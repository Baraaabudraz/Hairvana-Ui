const subscriptionRepository = require('../repositories/subscriptionRepository');

exports.getAllSubscriptions = async (query) => {
  try {
    return await subscriptionRepository.getAllSubscriptions(query);
  } catch (err) {
    throw new Error('Failed to get subscriptions: ' + err.message);
  }
};

exports.getSubscriptionById = async (id) => {
  if (!id) throw new Error('Subscription ID is required');
  try {
    return await subscriptionRepository.getSubscriptionById(id);
  } catch (err) {
    throw new Error('Failed to get subscription: ' + err.message);
  }
};

exports.createSubscription = async (data) => {
  if (!data || typeof data !== 'object') throw new Error('Subscription data is required');
  try {
    return await subscriptionRepository.createSubscription(data);
  } catch (err) {
    throw new Error('Failed to create subscription: ' + err.message);
  }
};

exports.updateSubscription = async (id, data) => {
  if (!id) throw new Error('Subscription ID is required');
  if (!data || typeof data !== 'object') throw new Error('Subscription data is required');
  try {
    return await subscriptionRepository.updateSubscription(id, data);
  } catch (err) {
    throw new Error('Failed to update subscription: ' + err.message);
  }
};

exports.cancelSubscription = async (id) => {
  if (!id) throw new Error('Subscription ID is required');
  try {
    return await subscriptionRepository.cancelSubscription(id);
  } catch (err) {
    throw new Error('Failed to cancel subscription: ' + err.message);
  }
};

exports.getSubscriptionPlans = async (query) => {
  try {
    return await subscriptionRepository.getSubscriptionPlans(query);
  } catch (err) {
    throw new Error('Failed to get subscription plans: ' + err.message);
  }
};

exports.createBillingRecord = async (data, supabase) => {
  if (!data || typeof data !== 'object') throw new Error('Billing record data is required');
  if (!supabase) throw new Error('Supabase client is required');
  try {
    return await subscriptionRepository.createBillingRecord(data, supabase);
  } catch (err) {
    throw new Error('Failed to create billing record: ' + err.message);
  }
};

exports.syncBilling = async (id, supabase) => {
  if (!id) throw new Error('Subscription ID is required');
  if (!supabase) throw new Error('Supabase client is required');
  try {
    return await subscriptionRepository.syncBilling(id, supabase);
  } catch (err) {
    throw new Error('Failed to sync billing: ' + err.message);
  }
};

exports.generateReport = async (id, body, supabase) => {
  if (!id) throw new Error('Subscription ID is required');
  if (!body || typeof body !== 'object') throw new Error('Report body is required');
  if (!supabase) throw new Error('Supabase client is required');
  try {
    return await subscriptionRepository.generateReport(id, body, supabase);
  } catch (err) {
    throw new Error('Failed to generate report: ' + err.message);
  }
};

exports.exportInvoices = async (id, query, supabase) => {
  if (!id) throw new Error('Subscription ID is required');
  if (!supabase) throw new Error('Supabase client is required');
  try {
    return await subscriptionRepository.exportInvoices(id, query, supabase);
  } catch (err) {
    throw new Error('Failed to export invoices: ' + err.message);
  }
};

exports.updatePaymentMethod = async (id, data, supabase) => {
  if (!id) throw new Error('Subscription ID is required');
  if (!data || typeof data !== 'object') throw new Error('Payment method data is required');
  if (!supabase) throw new Error('Supabase client is required');
  try {
    return await subscriptionRepository.updatePaymentMethod(id, data, supabase);
  } catch (err) {
    throw new Error('Failed to update payment method: ' + err.message);
  }
};

exports.createPlan = async (data) => {
  if (!data || typeof data !== 'object') throw new Error('Plan data is required');
  try {
    return await subscriptionRepository.createPlan(data);
  } catch (err) {
    throw new Error('Failed to create plan: ' + err.message);
  }
};

exports.getPlans = async () => {
  try {
    return await subscriptionRepository.getPlans();
  } catch (err) {
    throw new Error('Failed to get plans: ' + err.message);
  }
};

exports.getPlanById = async (id) => {
  if (!id) throw new Error('Plan ID is required');
  try {
    return await subscriptionRepository.getPlanById(id);
  } catch (err) {
    throw new Error('Failed to get plan: ' + err.message);
  }
};

exports.updatePlan = async (id, data) => {
  if (!id) throw new Error('Plan ID is required');
  if (!data || typeof data !== 'object') throw new Error('Plan data is required');
  try {
    return await subscriptionRepository.updatePlan(id, data);
  } catch (err) {
    throw new Error('Failed to update plan: ' + err.message);
  }
};

exports.deletePlan = async (id) => {
  if (!id) throw new Error('Plan ID is required');
  try {
    return await subscriptionRepository.deletePlan(id);
  } catch (err) {
    throw new Error('Failed to delete plan: ' + err.message);
  }
};

exports.getSubscriptionBySalonId = async (salonId) => {
  if (!salonId) throw new Error('Salon ID is required');
  try {
    return await subscriptionRepository.getSubscriptionBySalonId(salonId);
  } catch (err) {
    throw new Error('Failed to get subscription by salon ID: ' + err.message);
  }
};

exports.getSubscriptionByOwnerId = async (ownerId) => {
  if (!ownerId) throw new Error('Owner ID is required');
  try {
    return await subscriptionRepository.getSubscriptionByOwnerId(ownerId);
  } catch (err) {
    throw new Error('Failed to get subscription by owner ID: ' + err.message);
  }
};

exports.getBillingHistoryBySubscriptionId = async (subscriptionId) => {
  if (!subscriptionId) throw new Error('Subscription ID is required');
  try {
    return await subscriptionRepository.getBillingHistoryBySubscriptionId(subscriptionId);
  } catch (err) {
    throw new Error('Failed to get billing history: ' + err.message);
  }
};

/**
 * Upgrade subscription (immediate activation)
 * @param {string} id - Subscription ID
 * @param {Object} data - Upgrade data
 * @returns {Object} Updated subscription
 */
exports.upgradeSubscription = async (id, data) => {
  if (!id) throw new Error('Subscription ID is required');
  if (!data || typeof data !== 'object') throw new Error('Upgrade data is required');
  try {
    return await subscriptionRepository.upgradeSubscription(id, data);
  } catch (err) {
    throw new Error('Failed to upgrade subscription: ' + err.message);
  }
};

/**
 * Downgrade subscription (end of cycle activation)
 * @param {string} id - Subscription ID
 * @param {Object} data - Downgrade data
 * @returns {Object} Updated subscription
 */
exports.downgradeSubscription = async (id, data) => {
  if (!id) throw new Error('Subscription ID is required');
  if (!data || typeof data !== 'object') throw new Error('Downgrade data is required');
  try {
    return await subscriptionRepository.downgradeSubscription(id, data);
  } catch (err) {
    throw new Error('Failed to downgrade subscription: ' + err.message);
  }
}; 