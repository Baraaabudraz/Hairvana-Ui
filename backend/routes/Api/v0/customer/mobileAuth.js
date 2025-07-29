const express = require('express');
const router = express.Router();
const mobileAuthController = require('../../../../controllers/Api/customer/auth/mobileAuthController');
const { registerValidation, loginValidation } = require('../../../../validation/mobileAuthValidation');
const validate = require('../../../../middleware/validate');
const { 
  authenticateCustomer, 
  authenticateCustomerLocal,
  authenticateRefreshToken,
  authenticateForLogout,
  securityHeaders,
  auditLog 
} = require('../../../../middleware/passportMiddleware');
const { loginRateLimit, registerRateLimit, passwordChangeRateLimit } = require('../../../../middleware/rateLimitMiddleware');


// Apply security headers to all routes
router.use(securityHeaders);

// Public routes (no authentication required)
router.post('/register', 
  registerValidation, 
  registerRateLimit,
  validate,
  auditLog('customer_register'),
  mobileAuthController.register
);

router.post('/login', 
  loginValidation, 
  validate,
  loginRateLimit,
  auditLog('customer_login'),
  authenticateCustomerLocal,
  mobileAuthController.login
);

// Protected routes (require authentication)
router.post('/logout', 
  authenticateForLogout,
  auditLog('customer_logout'),
  mobileAuthController.logout
);

router.post('/logout-all', 
  authenticateForLogout,
  auditLog('customer_logout_all'),
  mobileAuthController.logoutAll
);

router.post('/refresh', 
  authenticateRefreshToken,
  auditLog('token_refresh'),
  mobileAuthController.refresh
);

router.get('/profile', 
  authenticateCustomer,
  mobileAuthController.getProfile
);

router.put('/change-password',
  authenticateCustomer,
  [
    require('express-validator').body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    require('express-validator').body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ],
  passwordChangeRateLimit,
  validate,
  auditLog('password_change'),
  mobileAuthController.changePassword
);

router.get('/token-audit',
  authenticateCustomer,
  mobileAuthController.getTokenAudit
);

module.exports = router; 