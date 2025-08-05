const billingHistoryService = require('../services/billingHistoryService');

exports.getAllBillingHistories = async (req, res, next) => {
  try {
    const histories = await billingHistoryService.getAllBillingHistories();
    res.json(histories);
  } catch (error) {
    next(error);
  }
};

exports.getBillingHistoryById = async (req, res, next) => {
  try {
    const history = await billingHistoryService.getBillingHistoryById(req.params.id);
    if (!history) return res.status(404).json({ error: 'Billing history not found' });
    res.json(history);
  } catch (error) {
    next(error);
  }
};

exports.getBillingHistoriesBySubscription = async (req, res, next) => {
  try {
    const histories = await billingHistoryService.getBillingHistoriesBySubscription(req.params.subscriptionId);
    res.json(histories);
  } catch (error) {
    next(error);
  }
};

exports.createBillingHistory = async (req, res, next) => {
  try {
    const history = await billingHistoryService.createBillingHistory(req.body);
    res.status(201).json(history);
  } catch (error) {
    next(error);
  }
};

exports.updateBillingHistory = async (req, res, next) => {
  try {
    const updated = await billingHistoryService.updateBillingHistory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Billing history not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.deleteBillingHistory = async (req, res, next) => {
  try {
    const deleted = await billingHistoryService.deleteBillingHistory(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Billing history not found' });
    res.json({ message: 'Billing history deleted' });
  } catch (error) {
    next(error);
  }
}; 