const https = require('https');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { createLog } = require('../utils/logger');
const { checkAlerts } = require('../utils/alertSystem');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

/** Verify Google reCAPTCHA v2 token against Google's siteverify API */
const verifyRecaptcha = (token) => {
  return new Promise((resolve) => {
    if (!token) return resolve(false);
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY not set — skipping reCAPTCHA check.');
      return resolve(true); // Allow through if not configured (dev fallback)
    }
    const postData = `secret=${secretKey}&response=${token}`;
    const options = {
      hostname: 'www.google.com',
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.success === true);
        } catch {
          resolve(false);
        }
      });
    });
    req.on('error', () => resolve(false));
    req.write(postData);
    req.end();
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, recaptchaToken } = req.body;

    // Verify reCAPTCHA token with Google
    const captchaPassed = await verifyRecaptcha(recaptchaToken);
    if (!captchaPassed) {
      return res.status(400).json({ error: 'CAPTCHA verification failed. Please complete the robot check.' });
    }

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
    const { email, password, otp, fingerprint, recaptchaToken } = req.body;

    // Verify reCAPTCHA token with Google
    const captchaPassed = await verifyRecaptcha(recaptchaToken);
    if (!captchaPassed) {
      return res.status(400).json({ error: 'CAPTCHA verification failed. Please complete the robot check.' });
    }

    const user = await User.findOne({ email }).select('+password +mfaSecret +passwordlessToken +passwordlessExpiresAt +failedLoginAttempts +lockUntil');

    if (!user) {
      await createLog({ email, action: 'LOGIN_ATTEMPT', status: 'failure', details: 'Invalid credentials', ip: req.ip });
      await checkAlerts('LOGIN_ATTEMPT', { email, ip: req.ip });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(423).json({ error: 'Account temporarily locked. Try again later.' });
    }

    if (!user || !(await user.comparePassword(password))) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      let locked = false;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        locked = true;
      }
      await user.save();
      await createLog({ user: user._id, email, action: 'LOGIN_ATTEMPT', status: 'failure', details: 'Invalid credentials', ip: req.ip });
      await checkAlerts('LOGIN_ATTEMPT', { email, ip: req.ip });
      if (locked) {
        await checkAlerts('ACCOUNT_LOCKOUT', { email, ip: req.ip });
      }
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

/**
 * Send a 6-character hex email verification code to the authenticated user.
 * In production: send via email (Nodemailer/SendGrid). For this academic
 * submission the token is returned in the JSON response for Postman/Burp demo.
 */
const requestEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+emailVerifyToken +emailVerifyExpires');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.isEmailVerified) {
      return res.status(200).json({ message: 'Email is already verified.' });
    }
    const token = crypto.randomBytes(3).toString('hex').toUpperCase();
    user.emailVerifyToken = token;
    user.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    await createLog({ user: user._id, action: 'EMAIL_VERIFY_REQUEST', status: 'success', ip: req.ip });
    res.json({ message: 'Verification code generated.', verificationCode: token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** Confirm email by submitting the verification code */
const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id).select('+emailVerifyToken +emailVerifyExpires');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.isEmailVerified) return res.status(200).json({ message: 'Email already verified.' });
    if (
      !user.emailVerifyToken ||
      user.emailVerifyToken !== code ||
      !user.emailVerifyExpires ||
      user.emailVerifyExpires < new Date()
    ) {
      await createLog({ user: user._id, action: 'EMAIL_VERIFY_FAIL', status: 'failure', ip: req.ip });
      return res.status(400).json({ error: 'Invalid or expired verification code.' });
    }
    user.isEmailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();
    await createLog({ user: user._id, action: 'EMAIL_VERIFIED', status: 'success', ip: req.ip });
    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** Logout: invalidate HttpOnly session cookie and log the event */
const clearSession = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    if (req.user) {
      await createLog({ user: req.user._id, action: 'LOGOUT', status: 'success', ip: req.ip });
    }
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register, login, getMe, updateProfile, exportProfile, importProfile,
  requestPasswordless, passwordlessLogin, googleLogin,
  requestEmailVerification, verifyEmail, clearSession
};
