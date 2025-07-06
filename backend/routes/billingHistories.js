const express = require('express');
const router = express.Router();
const billingHistoryController = require('../controllers/billingHistoryController');

// Create a new billing history (invoice)
router.post('/', billingHistoryController.createBillingHistory);

module.exports = router;