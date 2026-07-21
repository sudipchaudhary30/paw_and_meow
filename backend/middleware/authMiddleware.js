const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided. Access denied.' });
    }

    const decoded = verifyToken(token);
    const fingerprint = req.headers['x-session-fingerprint'] || req.body?.fingerprint;

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or deactivated.' });
    }

    if (user.sessionFingerprint && fingerprint && user.sessionFingerprint !== fingerprint) {
      return res.status(403).json({ error: 'Session fingerprint mismatch.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = { protect };
