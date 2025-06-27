const { body } = require('express-validator');

const createSubscriptionValidation = [
  body('salon_id')
    .notEmpty()
    .withMessage('Salon ID is required'),
  body('plan_id')
    .notEmpty()
    .withMessage('Plan ID is required'),
  body('status')
    .optional()
    .isIn(['active', 'trial', 'cancelled', 'past_due'])
    .withMessage('Invalid subscription status'),
  body('start_date')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('next_billing_date')
    .notEmpty()
    .withMessage('Next billing date is required')
    .isISO8601()
    .withMessage('Invalid next billing date format'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isNumeric()
    .withMessage('Amount must be a number'),
  body('billing_cycle')
    .notEmpty()
    .withMessage('Billing cycle is required')
    .isIn(['monthly', 'yearly'])
    .withMessage('Invalid billing cycle'),
  body('usage')
    .optional()
    .isObject()
    .withMessage('Usage must be an object'),
  body('payment_method')
    .optional()
    .isObject()
    .withMessage('Payment method must be an object'),
];

const updateSubscriptionValidation = [
  body('plan_id')
    .optional()
    .notEmpty()
    .withMessage('Plan ID cannot be empty'),
  body('status')
    .optional()
    .isIn(['active', 'trial', 'cancelled', 'past_due'])
    .withMessage('Invalid subscription status'),
  body('next_billing_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid next billing date format'),
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Amount must be a number'),
  body('billing_cycle')
    .optional()
    .isIn(['monthly', 'yearly'])
    .withMessage('Invalid billing cycle'),
  body('usage')
    .optional()
    .isObject()
    .withMessage('Usage must be an object'),
  body('payment_method')
    .optional()
    .isObject()
    .withMessage('Payment method must be an object'),
];

module.exports = {
  createSubscriptionValidation,
  updateSubscriptionValidation,
};