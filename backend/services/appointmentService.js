const appointmentRepository = require('../repositories/appointmentRepository');
const { Service } = require('../models');

exports.getAllAppointments = async (query) => {
  return appointmentRepository.findAll(query);
};

exports.getAppointmentById = async (id) => {
  return appointmentRepository.findById(id);
};

exports.createAppointment = async (data) => {
  // Get service details for duration
  const service = await Service.findOne({ where: { id: data.service_id } });
  if (!service) throw new Error('Service not found');
  // Check if the time slot is available
  const appointmentDate = new Date(data.date);
  const endTime = new Date(appointmentDate.getTime() + service.duration * 60000);
  const existingAppointments = await appointmentRepository.findConflicting({
    staff_id: data.staff_id,
    status: 'confirmed',
    start: appointmentDate,
    end: endTime
  });
  if (existingAppointments && existingAppointments.length > 0) {
    const err = new Error('This time slot is not available');
    err.status = 409;
    throw err;
  }
  const newAppointment = await appointmentRepository.create({ ...data, duration: service.duration });
  return appointmentRepository.findById(newAppointment.id);
};

exports.updateAppointment = async (id, data) => {
  await appointmentRepository.update(id, data);
  return appointmentRepository.findById(id);
};

exports.cancelAppointment = async (id) => {
  await appointmentRepository.update(id, { status: 'cancelled' });
  return appointmentRepository.findById(id);
};

/**
 * Get appointments by salon IDs with filters
 * @param {Array} salonIds - Array of salon IDs
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Appointments
 */
exports.getAppointmentsBySalonIds = async (salonIds, filters = {}) => {
  return appointmentRepository.findBySalonIds(salonIds, filters);
};

/**
 * Get appointment by ID if it belongs to specified salon IDs
 * @param {string} appointmentId - Appointment ID
 * @param {Array} salonIds - Array of salon IDs
 * @returns {Promise<Object|null>} Appointment or null
 */
exports.getAppointmentByIdForSalons = async (appointmentId, salonIds) => {
  return appointmentRepository.findByIdForSalons(appointmentId, salonIds);
};

/**
 * Update appointment status
 * @param {string} appointmentId - Appointment ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated appointment
 */
exports.updateAppointmentStatus = async (appointmentId, updateData) => {
  await appointmentRepository.update(appointmentId, updateData);
  return appointmentRepository.findById(appointmentId);
};

/**
 * Get appointment statistics for salon IDs
 * @param {Array} salonIds - Array of salon IDs
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Statistics object
 */
exports.getAppointmentStatsBySalonIds = async (salonIds, filters = {}) => {
  return appointmentRepository.getStatsBySalonIds(salonIds, filters);
};

exports.checkAvailability = async (query) => {
  const { staffId, serviceId, date } = query;
  const service = await Service.findOne({ where: { id: serviceId } });
  if (!service) throw new Error('Service not found');
  const appointmentDate = new Date(date);
  const endTime = new Date(appointmentDate.getTime() + service.duration * 60000);
  const existingAppointments = await appointmentRepository.findConflicting({
    staff_id: staffId,
    status: 'confirmed',
    start: appointmentDate,
    end: endTime
  });
  return !existingAppointments || existingAppointments.length === 0;
}; 