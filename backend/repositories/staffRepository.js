const { Staff, Salon, Appointment } = require('../models');
const { Op } = require('sequelize');

exports.getAllStaff = async (query) => {
  const where = {};
  if (query.salonId) where.salon_id = query.salonId;
  if (query.serviceId) where.services = { [Op.contains]: [query.serviceId] };
  return Staff.findAll({ where });
};

exports.getStaffById = async (id) => {
  return Staff.findOne({ where: { id } });
};

exports.createStaff = async (staffData) => {
  return Staff.create(staffData);
};

exports.updateStaff = async (id, staffData) => {
  const [affectedRows, [updatedStaff]] = await Staff.update(staffData, {
    where: { id },
    returning: true
  });
  return updatedStaff;
};

exports.deleteStaff = async (id) => {
  return Staff.destroy({ where: { id } });
};

exports.assignService = async (id, serviceId) => {
  const staff = await Staff.findOne({ where: { id } });
  if (!staff) return { message: 'Staff member not found' };
  const currentServices = staff.services || [];
  if (!currentServices.includes(serviceId)) {
    staff.services = [...currentServices, serviceId];
    await staff.save();
  }
  return { message: 'Service assigned successfully' };
};

exports.removeService = async (id, serviceId) => {
  const staff = await Staff.findOne({ where: { id } });
  if (!staff) return { message: 'Staff member not found' };
  const currentServices = staff.services || [];
  staff.services = currentServices.filter(sid => sid !== serviceId);
  await staff.save();
  return { message: 'Service removed successfully' };
};

/**
 * Find staff by salon IDs with filters
 * @param {Array} salonIds - Array of salon IDs
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Staff members
 */
exports.findBySalonIds = async (salonIds, filters = {}) => {
  const where = {
    salon_id: { [Op.in]: salonIds }
  };
  
  // Status filter
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      where.status = { [Op.in]: filters.status };
    } else {
      where.status = filters.status;
    }
  }
  
  // Role filter
  if (filters.role) {
    if (Array.isArray(filters.role)) {
      where.role = { [Op.in]: filters.role };
    } else {
      where.role = filters.role;
    }
  }
  
  // Search by name
  if (filters.search) {
    where.name = { [Op.like]: `%${filters.search}%` };
  }
  
  // Pagination
  const limit = filters.limit ? parseInt(filters.limit) : 50;
  const offset = filters.page ? (parseInt(filters.page) - 1) * limit : 0;
  
  return Staff.findAll({
    where,
    order: [['name', 'ASC']],
    limit,
    offset,
    include: [
      { 
        model: Salon, 
        as: 'salon', 
        attributes: ['id', 'name', 'phone', 'email']
      }
    ]
  });
};

/**
 * Find staff by salon ID
 * @param {string} salonId - Salon ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Staff members
 */
exports.findBySalonId = async (salonId, filters = {}) => {
  return exports.findBySalonIds([salonId], filters);
};

/**
 * Find staff by ID if it belongs to specified salon IDs
 * @param {string} staffId - Staff ID
 * @param {Array} salonIds - Array of salon IDs
 * @returns {Promise<Object|null>} Staff member or null
 */
exports.findByIdForSalons = async (staffId, salonIds) => {
  return Staff.findOne({
    where: {
      id: staffId,
      salon_id: { [Op.in]: salonIds }
    },
    include: [
      { 
        model: Salon, 
        as: 'salon', 
        attributes: ['id', 'name', 'phone', 'email']
      }
    ]
  });
};

/**
 * Find staff by email
 * @param {string} email - Staff email
 * @returns {Promise<Object|null>} Staff member or null
 */
exports.findByEmail = async (email) => {
  return Staff.findOne({
    where: { email }
  });
};

/**
 * Check if staff has any appointments
 * @param {string} staffId - Staff ID
 * @returns {Promise<boolean>} True if has appointments
 */
exports.checkHasAppointments = async (staffId) => {
  const count = await Appointment.count({
    where: { staff_id: staffId }
  });
  return count > 0;
};

/**
 * Get staff statistics for salon IDs
 * @param {Array} salonIds - Array of salon IDs
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Statistics object
 */
exports.getStatsBySalonIds = async (salonIds, filters = {}) => {
  const baseWhere = {
    salon_id: { [Op.in]: salonIds }
  };
  
  // Get counts by status and role
  const [
    totalStaff,
    activeStaff,
    inactiveStaff,
    onLeaveStaff,
    terminatedStaff,
    stylists,
    assistants,
    managers,
    receptionists
  ] = await Promise.all([
    Staff.count({ where: baseWhere }),
    Staff.count({ where: { ...baseWhere, status: 'active' } }),
    Staff.count({ where: { ...baseWhere, status: 'inactive' } }),
    Staff.count({ where: { ...baseWhere, status: 'on_leave' } }),
    Staff.count({ where: { ...baseWhere, status: 'terminated' } }),
    Staff.count({ where: { ...baseWhere, role: 'stylist' } }),
    Staff.count({ where: { ...baseWhere, role: 'assistant' } }),
    Staff.count({ where: { ...baseWhere, role: 'manager' } }),
    Staff.count({ where: { ...baseWhere, role: 'receptionist' } })
  ]);
  
  return {
    total: totalStaff,
    byStatus: {
      active: activeStaff,
      inactive: inactiveStaff,
      on_leave: onLeaveStaff,
      terminated: terminatedStaff
    },
    byRole: {
      stylist: stylists,
      assistant: assistants,
      manager: managers,
      receptionist: receptionists
    },
    activePercentage: totalStaff > 0 ? ((activeStaff / totalStaff) * 100).toFixed(2) : 0
  };
}; 