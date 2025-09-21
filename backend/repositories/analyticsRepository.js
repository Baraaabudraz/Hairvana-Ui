const { User, Salon, Appointment, Service, BillingHistory, Subscription, SubscriptionPlan, SubscriptionPayment } = require('../models');
const { Op, Sequelize } = require('sequelize');

function getStartDateForPeriod(period = '30d') {
  const now = new Date();
  if (period === '7d') now.setDate(now.getDate() - 7);
  else if (period === '30d') now.setDate(now.getDate() - 30);
  else if (period === '90d') now.setDate(now.getDate() - 90);
  else if (period === '1y') now.setFullYear(now.getFullYear() - 1);
  return now;
}

exports.getAnalyticsData = async (query) => {
  const period = query.period || '30d';
  const startDate = getStartDateForPeriod(period);

  // Helper functions
  const safeCount = async (model, where = {}) => {
    try { return await model.count({ where }); } catch { return 0; }
  };
  const safeSum = async (model, field, where = {}) => {
    try { return (await model.sum(field, { where })) || 0; } catch { return 0; }
  };
  const safeFindAll = async (model, options = {}) => {
    try { return await model.findAll(options); } catch { return []; }
  };

  // Subscription Overview
  const totalSubscriptions = await safeCount(Subscription);
  const activeSubscriptions = await safeCount(Subscription, { status: 'active' });
  const cancelledSubscriptions = await safeCount(Subscription, { status: 'cancelled' });
  const expiredSubscriptions = await safeCount(Subscription, { status: 'expired' });
  
  // Subscription Revenue (Total Revenue is subscription-only)
  const subscriptionRevenueCurrent = await safeSum(Subscription, 'amount', { 
    status: 'active'
  });
  const prevStartDate = getStartDateForPeriod(period === '7d' ? '14d' : period === '30d' ? '60d' : period === '90d' ? '180d' : '2y');
  const subscriptionRevenuePrevious = await safeSum(Subscription, 'amount', { 
    status: 'active',
    createdAt: { [Op.lt]: startDate }
  });
  const subscriptionRevenueGrowth = subscriptionRevenuePrevious && subscriptionRevenuePrevious > 0 
    ? ((subscriptionRevenueCurrent - subscriptionRevenuePrevious) / subscriptionRevenuePrevious) * 100 
    : 0;

  // Monthly Recurring Revenue (MRR)
  const mrr = await safeSum(Subscription, 'amount', { 
    status: 'active',
    billingCycle: 'monthly'
  });
  const annualRecurringRevenue = await safeSum(Subscription, 'amount', { 
    status: 'active',
    billingCycle: 'yearly'
  });

  // Subscription Plans Distribution
  let planDistribution = [];
  try {
    const plans = await SubscriptionPlan.findAll({
      include: [{
        model: Subscription,
        as: 'subscriptions',
        where: { status: 'active' },
        required: false
      }]
    });
    planDistribution = plans.map(plan => ({
      name: plan.name,
      price: plan.price,
      subscribers: plan.subscriptions ? plan.subscriptions.length : 0,
      revenue: (plan.subscriptions ? plan.subscriptions.length : 0) * plan.price,
      growth: 0 // Could be calculated based on previous period
    }));
  } catch { planDistribution = []; }

  // Churn Analysis
  const churnedThisPeriod = await safeCount(Subscription, {
    status: 'cancelled',
    updatedAt: { [Op.gte]: startDate }
  });
  const churnRate = totalSubscriptions > 0 ? (churnedThisPeriod / totalSubscriptions) * 100 : 0;

  // New Subscriptions
  const newSubscriptions = await safeCount(Subscription, { 
    createdAt: { [Op.gte]: startDate } 
  });

  // Geographic Distribution of Subscriptions
  let geographicData = [];
  try {
    const subscriptions = await Subscription.findAll({
      include: [{
        model: User,
        as: 'owner',
        include: [{
          model: Salon,
          as: 'salons',
          include: [{
            model: require('../models').Address,
            as: 'address',
            attributes: ['city', 'state']
          }]
        }]
      }]
    });
    
    const geoMap = {};
    subscriptions.forEach(sub => {
      const salon = sub.owner?.salons?.[0];
      const loc = salon?.address ? `${salon.address.city}, ${salon.address.state}` : 'Unknown Location';
      if (!geoMap[loc]) {
        geoMap[loc] = { 
          location: loc, 
          subscriptions: 0, 
          revenue: 0,
          activeSubscriptions: 0
        };
      }
      geoMap[loc].subscriptions += 1;
      geoMap[loc].revenue += Number(sub.amount || 0);
      if (sub.status === 'active') {
        geoMap[loc].activeSubscriptions += 1;
      }
    });
    geographicData = Object.values(geoMap);
  } catch { geographicData = []; }

  // Performance Metrics
  const averageRevenuePerUser = activeSubscriptions > 0 ? (mrr / activeSubscriptions) : 0;
  const customerLifetimeValue = 0; // Would need historical data to calculate
  const subscriptionRetentionRate = 100 - churnRate;

  // Chart Data for Subscription Trends
  const generateSubscriptionChartData = async () => {
    try {
      const months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthlyRevenue = await safeSum(Subscription, 'amount', { 
          status: 'active',
          createdAt: { [Op.between]: [startOfMonth, endOfMonth] }
        });
        const monthlyNewSubs = await safeCount(Subscription, { 
          createdAt: { [Op.between]: [startOfMonth, endOfMonth] }
        });
        const monthlyChurned = await safeCount(Subscription, { 
          status: 'cancelled',
          updatedAt: { [Op.between]: [startOfMonth, endOfMonth] }
        });
        
        months.push({ 
          month: monthName, 
          revenue: monthlyRevenue, 
          newSubscriptions: monthlyNewSubs, 
          churned: monthlyChurned,
          netGrowth: monthlyNewSubs - monthlyChurned,
          date: startOfMonth.toISOString().split('T')[0] 
        });
      }
      return months;
    } catch { return []; }
  };
  const subscriptionChartData = await generateSubscriptionChartData();

  return {
    overview: {
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      expiredSubscriptions,
      totalRevenue: subscriptionRevenueCurrent,
      monthlyGrowth: subscriptionRevenueGrowth,
      mrr,
      annualRecurringRevenue
    },
    revenue: {
      current: subscriptionRevenueCurrent,
      previous: subscriptionRevenuePrevious,
      growth: subscriptionRevenueGrowth,
      data: subscriptionChartData
    },
    subscriptions: {
      total: totalSubscriptions,
      active: activeSubscriptions,
      cancelled: cancelledSubscriptions,
      churned: churnedThisPeriod,
      data: subscriptionChartData
    },
    userGrowth: {
      newUsers: newSubscriptions,
      returningUsers: 0, // Not applicable for subscriptions
      data: subscriptionChartData
    },
    topServices: planDistribution, // Using plan distribution instead of services
    geographicData,
    performanceMetrics: {
      averageRevenuePerUser,
      customerLifetimeValue,
      subscriptionRetentionRate,
      churnRate
    }
  };
}; 