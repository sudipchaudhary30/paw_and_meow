const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateProfile, exportProfile, importProfile, requestPasswordless, passwordlessLogin, googleLogin, requestEmailVerification, verifyEmail, clearSession } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/validateInput');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  // BEFORE FIX (Vulnerable Code - Finding 5):
  // body('password').isLength({ min: 6 })
  // ^ Only minimum length enforced — simple passwords like '123456' allowed
  // AFTER FIX (Remediated Code): Strict complexity regex enforced
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase letter and number'),
  handleValidation
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation
], login);

router.post('/passwordless/request', [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  handleValidation
], requestPasswordless);

router.post('/passwordless/login', [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('code').notEmpty().withMessage('Code is required'),
  handleValidation
], passwordlessLogin);

router.post('/google', [
  body('idToken').notEmpty().withMessage('Google token is required'),
  handleValidation
], googleLogin);

// Authenticated profile routes
router.get('/me', protect, getMe);
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty().isLength({ max: 50 }),
  handleValidation
], updateProfile);
router.get('/export', protect, exportProfile);
router.post('/import', protect, importProfile);

// Email verification routes
router.post('/email/verify/request', protect, requestEmailVerification);
router.post('/email/verify/confirm', protect, [
  body('code').notEmpty().withMessage('Verification code is required'),
  handleValidation
], verifyEmail);

// Session logout
router.post('/logout', protect, clearSession);

module.exports = router;

// Admin user management routes
const { requireRole } = require('../middleware/roleMiddleware');
const { enforceIpAllowlist } = require('../middleware/ipAllowlistMiddleware');

router.get('/admin/diagnostics', protect, requireRole('admin'), enforceIpAllowlist, (req, res) => {
  res.json({
    status: 'secure',
    systemTime: new Date().toISOString(),
    allowedIps: process.env.ADMIN_ALLOWED_IPS || 'none configured',
    message: 'Access granted via IP allowlist verification.'
  });
});

router.get('/users', protect, requireRole('admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    const { search, limit = 50 } = req.query;
    const filter = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).limit(Number(limit));
    res.json({ users });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/users/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
