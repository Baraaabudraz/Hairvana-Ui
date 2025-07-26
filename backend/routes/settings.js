const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const {
  authenticateToken,
  authorize,
} = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// Protect all routes
router.use(authenticateToken);

// User settings routes
router.get("/", settingsController.getUserSettings);
router.put("/profile", settingsController.updateProfileSettings);
router.put("/security", settingsController.updateSecuritySettings);
router.put("/notifications", settingsController.updateNotificationPreferences);
router.put("/billing", settingsController.updateBillingSettings);
router.put("/backup", settingsController.updateBackupSettings);

// Platform settings routes (admin only)
router.get(
  "/platform",
  checkPermission("settings", "view"),
  settingsController.getPlatformSettings
);
router.put(
  "/platform",
  checkPermission("settings", "edit"),
  settingsController.updatePlatformSettings
);

// Integration settings routes (admin only)
router.get(
  "/integrations",
  checkPermission("settings", "view"),
  settingsController.getIntegrationSettings
);
router.put(
  "/integrations",
  checkPermission("settings", "edit"),
  settingsController.updateIntegrationSettings
);

module.exports = router;
