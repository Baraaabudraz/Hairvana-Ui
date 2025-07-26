"use strict";
const db = require("../models");

// Usage: checkPermission('users', 'edit')
function checkPermission(resource, action) {
  return async (req, res, next) => {
    try {
      const user = req.user; // Assumes user is attached to req (e.g., by auth middleware)
      console.log("user", user);
      if (!user || !user.role_id) {
        return res.status(401).json({ error: "Unauthorized: No user or role" });
      }
      // Find permission for this role/resource/action
      const permission = await db.Permission.findOne({
        where: {
          role_id: user.role_id,
          resource,
          action,
          allowed: true,
        },
      });
      if (!permission) {
        return res
          .status(403)
          .json({ error: "Forbidden: insufficient permissions" });
      }
      next();
    } catch (err) {
      console.error("Permission check error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

module.exports = checkPermission;
