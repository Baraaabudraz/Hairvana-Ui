const paymentRepository = require('../repositories/paymentRepository');

exports.getAllPayments = async () => {
  return paymentRepository.findAll();
};

exports.getPaymentById = async (id) => {
  return paymentRepository.findById(id);
};

exports.createPayment = async (data) => {
  return paymentRepository.create(data);
};

exports.updatePayment = async (id, data) => {
  await paymentRepository.update(id, data);
  return paymentRepository.findById(id);
};

exports.deletePayment = async (id) => {
  return paymentRepository.delete(id);
}; 