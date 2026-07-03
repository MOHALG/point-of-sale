// middleware/verify-token.js

// We'll need to import jwt to use the verify method
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization token required.' });
    }

    // Accept both "Bearer <token>" and raw token for compatibility.
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Assign decoded payload to req.user
    req.user = decoded.payload;

    // Call next() to invoke the next middleware function
    next();
  } catch (err) {
    // If any errors, send back a 401 status and an 'Invalid token.' error message
    res.status(401).json({ message: 'Invalid token.' });
  }
}

const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: user context missing.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.warn(
        `[RBAC] 403 ${req.method} ${req.originalUrl} userRole=${req.user.role} allowedRoles=${allowedRoles.join(',')}`
      );
      return res.status(403).json({ message: 'Forbidden: insufficient role.' });
    }

    next();
  };
};

// We'll need to export this function to use it in our controller files
module.exports = { verifyToken, requireRoles };
