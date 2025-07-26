const express = require("express");
const router = express.Router();
const rolesController = require("../controllers/rolesController");
const { authenticateToken } = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
router.use(authenticateToken);

// List all roles with permissions
router.get(
  "/",
  checkPermission("roles", "view"),
  rolesController.getRolesWithPermissions
);

// Update permissions for a role
router.put(
  "/:roleId/permissions",
  checkPermission("roles", "edit"),
  rolesController.updateRolePermissions
);

// Update role name/description
router.put(
  "/:roleId",
  checkPermission("roles", "edit"),
  rolesController.updateRole
);

// Create a new role
router.post("/", checkPermission("roles", "add"), rolesController.createRole);

// Delete a role
router.delete(
  "/:roleId",
  checkPermission("roles", "delete"),
  rolesController.deleteRole
);

// Add endpoint for roles list without permissions
router.get("/list", rolesController.getRolesList);

module.exports = router;
