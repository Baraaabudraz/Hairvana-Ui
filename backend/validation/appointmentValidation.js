const { body, query, param } = require('express-validator');
const { commonRules } = require('./index');

/**
 * Validation schema for creating a new appointment
 */
const createAppointmentValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  
  body('salonId')
    .notEmpty()
    .withMessage('Salon ID is required')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
  
  body('serviceId')
    .notEmpty()
    .withMessage('Service ID is required')
    .isUUID()
    .withMessage('Service ID must be a valid UUID'),
  
  body('staffId')
    .notEmpty()
    .withMessage('Staff ID is required')
    .isUUID()
    .withMessage('Staff ID must be a valid UUID'),
  
  commonRules.date('date'),
  
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])
    .withMessage('Invalid appointment status'),
  
  body('notes')
    .optional()
    .trim(),
];

/**
 * Validation schema for updating an existing appointment
 */
const updateAppointmentValidation = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])
    .withMessage('Invalid appointment status'),
  
  body('notes')
    .optional()
    .trim(),
];

/**
 * Validation schema for checking availability
 */
const checkAvailabilityValidation = [
  query('salonId')
    .notEmpty()
    .withMessage('Salon ID is required')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
  
  query('staffId')
    .notEmpty()
    .withMessage('Staff ID is required')
    .isUUID()
    .withMessage('Staff ID must be a valid UUID'),
  
  query('serviceId')
    .notEmpty()
    .withMessage('Service ID is required')
    .isUUID()
    .withMessage('Service ID must be a valid UUID'),
  
  query('start_at')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
];

/**
 * Validation schema for cancelling an appointment
 */
const cancelAppointmentValidation = [
  body('reason')
    .optional()
    .trim(),
];

/**
 * Validation schema for booking an appointment (mobile API)
 */
const bookAppointmentValidation = [
  body('salonId')
    .notEmpty()
    .withMessage('Salon ID is required')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),

  body('start_at')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be in ISO8601 format'),

  body('service_ids')
    .isArray({ min: 1 })
    .withMessage('At least one service must be selected'),
  body('service_ids.*')
    .isUUID()
    .withMessage('Each service ID must be a valid UUID'),

  body('staffId')
    .notEmpty()
    .withMessage('Staff ID is required')
    .isUUID()
    .withMessage('Staff ID must be a valid UUID'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
];

/**
 * Validation schema for salon owner appointment queries
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
    .withMessage('To date must be a valid ISO8601 date'),
];

/**
 * Validation schema for appointment ID parameter
 */
const appointmentIdValidation = [
  param('appointmentId')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .isUUID()
    .withMessage('Appointment ID must be a valid UUID'),
];

/**
 * Validation schema for updating appointment status
 */
const updateAppointmentStatusValidation = [
  ...appointmentIdValidation,
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'booked', 'cancelled', 'completed'])
    .withMessage('Status must be one of: pending, booked, cancelled, completed'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
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
    .withMessage('To date must be a valid ISO8601 date'),
];

module.exports = {
  createAppointmentValidation,
  updateAppointmentValidation,
  checkAvailabilityValidation,
  cancelAppointmentValidation,
  bookAppointmentValidation,
  salonAppointmentQueryValidation,
  appointmentIdValidation,
  updateAppointmentStatusValidation,
  appointmentStatsValidation,
};