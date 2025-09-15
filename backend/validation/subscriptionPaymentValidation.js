const { body } = require('express-validator');

/**
 * Validation schema for creating subscription payment intent
 */
const createSubscriptionPaymentIntentValidation = [
  body('planId')
    .notEmpty()
    .withMessage('Plan ID is required')
    .isUUID()
    .withMessage('Plan ID must be a valid UUID'),

  body('billingCycle')
    .optional()
    .isIn(['monthly', 'yearly'])
    .withMessage('Invalid billing cycle'),

  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('User ID must be a valid UUID')
];

/**
 * Validation schema for creating upgrade/downgrade payment intent
 */
const createUpgradeDowngradePaymentIntentValidation = [
  body('planId')
    .notEmpty()
    .withMessage('Plan ID is required')
    .isUUID()
    .withMessage('Plan ID must be a valid UUID'),

  body('billingCycle')
    .optional()
    .isIn(['monthly', 'yearly'])
    .withMessage('Invalid billing cycle'),

  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('User ID must be a valid UUID')
];

/**
 * Validation schema for refunding payment
 */
const refundPaymentValidation = [
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Reason must be less than 500 characters')
];

module.exports = {
  createSubscriptionPaymentIntentValidation,
  createUpgradeDowngradePaymentIntentValidation,
  refundPaymentValidation
};
