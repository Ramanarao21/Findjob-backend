const User = require('../models/userModel');

/**
 * Helper to check if a user object has an active Pro membership
 * @param {Object} user - User mongoose document or object
 * @returns {boolean} True if Pro tier and not expired
 */
const isProUser = (user) => {
  if (!user) return false;
  if (user.membershipTier !== 'pro') return false;
  if (user.proExpiresAt && new Date(user.proExpiresAt) <= new Date()) {
    return false;
  }
  return true;
};

/**
 * Middleware: Enforces that the authenticated user has an active Pro tier membership.
 * Must be placed AFTER authMiddleware (verifyToken).
 */
const requirePro = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    if (!isProUser(user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: This action requires an active Pro membership',
        code: 'PRO_MEMBERSHIP_REQUIRED',
        upgradeUrl: '/membership/upgrade',
      });
    }

    // Attach fresh user object to request
    req.fullUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requirePro,
  isProUser,
};
