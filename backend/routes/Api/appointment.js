const express = require('express');
const router = express.Router();
const appointmentController = require('../../controllers/Api/appointmentController');
const { authenticateToken } = require('../../middleware/authMiddleware');
const { 
  createAppointmentValidation, 
  bookAppointmentValidation,
  checkAvailabilityValidation,
  cancelAppointmentValidation 
} = require('../../validation/appointmentValidation');
const validate = require('../../middleware/validate');

router.get('/salons/:id/availability', checkAvailabilityValidation, appointmentController.getAvailability);
router.get('/salons/:salon_id/services', appointmentController.getSalonServices);
router.get('/services', appointmentController.getAllServices);
router.post('/appointments', authenticateToken, bookAppointmentValidation, validate, appointmentController.bookAppointment);
router.get('/appointments', authenticateToken, appointmentController.getAppointments);
router.get('/appointments/:id', authenticateToken, appointmentController.getAppointmentById);
router.put('/appointments/:id/cancel', authenticateToken, cancelAppointmentValidation, validate, appointmentController.cancelAppointment);
router.put('/appointments/:id/complete', authenticateToken, appointmentController.completeAppointment);

module.exports = router; 