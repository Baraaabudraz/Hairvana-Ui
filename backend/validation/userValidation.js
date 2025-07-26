const { body } = require("express-validator");
const { commonRules } = require("./index");

/**
 * Validation schema for creating a new user
 */
const createUserValidation = [
  commonRules
    .requiredString("name")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),
  commonRules.email(),
  commonRules.password(),
  body("role_id").isUUID().withMessage("role_id must be a valid UUID"),
  commonRules.phone(),

  // Conditional validation for salon role (if you want to keep this, you may need to fetch role name from DB in controller)
  body("salonName").optional().trim(),
  body("salonAddress").optional().trim(),
  body("businessLicense").optional().trim(),
  body("subscription")
    .optional()
    .isIn(["Basic", "Standard", "Premium"])
    .withMessage("Invalid subscription plan"),
];

/**
 * Validation schema for updating an existing user
 */
const updateUserValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email address"),

  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("role_id")
    .optional()
    .isUUID()
    .withMessage("role_id must be a valid UUID"),

  commonRules.phone(),

  body("status")
    .optional()
    .isIn(["active", "pending", "suspended"])
    .withMessage("Invalid user status"),

  body("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),
];

/**
 * Validation schema for updating user status
 */
const updateUserStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["active", "pending", "suspended"])
    .withMessage("Invalid status value"),
];

module.exports = {
  createUserValidation,
  updateUserValidation,
  updateUserStatusValidation,
};
