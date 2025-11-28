const express = require('express');
const router = express.Router();
const hairstyleController = require('../../../../controllers/Api/customer/hairstyleController');
const { getHairstylesValidation, getHairstyleByIdValidation } = require('../../../../validation/hairstyleValidation');
const validate = require('../../../../middleware/validate');
const { authenticateCustomer } = require('../../../../middleware/passportMiddleware');


router.get('/', getHairstylesValidation,authenticateCustomer, validate, hairstyleController.getHairstyles);
router.get('/:id', getHairstyleByIdValidation,authenticateCustomer, validate, hairstyleController.getHairstyleById);

module.exports = router; 