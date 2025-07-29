const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginValidation, registerValidation, changePasswordValidation } = require('../validation/authValidation');
const validate = require('../middleware/validate');
const { authenticateToken } = require('../middleware/authMiddleware');
const { loginRateLimit, registerRateLimit, passwordChangeRateLimit } = require('../middleware/rateLimitMiddleware');

// Public routes
router.post('/login', loginRateLimit, loginValidation, validate, authController.login);
router.post('/register', registerRateLimit, registerValidation, validate, authController.register);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser);
router.get('/permissions', authenticateToken, authController.getUserPermissions);
router.post('/change-password', authenticateToken, passwordChangeRateLimit, changePasswordValidation, validate, authController.changePassword);

module.exports = router;