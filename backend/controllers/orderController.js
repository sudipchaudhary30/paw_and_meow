const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { createLog } = require('../utils/logger');
const { checkAlerts } = require('../utils/alertSystem');
const {
  generateEsewaSignature,
  verifyEsewaCallbackSignature,
  verifyEsewaTransactionWithApi,
  ESEWA_PRODUCT_CODE,
  ESEWA_GATEWAY_URL
} = require('../utils/esewaService');

/**
 * Safely starts a Mongoose transaction session ONLY if connected to a Replica Set or Sharded Cluster.
 * Prevents "Transaction numbers are only allowed on a replica set member or mongos" on standalone MongoDB.
 */
const startSafeSession = async () => {
  try {
    const topologyType = mongoose.connection?.client?.topology?.description?.type;
    const isReplicaSet = topologyType && (
      topologyType.includes('ReplicaSet') || 
      topologyType === 'Sharded' || 
      topologyType === 'ReplicaSetWithPrimary' ||
      topologyType === 'ReplicaSetNoPrimary'
    );

    if (!isReplicaSet) {
      return null;
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    return session;
  } catch (err) {
    return null;
  }
};

/**
 * Creates a new order with atomic stock updates and eSewa payment signature generation.
 * Handles both standalone MongoDB instances and MongoDB Replica Sets gracefully.
 */
const placeOrder = async (req, res) => {
  const session = await startSafeSession();

  try {
    const { items, shippingAddress, notes, paymentMethod = 'eSewa' } = req.body;

    let totalAmount = 0;
    const enrichedItems = [];

    // Retrieve and check stock
    for (const item of items) {
      const productQuery = Product.findById(item.productId);
      if (session) productQuery.session(session);
      const product = await productQuery;

      if (!product || !product.isActive) {
        throw new Error(`Product not available: ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for: ${product.name}`);
      }
      totalAmount += product.price * item.quantity;
      enrichedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
    }

    // Reserve stock immediately
    for (const item of enrichedItems) {
      if (session) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } },
          { session, runValidators: true }
        );
      } else {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } },
          { runValidators: true }
        );
      }
    }

    const transactionUuid = `ORDER-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const signature = generateEsewaSignature(totalAmount, transactionUuid);

    const orderData = {
      user: req.user._id,
      items: enrichedItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: 'Pending',
      esewaTransactionUuid: transactionUuid,
      notes
    };

    let order;
    if (session) {
      const created = await Order.create([orderData], { session });
      order = created[0];
      await session.commitTransaction();
      session.endSession();
    } else {
      order = await Order.create(orderData);
    }

    await createLog({
      user: req.user._id,
      action: 'PLACE_ORDER',
      resource: 'Order',
      resourceId: order._id,
      status: 'success',
      details: { totalAmount, esewaTransactionUuid: transactionUuid },
      ip: req.ip
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    return res.status(201).json({
      order,
      esewaForm: {
        amount: totalAmount,
        tax_amount: 0,
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: ESEWA_PRODUCT_CODE,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `${clientUrl}/payment/esewa/success`,
        failure_url: `${clientUrl}/payment/esewa/failure`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
        esewaUrl: ESEWA_GATEWAY_URL
      }
    });

  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (aErr) {}
    }

    await createLog({
      user: req.user?._id,
      action: 'PLACE_ORDER_FAILED',
      resource: 'Order',
      status: 'failure',
      details: { error: error.message },
      ip: req.ip
    });

    res.status(400).json({ error: error.message });
  }
};

/**
 * Confirms and verifies eSewa payment status server-side.
 * Decodes callback payload, verifies HMAC-SHA256 signature, and validates transaction status.
 */
const verifyEsewaPayment = async (req, res) => {
  const session = await startSafeSession();

  try {
    const { encodedData } = req.body;
    if (!encodedData) {
      throw new Error('Encoded eSewa payload (data) is required.');
    }

    // Decode base64 callback data from eSewa
    const decodedString = Buffer.from(encodedData, 'base64').toString('utf-8');
    const parsedData = JSON.parse(decodedString);

    const { transaction_code, status, total_amount, transaction_uuid } = parsedData;

    // Cryptographic signature check
    const isValidSignature = verifyEsewaCallbackSignature(parsedData);
    if (!isValidSignature) {
      throw new Error('Invalid HMAC-SHA256 signature from eSewa.');
    }

    // Find target pending order
    const orderQuery = Order.findOne({ esewaTransactionUuid: transaction_uuid });
    if (session) orderQuery.session(session);
    const order = await orderQuery;

    if (!order) {
      if (session) { session.endSession(); }
      return res.status(404).json({ error: 'Associated order not found.' });
    }

    if (order.status !== 'Pending') {
      if (session) { session.endSession(); }
      return res.status(400).json({ error: 'Order is already processed.' });
    }

    // Server-side verification check with eSewa verification endpoint
    let apiStatusResult;
    try {
      apiStatusResult = await verifyEsewaTransactionWithApi(total_amount, transaction_uuid);
    } catch (apiErr) {
      // Fall back to callback status check if signature is valid
      apiStatusResult = { status: status || 'COMPLETE' };
    }

    const verifiedStatus = apiStatusResult?.status || status;

    if (verifiedStatus === 'COMPLETE' || status === 'COMPLETE') {
      order.status = 'Paid';
      order.esewaTransactionCode = transaction_code || parsedData.ref_id;
      if (session) {
        await order.save({ session });
        await session.commitTransaction();
        session.endSession();
      } else {
        await order.save();
      }

      await createLog({
        user: req.user._id,
        action: 'ESEWA_PAYMENT_SUCCESS',
        resource: 'Order',
        resourceId: order._id,
        status: 'success',
        details: { esewaTransactionUuid: transaction_uuid, esewaTransactionCode: transaction_code },
        ip: req.ip
      });

      return res.json({ message: 'eSewa payment confirmed successfully.', order });
    } else {
      throw new Error(`eSewa status invalid: ${verifiedStatus}`);
    }

  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (aErr) {}
    }

    // Rollback stock if confirmation fails
    try {
      const { encodedData } = req.body;
      if (encodedData) {
        const decodedString = Buffer.from(encodedData, 'base64').toString('utf-8');
        const parsedData = JSON.parse(decodedString);
        const order = await Order.findOne({ esewaTransactionUuid: parsedData.transaction_uuid });

        if (order && order.status === 'Pending') {
          order.status = 'Rolled_Back';
          await order.save();
          
          for (const item of order.items) {
            await Product.findByIdAndUpdate(
              item.product,
              { $inc: { stock: item.quantity } }
            );
          }
        }
      }
    } catch (rbErr) {}

    await createLog({
      user: req.user?._id,
      action: 'ESEWA_PAYMENT_FAILURE',
      resource: 'Order',
      status: 'failure',
      details: { error: error.message },
      ip: req.ip
    });

    await checkAlerts('UPLOAD_REJECTION_FAILURE', { ip: req.ip });

    res.status(400).json({ error: `eSewa payment confirmation failed: ${error.message}` });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ orders, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    await createLog({ user: req.user._id, action: 'UPDATE_ORDER', resource: 'Order', resourceId: order._id, status: 'success', details: { newStatus: status }, ip: req.ip });
    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  placeOrder,
  verifyEsewaPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
};
