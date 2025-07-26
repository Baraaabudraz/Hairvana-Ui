const {
  Salon,
  User,
  Appointment,
  Review,
  Service,
  Staff, Address,
} = require("../models");
const { Op, Sequelize } = require("sequelize");

exports.findAll = async (query) => {
  const where = {};
  if (query.owner_id) {
    where.owner_id = query.owner_id;
  } else {
    if (query.status && query.status !== "all") where.status = query.status;
    if (query.ownerId) where.owner_id = query.ownerId;
  
  const includeModels = [
    { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role'] },
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
      { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role'] },
      { model: Address, as: 'address' },
      { model: Service, as: 'services' }
    ]
  });
};

exports.findByOwnerId = async (ownerId) => {
  return Salon.findOne({
    where: { owner_id: ownerId },
    include: [
      { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role'] },
      { model: Address, as: 'address' },
      { model: Service, as: 'services' }
    ]
  });
};

exports.findAllByOwnerId = async (ownerId) => {
  return Salon.findAll({
    where: { owner_id: ownerId },
    include: [
      { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role'] },
      { model: Address, as: 'address' },
      { model: Service, as: 'services' }
    ],
    order: [['created_at', 'DESC']]
  });
};

exports.create = async (data) => Salon.create(data);

exports.update = async (id, data) => {
  const [affectedRows, [updatedSalon]] = await Salon.update(data, {
    where: { id },
    returning: true,
  });
  return updatedSalon;
};

exports.delete = async (id) => {
  return Salon.destroy({ where: { id } });
};

exports.updateStatus = async (id, status) => {
  const [affectedRows, [updatedSalon]] = await Salon.update(
    { status },
    { where: { id }, returning: true }
  );
  return updatedSalon;
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
