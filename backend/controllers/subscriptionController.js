const subscriptionService = require('../services/subscriptionService');

exports.getAllSubscriptions = async (req, res, next) => {
  try {
    const result = await subscriptionService.getAllSubscriptions(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptionById = async (req, res, next) => {
  try {
    const result = await subscriptionService.getSubscriptionById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Subscription not found' });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.createSubscription = async (req, res, next) => {
  try {
    const result = await subscriptionService.createSubscription(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateSubscription = async (req, res, next) => {
  try {
    const result = await subscriptionService.updateSubscription(req.params.id, req.body);
    if (!result) return res.status(404).json({ error: 'Subscription not found' });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.cancelSubscription = async (req, res, next) => {
  try {
    const result = await subscriptionService.cancelSubscription(req.params.id);
    if (!result) return res.status(404).json({ error: 'Subscription not found' });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptionPlans = async (req, res, next) => {
  try {
    const result = await subscriptionService.getSubscriptionPlans(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.createBillingRecord = async (req, res, next) => {
  try {
    const result = await subscriptionService.createBillingRecord(req.body, req.supabase);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.syncBilling = async (req, res, next) => {
  try {
    const result = await subscriptionService.syncBilling(req.params.id, req.supabase);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.generateReport = async (req, res, next) => {
  try {
    const result = await subscriptionService.generateReport(req.params.id, req.body, req.supabase);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.exportInvoices = async (req, res, next) => {
  try {
    const result = await subscriptionService.exportInvoices(req.params.id, req.query, req.supabase);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.updatePaymentMethod = async (req, res, next) => {
  try {
    const result = await subscriptionService.updatePaymentMethod(req.params.id, req.body, req.supabase);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.createPlan = async (req, res, next) => {
  try {
    const result = await subscriptionService.createPlan(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getPlans = async (req, res, next) => {
  try {
    const result = await subscriptionService.getPlans();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getPlanById = async (req, res, next) => {
  try {
    const result = await subscriptionService.getPlanById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Plan not found' });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.updatePlan = async (req, res, next) => {
  try {
    const result = await subscriptionService.updatePlan(req.params.id, req.body);
    if (!result) return res.status(404).json({ error: 'Plan not found' });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.deletePlan = async (req, res, next) => {
  try {
    const result = await subscriptionService.deletePlan(req.params.id);
    if (!result) return res.status(404).json({ error: 'Plan not found' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};