/**
 * csrfMiddleware.js
 * 
 * Double-Submit Cookie CSRF protection pattern.
 * For stateless JWT APIs this implements the Synchronizer Token Pattern:
 *  1. GET /api/auth/csrf-token, server issues a random CSRF token in a cookie
 *     AND returns it in the response body.
 *  2. Client sends the token as X-CSRF-Token header on state-changing requests.
 *  3. Middleware verifies header value matches cookie value.
 * 
 * Protects: POST, PUT, PATCH, DELETE on all /api/ routes except public GETs.
 */

const crypto = require('crypto');

/** Issue a new CSRF token cookie and return the token in JSON */
const issueCsrfToken = (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrf_token', token, {
    httpOnly: false,       // must be readable by JS to place in header
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000 // 1 hour
  });
  res.json({ csrfToken: token });
};

/**
 * Enforce CSRF token on all mutating requests.
 * Skips GET, HEAD, OPTIONS (safe methods).
 * Skips Google OAuth route (uses its own ID-token verification).
 */
// BEFORE FIX (Vulnerable Code - Finding 7):
// app.use('/api/auth', authRoutes);
// ^ No CSRF token validation on any state-changing endpoints (POST, PUT, DELETE)
// ^ Attacker could forge requests from a malicious site while victim is logged in
// AFTER FIX (Remediated Code): Double-Submit Cookie pattern enforced below
const verifyCsrf = (req, res, next) => {
  const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
  const SKIP_PATHS = ['/api/auth/google']; // OAuth bypasses CSRF token check

 

  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies?.csrf_token;

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ error: 'CSRF validation failed. Request blocked.' });
  }
  next();
};

module.exports = { issueCsrfToken, verifyCsrf };
