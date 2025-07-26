const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const {
  createAppointmentValidation,
  updateAppointmentValidation,
} = require("../validation/appointmentValidation");
const validate = require("../middleware/validate");
const { authenticateToken } = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// Protect all routes
router.use(authenticateToken);

// GET all appointments
router.get(
  "/",
  checkPermission("appointments", "view"),
  appointmentController.getAllAppointments
);

// GET appointment by ID
router.get("/:id", appointmentController.getAppointmentById);

// POST a new appointment with validation
router.post(
  "/",
  createAppointmentValidation,
  validate,
  checkPermission("appointments", "add"),
  appointmentController.createAppointment
);

// PUT (update) an appointment by ID with validation
router.put(
  "/:id",
  updateAppointmentValidation,
  validate,
  checkPermission("appointments", "edit"),
  appointmentController.updateAppointment
);

// PATCH cancel an appointment
router.patch("/:id/cancel", appointmentController.cancelAppointment);

// GET check availability
router.get("/availability", appointmentController.checkAvailability);

module.exports = router;
