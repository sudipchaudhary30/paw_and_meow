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
    enum: ['Cash on Delivery', 'eSewa', 'Khalti'],
    default: 'Cash on Delivery'
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  notes: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
