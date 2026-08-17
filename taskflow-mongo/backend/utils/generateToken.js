// ============================================================
// Utility: Generate a signed JWT for an authenticated user
// ============================================================
const jwt = require('jsonwebtoken');

/**
 * Generate a JWT containing the user's id and role.
 * @param {Object} payload - e.g. { id, role }
 * @returns {string} signed JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

module.exports = generateToken;
