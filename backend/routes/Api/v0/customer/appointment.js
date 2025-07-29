const express = require('express');
const router = express.Router();
const appointmentController = require('../../../../controllers/Api/customer/appointmentController');
const { authenticateCustomer } = require('../../../../middleware/passportMiddleware');

const { 
  createAppointmentValidation, 
  bookAppointmentValidation,
  checkAvailabilityValidation,
  cancelAppointmentValidation 
} = require('../../../../validation/appointmentValidation');
const validate = require('../../../../middleware/validate');

router.get('/salons/:id/availability', authenticateCustomer, checkAvailabilityValidation, appointmentController.getAvailability);
router.get('/salons/:salon_id/services', authenticateCustomer, appointmentController.getSalonServices);
router.get('/services', authenticateCustomer, appointmentController.getAllServices);
router.post('/appointments', authenticateCustomer, bookAppointmentValidation, validate, appointmentController.bookAppointment);
router.get('/appointments', authenticateCustomer, appointmentController.getAppointments);
router.get('/appointments/:id', authenticateCustomer, appointmentController.getAppointmentById);
router.put('/appointments/:id/cancel', authenticateCustomer, cancelAppointmentValidation, validate, appointmentController.cancelAppointment);
router.put('/appointments/:id/complete', authenticateCustomer, appointmentController.completeAppointment);

module.exports = router; 