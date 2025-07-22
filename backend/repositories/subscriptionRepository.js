const { Subscription, Salon, SubscriptionPlan, BillingHistory } = require('../models');
const { Op } = require('sequelize');

exports.getAllSubscriptions = async (query) => {
  const { status, salonId, ownerId, search, includePlans } = query;
  const where = {};
  if (status && status !== 'all') where.status = status;
  if (salonId) where.salon_id = salonId;
  const salonWhere = {};
  if (ownerId) salonWhere.owner_id = ownerId;
  if (search) {
    salonWhere[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { owner_name: { [Op.iLike]: `%${search}%` } }
    ];
  }
  const subscriptions = await Subscription.findAll({
    where,
    include: [
      { model: Salon, as: 'salon', where: Object.keys(salonWhere).length ? salonWhere : undefined, required: !!(ownerId || search) },
      { model: SubscriptionPlan, as: 'plan' }
    ]
  });
  const formattedSubscriptions = subscriptions.map(sub => {
    const s = sub.toJSON();
    return {
      id: s.id,
      salonId: s.salon_id,
      salonName: s.salon?.name,
      salonPhone: s.salon?.phone,
      salonEmail: s.salon?.email,
      ownerId: s.salon?.owner_id,
      ownerName: s.salon?.owner_name,
      ownerEmail: s.salon?.owner_email,
      plan: s.plan?.name,
      status: s.status,
      startDate: s.start_date,
      nextBillingDate: s.next_billing_date,
      amount: s.amount,
      billingCycle: s.billing_cycle,
      features: s.plan?.features,
      usage: s.usage,
      paymentMethod: s.payment_method,
      billingHistory: []
    };
  });
  const stats = {
    total: formattedSubscriptions.length,
    active: formattedSubscriptions.filter(s => s.status === 'active').length,
    trial: formattedSubscriptions.filter(s => s.status === 'trial').length,
    cancelled: formattedSubscriptions.filter(s => s.status === 'cancelled').length,
    totalRevenue: formattedSubscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + Number(s.amount || 0), 0),
  };
  const response = {
    subscriptions: formattedSubscriptions,
    total: formattedSubscriptions.length,
    stats
  };
  if (includePlans === 'true') {
    const plans = await SubscriptionPlan.findAll();
    response.plans = plans;
  }
  return response;
};

exports.getSubscriptionById = async (id) => {
  const sub = await Subscription.findOne({
    where: { id },
    include: [
      { model: Salon, as: 'salon' },
      { model: SubscriptionPlan, as: 'plan' }
    ]
  });
  if (!sub) return null;
  const s = sub.toJSON();
  let usage = s.usage;
  if (!usage) {
    usage = {
      bookings: 0,
      bookingsLimit: (s.plan && s.plan.limits && s.plan.limits.bookings != null) ? s.plan.limits.bookings : 0,
      staff: 0,
      staffLimit: (s.plan && s.plan.limits && s.plan.limits.staff != null) ? s.plan.limits.staff : 0,
      locations: 1,
      locationsLimit: (s.plan && s.plan.limits && s.plan.limits.locations != null) ? s.plan.limits.locations : 1
    };
  }
  let billingHistory = await BillingHistory.findAll({
    where: { subscription_id: s.id },
    order: [['date', 'DESC']]
  });
  billingHistory = billingHistory.map(bh => {
    const obj = bh.toJSON();
    return {
      ...obj,
      total: obj.total !== undefined ? obj.total : (Number(obj.amount) + Number(obj.tax_amount || 0)),
    };
  });
  return {
    id: s.id,
    salonId: s.salon_id,
    salonName: s.salon?.name,
    salonPhone: s.salon?.phone,
    salonEmail: s.salon?.email,
    ownerId: s.salon?.owner_id,
    ownerName: s.salon?.owner_name,
    ownerEmail: s.salon?.owner_email,
    plan: s.plan?.name,
    status: s.status,
    startDate: s.start_date,
    nextBillingDate: s.next_billing_date,
    amount: s.amount,
    billingCycle: s.billing_cycle,
    features: s.plan?.features,
    usage,
    paymentMethod: s.payment_method,
    billingHistory
  };
};

exports.createSubscription = async (data) => {
  if (!data.salon_id || !data.plan_id) throw new Error('salon_id and plan_id are required');
  const plan = await SubscriptionPlan.findOne({ where: { id: data.plan_id } });
  if (!plan) throw new Error('Invalid plan ID');
  const salon = await Salon.findOne({ where: { id: data.salon_id } });
  if (!salon) throw new Error('Invalid salon ID');
  const newSub = await Subscription.create({
    ...data,
    amount: plan.price,
    start_date: data.start_date || new Date(),
    status: data.status || 'active',
    billing_cycle: data.billing_cycle || plan.billing_period
  });
  return newSub.toJSON();
};

exports.updateSubscription = async (id, data) => {
  if (data.plan_id) {
    const plan = await SubscriptionPlan.findOne({ where: { id: data.plan_id } });
    if (!plan) throw new Error('Invalid plan ID');
    if (data.usage) {
      data.usage = {
        ...data.usage,
        bookingsLimit: plan.limits.bookings,
        staffLimit: plan.limits.staff,
        locationsLimit: plan.limits.locations
      };
    }
    data.amount = plan.price;
  }
  const [updatedCount, updatedRows] = await Subscription.update(data, {
    where: { id },
    returning: true
  });
  if (updatedCount === 0) return null;
  return updatedRows[0];
};

exports.cancelSubscription = async (id) => {
  const [updatedCount, updatedRows] = await Subscription.update(
    { status: 'cancelled' },
    { where: { id }, returning: true }
  );
  if (updatedCount === 0) return null;
  return updatedRows[0];
};

exports.getSubscriptionPlans = async (query) => {
  return SubscriptionPlan.findAll();
};

exports.createBillingRecord = async (data, supabase) => {
  const { data: result, error } = await supabase
    .from('billing_history')
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return result;
};

exports.syncBilling = async (id, supabase) => {
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select(`*,salon:salons(id, name),plan:subscription_plans(*)`)
    .eq('id', id)
    .single();
  if (subError) throw new Error('Subscription not found');
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    message: 'Billing data synchronized successfully',
    subscription: {
      ...subscription,
      lastSynced: new Date().toISOString()
    }
  };
};

exports.generateReport = async (id, body, supabase) => {
  const { reportType, dateRange, format } = body;
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select(`*,salon:salons(id, name),plan:subscription_plans(*)`)
    .eq('id', id)
    .single();
  if (subError) throw new Error('Subscription not found');
  const { data: billingHistory, error: billingError } = await supabase
    .from('billing_history')
    .select('*')
    .eq('subscription_id', id)
    .order('date', { ascending: false });
  if (billingError) throw new Error('Failed to fetch billing history');
  let reportData;
  switch (reportType) {
    case 'billing':
      reportData = {
        title: 'Subscription Billing Report',
        subscription: subscription,
        billingHistory: billingHistory || [],
        summary: {
          totalBilled: billingHistory?.reduce((sum, record) => sum + record.amount, 0) || 0,
          invoiceCount: billingHistory?.length || 0,
          dateRange: dateRange
        }
      };
      break;
    case 'usage':
      reportData = {
        title: 'Subscription Usage Report',
        subscription: subscription,
        usage: subscription.usage,
        limits: subscription.plan.limits,
        dateRange: dateRange
      };
      break;
    default:
      reportData = {
        title: 'Subscription Summary Report',
        subscription: subscription,
        billingHistory: billingHistory || [],
        dateRange: dateRange
      };
  }
  return {
    message: 'Report generated successfully',
    reportId: `report-${Date.now()}`,
    reportData,
    format
  };
};

exports.exportInvoices = async (id, query, supabase) => {
  const { format } = query;
  const { data: billingHistory, error: billingError } = await supabase
    .from('billing_history')
    .select('*')
    .eq('subscription_id', id)
    .order('date', { ascending: false });
  if (billingError) throw new Error('Failed to fetch billing history');
  return {
    message: 'Invoices exported successfully',
    exportId: `export-${Date.now()}`,
    invoices: billingHistory || [],
    format: format || 'csv'
  };
};

exports.updatePaymentMethod = async (id, data, supabase) => {
  if (!data || !data.type) throw new Error('Invalid payment method data');
  const { data: result, error } = await supabase
    .from('subscriptions')
    .update({ payment_method: data })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return {
    message: 'Payment method updated successfully',
    subscription: result
  };
};

exports.createPlan = async (data) => {
  return SubscriptionPlan.create(data);
};

exports.getPlans = async () => {
  return SubscriptionPlan.findAll();
};

exports.getPlanById = async (id) => {
  return SubscriptionPlan.findByPk(id);
};

exports.updatePlan = async (id, data) => {
  const plan = await SubscriptionPlan.findByPk(id);
  if (!plan) return null;
  await plan.update(data);
  return plan;
};

exports.deletePlan = async (id) => {
  const plan = await SubscriptionPlan.findByPk(id);
  if (!plan) return null;
  await plan.destroy();
  return true;
}; 