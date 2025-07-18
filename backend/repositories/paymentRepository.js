const { Payment } = require('../models');

exports.findAll = async () => {
  return Payment.findAll();
};

exports.findById = async (id) => {
  return Payment.findByPk(id);
};

exports.create = async (data) => {
  return Payment.create(data);
};

exports.update = async (id, data) => {
  const [affectedRows, [updatedPayment]] = await Payment.update(data, {
    where: { id },
    returning: true
  });
  return updatedPayment;
};

exports.delete = async (id) => {
  return Payment.destroy({ where: { id } });
}; 