const express = require('express');
const router = express.Router();
const mobileAuthController = require('../../../../controllers/Api/customer/auth/mobileAuthController');
const { registerValidation, loginValidation } = require('../../../../validation/mobileAuthValidation');
const validate = require('../../../../middleware/validate');
const { authenticateToken } = require('../../../../middleware/authMiddleware');
const { authenticateCustomer } = require('../../../../middleware/authMiddleware');

router.post('/register', registerValidation, validate, mobileAuthController.register);
router.post('/login', loginValidation, validate, mobileAuthController.login);
router.post('/logout', authenticateToken, mobileAuthController.logout);

module.exports = router; 