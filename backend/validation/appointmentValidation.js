const { body, query } = require('express-validator');
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

module.exports = {
  createAppointmentValidation,
  updateAppointmentValidation,
  checkAvailabilityValidation,
  cancelAppointmentValidation,
  bookAppointmentValidation,
};