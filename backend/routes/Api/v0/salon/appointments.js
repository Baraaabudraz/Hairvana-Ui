const express = require('express');
const router = express.Router();
const appointmentController = require('../../../../controllers/Api/salon/appointmentController');
const { authenticateOwner } = require('../../../../middleware/authMiddleware');
const { 
  salonAppointmentQueryValidation,
  appointmentIdValidation,
  updateAppointmentStatusValidation,
  appointmentStatsValidation
} = require('../../../../validation/appointmentValidation');
const validate = require('../../../../middleware/validate');

// Protect all routes with salon owner authentication
router.use(authenticateOwner);

// GET /backend/api/v0/salon/appointments/requests - Get appointment requests (pending)
router.get('/requests', 
  salonAppointmentQueryValidation, 
  validate, 
  appointmentController.getAppointmentRequests
);

// GET /backend/api/v0/salon/appointments/upcoming - Get upcoming appointments (booked)
router.get('/upcoming', 
  salonAppointmentQueryValidation, 
  validate, 
  appointmentController.getUpcomingAppointments
);

// GET /backend/api/v0/salon/appointments/past - Get past appointments (completed/cancelled)
router.get('/past', 
  salonAppointmentQueryValidation, 
  validate, 
  appointmentController.getPastAppointments
);

// GET /backend/api/v0/salon/appointments/stats - Get appointment statistics
router.get('/stats', 
  appointmentStatsValidation, 
  validate, 
  appointmentController.getAppointmentStats
);

// GET /backend/api/v0/salon/appointments/:appointmentId - Get appointment details by ID
router.get('/:appointmentId', 
  appointmentIdValidation, 
  validate, 
  appointmentController.getAppointmentById
);

// PUT /backend/api/v0/salon/appointments/:appointmentId/status - Update appointment status
router.put('/:appointmentId/status', 
  updateAppointmentStatusValidation, 
  validate, 
  appointmentController.updateAppointmentStatus
);

module.exports = router; 