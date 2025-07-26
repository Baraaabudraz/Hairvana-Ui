const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const {
  createStaffValidation,
  updateStaffValidation,
} = require("../validation/staffValidation");
const validate = require("../middleware/validate");
const {
  authenticateToken,
  authorizeNoDelete,
  blockUserDashboard,
} = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// Protect all routes
router.use(authenticateToken);
router.use(blockUserDashboard());

// GET all staff
router.get("/", checkPermission("staff", "view"), staffController.getAllStaff);

// GET staff by ID
router.get("/:id", staffController.getStaffById);

// POST a new staff member with validation
router.post("/", checkPermission("staff", "add"), staffController.createStaff);

// PUT (update) a staff member by ID with validation
router.put(
  "/:id",
  checkPermission("staff", "edit"),
  updateStaffValidation,
  validate,
  staffController.updateStaff
);

// DELETE a staff member by ID
router.delete(
  "/:id",
  checkPermission("staff", "delete"),
  staffController.deleteStaff
);

// POST assign service to staff
router.post("/:id/services", staffController.assignService);

// DELETE remove service from staff
router.delete("/:id/services/:serviceId", staffController.removeService);

module.exports = router;
