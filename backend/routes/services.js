const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const {
  createServiceValidation,
  updateServiceValidation,
} = require("../validation/serviceValidation");
const validate = require("../middleware/validate");
const {
  authenticateToken,
  blockUserDashboard,
} = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// Protect all routes
router.use(authenticateToken);
router.use(blockUserDashboard());

// GET all services
router.get(
  "/",
  checkPermission("services", "view"),
  serviceController.getAllServices
);

// GET service by ID
router.get("/:id", serviceController.getServiceById);

// POST a new service with validation
router.post(
  "/",
  createServiceValidation,
  validate,
  checkPermission("services", "add"),
  serviceController.createService
);

// PUT (update) a service by ID with validation
router.put(
  "/:id",
  updateServiceValidation,
  validate,
  checkPermission("services", "edit"),
  serviceController.updateService
);

// DELETE a service by ID
router.delete(
  "/:id",
  checkPermission("services", "delete"),
  serviceController.deleteService
);

// GET service categories
router.get("/categories", serviceController.getServiceCategories);

module.exports = router;
