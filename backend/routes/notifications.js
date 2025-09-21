const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const {
  createNotificationValidation,
} = require("../validation/notificationValidation");
const validate = require("../middleware/validate");
const {
  authenticateToken,
  authorize,
  authorizeNoDelete,
  blockUserDashboard,
} = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// Protect all routes
router.use(authenticateToken);
router.use(blockUserDashboard());

// Admin routes
// GET all notifications - admin only
router.get(
  "/admin",
  checkPermission("notifications", "view"),
  notificationController.getAllNotifications
);

// POST a new notification with validation - admin only
router.post(
  "/",
  checkPermission("notifications", "edit"),
  createNotificationValidation,
  validate,
  notificationController.createNotification
);

// GET notification templates - admin only
router.get(
  "/templates",
  checkPermission("notifications", "view"),
  notificationController.getNotificationTemplates
);

// DELETE a notification - super_admin only
router.delete(
  "/:id",
  checkPermission("notifications", "delete"),
  notificationController.deleteNotification
);

// POST send a notification - admin only
router.post(
  "/:id/send",
  authorize("admin", "super admin"),
  notificationController.sendNotification
);

// User routes
// GET / — List user notifications
router.get('/', notificationController.getUserNotifications);

// GET /unread-count — Get count of unread notifications
router.get('/unread-count', notificationController.getUnreadCount);

// POST /:id/read — Mark a specific notification as read
router.post('/:id/read', notificationController.markNotificationAsRead);

// POST /mark-all-read — Mark all notifications as read
router.post('/mark-all-read', notificationController.markAllNotificationsAsRead);

module.exports = router;
