const Log = require('../models/Log');

const createLog = async ({ user, email, action, resource, resourceId, ip, userAgent, status = 'success', details }) => {
  try {
    await Log.create({ user, email, action, resource, resourceId, ip, userAgent, status, details });
  } catch (err) {
    console.error('Logging error:', err.message);
  }
};

module.exports = { createLog };
