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
      { model: Salon, as: 'salon', attributes: ['id', 'name', 'location', 'address', 'phone', 'email', 'images'] },
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
      { model: Salon, as: 'salon', attributes: ['id', 'name', 'location', 'address', 'phone', 'email', 'images'] },
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

exports.findConflicting = async ({ staff_id, status, start, end }) => {
  return Appointment.findAll({
    where: {
      staff_id,
      status,
      date: {
        [Op.lt]: end,
        [Op.gt]: start
      }
    }
  });
}; 