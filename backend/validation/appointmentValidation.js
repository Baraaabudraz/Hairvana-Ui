const { body, query } = require('express-validator');
const { commonRules } = require('./index');

/**
 * Validation schema for creating a new appointment
 */
const createAppointmentValidation = [
  body('user_id')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  
  body('salon_id')
    .notEmpty()
    .withMessage('Salon ID is required')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
  
  body('service_id')
    .notEmpty()
    .withMessage('Service ID is required')
    .isUUID()
    .withMessage('Service ID must be a valid UUID'),
  
  body('staff_id')
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
  
  query('date')
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

module.exports = {
  createAppointmentValidation,
  updateAppointmentValidation,
  checkAvailabilityValidation,
  cancelAppointmentValidation
};