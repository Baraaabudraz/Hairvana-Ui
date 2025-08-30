const { body } = require('express-validator');
const { commonRules } = require('./index');

/**
 * Validation schema for creating a new subscription
 * Simplified: Only planId required - everything else is calculated automatically
 */
const createSubscriptionValidation = [
  body('planId')
    .notEmpty()
    .withMessage('Plan ID is required')
    .isUUID()
    .withMessage('Plan ID must be a valid UUID'),
  
  // Optional billing cycle - defaults to plan's default billing period
  body('billingCycle')
    .optional()
    .isIn(['monthly', 'yearly'])
    .withMessage('Invalid billing cycle'),
  
  // All other fields are calculated automatically:
  // - amount: calculated from plan pricing
  // - startDate: set to current date
  // - nextBillingDate: calculated based on billing cycle
  // - status: defaults to 'active'
  // - usage: initialized with plan limits
];

/**
 * Validation schema for upgrading/downgrading subscriptions
 * Simplified: Only planId required - everything else is calculated automatically
 */
const updateSubscriptionValidation = [
  body('planId')
    .notEmpty()
    .withMessage('Plan ID is required')
    .isUUID()
    .withMessage('Plan ID must be a valid UUID'),

  // Optional billing cycle - if not provided, keeps current billing cycle
  body('billingCycle')
    .optional()
    .isIn(['monthly', 'yearly'])
    .withMessage('Invalid billing cycle'),

  // All other fields are calculated automatically:
  // - amount: calculated from plan pricing
  // - nextBillingDate: calculated based on upgrade/downgrade logic
  // - status: managed automatically
  // - usage: preserved and updated with new limits
];

/**
 * Validation schema for subscription payment intent creation
 */
const createPaymentIntentValidation = [
  body('planId')
    .notEmpty()
    .withMessage('Plan ID is required')
    .isUUID()
    .withMessage('Plan ID must be a valid UUID'),

  body('billingCycle')
    .optional()
    .isIn(['monthly', 'yearly'])
    .withMessage('Invalid billing cycle')
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
  createBillingRecordValidation,
  createPaymentIntentValidation
};