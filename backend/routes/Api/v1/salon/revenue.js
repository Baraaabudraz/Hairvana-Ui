const express = require('express');
const router = express.Router();
const { authenticateOwner } = require('../../../../middleware/passportMiddleware');
const salonController = require('../../../../controllers/Api/salon/salonController');
const { getMonthlyRevenueValidation, getTransactionHistoryValidation } = require('../../../../validation/salonValidation');
const validate = require('../../../../middleware/validate');

// Get monthly revenue for a specific salon
router.get('/:salonId/monthly-revenue', 
  authenticateOwner, 
  getMonthlyRevenueValidation,
  validate,
  salonController.getMonthlyRevenue
);

// Get transaction history for a specific salon
router.get('/:salonId/transaction-history', 
  authenticateOwner, 
  getTransactionHistoryValidation,
  validate,
  salonController.getTransactionHistory
);

module.exports = router; 