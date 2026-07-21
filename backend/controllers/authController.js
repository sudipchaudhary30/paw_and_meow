const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { createLog } = require('../utils/logger');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

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

    res.cookie('token', token, cookieOptions);
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, otp, fingerprint } = req.body;
    const user = await User.findOne({ email }).select('+password +mfaSecret +passwordlessToken +passwordlessExpiresAt +failedLoginAttempts +lockUntil');

    if (!user) {
      await createLog({ email, action: 'LOGIN_ATTEMPT', status: 'failure', details: 'Invalid credentials', ip: req.ip });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(423).json({ error: 'Account temporarily locked. Try again later.' });
    }

    if (!user || !(await user.comparePassword(password))) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      await createLog({ user: user._id, email, action: 'LOGIN_ATTEMPT', status: 'failure', details: 'Invalid credentials', ip: req.ip });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account deactivated. Contact support.' });
    }

    if (user.mfaEnabled && !otp) {
      return res.status(401).json({ error: 'MFA required.', requiresMfa: true });
    }

    if (user.mfaEnabled && otp) {
      const expected = (user.mfaSecret || '').slice(-6);
      if (otp !== expected) {
        return res.status(401).json({ error: 'Invalid MFA code.' });
      }
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip;
    user.sessionFingerprint = fingerprint || null;
    await user.save();

    const token = generateToken(user._id, user.role, { fingerprint: fingerprint || null });
    await createLog({ user: user._id, email, action: 'LOGIN', status: 'success', ip: req.ip });

    res.cookie('token', token, cookieOptions);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const requestPasswordless = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account found.' });
    const token = crypto.randomBytes(3).toString('hex').toUpperCase();
    user.passwordlessToken = token;
    user.passwordlessExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await createLog({ user: user._id, email, action: 'PASSWORDLESS_REQUEST', status: 'success', ip: req.ip });
    res.json({ message: 'Passwordless login code generated.', code: token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const passwordlessLogin = async (req, res) => {
  try {
    const { email, code, fingerprint } = req.body;
    const user = await User.findOne({ email }).select('+passwordlessToken +passwordlessExpiresAt');
    if (!user || !user.passwordlessToken || user.passwordlessToken !== code || !user.passwordlessExpiresAt || user.passwordlessExpiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired passwordless code.' });
    }
    user.passwordlessToken = null;
    user.passwordlessExpiresAt = null;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip;
    user.sessionFingerprint = fingerprint || null;
    await user.save();
    const token = generateToken(user._id, user.role, { fingerprint: fingerprint || null });
    res.cookie('token', token, cookieOptions);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken, fingerprint } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({ error: 'Google account email not available.' });
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: payload.name || email.split('@')[0],
        email,
        password: crypto.randomBytes(16).toString('hex'),
        googleId: payload.sub,
        authProvider: 'google',
        role: 'user'
      });
    } else {
      if (!user.googleId && payload.sub) {
        user.googleId = payload.sub;
        user.authProvider = user.authProvider || 'google';
        await user.save();
      }
    }

    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip;
    user.sessionFingerprint = fingerprint || null;
    await user.save();

    const token = generateToken(user._id, user.role, { fingerprint: fingerprint || null });
    await createLog({ user: user._id, email, action: 'LOGIN_GOOGLE', status: 'success', ip: req.ip });
    res.cookie('token', token, cookieOptions);
    res.json({ token, user });
  } catch (error) {
    res.status(401).json({ error: 'Google authentication failed.' });
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

const exportProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -mfaSecret -passwordlessToken -passwordlessExpiresAt -sessionFingerprint');
    const payload = {
      user: user.toObject(),
      exportedAt: new Date().toISOString(),
      note: 'Exported in accordance with privacy principles.'
    };
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const importProfile = async (req, res) => {
  try {
    const importedData = req.body.user || req.body;
    const { name, phone, address } = importedData;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    await createLog({ user: req.user._id, action: 'IMPORT_PROFILE', status: 'success', ip: req.ip });
    res.json({ message: 'Profile data imported successfully.', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, exportProfile, importProfile, requestPasswordless, passwordlessLogin, googleLogin };

