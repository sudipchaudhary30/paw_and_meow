const Order = require('../models/Order');
const Product = require('../models/Product');
const { createLog } = require('../utils/logger');

const placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // Validate products and calculate total
    let totalAmount = 0;
    const enrichedItems = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) throw new Error(`Product not available: ${item.productId}`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for: ${product.name}`);
      totalAmount += product.price * item.quantity;
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      };
    }));

    // Deduct stock
    await Promise.all(enrichedItems.map(item =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
    ));

    const order = await Order.create({
      user: req.user._id,
      items: enrichedItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes
    });

    await createLog({ user: req.user._id, action: 'PLACE_ORDER', resource: 'Order', resourceId: order._id, status: 'success', details: { totalAmount }, ip: req.ip });
    res.status(201).json({ order });
  } catch (error) {
    res.status(400).json({ error: error.message });
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

module.exports = { placeOrder, getMyOrders, getAllOrders, updateOrderStatus };
