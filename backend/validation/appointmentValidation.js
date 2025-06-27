const { body } = require('express-validator');

const createAppointmentValidation = [
  body('user_id')
    .notEmpty()
    .withMessage('User ID is required'),
  body('salon_id')
    .notEmpty()
    .withMessage('Salon ID is required'),
  body('service_id')
    .notEmpty()
    .withMessage('Service ID is required'),
  body('staff_id')
    .notEmpty()
    .withMessage('Staff ID is required'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
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

module.exports = {
  createAppointmentValidation,
  updateAppointmentValidation,
};