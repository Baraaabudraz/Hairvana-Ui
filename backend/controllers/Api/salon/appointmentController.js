const appointmentService = require('../../../services/appointmentService');
const salonRepository = require('../../../repositories/salonRepository');
const { validationResult } = require('express-validator');

/**
 * Get all appointment requests (pending status) for salon owner's salons
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

    // Get all salons for this owner
    const salons = await salonRepository.findAllByOwnerId(ownerId);
    if (!salons || salons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No salons found for this owner'
      });
    }

    const salonIds = salons.map(salon => salon.id);

    // Get pending appointments for all owner's salons
    const appointments = await appointmentService.getAppointmentsBySalonIds(salonIds, {
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
        salons: salons.length
      }
    });

  } catch (error) {
    console.error('Error fetching appointment requests:', error);
    next(error);
  }
};

/**
 * Get all upcoming appointments (booked status) for salon owner's salons
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

    // Get all salons for this owner
    const salons = await salonRepository.findAllByOwnerId(ownerId);
    if (!salons || salons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No salons found for this owner'
      });
    }

    const salonIds = salons.map(salon => salon.id);

    // Get upcoming appointments for all owner's salons
    const appointments = await appointmentService.getAppointmentsBySalonIds(salonIds, {
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
        salons: salons.length
      }
    });

  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    next(error);
  }
};

/**
 * Get all past appointments (completed/cancelled) for salon owner's salons
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

    // Get all salons for this owner
    const salons = await salonRepository.findAllByOwnerId(ownerId);
    if (!salons || salons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No salons found for this owner'
      });
    }

    const salonIds = salons.map(salon => salon.id);

    // Get past appointments for all owner's salons
    const appointments = await appointmentService.getAppointmentsBySalonIds(salonIds, {
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
        salons: salons.length
      }
    });

  } catch (error) {
    console.error('Error fetching past appointments:', error);
    next(error);
  }
};

/**
 * Get appointment details by ID (only if it belongs to owner's salon)
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
    const appointmentId = req.params.appointmentId;

    // Get all salons for this owner
    const salons = await salonRepository.findAllByOwnerId(ownerId);
    if (!salons || salons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No salons found for this owner'
      });
    }

    const salonIds = salons.map(salon => salon.id);

    // Get appointment by ID if it belongs to owner's salon
    const appointment = await appointmentService.getAppointmentByIdForSalons(appointmentId, salonIds);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not accessible'
      });
    }

    res.json({
      success: true,
      message: 'Appointment details retrieved successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Error fetching appointment details:', error);
    next(error);
  }
};

/**
 * Update appointment status (approve, reject, complete)
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
    const appointmentId = req.params.appointmentId;
    const { status, notes } = req.body;

    // Get all salons for this owner
    const salons = await salonRepository.findAllByOwnerId(ownerId);
    if (!salons || salons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No salons found for this owner'
      });
    }

    const salonIds = salons.map(salon => salon.id);

    // Verify appointment belongs to owner's salon
    const existingAppointment = await appointmentService.getAppointmentByIdForSalons(appointmentId, salonIds);
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
      data: updatedAppointment
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    next(error);
  }
};

/**
 * Get appointment statistics for salon owner
 */
exports.getAppointmentStats = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Get all salons for this owner
    const salons = await salonRepository.findAllByOwnerId(ownerId);
    if (!salons || salons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No salons found for this owner'
      });
    }

    const salonIds = salons.map(salon => salon.id);

    // Get appointment statistics
    const stats = await appointmentService.getAppointmentStatsBySalonIds(salonIds, req.query);

    res.json({
      success: true,
      message: 'Appointment statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Error fetching appointment statistics:', error);
    next(error);
  }
}; 