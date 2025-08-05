const { body, param, query } = require('express-validator');

/**
 * Appointment Validation Schemas
 * 
 * This file contains all validation schemas for appointment-related endpoints.
 * Each validation schema is designed to provide clear, helpful error messages
 * and follows REST API best practices.
 */

// ============================================================================
// APPOINTMENT BOOKING VALIDATION
// ============================================================================

/**
 * Validation schema for booking a new appointment
 */
const bookAppointmentValidation = [
  body('salonId')
    .notEmpty()
    .withMessage('Salon ID is required')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
  
  body('staffId')
    .notEmpty()
    .withMessage('Staff ID is required')
    .isUUID()
    .withMessage('Staff ID must be a valid UUID'),
  
  body('start_at')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)')
    .custom((value) => {
      const appointmentTime = new Date(value);
      const now = new Date();
      
      // Appointment must be at least 1 hour in the future
      const minTime = new Date(now.getTime() + 60 * 60 * 1000);
      
      if (appointmentTime <= minTime) {
        throw new Error('Appointment must be at least 1 hour in the future');
      }
      
      // Appointment cannot be more than 6 months in the future
      const maxTime = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
      
      if (appointmentTime > maxTime) {
        throw new Error('Appointment cannot be more than 6 months in the future');
      }
      
      return true;
    }),
  
  body('service_ids')
    .isArray({ min: 1 })
    .withMessage('At least one service must be selected')
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('Service IDs must be an array with at least one service');
      }
      
      // Validate each service ID is a UUID
      for (const serviceId of value) {
        if (typeof serviceId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serviceId)) {
          throw new Error('All service IDs must be valid UUIDs');
        }
      }
      
      // Check for duplicate service IDs
      const uniqueIds = new Set(value);
      if (uniqueIds.size !== value.length) {
        throw new Error('Duplicate service IDs are not allowed');
      }
      
      return true;
    }),
  
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  body('special_requests')
    .optional()
    .isString()
    .withMessage('Special requests must be a string')
    .isLength({ max: 1000 })
    .withMessage('Special requests cannot exceed 1000 characters')
];

// ============================================================================
// AVAILABILITY CHECK VALIDATION
// ============================================================================

/**
 * Validation schema for checking salon availability
 */
const checkAvailabilityValidation = [
  param('id')
    .notEmpty()
    .withMessage('Salon ID is required')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
  
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in ISO 8601 format (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      
      // Date cannot be in the past
      if (date < now.setHours(0, 0, 0, 0)) {
        throw new Error('Date cannot be in the past');
      }
      
      // Date cannot be more than 6 months in the future
      const maxDate = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
      if (date > maxDate) {
        throw new Error('Date cannot be more than 6 months in the future');
      }
      
      return true;
    }),
  
  query('staff_id')
    .optional()
    .isUUID()
    .withMessage('Staff ID must be a valid UUID')
];

// ============================================================================
// APPOINTMENT CANCELLATION VALIDATION
// ============================================================================

/**
 * Validation schema for cancelling an appointment
 */
const cancelAppointmentValidation = [
  param('id')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .isUUID()
    .withMessage('Appointment ID must be a valid UUID'),
  
  body('cancellation_reason')
    .optional()
    .isString()
    .withMessage('Cancellation reason must be a string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason cannot exceed 500 characters')
    .custom((value) => {
      if (value && value.trim().length === 0) {
        throw new Error('Cancellation reason cannot be empty if provided');
      }
      return true;
    })
];

// ============================================================================
// APPOINTMENT COMPLETION VALIDATION
// ============================================================================

/**
 * Validation schema for completing an appointment
 */
const completeAppointmentValidation = [
  param('id')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .isUUID()
    .withMessage('Appointment ID must be a valid UUID')
];

// ============================================================================
// APPOINTMENT UPDATE VALIDATION
// ============================================================================

/**
 * Validation schema for updating an appointment
 */
const updateAppointmentValidation = [
  param('id')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .isUUID()
    .withMessage('Appointment ID must be a valid UUID'),
  
  body('salonId')
    .optional()
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
  
  body('staffId')
    .optional()
    .isUUID()
    .withMessage('Staff ID must be a valid UUID'),
  
  body('start_at')
    .optional()
    .isISO8601()
    .withMessage('Start time must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)')
    .custom((value) => {
      const appointmentTime = new Date(value);
      const now = new Date();
      
      // Appointment must be at least 1 hour in the future
      const minTime = new Date(now.getTime() + 60 * 60 * 1000);
      
      if (appointmentTime <= minTime) {
        throw new Error('Appointment must be at least 1 hour in the future');
      }
      
      return true;
    }),
  
  body('service_ids')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one service must be selected')
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('Service IDs must be an array with at least one service');
      }
      
      // Validate each service ID is a UUID
      for (const serviceId of value) {
        if (typeof serviceId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serviceId)) {
          throw new Error('All service IDs must be valid UUIDs');
        }
      }
      
      return true;
    }),
  
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  body('special_requests')
    .optional()
    .isString()
    .withMessage('Special requests must be a string')
    .isLength({ max: 1000 })
    .withMessage('Special requests cannot exceed 1000 characters'),
  
  body('status')
    .optional()
    .isIn(['pending', 'booked', 'cancelled', 'completed'])
    .withMessage('Status must be one of: pending, booked, cancelled, completed')
];

// ============================================================================
// APPOINTMENT LISTING VALIDATION
// ============================================================================

/**
 * Validation schema for listing appointments with filters
 */
const listAppointmentsValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'booked', 'cancelled', 'completed'])
    .withMessage('Status must be one of: pending, booked, cancelled, completed'),
  
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
    .isIn(['start_at', 'created_at', 'total_price', 'status'])
    .withMessage('Sort field must be one of: start_at, created_at, total_price, status'),
  
  query('order')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Order must be ASC or DESC'),
  
  query('salon_id')
    .optional()
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
  
  query('staff_id')
    .optional()
    .isUUID()
    .withMessage('Staff ID must be a valid UUID'),
  
  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Date from must be in ISO 8601 format (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format for date_from');
      }
      return true;
    }),
  
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('Date to must be in ISO 8601 format (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format for date_to');
      }
      return true;
    })
    .custom((value, { req }) => {
      // If both date_from and date_to are provided, ensure date_to is after date_from
      if (value && req.query.date_from) {
        const dateTo = new Date(value);
        const dateFrom = new Date(req.query.date_from);
        
        if (dateTo <= dateFrom) {
          throw new Error('Date to must be after date from');
        }
      }
      return true;
    })
];

// ============================================================================
// APPOINTMENT DETAILS VALIDATION
// ============================================================================

/**
 * Validation schema for getting appointment details
 */
const getAppointmentValidation = [
  param('id')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .isUUID()
    .withMessage('Appointment ID must be a valid UUID')
];

// ============================================================================
// SERVICE LISTING VALIDATION
// ============================================================================

/**
 * Validation schema for listing salon services
 */
const getSalonServicesValidation = [
  param('salon_id')
    .notEmpty()
    .withMessage('Salon ID is required')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID')
];

// ============================================================================
// SALON APPOINTMENT VALIDATION
// ============================================================================

/**
 * Validation schema for salon appointment queries
 */
const salonAppointmentQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('from')
    .optional()
    .isISO8601()
    .withMessage('From date must be a valid ISO8601 date'),
  
  query('to')
    .optional()
    .isISO8601()
    .withMessage('To date must be a valid ISO8601 date')
];

/**
 * Validation schema for appointment ID parameter
 */
const appointmentIdValidation = [
  param('appointmentId')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .isUUID()
    .withMessage('Appointment ID must be a valid UUID')
];

/**
 * Validation schema for updating appointment status
 */
const updateAppointmentStatusValidation = [
  param('appointmentId')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .isUUID()
    .withMessage('Appointment ID must be a valid UUID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'booked', 'cancelled', 'completed'])
    .withMessage('Status must be one of: pending, booked, cancelled, completed'),
  
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

/**
 * Validation schema for appointment statistics query
 */
const appointmentStatsValidation = [
  query('from')
    .optional()
    .isISO8601()
    .withMessage('From date must be a valid ISO8601 date'),
  
  query('to')
    .optional()
    .isISO8601()
    .withMessage('To date must be a valid ISO8601 date')
];

// ============================================================================
// PAYMENT CONFIRMATION VALIDATION (Future Implementation)
// ============================================================================

/**
 * Validation schema for confirming payment
 * @note This will be implemented when payment integration is added
 */
const confirmPaymentValidation = [
  body('appointmentId')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .isUUID()
    .withMessage('Appointment ID must be a valid UUID'),
  
  body('paymentIntentId')
    .notEmpty()
    .withMessage('Payment intent ID is required')
    .isString()
    .withMessage('Payment intent ID must be a string'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number')
];

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Appointment management
  bookAppointmentValidation,
  cancelAppointmentValidation,
  completeAppointmentValidation,
  updateAppointmentValidation,
  getAppointmentValidation,
  
  // Availability and services
  checkAvailabilityValidation,
  getSalonServicesValidation,
  
  // Listing and filtering
  listAppointmentsValidation,
  
  // Salon appointment management
  salonAppointmentQueryValidation,
  appointmentIdValidation,
  updateAppointmentStatusValidation,
  appointmentStatsValidation,
  
  // Payment (future)
  confirmPaymentValidation
};