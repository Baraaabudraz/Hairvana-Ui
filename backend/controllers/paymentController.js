const { Payment } = require('../models');

exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.findAll();
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

exports.createPayment = async (req, res, next) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

exports.updatePayment = async (req, res, next) => {
  try {
    const [affectedRows, [updatedPayment]] = await Payment.update(req.body, {
      where: { id: req.params.id },
      returning: true
    });
    if (!updatedPayment) return res.status(404).json({ message: 'Payment not found' });
    res.json(updatedPayment);
  } catch (error) {
    next(error);
  }
};

exports.deletePayment = async (req, res, next) => {
  try {
    const deleted = await Payment.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    next(error);
  }
}; 