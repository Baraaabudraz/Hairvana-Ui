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