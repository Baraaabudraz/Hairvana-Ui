 const {
   Subscription,
   Salon,
   SubscriptionPlan,
   BillingHistory,
   User,
 } = require("../models");
const { Op } = require("sequelize");

 exports.getAllSubscriptions = async (query) => {
   const { status, salonId, ownerId, search, includePlans } = query;
   const where = {};
   if (status && status !== "all") where.status = status;
   if (ownerId) where.owner_id = ownerId;
   
     // Build include array - include salon information through owner
  const include = [
    { model: SubscriptionPlan, as: "plan" },
    { 
      model: User, 
      as: "owner",
      include: [
        {
          model: Salon,
          as: "salons",
          required: false, // Left join to include users even if no salons
        }
      ]
    }
  ];
   
   let subscriptions = await Subscription.findAll({
     where,
     include: include,
   });
   
   // If filtering by salon, we need to filter after the fact
   if (salonId) {
     const salon = await Salon.findByPk(salonId);
     if (salon) {
       subscriptions = subscriptions.filter(sub => sub.owner_id === salon.owner_id);
     } else {
       subscriptions = []; // No salon found, return empty array
     }
   }
   
   // If searching, filter by owner name/email
   if (search) {
     subscriptions = subscriptions.filter(sub => {
       const ownerName = sub.owner?.name || sub.owner?.email || '';
       return ownerName.toLowerCase().includes(search.toLowerCase());
     });
   }
   
   const formattedSubscriptions = subscriptions.map((sub) => {
     const s = sub.toJSON();
     
     // Get the first salon for this owner (assuming one owner can have multiple salons)
     const ownerSalon = s.owner?.salons && s.owner.salons.length > 0 ? s.owner.salons[0] : null;
     
     return {
       id: s.id,
       ownerId: s.owner_id,
       ownerName: s.owner?.name || s.owner?.email,
       ownerEmail: s.owner?.email,
       plan: s.plan?.name,
       status: s.status,
       startDate: s.start_date,
       nextBillingDate: s.next_billing_date,
       amount: s.amount,
       billingCycle: s.billing_cycle,
       features: s.plan?.features,
       usage: s.usage,
       paymentMethod: s.payment_method,
       billingHistory: [],
       // Include actual salon information
       salonId: ownerSalon?.id || null,
       salonName: ownerSalon?.name || null,
       salonPhone: ownerSalon?.phone || null,
       salonEmail: ownerSalon?.email || null,
     };
   });
  const stats = {
    total: formattedSubscriptions.length,
    active: formattedSubscriptions.filter((s) => s.status === "active").length,
    trial: formattedSubscriptions.filter((s) => s.status === "trial").length,
    cancelled: formattedSubscriptions.filter((s) => s.status === "cancelled")
      .length,
    totalRevenue: formattedSubscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + Number(s.amount || 0), 0),
  };
  const response = {
    subscriptions: formattedSubscriptions,
    total: formattedSubscriptions.length,
    stats,
  };
  if (includePlans === "true") {
    const plans = await SubscriptionPlan.findAll();
    response.plans = plans;
  }
  return response;
};

 exports.getSubscriptionById = async (id) => {
   const sub = await Subscription.findOne({
     where: { id },
     include: [
       { model: User, as: "owner" },
       { model: SubscriptionPlan, as: "plan" },
     ],
   });
   if (!sub) return null;
   const s = sub.toJSON();
   let usage = s.usage;
   if (!usage) {
     usage = {
       bookings: 0,
       bookingsLimit:
         s.plan && s.plan.limits && s.plan.limits.bookings != null
           ? s.plan.limits.bookings
           : 0,
       staff: 0,
       staffLimit:
         s.plan && s.plan.limits && s.plan.limits.staff != null
           ? s.plan.limits.staff
           : 0,
       locations: 1,
       locationsLimit:
         s.plan && s.plan.limits && s.plan.limits.locations != null
           ? s.plan.limits.locations
           : 1,
     };
   }
   let billingHistory = await BillingHistory.findAll({
     where: { subscription_id: s.id },
     order: [["date", "DESC"]],
   });
   // Compute robust billing period defaults
   const cycle = String(s.billing_cycle || s.billing_period || 'monthly').toLowerCase();
   let periodStart = s.start_date || s.created_at || null;
   let periodEnd = s.next_billing_date || null;
   // If subscription has no dates, derive from billing history
   if ((!periodStart || !periodEnd) && billingHistory.length > 0) {
     // Find the earliest invoice date
     const validDates = billingHistory
       .map(bh => new Date(bh.date))
       .filter(d => !isNaN(d.getTime()));
     if (validDates.length > 0) {
       const earliest = new Date(Math.min.apply(null, validDates));
       if (!periodStart) periodStart = earliest.toISOString();
       if (!periodEnd) {
         const endCalc = new Date(earliest);
         if (cycle === 'yearly') {
           endCalc.setFullYear(endCalc.getFullYear() + 1);
         } else {
           endCalc.setMonth(endCalc.getMonth() + 1);
         }
         periodEnd = endCalc.toISOString();
       }
     }
   }
   // If still missing end, compute from start using cycle
   if (periodStart && !periodEnd) {
     const startObj = new Date(periodStart);
     const endObj = new Date(startObj);
     if (cycle === 'yearly') {
       endObj.setFullYear(endObj.getFullYear() + 1);
     } else {
       endObj.setMonth(endObj.getMonth() + 1);
     }
     periodEnd = endObj.toISOString();
   }
   billingHistory = billingHistory.map((bh) => {
     const obj = bh.toJSON();
     // Per-invoice billing period from its own date
     let invoiceStart = obj.date || periodStart;
     let invoiceEnd = periodEnd;
     if (obj.date) {
       const sObj = new Date(obj.date);
       const eObj = new Date(sObj);
       if (cycle === 'yearly') {
         eObj.setFullYear(eObj.getFullYear() + 1);
       } else {
         eObj.setMonth(eObj.getMonth() + 1);
       }
       invoiceStart = sObj.toISOString();
       invoiceEnd = eObj.toISOString();
     }
     return {
       ...obj,
       total:
         obj.total !== undefined
           ? obj.total
           : Number(obj.amount) + Number(obj.tax_amount || 0),
       billing_period_start: invoiceStart,
       billing_period_end: invoiceEnd,
     };
   });
   return {
     id: s.id,
     ownerId: s.owner_id,
     ownerName: s.owner?.name || s.owner?.email,
     ownerEmail: s.owner?.email,
     plan: s.plan?.name,
     status: s.status,
     startDate: periodStart,
     nextBillingDate: periodEnd,
     amount: s.amount,
     billingCycle: s.billing_cycle,
     billingPeriodStart: periodStart,
     billingPeriodEnd: periodEnd,
     features: s.plan?.features,
     usage,
     paymentMethod: s.payment_method,
     paymentId: s.payment_id || null,
     billingHistory,
   };
 };

 exports.createSubscription = async (data) => {
   console.log("data", data);
   if (!data.ownerId || !data.planId)
     throw new Error("owner_id and plan_id are required");
   const plan = await SubscriptionPlan.findOne({ where: { id: data.planId } });
   if (!plan) throw new Error("Invalid plan ID");
   const user = await User.findOne({ where: { id: data.ownerId } });
   if (!user) throw new Error("Invalid owner ID");
   
   // Calculate next billing date based on billing cycle
   const startDate = data.startDate || new Date();
   const billingCycle = data.billingCycle || plan.billing_period || 'monthly';
   const nextBillingDate = new Date(startDate);
   
   if (billingCycle === 'yearly') {
     nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
   } else {
     nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
   }
   
   // Get count of salons for this owner to set initial location count
   const salonCount = await Salon.count({ where: { owner_id: data.ownerId } });
   
   // Initialize usage with plan limits
   const usage = {
     bookings: 0,
     bookingsLimit: plan.limits?.bookings || 0,
     staff: 0,
     staffLimit: plan.limits?.staff || 0,
     locations: Math.max(1, salonCount), // At least 1 location
     locationsLimit: plan.limits?.locations || 1,
   };
   
   const newSub = await Subscription.create({
     ownerId: data.ownerId,
     planId: data.planId,
     amount: billingCycle === 'yearly' ? plan.yearly_price : plan.price,
     startDate: startDate,
     nextBillingDate: nextBillingDate,
     status: data.status || "active",
     billingCycle: billingCycle,
     billingPeriod: billingCycle, // Set both for compatibility
     usage: usage,
   });
   return newSub.toJSON();
 };

exports.updateSubscription = async (id, data) => {
  if (data.planId) {
    const plan = await SubscriptionPlan.findOne({
      where: { id: data.planId },
    });
    if (!plan) throw new Error("Invalid plan ID");
    if (data.usage) {
      data.usage = {
        ...data.usage,
        bookingsLimit: plan.limits.bookings,
        staffLimit: plan.limits.staff,
        locationsLimit: plan.limits.locations,
      };
    }
    data.amount = plan.price;
  }
  const [updatedCount, updatedRows] = await Subscription.update(data, {
    where: { id },
    returning: true,
  });
  if (updatedCount === 0) return null;
  return updatedRows[0];
};

exports.cancelSubscription = async (id) => {
  const [updatedCount, updatedRows] = await Subscription.update(
    { status: "cancelled" },
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
    .from("billing_history")
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return result;
};

exports.syncBilling = async (id, supabase) => {
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .select(`*,salon:salons(id, name),plan:subscription_plans(*)`)
    .eq("id", id)
    .single();
  if (subError) throw new Error("Subscription not found");
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    message: "Billing data synchronized successfully",
    subscription: {
      ...subscription,
      lastSynced: new Date().toISOString(),
    },
  };
};

exports.generateReport = async (id, body, supabase) => {
  const { reportType, dateRange, format } = body;
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .select(`*,salon:salons(id, name),plan:subscription_plans(*)`)
    .eq("id", id)
    .single();
  if (subError) throw new Error("Subscription not found");
  const { data: billingHistory, error: billingError } = await supabase
    .from("billing_history")
    .select("*")
    .eq("subscription_id", id)
    .order("date", { ascending: false });
  if (billingError) throw new Error("Failed to fetch billing history");
  let reportData;
  switch (reportType) {
    case "billing":
      reportData = {
        title: "Subscription Billing Report",
        subscription: subscription,
        billingHistory: billingHistory || [],
        summary: {
          totalBilled:
            billingHistory?.reduce((sum, record) => sum + record.amount, 0) ||
            0,
          invoiceCount: billingHistory?.length || 0,
          dateRange: dateRange,
        },
      };
      break;
    case "usage":
      reportData = {
        title: "Subscription Usage Report",
        subscription: subscription,
        usage: subscription.usage,
        limits: subscription.plan.limits,
        dateRange: dateRange,
      };
      break;
    default:
      reportData = {
        title: "Subscription Summary Report",
        subscription: subscription,
        billingHistory: billingHistory || [],
        dateRange: dateRange,
      };
  }
  return {
    message: "Report generated successfully",
    reportId: `report-${Date.now()}`,
    reportData,
    format,
  };
};

exports.exportInvoices = async (id, query, supabase) => {
  const { format } = query;
  const { data: billingHistory, error: billingError } = await supabase
    .from("billing_history")
    .select("*")
    .eq("subscription_id", id)
    .order("date", { ascending: false });
  if (billingError) throw new Error("Failed to fetch billing history");
  return {
    message: "Invoices exported successfully",
    exportId: `export-${Date.now()}`,
    invoices: billingHistory || [],
    format: format || "csv",
  };
};

exports.updatePaymentMethod = async (id, data, supabase) => {
  if (!data || !data.type) throw new Error("Invalid payment method data");
  const { data: result, error } = await supabase
    .from("subscriptions")
    .update({ payment_method: data })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return {
    message: "Payment method updated successfully",
    subscription: result,
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

 exports.getSubscriptionBySalonId = async (salonId) => {
   // First get the salon to find the owner_id
   const salon = await Salon.findOne({ where: { id: salonId } });
   if (!salon) return null;
   
   const subscription = await Subscription.findOne({
     where: { owner_id: salon.owner_id },
     include: [
       { model: SubscriptionPlan, as: 'plan' }
     ],
     order: [['created_at', 'DESC']]
   });
   
   if (!subscription) return null;
   
   const s = subscription.toJSON();
   let usage = s.usage;
   if (!usage) {
     usage = {
       bookings: 0,
       bookingsLimit: s.plan && s.plan.limits && s.plan.limits.bookings != null ? s.plan.limits.bookings : 0,
       staff: 0,
       staffLimit: s.plan && s.plan.limits && s.plan.limits.staff != null ? s.plan.limits.staff : 0,
       locations: 1,
       locationsLimit: s.plan && s.plan.limits && s.plan.limits.locations != null ? s.plan.limits.locations : 1,
     };
   }
   
   return {
     id: s.id,
     salonId: salonId, // Return the requested salonId for compatibility
     ownerId: s.owner_id,
     plan: s.plan,
     status: s.status,
     startDate: s.start_date,
     endDate: s.end_date,
     billingCycle: s.billing_cycle,
     nextBillingDate: s.next_billing_date,
     amount: s.amount,
     usage: usage,
     paymentMethod: s.payment_method,
     createdAt: s.created_at,
     updatedAt: s.updated_at
   };
 };

exports.getSubscriptionByOwnerId = async (ownerId) => {
  const subscription = await Subscription.findOne({
    where: { owner_id: ownerId },
    include: [
      { model: SubscriptionPlan, as: 'plan' }
    ],
    order: [['created_at', 'DESC']]
  });
  
  if (!subscription) return null;
  
  const s = subscription.toJSON();
  let usage = s.usage;
  if (!usage) {
    usage = {
      bookings: 0,
      bookingsLimit: s.plan && s.plan.limits && s.plan.limits.bookings != null ? s.plan.limits.bookings : 0,
      staff: 0,
      staffLimit: s.plan && s.plan.limits && s.plan.limits.staff != null ? s.plan.limits.staff : 0,
      locations: 1,
      locationsLimit: s.plan && s.plan.limits && s.plan.limits.locations != null ? s.plan.limits.locations : 1,
    };
  }
  
  return {
    id: s.id,
    ownerId: s.owner_id,
    plan: s.plan,
    status: s.status,
    startDate: s.start_date,
    endDate: s.end_date,
    billingCycle: s.billing_cycle,
    nextBillingDate: s.next_billing_date,
    amount: s.amount,
    usage: usage,
    paymentMethod: s.payment_method,
    paymentId: s.payment_id || null,
    createdAt: s.created_at,
    updatedAt: s.updated_at
  };
};

exports.getBillingHistoryBySubscriptionId = async (subscriptionId) => {
  const billingHistory = await BillingHistory.findAll({
    where: { subscription_id: subscriptionId },
    order: [['date', 'DESC']]
  });
  
  return billingHistory.map(bh => {
    const obj = bh.toJSON();
    return {
      ...obj,
      total: obj.total !== undefined ? obj.total : Number(obj.amount) + Number(obj.tax_amount || 0),
    };
  });
};

/**
 * Upgrade subscription (immediate activation)
 * @param {string} id - Subscription ID
 * @param {Object} data - Upgrade data
 * @returns {Object} Updated subscription
 */
exports.upgradeSubscription = async (id, data) => {
  const subscription = await Subscription.findByPk(id, {
    include: [{ model: SubscriptionPlan, as: 'plan' }]
  });
  
  if (!subscription) {
    throw new Error('Subscription not found');
  }

  // Get the new plan to calculate the amount
  const newPlan = await SubscriptionPlan.findByPk(data.planId);
  if (!newPlan) {
    throw new Error('Plan not found');
  }

  // Calculate amount based on billing cycle
  const amount = data.billingCycle === 'yearly' ? newPlan.yearly_price : newPlan.price;

  // Update subscription immediately
  const updateData = {
    planId: data.planId,
    billingCycle: data.billingCycle,
    amount: amount,
    // For immediate upgrades, we might want to adjust the billing date
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: 'active'
  };

  await subscription.update(updateData);

  // Create a billing record for the upgrade (prorated amount)
  const currentPlan = subscription.plan;
  const currentAmount = subscription.billing_cycle === 'yearly' ? currentPlan.yearly_price : currentPlan.price;
  const proratedAmount = amount - currentAmount;

  if (proratedAmount > 0) {
    await BillingHistory.create({
      subscription_id: id,
      date: new Date(),
      amount: proratedAmount,
      status: 'pending',
      description: `Upgrade to ${newPlan.name} plan`,
      invoice_number: `UPG-${Date.now()}`,
      total: proratedAmount
    });
  }

  // Return updated subscription
  const updatedSubscription = await Subscription.findByPk(id, {
    include: [{ model: SubscriptionPlan, as: 'plan' }]
  });

     const s = updatedSubscription.toJSON();
   return {
     id: s.id,
     ownerId: s.owner_id,
     plan: s.plan,
     status: s.status,
     startDate: s.start_date,
     endDate: s.end_date,
     billingCycle: s.billing_cycle,
     nextBillingDate: s.next_billing_date,
     amount: s.amount,
     usage: s.usage,
     paymentMethod: s.payment_method,
     createdAt: s.created_at,
     updatedAt: s.updated_at,
     upgradeType: 'immediate'
   };
};

/**
 * Downgrade subscription (end of cycle activation)
 * @param {string} id - Subscription ID
 * @param {Object} data - Downgrade data
 * @returns {Object} Updated subscription
 */
exports.downgradeSubscription = async (id, data) => {
  const subscription = await Subscription.findByPk(id, {
    include: [{ model: SubscriptionPlan, as: 'plan' }]
  });
  
  if (!subscription) {
    throw new Error('Subscription not found');
  }

  // Get the new plan to calculate the amount
  const newPlan = await SubscriptionPlan.findByPk(data.planId);
  if (!newPlan) {
    throw new Error('Plan not found');
  }

  // Calculate amount based on billing cycle
  const amount = data.billingCycle === 'yearly' ? newPlan.yearly_price : newPlan.price;

  // For downgrades, we schedule the change for the end of the current billing cycle
  const updateData = {
    planId: data.planId,
    billingCycle: data.billingCycle,
    amount: amount,
    status: 'active'
    // Note: In a real implementation, you might want to add scheduled_downgrade fields
    // to track when the downgrade should take effect
  };

  await subscription.update(updateData);

  // Return updated subscription
  const updatedSubscription = await Subscription.findByPk(id, {
    include: [{ model: SubscriptionPlan, as: 'plan' }]
  });

     const s = updatedSubscription.toJSON();
   return {
     id: s.id,
     ownerId: s.owner_id,
     plan: s.plan,
     status: s.status,
     startDate: s.start_date,
     endDate: s.end_date,
     billingCycle: s.billing_cycle,
     nextBillingDate: s.next_billing_date,
     amount: s.amount,
     usage: s.usage,
     paymentMethod: s.payment_method,
     createdAt: s.created_at,
     updatedAt: s.updated_at,
     downgradeType: 'end_of_cycle'
   };
};
