const express = require('express');
const router = express.Router();
const salonController = require('../../../../controllers/Api/customer/salonController');
const { getSalonsValidation, getSalonByIdValidation } = require('../../../../validation/salonValidation');
const validate = require('../../../../middleware/validate');
const { authenticateCustomer } = require('../../../../middleware/passportMiddleware');


router.get('/', getSalonsValidation,authenticateCustomer, validate, salonController.getSalons);
router.get('/:id', getSalonByIdValidation,authenticateCustomer, validate, salonController.getSalonById);

module.exports = router; 