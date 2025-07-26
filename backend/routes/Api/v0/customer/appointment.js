const express = require('express');
const router = express.Router();
const appointmentController = require('../../../../controllers/Api/customer/appointmentController');
const { authenticateCustomer } = require('../../../../middleware/authMiddleware');
const { 
  createAppointmentValidation, 
  bookAppointmentValidation,
  checkAvailabilityValidation,
  cancelAppointmentValidation 
} = require('../../../../validation/appointmentValidation');
const validate = require('../../../../middleware/validate');

router.get('/salons/:id/availability', checkAvailabilityValidation, appointmentController.getAvailability);
router.get('/salons/:salon_id/services', appointmentController.getSalonServices);
router.get('/services', appointmentController.getAllServices);
router.post('/appointments', authenticateCustomer, bookAppointmentValidation, validate, appointmentController.bookAppointment);
router.get('/appointments', authenticateCustomer, appointmentController.getAppointments);
router.get('/appointments/:id', authenticateCustomer, appointmentController.getAppointmentById);
router.put('/appointments/:id/cancel', authenticateCustomer, cancelAppointmentValidation, validate, appointmentController.cancelAppointment);
router.put('/appointments/:id/complete', authenticateCustomer, appointmentController.completeAppointment);

module.exports = router; 