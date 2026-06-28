const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Treats', 'Toys', 'Grooming', 'Accessories', 'Health', 'Other']
  },
  description: { type: String, trim: true, maxlength: 1000 },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  imageUrl: { type: String, default: '' },
  brand: { type: String, trim: true },
  petType: [{ type: String, enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster', 'All'] }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
