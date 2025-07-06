const express = require('express');
const router = express.Router();
const mobileUserController = require('../../controllers/Api/mobileUserController');
const { protect } = require('../../middleware/authMiddleware');
const { updateProfileValidation } = require('../../validation/mobileUserValidation');
const validate = require('../../middleware/validate');

router.get('/profile', protect, mobileUserController.getProfile);
router.put('/profile', protect, updateProfileValidation, validate, mobileUserController.updateProfile);

module.exports = router; 