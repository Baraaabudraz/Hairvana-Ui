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
const { query } = require('express-validator');

// Validation for appointment list query parameters
const getAppointmentsValidation = [
  query('status').optional().isIn(['pending', 'booked', 'cancelled', 'completed']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['start_at', 'created_at', 'total_price']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['ASC', 'DESC']).withMessage('Order must be ASC or DESC'),
  query('salon_id').optional().isUUID().withMessage('Invalid salon ID'),
  query('staff_id').optional().isUUID().withMessage('Invalid staff ID'),
  query('date_from').optional().isISO8601().withMessage('Invalid date format for date_from'),
  query('date_to').optional().isISO8601().withMessage('Invalid date format for date_to')
];

router.get('/salons/:id/availability', authenticateCustomer, checkAvailabilityValidation, appointmentController.getAvailability);
router.get('/salons/:salon_id/services', authenticateCustomer, appointmentController.getSalonServices);
router.get('/services', authenticateCustomer, appointmentController.getAllServices);
router.post('/appointments', authenticateCustomer, bookAppointmentValidation, validate, appointmentController.bookAppointment);
router.get('/appointments', authenticateCustomer, getAppointmentsValidation, validate, appointmentController.getAppointments);
router.get('/appointments/stats', authenticateCustomer, appointmentController.getAppointmentStats);
router.get('/appointments/:id', authenticateCustomer, appointmentController.getAppointmentById);
router.put('/appointments/:id/cancel', authenticateCustomer, cancelAppointmentValidation, validate, appointmentController.cancelAppointment);
router.put('/appointments/:id/complete', authenticateCustomer, appointmentController.completeAppointment);

module.exports = router; 