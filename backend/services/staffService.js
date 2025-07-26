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

/**
 * Get staff by salon IDs with filters
 * @param {Array} salonIds - Array of salon IDs
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Staff members
 */
exports.getStaffBySalonIds = async (salonIds, filters = {}) => {
  try {
    return await staffRepository.findBySalonIds(salonIds, filters);
  } catch (err) {
    throw new Error('Failed to get staff by salon IDs: ' + err.message);
  }
};

/**
 * Get staff by salon ID with filters
 * @param {string} salonId - Salon ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Staff members
 */
exports.getStaffBySalonId = async (salonId, filters = {}) => {
  try {
    return await staffRepository.findBySalonId(salonId, filters);
  } catch (err) {
    throw new Error('Failed to get staff by salon ID: ' + err.message);
  }
};

/**
 * Get staff by ID if it belongs to specified salon IDs
 * @param {string} staffId - Staff ID
 * @param {Array} salonIds - Array of salon IDs
 * @returns {Promise<Object|null>} Staff member or null
 */
exports.getStaffByIdForSalons = async (staffId, salonIds) => {
  if (!staffId) throw new Error('Staff ID is required');
  if (!Array.isArray(salonIds) || salonIds.length === 0) {
    throw new Error('Salon IDs array is required');
  }
  try {
    return await staffRepository.findByIdForSalons(staffId, salonIds);
  } catch (err) {
    throw new Error('Failed to get staff by ID for salons: ' + err.message);
  }
};

/**
 * Get staff by email
 * @param {string} email - Staff email
 * @returns {Promise<Object|null>} Staff member or null
 */
exports.getStaffByEmail = async (email) => {
  if (!email) throw new Error('Email is required');
  try {
    return await staffRepository.findByEmail(email);
  } catch (err) {
    throw new Error('Failed to get staff by email: ' + err.message);
  }
};

/**
 * Check if staff has any appointments
 * @param {string} staffId - Staff ID
 * @returns {Promise<boolean>} True if has appointments
 */
exports.checkStaffHasAppointments = async (staffId) => {
  if (!staffId) throw new Error('Staff ID is required');
  try {
    return await staffRepository.checkHasAppointments(staffId);
  } catch (err) {
    throw new Error('Failed to check staff appointments: ' + err.message);
  }
};

/**
 * Get staff statistics for salon IDs
 * @param {Array} salonIds - Array of salon IDs
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Statistics object
 */
exports.getStaffStatsBySalonIds = async (salonIds, filters = {}) => {
  if (!Array.isArray(salonIds) || salonIds.length === 0) {
    throw new Error('Salon IDs array is required');
  }
  try {
    return await staffRepository.getStatsBySalonIds(salonIds, filters);
  } catch (err) {
    throw new Error('Failed to get staff statistics: ' + err.message);
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