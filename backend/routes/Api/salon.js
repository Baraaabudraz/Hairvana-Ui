const express = require('express');
const router = express.Router();
const salonController = require('../../controllers/Api/salonController');
const { getSalonsValidation, getSalonByIdValidation } = require('../../validation/salonValidation');
const validate = require('../../middleware/validate');

router.get('/', getSalonsValidation, validate, salonController.getSalons);
router.get('/:id', getSalonByIdValidation, validate, salonController.getSalonById);

module.exports = router; 