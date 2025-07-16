const express = require('express');
const router = express.Router();
const { registerDevice } = require('../../../../controllers/Api/customer/mobileDeviceController');
const { authenticateToken } = require('../../../../middleware/authMiddleware');

router.post('/', authenticateToken, registerDevice);

module.exports = router; 