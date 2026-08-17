// ============================================================
// Middleware: Role-based access control
// Usage: router.get('/admin-only', protect, authorize('admin'), handler)
// ============================================================

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};

module.exports = { authorize };
