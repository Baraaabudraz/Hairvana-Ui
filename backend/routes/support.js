const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { authenticateJWT, authenticateAdmin } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  createTicketValidation,
  updateTicketValidation,
  addMessageValidation,
  processCancellationValidation,
  processRefundValidation,
  getTicketsValidation,
  ticketIdValidation
} = require('../validation/supportValidation');

// Routes

// Get support statistics (Admin only)
router.get('/stats', 
  authenticateAdmin, 
  supportController.getStats
);

// Get all support tickets with filters (Admin only)
router.get('/', 
  authenticateAdmin, 
  getTicketsValidation, 
  validate, 
  supportController.getTickets
);

// Get single support ticket by ID
router.get('/:id', 
  authenticateJWT, 
  ticketIdValidation, 
  validate, 
  supportController.getTicketById
);

// Create new support ticket
router.post('/', 
  authenticateJWT, 
  createTicketValidation, 
  validate, 
  supportController.createTicket
);

// Update support ticket (Admin only)
router.put('/:id', 
  authenticateAdmin, 
  updateTicketValidation, 
  validate, 
  supportController.updateTicket
);

// Add message to support ticket
router.post('/:id/messages', 
  authenticateJWT, 
  addMessageValidation, 
  validate, 
  supportController.addMessage
);

// Process subscription cancellation (Admin only)
router.post('/:ticketId/cancel-subscription', 
  authenticateAdmin, 
  processCancellationValidation, 
  validate, 
  supportController.processCancellation
);

// Process refund request (Admin only)
router.post('/:ticketId/process-refund', 
  authenticateAdmin, 
  processRefundValidation, 
  validate, 
  supportController.processRefund
);

module.exports = router;
