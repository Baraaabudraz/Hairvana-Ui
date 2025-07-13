const express = require('express');
const router = express.Router();
const mobileUserController = require('../../controllers/Api/mobileUserController');
const { authenticateToken } = require('../../middleware/authMiddleware');
const { updateProfileValidation } = require('../../validation/mobileUserValidation');
const validate = require('../../middleware/validate');

router.get('/profile', authenticateToken, mobileUserController.getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, validate, mobileUserController.updateProfile);

module.exports = router; 