const { User, SalonOwner, Customer, Salon } = require('../models');

exports.findAll = async (query = {}) => {
  const { where = {}, limit = 10, offset = 0 } = query;
  return User.findAndCountAll({
    where,
    include: [
      { model: SalonOwner, as: 'salonOwner', include: [{ model: Salon, as: 'salons' }] },
      { model: Customer, as: 'customer' },
      { model: Salon, as: 'salons' }
    ],
    order: [['createdAt', 'DESC']], // Sort by latest users first
    limit,
    offset
  });
};

exports.findById = async (id) => {
  return User.findOne({
    where: { id },
    include: [
      { model: SalonOwner, as: 'salonOwner', include: [{ model: Salon, as: 'salons' }] },
      { model: Customer, as: 'customer' }
    ]
  });
};

exports.create = async (userData) => {
  return User.create(userData);
};

exports.update = async (id, userData) => {
  return User.update(userData, {
    where: { id },
    returning: true
  });
};

exports.delete = async (id) => {
  return User.destroy({ where: { id } });
};

exports.updateStatus = async (id, status) => {
  return User.update({ status }, { where: { id } });
}; 