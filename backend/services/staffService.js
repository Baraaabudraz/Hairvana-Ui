const staffRepository = require('../repositories/staffRepository');

exports.getAllStaff = async (query) => {
  try {
    return await staffRepository.getAllStaff(query);
  } catch (err) {
    throw new Error('Failed to get staff: ' + err.message);
  }
};

exports.getStaffById = async (id) => {
  if (!id) throw new Error('Staff ID is required');
  try {
    return await staffRepository.getStaffById(id);
  } catch (err) {
    throw new Error('Failed to get staff member: ' + err.message);
  }
};

exports.createStaff = async (staffData) => {
  if (!staffData || typeof staffData !== 'object') throw new Error('Staff data is required');
  if (!staffData.name) throw new Error('Staff name is required');
  if (!staffData.salon_id) throw new Error('Salon ID is required');
  try {
    return await staffRepository.createStaff(staffData);
  } catch (err) {
    throw new Error('Failed to create staff member: ' + err.message);
  }
};

exports.updateStaff = async (id, staffData) => {
  if (!id) throw new Error('Staff ID is required');
  if (!staffData || typeof staffData !== 'object') throw new Error('Staff data is required');
  try {
    return await staffRepository.updateStaff(id, staffData);
  } catch (err) {
    throw new Error('Failed to update staff member: ' + err.message);
  }
};

exports.deleteStaff = async (id) => {
  if (!id) throw new Error('Staff ID is required');
  try {
    return await staffRepository.deleteStaff(id);
  } catch (err) {
    throw new Error('Failed to delete staff member: ' + err.message);
  }
};

exports.assignService = async (id, serviceId) => {
  if (!id) throw new Error('Staff ID is required');
  if (!serviceId) throw new Error('Service ID is required');
  try {
    return await staffRepository.assignService(id, serviceId);
  } catch (err) {
    throw new Error('Failed to assign service: ' + err.message);
  }
};

exports.removeService = async (id, serviceId) => {
  if (!id) throw new Error('Staff ID is required');
  if (!serviceId) throw new Error('Service ID is required');
  try {
    return await staffRepository.removeService(id, serviceId);
  } catch (err) {
    throw new Error('Failed to remove service: ' + err.message);
  }
}; 