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

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Not authorized for this action" });
    }
    next();
  };
};

// Add authorizeSuperAdmin middleware
const authorizeSuperAdmin = (req, res, next) => {
  protect(req, res, function () {
    if (req.user && req.user.role === "superAdmin") {
      return next();
    }
    return res
      .status(403)
      .json({ error: "Only super admins can access this endpoint." });
  });
};

// Update authenticateOwner middleware to check for 'salonOwner' role
const authenticateOwner = (req, res, next) => {
  protect(req, res, function () {
    if (req.user && req.user.role === "salonOwner") {
      return next();
    }
    return res
      .status(403)
      .json({ error: "Only salon owners can access this endpoint." });
  });
};

// Generic role authorizer for future extensibility
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    protect(req, res, function () {
      if (req.user && roles.includes(req.user.role)) {
        return next();
      }
      return res.status(403).json({ error: "Not authorized for this action." });
    });
  };
};

// Role helpers
const isSuperAdmin = (user) => user && user.role === "super_admin";
const isAdmin = (user) => user && user.role === "admin";
const isSalonOwner = (user) => user && user.role === "salon";
const isUser = (user) => user && user.role === "user";

// Middleware: Only super_admin can delete
const authorizeNoDelete = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (isSuperAdmin(req.user)) {
      return next();
    }
    return res
      .status(403)
      .json({ message: "Only super admins can perform delete actions." });
  };
};

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

// Middleware: Enforce salon ownership (for salonOwner role)
// Usage: pass salonId param name (e.g., 'id')
const enforceSalonOwnership = (salonIdParam = "id") => {
  return async (req, res, next) => {
    if (!isSalonOwner(req.user)) {
      return res
        .status(403)
        .json({ message: "Only salon owners can access this feature." });
    }
    const salonId = req.params[salonIdParam] || req.body[salonIdParam];
    if (!salonId) {
      return res.status(400).json({ message: "Salon ID is required." });
    }
    // Check if the salon belongs to the user
    const { Salon } = require("../models");
    const salon = await Salon.findOne({
      where: { id: salonId, owner_id: req.user.userId },
    });
    console.log('Debug - Salon found:', salon); // Debug log
    if (!salon) {
      return res.status(403).json({ message: "You do not own this salon." });
    }
    next();
  };
};

module.exports = {
  authenticateToken: protect,
  authorize,
  authenticateOwner,
  authorizeSuperAdmin,
  authorizeRole,
  isSuperAdmin,
  isAdmin,
  isSalonOwner,
  isUser,
  authorizeNoDelete,
  blockUserDashboard,
  enforceSalonOwnership,
};
