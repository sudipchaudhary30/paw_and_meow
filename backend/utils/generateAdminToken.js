require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const { generateToken } = require('./jwt');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = process.env.ADMIN_EMAIL;
    if (!email) throw new Error('ADMIN_EMAIL not set in env');
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new Error('Admin user not found: ' + email);
    const token = generateToken(user._id, user.role);
    console.log(JSON.stringify({ token, user: { _id: user._id, email: user.email, role: user.role } }));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
})();
