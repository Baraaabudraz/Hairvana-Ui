const { Appointment, Salon, Service, Staff, User, Payment } = require('../models');
const { Op } = require('sequelize');

// Get all appointments
exports.getAllAppointments = async (req, res, next) => {
  try {
    const { userId, salonId, status, from, to } = req.query;
    const where = {};
    if (userId) where.user_id = userId;
    if (salonId) where.salon_id = salonId;
    if (status && status !== 'all') where.status = status;
    if (from) where.date = { [Op.gte]: from };
    if (to) where.date = { ...(where.date || {}), [Op.lte]: to };
    const appointments = await Appointment.findAll({
      where,
      order: [['date', 'DESC']],
      include: [
        { model: Salon, as: 'salon', attributes: ['id', 'name', 'location', 'address', 'phone', 'email', 'images'] },
        { model: Service, as: 'services', attributes: ['id', 'name', 'price', 'duration', 'description'] },
        { model: Staff, as: 'staff', attributes: ['id', 'name', 'avatar', 'bio'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] },
        { model: Payment, as: 'payment', attributes: ['id', 'amount', 'method', 'status', 'transaction_id'] }
      ]
    });
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findOne({
      where: { id },
      include: [
        { model: Salon, as: 'salon', attributes: ['id', 'name', 'location', 'address', 'phone', 'email', 'images'] },
        { model: Service, as: 'services', attributes: ['id', 'name', 'price', 'duration', 'description'] },
        { model: Staff, as: 'staff', attributes: ['id', 'name', 'avatar', 'bio'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] },
        { model: Payment, as: 'payment', attributes: ['id', 'amount', 'method', 'status', 'transaction_id'] }
      ]
    });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

// Create a new appointment
exports.createAppointment = async (req, res, next) => {
  try {
    const appointmentData = req.body;
    // Get service details for duration
    const service = await Service.findOne({ where: { id: appointmentData.service_id } });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    // Check if the time slot is available
    const appointmentDate = new Date(appointmentData.date);
    const endTime = new Date(appointmentDate.getTime() + service.duration * 60000);
    const existingAppointments = await Appointment.findAll({
      where: {
        staff_id: appointmentData.staff_id,
        status: 'confirmed',
        date: {
          [Op.lt]: endTime,
          [Op.gt]: appointmentDate
        }
      }
    });
    if (existingAppointments && existingAppointments.length > 0) {
      return res.status(409).json({ message: 'This time slot is not available' });
    }
    // Create appointment
    const newAppointment = await Appointment.create({
      ...appointmentData,
      duration: service.duration
    });
    res.status(201).json(newAppointment);
  } catch (error) {
    next(error);
  }
};

// Update an appointment
exports.updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointmentData = req.body;
    const [affectedRows, [updatedAppointment]] = await Appointment.update(appointmentData, {
      where: { id },
      returning: true
    });
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(updatedAppointment);
  } catch (error) {
    next(error);
  }
};

// Cancel an appointment
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [affectedRows, [updatedAppointment]] = await Appointment.update({ status: 'cancelled' }, {
      where: { id },
      returning: true
    });
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(updatedAppointment);
  } catch (error) {
    next(error);
  }
};

// Check availability
exports.checkAvailability = async (req, res, next) => {
  try {
    const { salonId, staffId, serviceId, date } = req.query;
    if (!salonId || !staffId || !serviceId || !date) {
      return res.status(400).json({ message: 'Salon ID, staff ID, service ID, and date are required' });
    }
    // Get salon hours for the day of the week (not implemented, just a placeholder)
    // Get service duration
    const service = await Service.findOne({ where: { id: serviceId } });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    const appointmentDate = new Date(date);
    const endTime = new Date(appointmentDate.getTime() + service.duration * 60000);
    const existingAppointments = await Appointment.findAll({
      where: {
        staff_id: staffId,
        status: 'confirmed',
        date: {
          [Op.lt]: endTime,
          [Op.gt]: appointmentDate
        }
      }
    });
    const available = !existingAppointments || existingAppointments.length === 0;
    res.json({ available });
  } catch (error) {
    next(error);
  }
};