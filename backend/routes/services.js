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
  authorizeNoDelete,
  blockUserDashboard,
} = require("../middleware/authMiddleware");

// Protect all routes
router.use(authenticateToken);
router.use(blockUserDashboard());

// GET all services
router.get("/", serviceController.getAllServices);

// GET service by ID
router.get("/:id", serviceController.getServiceById);

// POST a new service with validation
router.post(
  "/",
  createServiceValidation,
  validate,
  serviceController.createService
);

// PUT (update) a service by ID with validation
router.put(
  "/:id",
  updateServiceValidation,
  validate,
  serviceController.updateService
);

// DELETE a service by ID
router.delete("/:id", authorizeNoDelete(), serviceController.deleteService);

// GET service categories
router.get("/categories", serviceController.getServiceCategories);

module.exports = router;
