const { body } = require('express-validator');
const { validationResult } = require('express-validator');

// Validation rules for billing history
const validateBillingHistory = (isUpdate = false) => {
  const validations = [
    // subscription_id is required for creation
    ...(isUpdate ? [] : [
      body('subscription_id')
        .notEmpty()
        .withMessage('Subscription ID is required')
        .isUUID()
        .withMessage('Subscription ID must be a valid UUID')
    ]),
    
    // date validation
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date'),
    
    // amount validation
    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number'),
    
    // status validation
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['pending', 'paid', 'overdue', 'cancelled', 'refunded'])
      .withMessage('Status must be one of: pending, paid, overdue, cancelled, refunded'),
    
    // description validation (optional)
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters'),
    
    // invoice_number validation (optional)
    body('invoice_number')
      .optional()
      .isString()
      .withMessage('Invoice number must be a string')
      .isLength({ max: 100 })
      .withMessage('Invoice number must be less than 100 characters'),
    
    // tax_amount validation (optional)
    body('tax_amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Tax amount must be a positive number'),
    
    // subtotal validation (optional)
    body('subtotal')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Subtotal must be a positive number'),
    
    // total validation (optional)
    body('total')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Total must be a positive number'),
    
    // notes validation (optional)
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes must be a string')
      .isLength({ max: 1000 })
      .withMessage('Notes must be less than 1000 characters')
  ];
  
  return validations;
};

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateBillingHistory,
  handleValidationErrors
}; 