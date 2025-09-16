const express = require('express');
const router = express.Router();
const salonSupportController = require('../../../../controllers/Api/salon/salonSupportController');
const { authenticateOwner } = require('../../../../middleware/authMiddleware');
const { validate } = require('../../../../middleware/validationMiddleware');
const {
  createSalonSupportTicketValidation,
  addSalonSupportMessageValidation,
  getSalonSupportTicketsValidation,
  salonSupportTicketIdValidation
} = require('../../../../validation/salonSupportValidation');

// Routes for salon owner support functionality

// Get support ticket statistics for salon owner
router.get('/stats', 
  authenticateOwner, 
  salonSupportController.getMyStats
);

// Get support categories available for salon owners
router.get('/categories', 
  authenticateOwner, 
  salonSupportController.getSupportCategories
);

// Get salon owner's subscriptions for context
router.get('/subscriptions', 
  authenticateOwner, 
  salonSupportController.getMySubscriptions
);

// Get all support tickets for salon owner (with filters)
router.get('/tickets', 
  authenticateOwner, 
  getSalonSupportTicketsValidation, 
  validate, 
  salonSupportController.getMyTickets
);

// Get single support ticket by ID (only if belongs to salon owner)
router.get('/tickets/:id', 
  authenticateOwner, 
  salonSupportTicketIdValidation, 
  validate, 
  salonSupportController.getTicketById
);

// Create new support ticket
router.post('/tickets', 
  authenticateOwner, 
  createSalonSupportTicketValidation, 
  validate, 
  salonSupportController.createTicket
);

// Add message to support ticket (only if belongs to salon owner)
router.post('/tickets/:id/messages', 
  authenticateOwner, 
  addSalonSupportMessageValidation, 
  validate, 
  salonSupportController.addMessage
);

module.exports = router;
