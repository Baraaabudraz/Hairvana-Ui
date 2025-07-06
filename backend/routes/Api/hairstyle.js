const express = require('express');
const router = express.Router();
const hairstyleController = require('../../controllers/Api/hairstyleController');
const { getHairstylesValidation, getHairstyleByIdValidation } = require('../../validation/hairstyleValidation');
const validate = require('../../middleware/validate');

router.get('/', getHairstylesValidation, validate, hairstyleController.getHairstyles);
router.get('/:id', getHairstyleByIdValidation, validate, hairstyleController.getHairstyleById);

module.exports = router; 