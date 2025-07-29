const { Appointment, Salon, Service, Staff, User, Payment } = require('../models');
const { Op } = require('sequelize');

exports.findAll = async (query) => {
  const where = {};
  if (query.userId) where.user_id = query.userId;
  if (query.salonId) where.salon_id = query.salonId;
  if (query.status && query.status !== 'all') where.status = query.status;
  if (query.from) where.date = { [Op.gte]: query.from };
  if (query.to) where.date = { ...(where.date || {}), [Op.lte]: query.to };
  return Appointment.findAll({
    where,
    order: [['date', 'DESC']],
    include: [
      { 
        model: Salon, 
        as: 'salon', 
        attributes: ['id', 'name', 'phone', 'email', 'avatar', 'website', 'description'],
        include: [{
          model: require('../models').Address,
          as: 'address',
          attributes: ['street_address', 'city', 'state', 'zip_code', 'country']
        }]
      },
      { model: Service, as: 'services', attributes: ['id', 'name', 'price', 'duration', 'description'] },
      { model: Staff, as: 'staff', attributes: ['id', 'name', 'avatar', 'bio'] },
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] },
      { model: Payment, as: 'payment', attributes: ['id', 'amount', 'method', 'status', 'transaction_id'] }
    ]
  });
};

exports.findById = async (id) => {
  return Appointment.findOne({
    where: { id },
    include: [
      { 
        model: Salon, 
        as: 'salon', 
        attributes: ['id', 'name', 'phone', 'email', 'avatar', 'website', 'description'],
        include: [{
          model: require('../models').Address,
          as: 'address',
          attributes: ['street_address', 'city', 'state', 'zip_code', 'country']
        }]
      },
      { model: Service, as: 'services', attributes: ['id', 'name', 'price', 'duration', 'description'] },
      { model: Staff, as: 'staff', attributes: ['id', 'name', 'avatar', 'bio'] },
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] },
      { model: Payment, as: 'payment', attributes: ['id', 'amount', 'method', 'status', 'transaction_id'] }
    ]
  });
};

exports.create = async (data) => {
  return Appointment.create(data);
};

exports.update = async (id, data) => {
  return Appointment.update(data, { where: { id }, returning: true });
};

/**
 * Find appointments by salon IDs with filters
 * @param {Array} salonIds - Array of salon IDs
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Appointments
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
  
  // Date filters
  const now = new Date();
  if (filters.upcoming === true) {
    where.start_at = { [Op.gte]: now };
  } else if (filters.past === true) {
    where.start_at = { [Op.lt]: now };
  }
  
  // Custom date range
  if (filters.from) {
    where.start_at = { ...where.start_at, [Op.gte]: new Date(filters.from) };
  }
  if (filters.to) {
    where.start_at = { ...where.start_at, [Op.lte]: new Date(filters.to) };
  }
  
  // Pagination
  const limit = filters.limit ? parseInt(filters.limit) : 50;
  const offset = filters.page ? (parseInt(filters.page) - 1) * limit : 0;
  
  return Appointment.findAll({
    where,
    order: [['start_at', filters.past ? 'DESC' : 'ASC']],
    limit,
    offset,
    include: [
      { 
        model: Salon, 
        as: 'salon', 
        attributes: ['id', 'name', 'phone', 'email'],
        include: [{
          model: require('../models').Address,
          as: 'address',
          attributes: ['street_address', 'city', 'state', 'zip_code', 'country']
        }]
      },
      { 
        model: Service, 
        as: 'services', 
        attributes: ['id', 'name', 'price', 'duration', 'description'],
        through: { attributes: ['price'] }
      },
      { 
        model: Staff, 
        as: 'staff', 
        attributes: ['id', 'name', 'avatar', 'bio', 'specializations', 'role']
      },
      { 
        model: User, 
        as: 'user', 
        attributes: ['id', 'name', 'email', 'phone', 'avatar']
      },
      { 
        model: Payment, 
        as: 'payment', 
        attributes: ['id', 'amount', 'method', 'status', 'transaction_id', 'payment_date']
      }
    ]
  });
};

/**
 * Find appointment by ID if it belongs to specified salon IDs
 * @param {string} appointmentId - Appointment ID
 * @param {Array} salonIds - Array of salon IDs
 * @returns {Promise<Object|null>} Appointment or null
 */
exports.findByIdForSalons = async (appointmentId, salonIds) => {
  return Appointment.findOne({
    where: {
      id: appointmentId,
      salon_id: { [Op.in]: salonIds }
    },
    include: [
      { 
        model: Salon, 
        as: 'salon', 
        attributes: ['id', 'name', 'phone', 'email'],
        include: [{
          model: require('../models').Address,
          as: 'address',
          attributes: ['street_address', 'city', 'state', 'zip_code', 'country']
        }]
      },
      { 
        model: Service, 
        as: 'services', 
        attributes: ['id', 'name', 'price', 'duration', 'description'],
        through: { attributes: ['price'] }
      },
      { 
        model: Staff, 
        as: 'staff', 
        attributes: ['id', 'name', 'avatar', 'bio', 'specializations', 'role']
      },
      { 
        model: User, 
        as: 'user', 
        attributes: ['id', 'name', 'email', 'phone', 'avatar']
      },
      { 
        model: Payment, 
        as: 'payment', 
        attributes: ['id', 'amount', 'method', 'status', 'transaction_id', 'payment_date']
      }
    ]
  });
};

/**
 * Get appointment statistics for salon IDs
 * @param {Array} salonIds - Array of salon IDs
 * @param {Object} filters - Filter options (date range, etc.)
 * @returns {Promise<Object>} Statistics object
 */
exports.getStatsBySalonIds = async (salonIds, filters = {}) => {
  const baseWhere = {
    salon_id: { [Op.in]: salonIds }
  };
  
  // Date range filter
  if (filters.from || filters.to) {
    const dateFilter = {};
    if (filters.from) dateFilter[Op.gte] = new Date(filters.from);
    if (filters.to) dateFilter[Op.lte] = new Date(filters.to);
    baseWhere.start_at = dateFilter;
  }
  
  // Get counts by status
  const [pending, booked, completed, cancelled, totalRevenue] = await Promise.all([
    Appointment.count({
      where: { ...baseWhere, status: 'pending' }
    }),
    Appointment.count({
      where: { ...baseWhere, status: 'booked' }
    }),
    Appointment.count({
      where: { ...baseWhere, status: 'completed' }
    }),
    Appointment.count({
      where: { ...baseWhere, status: 'cancelled' }
    }),
    Appointment.sum('total_price', {
      where: { ...baseWhere, status: 'completed' }
    })
  ]);
  
  const total = pending + booked + completed + cancelled;
  
  return {
    total,
    pending,
    booked,
    completed,
    cancelled,
    totalRevenue: totalRevenue || 0,
    completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
    cancellationRate: total > 0 ? ((cancelled / total) * 100).toFixed(2) : 0
  };
};

exports.findConflicting = async ({ staff_id, status, start, end }) => {
  return Appointment.findAll({
    where: {
      staff_id,
      status,
      start_at: {
        [Op.lt]: end,
        [Op.gt]: start
      }
    }
  });
}; 