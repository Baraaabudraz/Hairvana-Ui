const { User, SalonOwner, Customer } = require('../models');

exports.findUserByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

exports.findUserById = async (id) => {
  return User.findOne({
    where: { id },
    include: [
      { model: SalonOwner, as: 'salonOwner' },
      { model: Customer, as: 'customer' }
    ]
  });
};

exports.updateLastLogin = async (id) => {
  return User.update({ last_login: new Date() }, { where: { id } });
};

exports.createUser = async (data) => {
  return User.create(data);
};

exports.createRoleSpecific = async (user, role) => {
  if (role === 'salon') {
    return SalonOwner.create({ user_id: user.id, total_salons: 0, total_revenue: 0, total_bookings: 0 });
  } else if (role === 'user') {
    return Customer.create({ user_id: user.id, total_spent: 0, total_bookings: 0, favorite_services: [] });
  }
};

exports.updatePassword = async (id, password_hash) => {
  return User.update({ password_hash }, { where: { id } });
}; 