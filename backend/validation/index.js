const { body, param, query } = require('express-validator');

// Common validation rules that can be reused across schemas
const commonRules = {
  // String validations
  requiredString: (field) => body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} is required`),
  
  minLength: (field, min) => body(field)
    .isLength({ min })
    .withMessage(`${field} must be at least ${min} characters long`),
  
  email: (field = 'email') => body(field)
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
  
  password: (field = 'password') => body(field)
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  
  phone: (field = 'phone') => body(field)
    .optional({ checkFalsy: true })
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
  
  // Number validations
  requiredNumber: (field) => body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .isNumeric()
    .withMessage(`${field} must be a number`),
  
  minNumber: (field, min) => body(field)
    .isFloat({ min })
    .withMessage(`${field} must be at least ${min}`),
  
  // Date validations
  date: (field) => body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .isISO8601()
    .withMessage(`${field} must be a valid date`),
  
  // Array validations
  array: (field) => body(field)
    .isArray()
    .withMessage(`${field} must be an array`),
  
  // Object validations
  object: (field) => body(field)
    .isObject()
    .withMessage(`${field} must be an object`),
  
  // Enum validations
  enum: (field, values, required = true) => {
    const validator = body(field)
      .isIn(values)
      .withMessage(`${field} must be one of: ${values.join(', ')}`);
    
    return required ? validator.notEmpty().withMessage(`${field} is required`) : validator.optional();
  },
  
  // URL validations
  url: (field) => body(field)
    .optional()
    .isURL()
    .withMessage(`${field} must be a valid URL`),
  
  // Boolean validations
  boolean: (field) => body(field)
    .isBoolean()
    .withMessage(`${field} must be a boolean`),
  
  // ID validations
  uuid: (field) => body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .isUUID()
    .withMessage(`${field} must be a valid UUID`),
  
  // Query parameter validations
  queryParam: (param, required = false) => {
    const validator = query(param);
    return required ? validator.notEmpty().withMessage(`${param} query parameter is required`) : validator;
  },
  
  // Path parameter validations
  pathParam: (param) => param(param)
    .notEmpty()
    .withMessage(`${param} parameter is required`)
};

module.exports = {
  commonRules
};