const { BillingHistory, Subscription } = require('../models');

exports.findAll = async () => {
  return BillingHistory.findAll({ include: [{ model: Subscription, as: 'subscription' }] });
};

exports.findById = async (id) => {
  return BillingHistory.findByPk(id, { include: [{ model: Subscription, as: 'subscription' }] });
};

exports.findBySubscription = async (subscriptionId) => {
  return BillingHistory.findAll({
    where: { subscription_id: subscriptionId },
    order: [['date', 'DESC']]
  });
};

exports.create = async (data) => {
  return BillingHistory.create(data);
};

exports.update = async (id, data) => {
  const [updatedCount, updatedRows] = await BillingHistory.update(data, {
    where: { id },
    returning: true
  });
  return updatedCount > 0 ? updatedRows[0] : null;
};

exports.delete = async (id) => {
  return BillingHistory.destroy({ where: { id } });
}; 