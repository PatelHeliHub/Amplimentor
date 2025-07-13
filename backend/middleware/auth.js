const User = require('../models/User');

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// Middleware to check if user has specific role
function requireRole(role) {
  return async (req, res, next) => {
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    try {
      const user = await User.findById(req.session.userId);
      if (!user || user.role !== role) {
        return res.redirect('/login');
      }
      next();
    } catch (err) {
      return res.redirect('/login');
    }
  };
}

module.exports = {
  requireAuth,
  requireRole
}; 