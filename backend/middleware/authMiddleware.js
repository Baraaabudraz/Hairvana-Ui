const jwt = require('jsonwebtoken');
const config = require('../config/config.json');

const protect = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Invalid token format' });
  jwt.verify(token, config.jwtSecret || process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized for this action' });
    }
    next();
  };
};

const authenticateCustomer = (req, res, next) => {
  protect(req, res, function() {
    if(req.user && req.user.role === 'user') {
      return next();
    }
    return res.status(403).json({ error: 'Only customers can access this endpoint.' });
  });
};

// Add authenticateOwner middleware
const authenticateOwner = (req, res, next) => {
  protect(req, res, function() {
    if (req.user && req.user.role === 'salon') {
      return next();
    }
    return res.status(403).json({ error: 'Only salon owners can access this endpoint.' });
  });
};

module.exports = { authenticateToken: protect, authorize, authenticateOwner, authenticateCustomer };