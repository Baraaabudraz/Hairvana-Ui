const jwt = require("jsonwebtoken");
const config = require("../config/config.json");

const protect = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Invalid token format" });
  jwt.verify(
    token,
    config.jwtSecret || process.env.JWT_SECRET,
    (err, decoded) => {
      if (err) return res.status(401).json({ error: "Invalid token" });
      req.user = decoded;
      next();
    }
  );
};

// Generic role authorizer using role name (fetch from JWT payload)
const authorize = (...roleNames) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (!roleNames.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Not authorized for this action" });
    }
    next();
  };
};

const authenticateCustomer = (req, res, next) => {
  protect(req, res, function() {
    if(req.user && req.user.role === 'customer') {
      return next();
    }
    return res.status(403).json({ error: 'Only customers can access this endpoint.' });
  });
};



// Role helpers using role name from JWT
const isSuperAdmin = (user) => user && user.role === "super admin";
const isAdmin = (user) => user && user.role === "admin";
const isUser = (user) => user && user.role === "customer";

// Middleware: Block 'user' role from dashboard/admin
const blockUserDashboard = () => {
  return (req, res, next) => {
    if (isUser(req.user)) {
      return res
        .status(403)
        .json({ message: "Users cannot access dashboard or admin features." });
    }
    next();
  };
};
// Add authenticateOwner middleware
const authenticateOwner = (req, res, next) => {
  protect(req, res, function() {
    if (req.user && req.user.role === 'salon owner') {
      return next();
    }
    return res.status(403).json({ error: 'Only salon owners can access this endpoint.' });
  });
};

// Add authenticateJWT middleware (alias for protect)
const authenticateJWT = protect;

// Add authenticateAdmin middleware
const authenticateAdmin = (req, res, next) => {
  protect(req, res, function() {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super admin')) {
      return next();
    }
    return res.status(403).json({ error: 'Only admins can access this endpoint.' });
  });
};

module.exports = {
  authenticateToken: protect,
  authenticateJWT,
  authenticateAdmin,
  authorize,
  isSuperAdmin,
  isAdmin,
  isUser,
  blockUserDashboard,
  authenticateOwner,
  authenticateCustomer
};
