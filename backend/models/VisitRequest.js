const mongoose = require('mongoose');

const visitRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  visitDate: {
    type: Date,
    required: [true, 'Visit date is required']
  },
  visitTime: {
    type: String,
    required: [true, 'Visit time is required']
  },
  message: { type: String, trim: true, maxlength: 500 },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  adminNote: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('VisitRequest', visitRequestSchema);
