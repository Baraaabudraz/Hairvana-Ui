"use strict";
const db = require("../models");

// Usage: checkPermission('users', 'edit')
function checkPermission(resource, action) {
  return async (req, res, next) => {
    try {
      const user = req.user; // Assumes user is attached to req (e.g., by auth middleware)
      console.log("user", user);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized: No user" });
      }

      // Handle both role_id (UUID) and role (string/object) from JWT
      let roleId = user.role_id;
      let roleName = user.role;

      // If role is an object, extract the name and id
      if (user.role && typeof user.role === 'object') {
        roleName = user.role.name;
        roleId = user.role.id;
      }

      // If we have role name but no role_id, try to find the role by name
      if (!roleId && roleName) {
        const role = await db.Role.findOne({
          where: { name: roleName }
        });
        if (role) {
          roleId = role.id;
        }
      }

      // For super admin, bypass permission checks
      if (roleName === 'super admin') {
        return next();
      }

      if (!roleId) {
        return res.status(401).json({ error: "Unauthorized: No valid role found" });
      }

      // Find permission for this role/resource/action
      const permission = await db.Permission.findOne({
        where: {
          role_id: roleId,
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
