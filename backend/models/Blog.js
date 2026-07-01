const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Blog category is required'],
    enum: ['Dog Care', 'Nutrition', 'Security', 'Adoption', 'Other'],
    default: 'Other'
  },
  content: {
    type: String,
    required: [true, 'Blog content is required']
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  imageUrl: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
