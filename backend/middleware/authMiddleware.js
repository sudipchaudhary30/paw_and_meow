const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Protect middleware enforcing Zero-Trust Framing:
 * "Never Trust, Always Verify" - No implicit trust is granted based on network location or a 
 * previously issued token. We re-validate token validity, check the active status and role in 
 * the database, and verify session fingerprint on every request.
 */

    const decoded = verifyToken(token);
    const fingerprint = req.headers['x-session-fingerprint'] || req.headers['user-agent'] || req.body?.fingerprint;

    // Fetch fresh user data from database to verify real-time status and role
    const user = await User.findById(decoded.id).select('+sessionFingerprint');
    if (!user || !user.isActive) {
      res.clearCookie('token');
      return res.status(401).json({ error: 'User not found or deactivated.' });
    }

    // Prevent privilege escalation via stale tokens by validating real-time database role
    if (user.role !== decoded.role) {
      res.clearCookie('token');
      return res.status(403).json({ error: 'User role mismatch. Stale token detected.' });
    }

    // Validate fingerprint on requests if fingerprint is present
    if (user.sessionFingerprint && fingerprint && user.sessionFingerprint !== fingerprint) {
      res.clearCookie('token');
      return res.status(401).json({ error: 'Session fingerprint mismatch. Re-authentication forced.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = { protect };

