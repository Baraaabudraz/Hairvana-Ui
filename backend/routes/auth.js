const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginValidation, registerValidation, changePasswordValidation } = require('../validation/authValidation');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', loginValidation, validate, authController.login);
router.post('/register', registerValidation, validate, authController.register);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', protect, authController.getCurrentUser);
router.post('/change-password', protect, changePasswordValidation, validate, authController.changePassword);

module.exports = router;