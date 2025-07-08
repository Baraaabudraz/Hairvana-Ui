const { Payment, Appointment } = require('../../models');

exports.getUserPayments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.findAll({ where: { user_id: userId } });
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

exports.getUserPaymentById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payment = await Payment.findOne({ where: { id: req.params.id, user_id: userId } });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

exports.createUserPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Only allow creating payment for the authenticated user
    const paymentData = { ...req.body, user_id: userId };
    const payment = await Payment.create(paymentData);
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

// POST /checkout — Initiate payment for an appointment
exports.checkoutPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { appointment_id, method } = req.body;

    // Validate appointment
    const appointment = await Appointment.findOne({ where: { id: appointment_id, user_id: userId } });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found or not yours' });

    // Check if already paid
    const existingPayment = await Payment.findOne({ where: { appointment_id } });
    if (existingPayment) return res.status(400).json({ message: 'Payment already exists for this appointment' });

    // Create payment (simulate payment gateway logic here)
    const payment = await Payment.create({
      user_id: userId,
      appointment_id,
      amount: appointment.total_price,
      method,
      status: 'paid', // or 'pending' if integrating with a real gateway
      payment_date: new Date()
    });

    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

// GET /history — User’s payment history
exports.getUserPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.findAll({ where: { user_id: userId } });
    res.json(payments);
  } catch (error) {
    next(error);
  }
}; 