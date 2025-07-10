const { Payment, Appointment } = require('../../models');
const Stripe = require('stripe');

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
    const { appointment_id ,method } = req.body;

    // Fetch integration settings and check feature toggle
    const { IntegrationSettings } = require('../../models');
    const settings = await IntegrationSettings.findOne({ order: [['updated_at', 'DESC']] });
    if (!settings || settings.stripe_enabled === false) {
      return res.status(503).json({ message: 'Payments are currently disabled by the admin.' });
    }
    if (!settings.payment_api_key) {
      return res.status(500).json({ message: 'Stripe API key is not configured.' });
    }
    const stripe = Stripe(settings.payment_api_key);

    // Validate appointment
    const appointment = await Appointment.findOne({ where: { id: appointment_id, user_id: userId } });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found or not yours' });
    if (["cancelled", "completed"].includes(appointment.status)) {
      return res.status(400).json({ message: 'Cannot pay for a cancelled or completed appointment' });
    }

    // Prevent duplicate payments (atomic)
    const [existingPayment, created] = await Payment.findOrCreate({
      where: { appointment_id },
      defaults: {
        user_id: userId,
        appointment_id,
        amount: appointment.total_price,
        method,
        status: 'pending',
        payment_date: new Date()
      }
    });
    if (!created) {
      return res.status(400).json({ message: 'Payment already exists for this appointment' });
    }

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(appointment.total_price) * 100), // cents
      currency: 'usd',
      metadata: {
        appointment_id: appointment.id,
        user_id: userId
      }
    });

    // Update the payment record with the Stripe transaction ID
    existingPayment.transaction_id = paymentIntent.id;
    await existingPayment.save();

    res.status(201).json({
      stripeClientSecret: paymentIntent.client_secret
    });
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