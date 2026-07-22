const { createLog } = require('../utils/logger');

/**
 * Checks if the request's remote IP is in the ADMIN_ALLOWED_IPS environment variable list.
 */
const isIpAllowlisted = (req) => {
  const allowedIpsStr = process.env.ADMIN_ALLOWED_IPS || '';
  if (!allowedIpsStr) return false;
  const allowedIps = allowedIpsStr.split(',').map(ip => ip.trim());
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  return allowedIps.includes(clientIp);
};

/**
 * Middleware to enforce that a request originates from an allowlisted IP address.
 * Logs success/failure actions to the audit trail.
 */
const enforceIpAllowlist = async (req, res, next) => {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  if (isIpAllowlisted(req)) {
    await createLog({
      action: 'IP_ALLOWLIST_BYPASS',
      status: 'success',
      ip: clientIp,
      details: { path: req.originalUrl, message: 'Trusted IP bypassed restriction' }
    });
    return next();
  }

  await createLog({
    action: 'IP_ALLOWLIST_BLOCKED',
    status: 'failure',
    ip: clientIp,
    details: { path: req.originalUrl, message: 'Access denied: IP not allowlisted' }
  });

  return res.status(403).json({ error: 'Access denied: IP not allowlisted.' });
};

module.exports = { isIpAllowlisted, enforceIpAllowlist };
