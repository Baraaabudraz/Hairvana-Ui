const { Subscription, Salon, SubscriptionPlan, BillingHistory } = require('../models');
const { Op } = require('sequelize');

// Get all subscriptions
exports.getAllSubscriptions = async (req, res) => {
  try {
    const { status, salonId, ownerId, search, includePlans } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (salonId) where.salon_id = salonId;
    // For ownerId, filter by salon's owner
    const salonWhere = {};
    if (ownerId) salonWhere.owner_id = ownerId;
    if (search) {
      salonWhere[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { owner_name: { [Op.iLike]: `%${search}%` } }
      ];
    }
    // Fetch subscriptions with associations
    const subscriptions = await Subscription.findAll({
      where,
      include: [
        { model: Salon, as: 'salon', where: Object.keys(salonWhere).length ? salonWhere : undefined, required: !!(ownerId || search) },
        { model: SubscriptionPlan, as: 'plan' }
      ]
    });
    // Format subscriptions for the frontend
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
        billingHistory: [] // Add billing history here if model exists
      };
    });
    // Calculate stats
    const stats = {
      total: formattedSubscriptions.length,
      active: formattedSubscriptions.filter(s => s.status === 'active').length,
      trial: formattedSubscriptions.filter(s => s.status === 'trial').length,
      cancelled: formattedSubscriptions.filter(s => s.status === 'cancelled').length,
      totalRevenue: formattedSubscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + Number(s.amount || 0), 0),
    };
    const response = {
      subscriptions: formattedSubscriptions,
      total: formattedSubscriptions.length,
      stats
    };
    // Include plans if requested
    if (includePlans === 'true') {
      const plans = await SubscriptionPlan.findAll();
      response.plans = plans;
    }
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get subscription by ID
exports.getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await Subscription.findOne({
      where: { id },
      include: [
        { model: Salon, as: 'salon' },
        { model: SubscriptionPlan, as: 'plan' }
      ]
    });
    if (!sub) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    const s = sub.toJSON();
    // Ensure usage is never null
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
    // Fetch billing history for this subscription
    let billingHistory = await BillingHistory.findAll({
      where: { subscription_id: s.id },
      order: [['date', 'DESC']]
    });
    // Map each record to ensure total is present and correct
    billingHistory = billingHistory.map(bh => {
      const obj = bh.toJSON();
      return {
        ...obj,
        total: obj.total !== undefined ? obj.total : (Number(obj.amount) + Number(obj.tax_amount || 0)),
      };
    });
    const formattedSubscription = {
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
      billingHistory // <-- now includes real data
    };
    res.json(formattedSubscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new subscription
exports.createSubscription = async (req, res) => {
  try {
    const subscriptionData = req.body;
    // Validate required fields
    if (!subscriptionData.salon_id || !subscriptionData.plan_id) {
      return res.status(400).json({ error: 'salon_id and plan_id are required' });
    }
    // Check if plan exists
    const plan = await SubscriptionPlan.findOne({ where: { id: subscriptionData.plan_id } });
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }
    // Check if salon exists
    const salon = await Salon.findOne({ where: { id: subscriptionData.salon_id } });
    if (!salon) {
      return res.status(400).json({ error: 'Invalid salon ID' });
    }
    // Create subscription
    const newSub = await Subscription.create({
      ...subscriptionData,
      amount: plan.price, // or use subscriptionData.amount if you want to allow override
      start_date: subscriptionData.start_date || new Date(),
      status: subscriptionData.status || 'active',
      billing_cycle: subscriptionData.billing_cycle || plan.billing_period
    });
    res.status(201).json(newSub.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a subscription
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscriptionData = req.body;

    // If changing plan, get the new plan details
    if (subscriptionData.plan_id) {
      const plan = await SubscriptionPlan.findOne({ where: { id: subscriptionData.plan_id } });
      if (!plan) {
        return res.status(400).json({ error: 'Invalid plan ID' });
      }
      // Update with new plan limits
      if (subscriptionData.usage) {
        subscriptionData.usage = {
          ...subscriptionData.usage,
          bookingsLimit: plan.limits.bookings,
          staffLimit: plan.limits.staff,
          locationsLimit: plan.limits.locations
        };
      }
      subscriptionData.amount = plan.price;
    }

    const [updatedCount, updatedRows] = await Subscription.update(subscriptionData, {
      where: { id },
      returning: true
    });
    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(updatedRows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel a subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedCount, updatedRows] = await Subscription.update(
      { status: 'cancelled' },
      { where: { id }, returning: true }
    );
    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(updatedRows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get subscription plans
exports.getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a billing record
exports.createBillingRecord = async (req, res) => {
  try {
    const billingData = req.body;
    
    const { data, error } = await req.supabase
      .from('billing_history')
      .insert(billingData)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Sync billing data
exports.syncBilling = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get subscription details
    const { data: subscription, error: subError } = await req.supabase
      .from('subscriptions')
      .select(`
        *,
        salon:salons(id, name),
        plan:subscription_plans(*)
      `)
      .eq('id', id)
      .single();
    
    if (subError) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Simulate syncing with payment gateway
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return updated subscription data
    res.json({
      message: 'Billing data synchronized successfully',
      subscription: {
        ...subscription,
        lastSynced: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate subscription report
exports.generateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reportType, dateRange, format } = req.body;
    
    // Get subscription details
    const { data: subscription, error: subError } = await req.supabase
      .from('subscriptions')
      .select(`
        *,
        salon:salons(id, name),
        plan:subscription_plans(*)
      `)
      .eq('id', id)
      .single();
    
    if (subError) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Get billing history
    const { data: billingHistory, error: billingError } = await req.supabase
      .from('billing_history')
      .select('*')
      .eq('subscription_id', id)
      .order('date', { ascending: false });
    
    if (billingError) {
      return res.status(500).json({ error: 'Failed to fetch billing history' });
    }
    
    // Generate report data based on type
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
    
    // In a real app, you would format the report based on the requested format
    // and potentially store it for later retrieval
    
    res.json({
      message: 'Report generated successfully',
      reportId: `report-${Date.now()}`,
      reportData,
      format
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export invoices
exports.exportInvoices = async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.query;
    
    // Get billing history
    const { data: billingHistory, error: billingError } = await req.supabase
      .from('billing_history')
      .select('*')
      .eq('subscription_id', id)
      .order('date', { ascending: false });
    
    if (billingError) {
      return res.status(500).json({ error: 'Failed to fetch billing history' });
    }
    
    // In a real app, you would format the data based on the requested format
    // and return it as a downloadable file
    
    res.json({
      message: 'Invoices exported successfully',
      exportId: `export-${Date.now()}`,
      invoices: billingHistory || [],
      format: format || 'csv'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update payment method
exports.updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
    
    // Validate payment data
    if (!paymentData || !paymentData.type) {
      return res.status(400).json({ error: 'Invalid payment method data' });
    }
    
    // Update subscription with new payment method
    const { data, error } = await req.supabase
      .from('subscriptions')
      .update({ payment_method: paymentData })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({
      message: 'Payment method updated successfully',
      subscription: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- PLAN CRUD OPERATIONS ---

// Create a new plan
exports.createPlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
};

// Get all plans
exports.getPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.findAll();
    res.json(plans);
  } catch (error) {
    next(error);
  }
};

// Get a plan by ID
exports.getPlanById = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    next(error);
  }
};

// Update a plan
exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    await plan.update(req.body);
    res.json(plan);
  } catch (error) {
    next(error);
  }
};

// Delete a plan
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    await plan.destroy();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};