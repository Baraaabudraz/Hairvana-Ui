const { Appointment, Salon, Service, Staff, User, Payment } = require('../models');
const { Op } = require('sequelize');
const appointmentService = require('../services/appointmentService');
const { validateAppointment, validateAvailability } = require('../validation/appointmentValidation');
const { serializeAppointment } = require('../serializers/appointmentSerializer');

// Get all appointments
exports.getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await appointmentService.getAllAppointments(req.query);
    res.json(appointments.map(serializeAppointment));
  } catch (error) {
    next(error);
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(serializeAppointment(appointment));
  } catch (error) {
    next(error);
  }
};

// Create a new appointment
exports.createAppointment = async (req, res, next) => {
  try {
    validateAppointment(req.body);
    const created = await appointmentService.createAppointment(req.body);
    res.status(201).json(serializeAppointment(created));
  } catch (error) {
    next(error);
  }
};

// Update an appointment
exports.updateAppointment = async (req, res, next) => {
  try {
    validateAppointment(req.body, true);
    const updated = await appointmentService.updateAppointment(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Appointment not found' });
    res.json(serializeAppointment(updated));
  } catch (error) {
    next(error);
  }
};

// Cancel an appointment
exports.cancelAppointment = async (req, res, next) => {
  try {
    const cancelled = await appointmentService.cancelAppointment(req.params.id);
    if (!cancelled) return res.status(404).json({ message: 'Appointment not found' });
    res.json(serializeAppointment(cancelled));
  } catch (error) {
    next(error);
  }
};

// Check availability
exports.checkAvailability = async (req, res, next) => {
  try {
    validateAvailability(req.query);
    const available = await appointmentService.checkAvailability(req.query);
    res.json({ available });
  } catch (error) {
    next(error);
  }
};