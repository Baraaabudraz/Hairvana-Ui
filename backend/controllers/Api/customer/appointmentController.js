'use strict';
const { Appointment, Salon, Staff, Service, AppointmentService, sequelize } = require('../../../models');
const { Op } = require('sequelize');
const { serializeAppointment } = require('../../../serializers/appointmentSerializer');
const notificationService = require('../../../services/notificationService');

// Get availability for a salon (using start_at/end_at fields)
exports.getAvailability = async (req, res) => {
  try {
    const salonId = req.params.id;
    const salon = await Salon.findByPk(salonId);
    if (!salon) return res.status(404).json({ error: 'Salon not found' });
    const hours = salon.hours || {};
    // Next 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return date;
    });
    // Fetch all booked appointments for this salon in the next 7 days
    const startDate = days[0].toISOString().split('T')[0];
    const endDate = days[days.length - 1].toISOString().split('T')[0];
    const appointments = await Appointment.findAll({
      where: {
        salon_id: salonId,
        start_at: { [Op.between]: [startDate + 'T00:00:00.000Z', endDate + 'T23:59:59.999Z'] },
        status: 'booked'
      }
    });
    // Helper to generate time slots
    function generateSlots(start, end) {
      const slots = [];
      let [startHour, startMin, startPeriod] = start.match(/(\d+):(\d+) (AM|PM)/).slice(1);
      let [endHour, endMin, endPeriod] = end.match(/(\d+):(\d+) (AM|PM)/).slice(1);
      startHour = parseInt(startHour, 10);
      endHour = parseInt(endHour, 10);
      if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
      if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
      if (startPeriod === 'AM' && startHour === 12) startHour = 0;
      if (endPeriod === 'AM' && endHour === 12) endHour = 0;
      for (let h = startHour; h < endHour; h++) {
        slots.push((h < 10 ? '0' : '') + h + ':00');
      }
      return slots;
    }
    // Build availability
    const slots = days.map(dateObj => {
      const dateStr = dateObj.toISOString().split('T')[0];
      const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const dayHours = hours[weekday];
      if (!dayHours || dayHours.toLowerCase() === 'closed') {
        return { date: dateStr, times: [] };
      }
      const [start, end] = dayHours.split(' - ');
      const possibleSlots = generateSlots(start, end);
      // For each slot, check if it overlaps with any appointment
      const availableTimes = possibleSlots.filter(slotTime => {
        // Build slot's start and end datetime
        const [slotHour, slotMin] = slotTime.split(':');
        const slotStart = new Date(dateStr + 'T' + slotHour + ':00:00.000Z');
        // Assume slot is 1 hour (or use your business logic for slot duration)
        const slotEnd = new Date(slotStart.getTime() + 60 * 60000);
        // Check for overlap with any appointment
        return !appointments.some(a => {
          const aStart = new Date(a.start_at);
          const aEnd = new Date(a.end_at);
          // Overlap if slotStart < aEnd && slotEnd > aStart
          return slotStart < aEnd && slotEnd > aStart;
        });
      });
      return {
        date: dateStr,
        times: availableTimes
      };
    });
    return res.json({ success: true, availability: slots });
  } catch (err) {
    console.error('getAvailability error:', err);
    return res.status(500).json({ error: 'Failed to fetch availability', details: err.message });
  }
};

// Book an appointment (best practice: create as 'pending', confirm after payment)
exports.bookAppointment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { salon_id, staff_id, start_at, notes, service_ids } = req.body;
    if (!salon_id || !staff_id || !start_at || !Array.isArray(service_ids) || service_ids.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Validate staff and salon
    const staff = await Staff.findOne({ where: { id: staff_id, salon_id }, transaction: t });
    if (!staff) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid staff or salon' });
    }
    // Validate services and check if they're available for this salon
    const services = await Service.findAll({ 
      where: { id: service_ids }, 
      include: [{
        model: Salon,
        as: 'salons',
        where: { id: salon_id },
        through: { attributes: [] }
      }],
      transaction: t 
    });
    
    if (services.length !== service_ids.length) {
      await t.rollback();
      return res.status(400).json({ 
        error: 'One or more services are invalid or not available for this salon',
        details: {
          requested: service_ids.length,
          found: services.length,
          available_services: services.map(s => ({ id: s.id, name: s.name }))
        }
      });
    }
    // Calculate duration and price
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = services.reduce((sum, s) => sum + parseFloat(s.price), 0);
    // Calculate end_at
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
          { [Op.and]: [ { start_at: { [Op.lte]: startTime } }, { end_at: { [Op.gte]: endTime } } ] }
        ]
      },
      transaction: t
    });
    if (hasConflict) {
      await t.rollback();
      return res.status(409).json({ error: 'This staff member already has an appointment during the selected time.' });
    }
    // Create appointment as 'pending'
    const appointment = await Appointment.create({
      user_id: req.user.id,
      salon_id,
      staff_id,
      start_at: startTime,
      end_at: endTime,
      status: 'pending', // Not 'booked' until payment is confirmed
      notes,
      total_price: totalPrice,
      duration: totalDuration
    }, { transaction: t });
    // Link services
    for (const service of services) {
      await AppointmentService.create({
        appointment_id: appointment.id,
        service_id: service.id,
        price: service.price
      }, { transaction: t });
    }
    await t.commit();
    // Send notification to user
    await notificationService.sendToUsers([
      req.user.id
    ], 'Appointment Booked', 'Your appointment has been booked. Please proceed to payment.', { appointmentId: appointment.id });
    // TODO: Integrate with payment provider here (create payment session/intent)
    // For now, return a placeholder paymentSessionId
    // const paymentSessionId = `demo-session-${appointment.id}`;
    return res.status(201).json({
      success: true,
      appointment: serializeAppointment({
        ...appointment.toJSON(),
        services: services.map(s => ({
          id: s.id,
          name: s.name,
          price: s.price,
          duration: s.duration
        }))
      }),
      // paymentSessionId // Frontend should use this to initiate payment
    });
  } catch (err) {
    await t.rollback();
    console.error('Book appointment error:', err);
    return res.status(500).json({
      error: 'Failed to book appointment',
      message: err.message,
      stack: err.stack
    });
  }
};

// Confirm payment and mark appointment as 'booked' (to be called by payment webhook or after payment success)
exports.confirmPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.status !== 'pending') return res.status(400).json({ error: 'Appointment is not pending' });
    appointment.status = 'booked';
    await appointment.save();
    return res.json({ success: true, appointment: serializeAppointment(appointment) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

// Cancel pending appointment (to be called on payment failure/timeout)
exports.cancelPendingAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.status !== 'pending') return res.status(400).json({ error: 'Appointment is not pending' });
    appointment.status = 'cancelled';
    await appointment.save();
    return res.json({ success: true, appointment: serializeAppointment(appointment) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};

// Get all appointments for the current user (serialized)
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Service,
          as: 'services',
          through: { attributes: [] }
        }
      ]
    });
    return res.json({ success: true, appointments: appointments.map(serializeAppointment) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// Get appointment by ID (serialized)
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    return res.json({ success: true, appointment: serializeAppointment(appointment) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch appointment' });
  }
};

// Cancel appointment (serialized)
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    appointment.status = 'cancelled';
    await appointment.save();
    return res.json({ success: true, appointment: serializeAppointment(appointment) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to cancel appointment' });
  }
}; 

// Update appointment status to 'completed'
exports.completeAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findOne({ where: { id: appointmentId, user_id: req.user.id } });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    appointment.status = 'completed';
    await appointment.save();
    // Send notification to user
    await notificationService.sendToUsers([
      req.user.id
    ], 'Appointment Completed', 'Your appointment has been marked as completed.', { appointmentId: appointment.id });
    return res.json({ success: true, appointment: serializeAppointment(appointment) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to complete appointment' });
  }
};

// Get available services for a salon (mobile API)
exports.getSalonServices = async (req, res) => {
  try {
    const { salon_id } = req.params;
    
    if (!salon_id) {
      return res.status(400).json({ error: 'Salon ID is required' });
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

    return res.json({
      success: true,
      services: services.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        image_url: service.image_url
      }))
    });
  } catch (err) {
    console.error('Get salon services error:', err);
    return res.status(500).json({ error: 'Failed to fetch salon services' });
  }
}; 

// Get all services (for debugging)
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [['name', 'ASC']]
    });

    return res.json({
      success: true,
      services: services.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration
      }))
    });
  } catch (err) {
    console.error('Get all services error:', err);
    return res.status(500).json({ error: 'Failed to fetch services' });
  }
}; 