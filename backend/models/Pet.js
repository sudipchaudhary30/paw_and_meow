const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pet name is required'],
    trim: true
  },
  species: {
    type: String,
    required: true,
    enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster', 'Other']
  },
  breed: { type: String, trim: true },
  age: { type: Number, min: 0 },
  gender: { type: String, enum: ['Male', 'Female', 'Unknown'] },
  description: { type: String, trim: true, maxlength: 1000 },
  imageUrl: { type: String, default: '' },
  vaccinated: { type: Boolean, default: false },
  neutered: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['Available', 'Pending', 'Adopted'],
    default: 'Available'
  },
  approved: {
    type: Boolean,
    default: false
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Pet', petSchema);
