'use strict';
const { Appointment, Salon, User } = require('../../models');
const { Op } = require('sequelize');

exports.getAvailability = async (req, res) => {
  try {
    const salonId = req.params.id;
    // Fetch salon and its hours
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
        date: { [Op.between]: [startDate, endDate] },
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
      // Find booked times for this date
      const booked = appointments.filter(a => a.date.toISOString().split('T')[0] === dateStr).map(a => a.time);
      return {
        date: dateStr,
        times: possibleSlots.filter(t => !booked.includes(t))
      };
    });
    return res.json({ success: true, availability: slots });
  } catch (err) {
    console.error('getAvailability error:', err);
    return res.status(500).json({ error: 'Failed to fetch availability', details: err.message });
  }
};

exports.bookAppointment = async (req, res) => {
  try {
    const { salon_id, service_id, staff_id, date, time, notes, price } = req.body;
    const appointment = await Appointment.create({
      user_id: req.user.id,
      salon_id,
      service_id,
      staff_id,
      date,
      time,
      status: 'booked',
      notes,
      price
    });
    return res.status(201).json({ success: true, appointment });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to book appointment' });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({ where: { user_id: req.user.id } });
    return res.json({ success: true, appointments });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    return res.json({ success: true, appointment });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch appointment' });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    appointment.status = 'cancelled';
    await appointment.save();
    return res.json({ success: true, appointment });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to cancel appointment' });
  }
}; 