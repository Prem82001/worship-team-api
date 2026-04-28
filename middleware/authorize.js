// This middleware checks: "Does this user have the right ROLE?"
// It runs AFTER auth.js (which checks the token)

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user was set by the auth middleware
    // It contains: { id, username, role }

    if (!req.user) {
      return res.status(401).json({
        message: 'You must be logged in'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Your role "${req.user.role}" is not allowed. Required: ${allowedRoles.join(' or ')}`
      });
    }

    // Role is allowed — continue
    next();
  };
};

module.exports = authorize;