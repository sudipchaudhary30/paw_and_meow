const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: String,
  action: { type: String, required: true },
  resource: String,
  resourceId: String,
  ip: String,
  userAgent: String,
  status: { type: String, enum: ['success', 'failure', 'warning'], default: 'success' },
  details: mongoose.Schema.Types.Mixed
}, { timestamps: true });

logSchema.index({ createdAt: -1 });
logSchema.index({ user: 1 });
logSchema.index({ action: 1 });

module.exports = mongoose.model('Log', logSchema);
