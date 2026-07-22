const Log = require('../models/Log');

/**
 * Real-time monitoring and alerting system helper.
 * Scans recent audit log patterns to trigger console warning alerts.
 */
const checkAlerts = async (action, context) => {
  try {
    const ip = context.ip;
    const email = context.email;

    if (action === 'LOGIN_ATTEMPT' && email) {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const failedAttemptsCount = await Log.countDocuments({
        email,
        action: 'LOGIN_ATTEMPT',
        status: 'failure',
        createdAt: { $gte: fifteenMinutesAgo }
      });

      if (failedAttemptsCount >= 5) {
        console.warn(` [CRITICAL ALERT] Security event detected: 5+ failed login attempts for user "${email}" from IP ${ip} in the last 15 minutes.`);
      }
    }

    if (action === 'ACCOUNT_LOCKOUT' && email) {
      console.warn(` [CRITICAL ALERT] Security event detected: User account "${email}" has been temporarily locked due to repeated authentication failures.`);
    }

    if (action === 'CSRF_VALIDATION_FAILED' || action === 'RATE_LIMIT_EXCEEDED' || action === 'UPLOAD_REJECTION_FAILURE') {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const failuresCount = await Log.countDocuments({
        ip,
        action,
        status: 'failure',
        createdAt: { $gte: tenMinutesAgo }
      });

      if (failuresCount >= 3) {
        console.warn(` [CRITICAL ALERT] Security event detected: Repeated "${action}" failures (count: ${failuresCount}) detected from IP ${ip} in the last 10 minutes.`);
      }
    }
  } catch (error) {
    console.error('Alert System Error:', error.message);
  }
};

module.exports = { checkAlerts };
