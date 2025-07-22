const billingHistoryRepository = require('../repositories/billingHistoryRepository');

exports.getAllBillingHistories = async () => {
  return billingHistoryRepository.findAll();
};

exports.getBillingHistoryById = async (id) => {
  return billingHistoryRepository.findById(id);
};

exports.getBillingHistoriesBySubscription = async (subscriptionId) => {
  return billingHistoryRepository.findBySubscription(subscriptionId);
};

exports.createBillingHistory = async (data) => {
  // Business logic for amount, tax, subtotal, total, invoice_number
  const amount = Number(data.amount);
  const taxAmount = Number(data.tax_amount) || 0;
  if (isNaN(amount) || amount <= 0) throw new Error('Amount must be a positive number');
  if (isNaN(taxAmount) || taxAmount < 0) throw new Error('Tax must be a non-negative number');
  if (taxAmount > amount) throw new Error('Tax cannot exceed amount');
  const subtotal = Number((amount).toFixed(2));
  const total = Number((amount + taxAmount).toFixed(2));
  let invoice_number = data.invoice_number;
  if (!invoice_number) {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    invoice_number = `INV-${year}-${random}`;
  }
  return billingHistoryRepository.create({
    ...data,
    amount,
    tax_amount: taxAmount,
    subtotal,
    total,
    invoice_number,
  });
};

exports.updateBillingHistory = async (id, data) => {
  await billingHistoryRepository.update(id, data);
  return billingHistoryRepository.findById(id);
};

exports.deleteBillingHistory = async (id) => {
  return billingHistoryRepository.delete(id);
}; 