const express = require('express');
const router = express.Router();
const { registerDevice } = require('../../../../controllers/Api/customer/mobileDeviceController');
const { authenticateCustomer } = require('../../../../middleware/passportMiddleware');

router.post('/', authenticateCustomer, registerDevice);

module.exports = router; 