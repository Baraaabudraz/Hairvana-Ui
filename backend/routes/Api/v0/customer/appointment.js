const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');

// Controllers
const appointmentController = require('../../../../controllers/Api/customer/appointmentController');

// Middleware
const { authenticateCustomer } = require('../../../../middleware/passportMiddleware');
const validate = require('../../../../middleware/validate');

// Validation schemas
const { 
  createAppointmentValidation, 
  bookAppointmentValidation,
  checkAvailabilityValidation,
  cancelAppointmentValidation 
} = require('../../../../validation/appointmentValidation');

/**
 * Appointment Routes for Customer Mobile API
 * 
 * All routes require customer authentication
 * Base path: /api/mobile
 */

// ============================================================================
// AVAILABILITY & SERVICES
// ============================================================================

/**
 * @route   GET /api/mobile/salons/:id/availability
 * @desc    Get available time slots for a salon
 * @access  Private (Customer)
 */
router.get(
  '/salons/:id/availability', 
  authenticateCustomer, 
  checkAvailabilityValidation, 
  validate, 
  appointmentController.getAvailability
);

/**
 * @route   GET /api/mobile/salons/:salon_id/services
 * @desc    Get all services available at a specific salon
 * @access  Private (Customer)
 */
router.get(
  '/salons/:salon_id/services', 
  authenticateCustomer, 
  appointmentController.getSalonServices
);

/**
 * @route   GET /api/mobile/services
 * @desc    Get all available services (for debugging/development)
 * @access  Private (Customer)
 */
router.get(
  '/services', 
  authenticateCustomer, 
  appointmentController.getAllServices
);

// ============================================================================
// APPOINTMENT MANAGEMENT
// ============================================================================

/**
 * @route   POST /api/mobile/appointments
 * @desc    Book a new appointment
 * @access  Private (Customer)
 */
router.post(
  '/appointments', 
  authenticateCustomer, 
  bookAppointmentValidation, 
  validate, 
  appointmentController.bookAppointment
);

/**
 * @route   GET /api/mobile/appointments
 * @desc    Get all appointments for the current user with filtering and pagination
 * @access  Private (Customer)
 * 
 * Query Parameters:
 * - status: Filter by appointment status (pending, booked, cancelled, completed)
 * - page: Page number for pagination (default: 1)
 * - limit: Number of items per page (default: 20, max: 100)
 * - sort: Sort field (start_at, created_at, total_price)
 * - order: Sort order (ASC, DESC)
 * - salon_id: Filter by salon ID
 * - staff_id: Filter by staff ID
 * - date_from: Filter appointments from this date (ISO 8601)
 * - date_to: Filter appointments to this date (ISO 8601)
 */
const getAppointmentsValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'booked', 'cancelled', 'completed'])
    .withMessage('Invalid status. Must be one of: pending, booked, cancelled, completed'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['start_at', 'created_at', 'total_price'])
    .withMessage('Invalid sort field. Must be one of: start_at, created_at, total_price'),
  
  query('order')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Order must be ASC or DESC'),
  
  query('salon_id')
    .optional()
    .isUUID()
    .withMessage('Invalid salon ID format'),
  
  query('staff_id')
    .optional()
    .isUUID()
    .withMessage('Invalid staff ID format'),
  
  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for date_from. Use ISO 8601 format (YYYY-MM-DD)'),
  
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for date_to. Use ISO 8601 format (YYYY-MM-DD)')
];

router.get(
  '/appointments', 
  authenticateCustomer, 
  getAppointmentsValidation, 
  validate, 
  appointmentController.getAppointments
);

/**
 * @route   GET /api/mobile/appointments/stats
 * @desc    Get appointment statistics for the current user
 * @access  Private (Customer)
 */
router.get(
  '/appointments/stats', 
  authenticateCustomer, 
  appointmentController.getAppointmentStats
);

/**
 * @route   GET /api/mobile/appointments/:id
 * @desc    Get a specific appointment by ID
 * @access  Private (Customer)
 */
router.get(
  '/appointments/:id', 
  authenticateCustomer, 
  appointmentController.getAppointmentById
);

/**
 * @route   PUT /api/mobile/appointments/:id/cancel
 * @desc    Cancel an existing appointment
 * @access  Private (Customer)
 * 
 * Request Body:
 * - cancellation_reason (optional): Reason for cancellation
 */
router.put(
  '/appointments/:id/cancel', 
  authenticateCustomer, 
  cancelAppointmentValidation, 
  validate, 
  appointmentController.cancelAppointment
);

module.exports = router; 