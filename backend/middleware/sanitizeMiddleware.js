/**
 * sanitizeMiddleware.js
 * 
 * Recursively strips XSS payloads from all incoming request body fields
 * using the `xss` library before the request reaches any controller.
 * 
 * Covers: req.body, req.query, req.params
 * 
 * Security Reference: OWASP XSS Prevention Cheat Sheet
 * https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
 */

const xss = require('xss');

/**
 * Recursively sanitize all string values in an object.
 * Removes dangerous HTML tags, event handlers, and script injections.
 */
function sanitizeObject(obj) {
  if (typeof obj === 'string') {
    return xss(obj, {
      whiteList: {},      // no HTML tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style']
    });
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

/** Express middleware: sanitize body, query, and params */
const sanitizeInputs = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

module.exports = { sanitizeInputs };
