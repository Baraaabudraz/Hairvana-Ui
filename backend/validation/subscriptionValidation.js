const { body } = require('express-validator');
const { commonRules } = require('./index');

/**
 * Validation schema for creating a new subscription
 */
const createSubscriptionValidation = [
  body('salon_id')
    .notEmpty()
    .withMessage('Salon ID is required')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
  
  body('plan_id')
    .notEmpty()
    .withMessage('Plan ID is required'),
  
  body('status')
    .optional()
    .isIn(['active', 'trial', 'cancelled', 'past_due'])
    .withMessage('Invalid subscription status'),
  
  commonRules.date('start_date'),
  
  commonRules.date('next_billing_date'),
  
  commonRules.requiredNumber('amount'),
  
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
  
  // Validate payment method details if provided
  body('payment_method.type')
    .if(body('payment_method').exists())
    .notEmpty()
    .withMessage('Payment method type is required')
    .isIn(['card'])
    .withMessage('Invalid payment method type'),
  
  body('payment_method.last4')
    .if(body('payment_method').exists())
    .notEmpty()
    .withMessage('Card last 4 digits are required')
    .isLength({ min: 4, max: 4 })
    .withMessage('Card last 4 digits must be 4 characters'),
  
  body('payment_method.brand')
    .if(body('payment_method').exists())
    .notEmpty()
    .withMessage('Card brand is required'),
  
  body('payment_method.expiryMonth')
    .if(body('payment_method').exists())
    .notEmpty()
    .withMessage('Card expiry month is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('Invalid expiry month'),
  
  body('payment_method.expiryYear')
    .if(body('payment_method').exists())
    .notEmpty()
    .withMessage('Card expiry year is required')
    .isInt({ min: new Date().getFullYear() })
    .withMessage('Invalid expiry year'),
];

/**
 * Validation schema for updating an existing subscription
 */
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

/**
 * Validation schema for creating a billing record
 */
const createBillingRecordValidation = [
  body('subscription_id')
    .notEmpty()
    .withMessage('Subscription ID is required')
    .isUUID()
    .withMessage('Subscription ID must be a valid UUID'),
  
  commonRules.date('date'),
  
  commonRules.requiredNumber('amount'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['paid', 'pending', 'failed', 'refunded'])
    .withMessage('Invalid billing status'),
  
  body('description')
    .optional()
    .trim(),
  
  body('invoice_number')
    .optional()
    .trim(),
  
  body('tax_amount')
    .optional()
    .isNumeric()
    .withMessage('Tax amount must be a number'),
  
  body('subtotal')
    .optional()
    .isNumeric()
    .withMessage('Subtotal must be a number'),
];

module.exports = {
  createSubscriptionValidation,
  updateSubscriptionValidation,
  createBillingRecordValidation
};