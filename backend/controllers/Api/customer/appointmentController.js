'use strict';

const { Appointment, Salon, Staff, Service, AppointmentService, Payment, Address, sequelize } = require('../../../models');
const { Op } = require('sequelize');
const { serializeAppointment } = require('../../../serializers/appointmentSerializer');
const notificationService = require('../../../services/notificationService');

/**
 * Standard API Response Helper
 */
const createApiResponse = (success, message, data = null, statusCode = 200) => {
  const response = {
    success,
    message,
    ...(data && { data })
  };
  return { response, statusCode };
};

/**
 * Error Response Helper
 */
const createErrorResponse = (message, statusCode = 500, details = null) => {
  const response = {
    success: false,
    message,
    ...(details && { details })
  };
  return { response, statusCode };
};

/**
 * Get availability for a salon
 * @route GET /api/mobile/salons/:id/availability
 */
exports.getAvailability = async (req, res) => {
  try {
    const salonId = req.params.id;
    
    // Find salon
    const salon = await Salon.findByPk(salonId);
    if (!salon) {
      const { response, statusCode } = createErrorResponse(
        'Salon not found',
        404
      );
      return res.status(statusCode).json(response);
    }

    const hours = salon.hours || {};
    
    // Generate next 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return date;
    });

    // Fetch booked appointments for the next 7 days
    const startDate = days[0].toISOString().split('T')[0];
    const endDate = days[days.length - 1].toISOString().split('T')[0];
    
    const appointments = await Appointment.findAll({
      where: {
        salon_id: salonId,
        start_at: { 
          [Op.between]: [
            startDate + 'T00:00:00.000Z', 
            endDate + 'T23:59:59.999Z'
          ] 
        },
        status: 'booked'
      }
    });

    // Helper function to generate time slots
    const generateSlots = (start, end) => {
      const slots = [];
      const [startHour, startMin, startPeriod] = start.match(/(\d+):(\d+) (AM|PM)/).slice(1);
      const [endHour, endMin, endPeriod] = end.match(/(\d+):(\d+) (AM|PM)/).slice(1);
      
      let startHourNum = parseInt(startHour, 10);
      let endHourNum = parseInt(endHour, 10);
      
      if (startPeriod === 'PM' && startHourNum !== 12) startHourNum += 12;
      if (endPeriod === 'PM' && endHourNum !== 12) endHourNum += 12;
      if (startPeriod === 'AM' && startHourNum === 12) startHourNum = 0;
      if (endPeriod === 'AM' && endHourNum === 12) endHourNum = 0;
      
      for (let h = startHourNum; h < endHourNum; h++) {
        slots.push((h < 10 ? '0' : '') + h + ':00');
      }
      return slots;
    };

    // Build availability for each day
    const availability = days.map(dateObj => {
      const dateStr = dateObj.toISOString().split('T')[0];
      const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const dayHours = hours[weekday];
      
      if (!dayHours || dayHours.toLowerCase() === 'closed') {
        return { 
          date: dateStr, 
          times: [],
          status: 'closed',
          message: 'Salon is closed on this day'
        };
      }

      const [start, end] = dayHours.split(' - ');
      const possibleSlots = generateSlots(start, end);

      // Filter out booked slots
      const availableTimes = possibleSlots.filter(slotTime => {
        const [slotHour, slotMin] = slotTime.split(':');
        const slotStart = new Date(dateStr + 'T' + slotHour + ':00:00.000Z');
        const slotEnd = new Date(slotStart.getTime() + 60 * 60000); // 1 hour slot
        
        return !appointments.some(appointment => {
          const aStart = new Date(appointment.start_at);
          const aEnd = new Date(appointment.end_at);
          return slotStart < aEnd && slotEnd > aStart;
        });
      });

      return {
        date: dateStr,
        times: availableTimes,
        status: availableTimes.length > 0 ? 'available' : 'fully_booked',
        message: availableTimes.length > 0 
          ? `${availableTimes.length} time slots available` 
          : 'No available time slots for this day'
      };
    });

    const { response, statusCode } = createApiResponse(
      true,
      'Salon availability retrieved successfully',
      {
        salon: {
          id: salon.id,
          name: salon.name,
          hours: salon.hours
        },
        availability,
        total_days: availability.length,
        available_days: availability.filter(day => day.times.length > 0).length
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('getAvailability error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to fetch salon availability',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

/**
 * Book a new appointment
 * @route POST /api/mobile/appointments
 */
exports.bookAppointment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { salonId: salon_id, staffId: staff_id, start_at, notes, service_ids } = req.body;
    
    // Validate required fields
    if (!salon_id || !staff_id || !start_at || !Array.isArray(service_ids) || service_ids.length === 0) {
      await transaction.rollback();
      const { response, statusCode } = createErrorResponse(
        'Missing required fields. Please provide salonId, staffId, start_at, and at least one service.',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Validate staff and salon relationship
    const staff = await Staff.findOne({ 
      where: { id: staff_id, salon_id }, 
      transaction 
    });
    
    if (!staff) {
      await transaction.rollback();
      const { response, statusCode } = createErrorResponse(
        'Invalid staff member or salon. Please verify the staff member works at this salon.',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Validate services availability
    const services = await Service.findAll({ 
      where: { id: service_ids }, 
      include: [{
        model: Salon,
        as: 'salons',
        where: { id: salon_id },
        through: { attributes: [] }
      }],
      transaction 
    });
    
    if (services.length !== service_ids.length) {
      await transaction.rollback();
      const { response, statusCode } = createErrorResponse(
        'One or more services are not available at this salon',
        400,
        {
          requested_services: service_ids.length,
          available_services: services.length,
          available_service_names: services.map(s => s.name)
        }
      );
      return res.status(statusCode).json(response);
    }

    // Calculate appointment details
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = services.reduce((sum, s) => sum + parseFloat(s.price), 0);
    const startTime = new Date(start_at);
    const endTime = new Date(startTime.getTime() + totalDuration * 60000);

    // Check for appointment conflicts
    const hasConflict = await Appointment.findOne({
      where: {
        staff_id,
        status: { [Op.in]: ['pending', 'booked'] },
        [Op.or]: [
          { start_at: { [Op.between]: [startTime, endTime] } },
          { end_at: { [Op.between]: [startTime, endTime] } },
          { 
            [Op.and]: [
              { start_at: { [Op.lte]: startTime } }, 
              { end_at: { [Op.gte]: endTime } }
            ] 
          }
        ]
      },
      transaction
    });

    if (hasConflict) {
      await transaction.rollback();
      const { response, statusCode } = createErrorResponse(
        'This staff member is not available during the selected time. Please choose a different time or staff member.',
        409
      );
      return res.status(statusCode).json(response);
    }

    // Create appointment
    const appointment = await Appointment.create({
      user_id: req.user.id,
      salon_id,
      staff_id,
      start_at: startTime,
      end_at: endTime,
      status: 'pending',
      notes,
      total_price: totalPrice,
      duration: totalDuration
    }, { transaction });

    // Link services to appointment
    for (const service of services) {
      await AppointmentService.create({
        appointment_id: appointment.id,
        service_id: service.id,
        price: service.price
      }, { transaction });
    }

    await transaction.commit();

    // Send notification
    await notificationService.sendToUsers(
      [req.user.id], 
      'Appointment Booked', 
      'Your appointment has been booked successfully. Please proceed to payment to confirm your booking.',
      { appointmentId: appointment.id }
    );

    const { response, statusCode } = createApiResponse(
      'Appointment booked successfully. Please complete payment to confirm your booking.',
      201,
      {
        appointment: serializeAppointment({
          ...appointment.toJSON(),
          services: services.map(s => ({
            id: s.id,
            name: s.name,
            price: s.price,
            duration: s.duration
          }))
        }),
        next_step: 'Complete payment to confirm booking'
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    await transaction.rollback();
    console.error('Book appointment error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to book appointment. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

/**
 * Get all appointments for the current user
 * @route GET /api/mobile/appointments
 */
exports.getAppointments = async (req, res) => {
  try {
    const { 
      status, 
      page = 1, 
      limit = 20, 
      sort = 'start_at', 
      order = 'DESC',
      salon_id,
      staff_id,
      date_from,
      date_to
    } = req.query;

    // Build where clause
    const whereClause = { user_id: req.user.id };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (salon_id) {
      whereClause.salon_id = salon_id;
    }
    
    if (staff_id) {
      whereClause.staff_id = staff_id;
    }
    
    if (date_from || date_to) {
      whereClause.start_at = {};
      if (date_from) {
        whereClause.start_at[Op.gte] = new Date(date_from);
      }
      if (date_to) {
        whereClause.start_at[Op.lte] = new Date(date_to);
      }
    }

    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Build include array
    const include = [
      {
        model: Service,
        as: 'services',
        through: { attributes: [] }
      },
      {
        model: Salon,
        as: 'salon',
        attributes: ['id', 'name', 'phone', 'email', 'description', 'hours', 'avatar', 'website'],
        include: [{
          model: Address,
          as: 'address',
          attributes: ['id', 'street_address', 'city', 'state', 'zip_code', 'country']
        }]
      },
      {
        model: Staff,
        as: 'staff',
        attributes: ['id', 'name', 'avatar', 'specializations', 'experience_years', 'bio', 'role', 'status', 'hourly_rate']
      },
      {
        model: Payment,
        as: 'payment',
        attributes: ['id', 'amount', 'method', 'status', 'transaction_id', 'created_at', 'updated_at']
      }
    ];

    // Get total count for pagination
    const totalCount = await Appointment.count({ where: whereClause });
    
    // Get appointments with pagination
    const appointments = await Appointment.findAll({
      where: whereClause,
      include: include,
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: offset
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Determine response message based on results
    let message;
    if (totalCount === 0) {
      message = 'No appointments found. You haven\'t booked any appointments yet.';
    } else if (appointments.length === 0) {
      message = 'No appointments found for the current page.';
    } else {
      message = `Successfully retrieved ${appointments.length} appointment${appointments.length === 1 ? '' : 's'}`;
    }

    const { response, statusCode } = createApiResponse(
      message,
      200,
      {
        appointments: appointments.map(serializeAppointment),
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_count: totalCount,
          limit: parseInt(limit),
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage
        },
        filters: {
          status,
          salon_id,
          staff_id,
          date_from,
          date_to,
          sort,
          order
        }
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('getAppointments error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to fetch appointments. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

/**
 * Get appointment by ID
 * @route GET /api/mobile/appointments/:id
 */
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ 
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        {
          model: Service,
          as: 'services',
          through: { attributes: [] }
        },
        {
          model: Salon,
          as: 'salon',
          attributes: ['id', 'name', 'phone', 'email', 'description', 'hours', 'avatar', 'website'],
          include: [{
            model: Address,
            as: 'address',
            attributes: ['id', 'street_address', 'city', 'state', 'zip_code', 'country']
          }]
        },
        {
          model: Staff,
          as: 'staff',
          attributes: ['id', 'name', 'avatar', 'specializations', 'experience_years', 'bio', 'role', 'status', 'hourly_rate']
        },
        {
          model: Payment,
          as: 'payment',
          attributes: ['id', 'amount', 'method', 'status', 'transaction_id', 'created_at', 'updated_at']
        }
      ]
    });

    if (!appointment) {
      const { response, statusCode } = createErrorResponse(
        'Appointment not found. The appointment you\'re looking for doesn\'t exist or you don\'t have permission to view it.',
        404
      );
      return res.status(statusCode).json(response);
    }

    const { response, statusCode } = createApiResponse(
      'Appointment details retrieved successfully',
      200,
      {
        appointment: serializeAppointment(appointment)
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('getAppointmentById error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to fetch appointment details. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

/**
 * Cancel appointment
 * @route PUT /api/mobile/appointments/:id/cancel
 */
exports.cancelAppointment = async (req, res) => {
  try {
    const { cancellation_reason } = req.body;
    const appointment = await Appointment.findOne({ 
      where: { id: req.params.id, user_id: req.user.id } 
    });

    if (!appointment) {
      const { response, statusCode } = createErrorResponse(
        'Appointment not found. The appointment you\'re trying to cancel doesn\'t exist or you don\'t have permission to cancel it.',
        404
      );
      return res.status(statusCode).json(response);
    }
    
    // Check if appointment is already cancelled
    if (appointment.status === 'cancelled') {
      const { response, statusCode } = createErrorResponse(
        'Appointment is already cancelled',
        400,
        {
          current_status: appointment.status,
          cancelled_at: appointment.cancelled_at,
          cancellation_reason: appointment.cancellation_reason
        }
      );
      return res.status(statusCode).json(response);
    }
    
    // Check if appointment is completed
    if (appointment.status === 'completed') {
      const { response, statusCode } = createErrorResponse(
        'Cannot cancel completed appointment',
        400,
        {
          current_status: appointment.status,
          message: 'This appointment has already been completed and cannot be cancelled.'
        }
      );
      return res.status(statusCode).json(response);
    }
    
    // Set cancellation details
    appointment.status = 'cancelled';
    appointment.cancelled_at = new Date();
    appointment.cancelled_by = req.user.id;
    appointment.cancellation_reason = cancellation_reason || 'Cancelled by user';
    
    await appointment.save();
    
    // Send notification
    await notificationService.sendToUsers(
      [req.user.id], 
      'Appointment Cancelled', 
      'Your appointment has been cancelled successfully.',
      { 
        appointmentId: appointment.id,
        salonId: appointment.salon_id,
        status: appointment.status,
        cancellation_reason: appointment.cancellation_reason
      }
    );
    
    const { response, statusCode } = createApiResponse(
      'Appointment cancelled successfully',
      200,
      {
        appointment: serializeAppointment(appointment),
        cancellation_details: {
          cancelled_at: appointment.cancelled_at,
          cancelled_by: appointment.cancelled_by,
          cancellation_reason: appointment.cancellation_reason
        }
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('cancelAppointment error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to cancel appointment. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

/**
 * Get appointment statistics for the current user
 * @route GET /api/mobile/appointments/stats
 */
exports.getAppointmentStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await Appointment.findAll({
      where: { user_id: userId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const totalAppointments = await Appointment.count({ where: { user_id: userId } });
    const upcomingAppointments = await Appointment.count({ 
      where: { 
        user_id: userId, 
        status: 'booked',
        start_at: { [Op.gt]: new Date() }
      } 
    });

    const statsObject = {
      total: totalAppointments,
      upcoming: upcomingAppointments,
      by_status: {}
    };

    stats.forEach(stat => {
      statsObject.by_status[stat.status] = parseInt(stat.dataValues.count);
    });

    // Determine message based on stats
    let message;
    if (totalAppointments === 0) {
      message = 'No appointment statistics available. You haven\'t booked any appointments yet.';
    } else {
      message = `Appointment statistics retrieved successfully. You have ${totalAppointments} total appointment${totalAppointments === 1 ? '' : 's'}.`;
    }

    const { response, statusCode } = createApiResponse(
      message,
      200,
      {
        stats: statsObject,
        summary: {
          total_appointments: totalAppointments,
          upcoming_appointments: upcomingAppointments,
          completed_appointments: statsObject.by_status.completed || 0,
          cancelled_appointments: statsObject.by_status.cancelled || 0,
          pending_appointments: statsObject.by_status.pending || 0
        }
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('getAppointmentStats error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to fetch appointment statistics. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

/**
 * Get available services for a salon
 * @route GET /api/mobile/salons/:salon_id/services
 */
exports.getSalonServices = async (req, res) => {
  try {
    const { salon_id } = req.params;
    
    if (!salon_id) {
      const { response, statusCode } = createErrorResponse(
        'Salon ID is required',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Verify salon exists
    const salon = await Salon.findByPk(salon_id);
    if (!salon) {
      const { response, statusCode } = createErrorResponse(
        'Salon not found',
        404
      );
      return res.status(statusCode).json(response);
    }

    const services = await Service.findAll({
      include: [{
        model: Salon,
        as: 'salons',
        where: { id: salon_id },
        through: { attributes: [] }
      }],
      order: [['name', 'ASC']]
    });

    // Determine message based on results
    let message;
    if (services.length === 0) {
      message = 'No services available at this salon yet.';
    } else {
      message = `Successfully retrieved ${services.length} service${services.length === 1 ? '' : 's'} for this salon.`;
    }

    const { response, statusCode } = createApiResponse(
      message,
      200,
      {
        salon: {
          id: salon.id,
          name: salon.name
        },
        services: services.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          image_url: service.image_url
        })),
        total_services: services.length
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('Get salon services error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to fetch salon services. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

/**
 * Get all services (for debugging/development)
 * @route GET /api/mobile/services
 */
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [['name', 'ASC']]
    });

    // Determine message based on results
    let message;
    if (services.length === 0) {
      message = 'No services available in the system yet.';
    } else {
      message = `Successfully retrieved ${services.length} service${services.length === 1 ? '' : 's'}.`;
    }

    const { response, statusCode } = createApiResponse(
      message,
      200,
      {
        services: services.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration
        })),
        total_services: services.length
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('Get all services error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to fetch services. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

// Legacy functions for backward compatibility
exports.confirmPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findByPk(appointmentId);
    
    if (!appointment) {
      const { response, statusCode } = createErrorResponse(
        'Appointment not found',
        404
      );
      return res.status(statusCode).json(response);
    }
    
    if (appointment.status !== 'pending') {
      const { response, statusCode } = createErrorResponse(
        'Appointment is not pending',
        400
      );
      return res.status(statusCode).json(response);
    }
    
    appointment.status = 'booked';
    await appointment.save();
    
    const { response, statusCode } = createApiResponse(
      'Payment confirmed and appointment booked successfully',
      200,
      {
        appointment: serializeAppointment(appointment)
      }
    );
    
    return res.status(statusCode).json(response);
  } catch (error) {
    const { response, statusCode } = createErrorResponse(
      'Failed to confirm payment',
      500
    );
    return res.status(statusCode).json(response);
  }
};

exports.cancelPendingAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findByPk(appointmentId);
    
    if (!appointment) {
      const { response, statusCode } = createErrorResponse(
        'Appointment not found',
        404
      );
      return res.status(statusCode).json(response);
    }
    
    if (appointment.status !== 'pending') {
      const { response, statusCode } = createErrorResponse(
        'Appointment is not pending',
        400
      );
      return res.status(statusCode).json(response);
    }
    
    appointment.status = 'cancelled';
    await appointment.save();
    
    const { response, statusCode } = createApiResponse(
      'Pending appointment cancelled successfully',
      200,
      {
        appointment: serializeAppointment(appointment)
      }
    );
    
    return res.status(statusCode).json(response);
  } catch (error) {
    const { response, statusCode } = createErrorResponse(
      'Failed to cancel appointment',
      500
    );
    return res.status(statusCode).json(response);
  }
};

exports.completeAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findOne({ 
      where: { id: appointmentId, user_id: req.user.id } 
    });
    
    if (!appointment) {
      const { response, statusCode } = createErrorResponse(
        'Appointment not found',
        404
      );
      return res.status(statusCode).json(response);
    }
    
    appointment.status = 'completed';
    await appointment.save();
    
    // Send notification
    await notificationService.sendToUsers(
      [req.user.id], 
      'Appointment Completed', 
      'Your appointment has been marked as completed.',
      { 
        appointmentId: appointment.id,
        salonId: appointment.salon_id,
        status: appointment.status
      }
    );
    
    const { response, statusCode } = createApiResponse(
      'Appointment marked as completed successfully',
      200,
      {
        appointment: serializeAppointment(appointment)
      }
    );
    
    return res.status(statusCode).json(response);
  } catch (error) {
    const { response, statusCode } = createErrorResponse(
      'Failed to complete appointment',
      500
    );
    return res.status(statusCode).json(response);
  }
}; 