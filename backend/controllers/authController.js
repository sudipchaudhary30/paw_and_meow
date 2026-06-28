const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { createLog } = require('../utils/logger');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await createLog({ email, action: 'REGISTER_ATTEMPT', status: 'failure', details: 'Email already exists', ip: req.ip });
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Prevent self-assigning admin role unless no users exist
    const userCount = await User.countDocuments();
    const assignedRole = (role === 'admin' && userCount === 0) ? 'admin' : 'user';

    const user = await User.create({ name, email, password, role: assignedRole });
    const token = generateToken(user._id, user.role);

    await createLog({ user: user._id, email, action: 'REGISTER', status: 'success', ip: req.ip });

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      await createLog({ email, action: 'LOGIN_ATTEMPT', status: 'failure', details: 'Invalid credentials', ip: req.ip });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account deactivated. Contact support.' });
    }

    const token = generateToken(user._id, user.role);
    await createLog({ user: user._id, email, action: 'LOGIN', status: 'success', ip: req.ip });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    await createLog({ user: req.user._id, action: 'UPDATE_PROFILE', status: 'success', ip: req.ip });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
