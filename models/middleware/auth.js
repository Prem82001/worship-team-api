const jwt = require('jsonwebtoken');

// This function runs BEFORE your route handler
// It checks: "Does this person have a valid token?"

const auth = (req, res, next) => {
  try {
    // 1. Get the token from the request header
    //    It comes as: "Bearer eyJhbGciOi..."
    //    We split by space and take the second part
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Access denied. Token format invalid.'
      });
    }

    // 2. Verify the token using our secret key
    //    If someone faked the token, this will fail
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach the user info to the request
    //    Now every route after this can use req.user
    req.user = decoded;

    // 4. Move on to the next function (the route handler)
    next();

  } catch (error) {
    res.status(403).json({
      message: 'Invalid or expired token'
    });
  }
};

module.exports = auth;