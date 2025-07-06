const { BillingHistory, Subscription } = require('../models');

// Get all billing histories
exports.getAllBillingHistories = async (req, res) => {
  try {
    const histories = await BillingHistory.findAll({ include: [{ model: Subscription, as: 'subscription' }] });
    res.json(histories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get billing history by ID
exports.getBillingHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await BillingHistory.findByPk(id, { include: [{ model: Subscription, as: 'subscription' }] });
    if (!history) return res.status(404).json({ error: 'Billing history not found' });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get billing histories by subscription
exports.getBillingHistoriesBySubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const histories = await BillingHistory.findAll({
      where: { subscription_id: subscriptionId },
      order: [['date', 'DESC']]
    });
    res.json(histories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a billing history
exports.createBillingHistory = async (req, res) => {
  try {
    const data = req.body;
    const amount = Number(data.amount);
    const taxAmount = Number(data.tax_amount) || 0;
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    if (isNaN(taxAmount) || taxAmount < 0) {
      return res.status(400).json({ error: 'Tax must be a non-negative number' });
    }
    if (taxAmount > amount) {
      return res.status(400).json({ error: 'Tax cannot exceed amount' });
    }
    const subtotal = Number((amount).toFixed(2));
    const total = Number((amount + taxAmount).toFixed(2));
    // Auto-generate invoice_number if not provided
    let invoice_number = data.invoice_number;
    if (!invoice_number) {
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      invoice_number = `INV-${year}-${random}`;
    }
    const history = await BillingHistory.create({
      ...data,
      amount,
      tax_amount: taxAmount,
      subtotal,
      total,
      invoice_number,
    });
    res.status(201).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a billing history
exports.updateBillingHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const [updatedCount, updatedRows] = await BillingHistory.update(data, {
      where: { id },
      returning: true
    });
    if (updatedCount === 0) return res.status(404).json({ error: 'Billing history not found' });
    res.json(updatedRows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a billing history
exports.deleteBillingHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BillingHistory.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: 'Billing history not found' });
    res.json({ message: 'Billing history deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 