const express = require('express');
const router = express.Router();
const appointmentController = require('../../controllers/Api/appointmentController');
const { protect } = require('../../middleware/authMiddleware');
const { 
  createAppointmentValidation, 
  bookAppointmentValidation,
  checkAvailabilityValidation,
  cancelAppointmentValidation 
} = require('../../validation/appointmentValidation');
const validate = require('../../middleware/validate');

router.get('/salons/:id/availability', checkAvailabilityValidation, appointmentController.getAvailability);
router.post('/appointments', protect, bookAppointmentValidation, validate, appointmentController.bookAppointment);
router.get('/appointments', protect, appointmentController.getAppointments);
router.get('/appointments/:id', protect, appointmentController.getAppointmentById);
router.put('/appointments/:id/cancel', protect, cancelAppointmentValidation, validate, appointmentController.cancelAppointment);

module.exports = router; 