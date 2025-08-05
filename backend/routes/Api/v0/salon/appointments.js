const express = require('express');
const router = express.Router();
const appointmentController = require('../../../../controllers/Api/salon/appointmentController');
const { authenticateOwner } = require('../../../../middleware/passportMiddleware');
const { 
  salonAppointmentQueryValidation,
  appointmentIdValidation,
  updateAppointmentStatusValidation,
  appointmentStatsValidation
} = require('../../../../validation/appointmentValidation');
const { salonIdValidation } = require('../../../../validation/salonValidation');
const validate = require('../../../../middleware/validate');

// Protect all routes with salon owner authentication
router.use(authenticateOwner);

// GET /backend/api/v0/salon/appointments/:salonId/requests - Get appointment requests (pending) for specific salon
router.get('/:salonId/requests', 
  salonIdValidation,
  salonAppointmentQueryValidation, 
  validate, 
  appointmentController.getAppointmentRequests
);

// GET /backend/api/v0/salon/appointments/:salonId/upcoming - Get upcoming appointments (booked) for specific salon
router.get('/:salonId/upcoming', 
  salonIdValidation,
  salonAppointmentQueryValidation, 
  validate, 
  appointmentController.getUpcomingAppointments
);

// GET /backend/api/v0/salon/appointments/:salonId/past - Get past appointments (completed/cancelled) for specific salon
router.get('/:salonId/past', 
  salonIdValidation,
  salonAppointmentQueryValidation, 
  validate, 
  appointmentController.getPastAppointments
);

// GET /backend/api/v0/salon/appointments/:salonId/stats - Get appointment statistics for specific salon
router.get('/:salonId/stats', 
  salonIdValidation,
  appointmentStatsValidation, 
  validate, 
  appointmentController.getAppointmentStats
);

// GET /backend/api/v0/salon/appointments/:salonId/:appointmentId - Get appointment details by ID for specific salon
router.get('/salon/:salonId/appointment/:appointmentId', 
  salonIdValidation,
  appointmentIdValidation, 
  validate, 
  appointmentController.getAppointmentById
);

// PUT /backend/api/v0/salon/appointments/:salonId/:appointmentId/status - Update appointment status for specific salon
router.put('/salon/:salonId/appointment/:appointmentId/status', 
  salonIdValidation,
  updateAppointmentStatusValidation, 
  validate, 
  appointmentController.updateAppointmentStatus
);

module.exports = router; 