const express = require('express');
const router = express.Router();
const mobileAuthController = require('../../controllers/Api/mobileAuthController');
const { registerValidation, loginValidation } = require('../../validation/mobileAuthValidation');
const validate = require('../../middleware/validate');

router.post('/register', registerValidation, validate, mobileAuthController.register);
router.post('/login', loginValidation, validate, mobileAuthController.login);

module.exports = router; 