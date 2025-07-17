const { body } = require('express-validator');
const { commonRules } = require('./index');

/**
 * Validation schema for creating a new subscription
 */
const createSubscriptionValidation = [
  body('salonId')
    .notEmpty()
    .withMessage('Salon ID is required')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
  
  body('planId')
    .notEmpty()
    .withMessage('Plan ID is required'),
  
  body('status')
    .optional()
    .isIn(['active', 'trial', 'cancelled', 'past_due'])
    .withMessage('Invalid subscription status'),
  
  commonRules.date('startDate'),
  
  commonRules.date('nextBillingDate'),
  
  commonRules.requiredNumber('amount'),
  
  body('billingCycle')
    .notEmpty()
    .withMessage('Billing cycle is required')
    .isIn(['monthly', 'yearly'])
    .withMessage('Invalid billing cycle'),
  
  body('usage')
    .optional()
    .isObject()
    .withMessage('Usage must be an object'),
  
  body('paymentMethod')
    .optional()
    .isObject()
    .withMessage('Payment method must be an object'),
  
  // Validate payment method details if provided
  body('paymentMethod.type')
    .if(body('paymentMethod').exists())
    .notEmpty()
    .withMessage('Payment method type is required')
    .isIn(['card'])
    .withMessage('Invalid payment method type'),
  
  body('paymentMethod.last4')
    .if(body('paymentMethod').exists())
    .notEmpty()
    .withMessage('Card last 4 digits are required')
    .isLength({ min: 4, max: 4 })
    .withMessage('Card last 4 digits must be 4 characters'),
  
  body('paymentMethod.brand')
    .if(body('paymentMethod').exists())
    .notEmpty()
    .withMessage('Card brand is required'),
  
  body('paymentMethod.expiryMonth')
    .if(body('paymentMethod').exists())
    .notEmpty()
    .withMessage('Card expiry month is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('Invalid expiry month'),
  
  body('paymentMethod.expiryYear')
    .if(body('paymentMethod').exists())
    .notEmpty()
    .withMessage('Card expiry year is required')
    .isInt({ min: new Date().getFullYear() })
    .withMessage('Invalid expiry year'),
];

/**
 * Validation schema for updating an existing subscription
 */
const updateSubscriptionValidation = [
  body('planId')
    .optional()
    .notEmpty()
    .withMessage('Plan ID cannot be empty'),
  
  body('status')
    .optional()
    .isIn(['active', 'trial', 'cancelled', 'past_due'])
    .withMessage('Invalid subscription status'),
  
  body('nextBillingDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid next billing date format'),
  
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Amount must be a number'),
  
  body('billingCycle')
    .optional()
    .isIn(['monthly', 'yearly'])
    .withMessage('Invalid billing cycle'),
  
  body('usage')
    .optional()
    .isObject()
    .withMessage('Usage must be an object'),
  
  body('paymentMethod')
    .optional()
    .isObject()
    .withMessage('Payment method must be an object'),
];

/**
 * Validation schema for creating a billing record
 */
const createBillingRecordValidation = [
  body('subscriptionId')
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
  
  body('invoiceNumber')
    .optional()
    .trim(),
  
  body('taxAmount')
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