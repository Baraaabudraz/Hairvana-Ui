const {
  Salon,
  User,
  Appointment,
  Review,
  Service,
  Staff, Address,
  Payment,
} = require("../models");
const { Op, Sequelize } = require("sequelize");

exports.findAll = async (query) => {
  const where = {};
  let includeModels =[];
  if (query.owner_id) {
    where.owner_id = query.owner_id;
  } else {
    if (query.status && query.status !== "all") where.status = query.status;
    if (query.ownerId) where.owner_id = query.ownerId;
  
   includeModels = [
    { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role_id'] },
    { model: Address, as: 'address' }
  ];
  
    if (query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${query.search}%` } },
        { '$address.city$': { [Op.iLike]: `%${query.search}%` } },
      { '$address.state$': { [Op.iLike]: `%${query.search}%` } },
      ];
    }
  }
  
  const limit = query.limit ? parseInt(query.limit, 10) : 10;
  const offset = query.page ? (parseInt(query.page, 10) - 1) * limit : 0;
  const { rows, count } = await Salon.findAndCountAll({
    where,
    include: includeModels,
    limit,
    offset,
  });
  return { rows, count };
};

exports.findById = async (id) => {
  return Salon.findOne({
    where: { id },
    include: [
      { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role_id'] },
      { model: Address, as: 'address' },
      { model: Service, as: 'services' }
    ]
  });
};

exports.findByOwnerId = async (ownerId) => {
  return Salon.findOne({
    where: { owner_id: ownerId },
    include: [
      { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role_id'] },
      { model: Address, as: 'address' },
      { model: Service, as: 'services' }
    ]
  });
};

exports.findAllByOwnerId = async (ownerId) => {
  return Salon.findAll({
    where: { owner_id: ownerId },
    include: [
      { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role_id'] },
      { model: Address, as: 'address' },
      { model: Service, as: 'services' }
    ],
    order: [['created_at', 'DESC']]
  });
};

exports.create = async (data) => Salon.create(data);

exports.update = async (id, data) => {
  await Salon.update(data, {
    where: { id }
  });
  
  // Fetch the updated salon with includes
  return Salon.findOne({
    where: { id },
    include: [
      { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role_id'] },
      { model: Address, as: 'address' },
      { model: Service, as: 'services' }
    ]
  });
};

exports.delete = async (id) => {
  return Salon.destroy({ where: { id } });
};

exports.updateStatus = async (id, status) => {
  await Salon.update(
    { status },
    { where: { id } }
  );
  
  // Fetch the updated salon with includes
  return Salon.findOne({
    where: { id },
    include: [
      { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role_id'] },
      { model: Address, as: 'address' },
      { model: Service, as: 'services' }
    ]
  });
};

exports.getRevenue = async (salonId) => {
  const revenue = await Appointment.sum("total_price", {
    where: { salon_id: salonId, status: ["booked", "completed"] },
  });
  return revenue || 0;
};

exports.getBookings = async (salonId) => {
  const bookings = await Appointment.count({
    where: { salon_id: salonId, status: ["booked", "completed"] },
  });
  return bookings || 0;
};

exports.getRating = async (salonId) => {
  const ratingResult = await Review.findOne({
    attributes: [[Sequelize.fn("AVG", Sequelize.col("rating")), "avgRating"]],
    where: { salon_id: salonId },
  });
  return ratingResult && ratingResult.dataValues.avgRating
    ? parseFloat(ratingResult.dataValues.avgRating)
    : 0;
};

exports.getServices = async (id) => {
  return Service.findAll({ where: { salon_id: id } });
};

exports.getStaff = async (id) => {
  return Staff.findAll({ where: { salon_id: id } });
};

exports.getAppointments = async (id, query) => {
  const where = { salon_id: id };
  if (query.status && query.status !== "all") where.status = query.status;
  if (query.from) where.date = { [Op.gte]: query.from };
  if (query.to) where.date = { ...(where.date || {}), [Op.lte]: query.to };
  return Appointment.findAll({
    where,
    order: [["date", "DESC"]],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "phone", "avatar"],
      },
      {
        model: Service,
        as: "service",
        attributes: ["id", "name", "price", "duration"],
      },
      { model: Staff, as: "staff", attributes: ["id", "name", "avatar"] },
    ],
  });
};

/**
 * Get monthly revenue for a specific salon
 * @param {string} salonId - Salon ID
 * @param {number} year - Year
 * @param {number} month - Month
 * @returns {Object} Monthly revenue data
 */
exports.getMonthlyRevenue = async (salonId, year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  // Get total revenue for the month
  const totalRevenue = await Payment.sum('amount', {
    include: [{
      model: Appointment,
      as: 'appointment',
      where: { 
        salon_id: salonId,
        start_at: { [Op.between]: [startDate, endDate] }
      },
      attributes: []
    }],
    where: { status: 'paid' }
  });

  // Get total transactions count
  const totalTransactions = await Payment.count({
    include: [{
      model: Appointment,
      as: 'appointment',
      where: { 
        salon_id: salonId,
        start_at: { [Op.between]: [startDate, endDate] }
      },
      attributes: []
    }],
    where: { status: 'paid' }
  });

  // Get average transaction value
  const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Get revenue breakdown by service - simplified approach
  // For now, return empty array to avoid complex grouping issues
  const revenueBreakdown = [];

  return {
    totalRevenue: totalRevenue || 0,
    totalTransactions: totalTransactions || 0,
    averageTransactionValue: averageTransactionValue || 0,
    revenueBreakdown: revenueBreakdown || []
  };
};

/**
 * Get transaction history for a specific salon
 * @param {string} salonId - Salon ID
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.status - Payment status filter
 * @param {string} options.from - Start date filter
 * @param {string} options.to - End date filter
 * @returns {Object} Transaction history data
 */
exports.getTransactionHistory = async (salonId, options) => {
  const where = {};
  const appointmentWhere = { salon_id: salonId };
  
  // Add status filter
  if (options.status && options.status !== 'all') {
    where.status = options.status;
  }
  
  // Add date range filters
  if (options.from) {
    appointmentWhere.start_at = { [Op.gte]: new Date(options.from) };
  }
  if (options.to) {
    appointmentWhere.start_at = { 
      ...(appointmentWhere.start_at || {}), 
      [Op.lte]: new Date(options.to) 
    };
  }

  // Get total count for pagination
  const total = await Payment.count({
    include: [{
      model: Appointment,
      as: 'appointment',
      where: appointmentWhere,
      attributes: []
    }],
    where
  });

  // Get total amount
  const totalAmount = await Payment.sum('amount', {
    include: [{
      model: Appointment,
      as: 'appointment',
      where: appointmentWhere,
      attributes: []
    }],
    where: { ...where, status: 'paid' }
  });

  // Calculate average amount
  const averageAmount = total > 0 ? totalAmount / total : 0;

  // Get paginated transactions
  const offset = (options.page - 1) * options.limit;
  const transactions = await Payment.findAll({
    attributes: [
      'id', 'amount', 'method', 'status', 'transaction_id', 
      'payment_date', 'refund_amount', 'refund_reason', 'created_at'
    ],
    include: [{
      model: Appointment,
      as: 'appointment',
      where: appointmentWhere,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'avatar']
        },
        {
          model: Staff,
          as: 'staff',
          attributes: ['id', 'name', 'avatar']
        }
      ]
    }],
    where,
    order: [['created_at', 'DESC']],
    limit: options.limit,
    offset
  });

  return {
    transactions,
    total,
    totalAmount: totalAmount || 0,
    averageAmount: averageAmount || 0
  };
};

/**
 * Get services for a specific appointment
 * @param {string} appointmentId - Appointment ID
 * @returns {Array} Services for the appointment
 */
exports.getAppointmentServices = async (appointmentId) => {
  const appointment = await Appointment.findOne({
    where: { id: appointmentId },
    include: [{
      model: Service,
      as: 'services',
      attributes: ['id', 'name', 'price', 'duration']
    }]
  });
  
  return appointment ? appointment.services : [];
};
