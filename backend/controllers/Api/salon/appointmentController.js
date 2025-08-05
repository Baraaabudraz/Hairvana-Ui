const appointmentService = require('../../../services/appointmentService');
const salonRepository = require('../../../repositories/salonRepository');
const { validationResult } = require('express-validator');

/**
 * Get all appointment requests (pending status) for a specific salon
 */
exports.getAppointmentRequests = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const ownerId = req.user.id;
    const salonId = req.params.salonId;

    // Verify that the authenticated user owns this salon
    const salon = await salonRepository.findById(salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    if (salon.owner_id !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view appointments for your own salon.'
      });
    }

    // Get pending appointments for the specific salon
    const appointments = await appointmentService.getAppointmentsBySalonIds([salonId], {
      status: 'pending',
      ...req.query
    });

    const message = appointments.length > 0 
      ? 'Appointment requests retrieved successfully'
      : 'No appointment requests found';

    res.json({
      success: true,
      message,
      data: {
        appointments,
        count: appointments.length,
        salon: {
          id: salon.id,
          name: salon.name
        }
      }
    });

  } catch (error) {
    console.error('Error fetching appointment requests:', error);
    next(error);
  }
};

/**
 * Get all upcoming appointments (booked status) for a specific salon
 */
exports.getUpcomingAppointments = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const ownerId = req.user.id;
    const salonId = req.params.salonId;

    // Verify that the authenticated user owns this salon
    const salon = await salonRepository.findById(salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    if (salon.owner_id !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view appointments for your own salon.'
      });
    }

    // Get upcoming appointments for the specific salon
    const appointments = await appointmentService.getAppointmentsBySalonIds([salonId], {
      status: 'booked',
      upcoming: true,
      ...req.query
    });

    const message = appointments.length > 0 
      ? 'Upcoming appointments retrieved successfully'
      : 'No upcoming appointments found';

    res.json({
      success: true,
      message,
      data: {
        appointments,
        count: appointments.length,
        salon: {
          id: salon.id,
          name: salon.name
        }
      }
    });

  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    next(error);
  }
};

/**
 * Get all past appointments (completed/cancelled) for a specific salon
 */
exports.getPastAppointments = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const ownerId = req.user.id;
    const salonId = req.params.salonId;

    // Verify that the authenticated user owns this salon
    const salon = await salonRepository.findById(salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    if (salon.owner_id !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view appointments for your own salon.'
      });
    }

    // Get past appointments for the specific salon
    const appointments = await appointmentService.getAppointmentsBySalonIds([salonId], {
      status: ['completed', 'cancelled'],
      past: true,
      ...req.query
    });

    const message = appointments.length > 0 
      ? 'Past appointments retrieved successfully'
      : 'No past appointments found';

    res.json({
      success: true,
      message,
      data: {
        appointments,
        count: appointments.length,
        salon: {
          id: salon.id,
          name: salon.name
        }
      }
    });

  } catch (error) {
    console.error('Error fetching past appointments:', error);
    next(error);
  }
};

/**
 * Get appointment details by ID (only if it belongs to the specified salon)
 */
exports.getAppointmentById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const ownerId = req.user.id;
    const salonId = req.params.salonId;
    const appointmentId = req.params.appointmentId;

    // Verify that the authenticated user owns this salon
    const salon = await salonRepository.findById(salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    if (salon.owner_id !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view appointments for your own salon.'
      });
    }

    // Get appointment by ID if it belongs to the specified salon
    const appointment = await appointmentService.getAppointmentByIdForSalons(appointmentId, [salonId]);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not accessible'
      });
    }

    res.json({
      success: true,
      message: 'Appointment details retrieved successfully',
      data: {
        appointment,
        salon: {
          id: salon.id,
          name: salon.name
        }
      }
    });

  } catch (error) {
    console.error('Error fetching appointment details:', error);
    next(error);
  }
};

/**
 * Update appointment status (approve, reject, complete) for a specific salon
 */
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const ownerId = req.user.id;
    const salonId = req.params.salonId;
    const appointmentId = req.params.appointmentId;
    const { status, notes } = req.body;

    // Verify that the authenticated user owns this salon
    const salon = await salonRepository.findById(salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    if (salon.owner_id !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update appointments for your own salon.'
      });
    }

    // Verify appointment belongs to the specified salon
    const existingAppointment = await appointmentService.getAppointmentByIdForSalons(appointmentId, [salonId]);
    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not accessible'
      });
    }

    // Update appointment status
    const updateData = { status };
    if (notes) updateData.notes = notes;
    if (status === 'cancelled') {
      updateData.cancelled_at = new Date();
      updateData.cancelled_by = ownerId;
    }

    const updatedAppointment = await appointmentService.updateAppointmentStatus(appointmentId, updateData);

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: {
        appointment: updatedAppointment,
        salon: {
          id: salon.id,
          name: salon.name
        }
      }
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    next(error);
  }
};

/**
 * Get appointment statistics for a specific salon
 */
exports.getAppointmentStats = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const salonId = req.params.salonId;

    // Verify that the authenticated user owns this salon
    const salon = await salonRepository.findById(salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    if (salon.owner_id !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view statistics for your own salon.'
      });
    }

    // Get appointment statistics for the specific salon
    const stats = await appointmentService.getAppointmentStatsBySalonIds([salonId], req.query);

    res.json({
      success: true,
      message: 'Appointment statistics retrieved successfully',
      data: {
        stats,
        salon: {
          id: salon.id,
          name: salon.name
        }
      }
    });

  } catch (error) {
    console.error('Error fetching appointment statistics:', error);
    next(error);
  }
}; 