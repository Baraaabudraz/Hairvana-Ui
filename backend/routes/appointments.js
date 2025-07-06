const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { createAppointmentValidation, updateAppointmentValidation } = require('../validation/appointmentValidation');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// GET all appointments
router.get('/', appointmentController.getAllAppointments);

// GET appointment by ID
router.get('/:id', appointmentController.getAppointmentById);

// POST a new appointment with validation
router.post('/', createAppointmentValidation, validate, appointmentController.createAppointment);

// PUT (update) an appointment by ID with validation
router.put('/:id', updateAppointmentValidation, validate, appointmentController.updateAppointment);

// PATCH cancel an appointment
router.patch('/:id/cancel', appointmentController.cancelAppointment);

// GET check availability
router.get('/availability', appointmentController.checkAvailability);

module.exports = router;