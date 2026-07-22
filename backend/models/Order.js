const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    postalCode: String,
    country: { type: String, default: 'Nepal' }
  },
  paymentMethod: {
    type: String,
    enum: ['eSewa', 'Cash on Delivery'],
    default: 'eSewa'
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Fulfilled', 'Failed', 'Rolled_Back'],
    default: 'Pending'
  },
  esewaTransactionUuid: { type: String, unique: true, sparse: true },
  esewaTransactionCode: { type: String },
  notes: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
