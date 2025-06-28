// Get all subscriptions
exports.getAllSubscriptions = async (req, res) => {
  try {
    const { status, salonId, ownerId, search, includePlans } = req.query;
    
    let query = req.supabase
      .from('subscriptions')
      .select(`
        *,
        salon:salons(id, name, location, owner_id, owner_name, owner_email),
        plan:subscription_plans(*)
      `, { count: 'exact' });
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (salonId) {
      query = query.eq('salon_id', salonId);
    }
    
    if (ownerId) {
      query = query.eq('salon.owner_id', ownerId);
    }
    
    if (search) {
      query = query.or(`salon.name.ilike.%${search}%,salon.owner_name.ilike.%${search}%`);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // Fetch billing history for each subscription
    if (data && data.length > 0) {
      const subscriptionIds = data.map(sub => sub.id);
      
      const { data: billingData, error: billingError } = await req.supabase
        .from('billing_history')
        .select('*')
        .in('subscription_id', subscriptionIds)
        .order('date', { ascending: false });
      
      if (!billingError && billingData) {
        // Group billing history by subscription_id
        const billingBySubscription = billingData.reduce((acc, bill) => {
          if (!acc[bill.subscription_id]) {
            acc[bill.subscription_id] = [];
          }
          acc[bill.subscription_id].push(bill);
          return acc;
        }, {});
        
        // Add billing history to each subscription
        data.forEach(subscription => {
          subscription.billingHistory = billingBySubscription[subscription.id] || [];
        });
      }
    }
    
    // Format subscriptions for the frontend
    const formattedSubscriptions = data?.map(sub => {
      return {
        id: sub.id,
        salonId: sub.salon_id,
        salonName: sub.salon.name,
        ownerId: sub.salon.owner_id,
        ownerName: sub.salon.owner_name,
        ownerEmail: sub.salon.owner_email,
        plan: sub.plan.name,
        status: sub.status,
        startDate: sub.start_date,
        nextBillingDate: sub.next_billing_date,
        amount: sub.amount,
        billingCycle: sub.billing_cycle,
        features: sub.plan.features,
        usage: sub.usage,
        paymentMethod: sub.payment_method,
        billingHistory: sub.billingHistory || []
      };
    }) || [];
    
    // Calculate stats
    const stats = {
      total: formattedSubscriptions.length,
      active: formattedSubscriptions.filter(s => s.status === 'active').length,
      trial: formattedSubscriptions.filter(s => s.status === 'trial').length,
      cancelled: formattedSubscriptions.filter(s => s.status === 'cancelled').length,
      totalRevenue: formattedSubscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.amount, 0),
    };
    
    const response = {
      subscriptions: formattedSubscriptions,
      total: count || 0,
      stats
    };
    
    // Include plans if requested
    if (includePlans === 'true') {
      const { data: plansData, error: plansError } = await req.supabase
        .from('subscription_plans')
        .select('*');
      
      if (!plansError) {
        response.plans = plansData;
      }
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
    
    const { data, error } = await req.supabase
      .from('subscriptions')
      .select(`
        *,
        salon:salons(id, name, location, owner_id, owner_name, owner_email),
        plan:subscription_plans(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Fetch billing history
    const { data: billingData, error: billingError } = await req.supabase
      .from('billing_history')
      .select('*')
      .eq('subscription_id', id)
      .order('date', { ascending: false });
    
    // Format subscription for the frontend
    const formattedSubscription = {
      id: data.id,
      salonId: data.salon_id,
      salonName: data.salon.name,
      ownerId: data.salon.owner_id,
      ownerName: data.salon.owner_name,
      ownerEmail: data.salon.owner_email,
      plan: data.plan.name,
      status: data.status,
      startDate: data.start_date,
      nextBillingDate: data.next_billing_date,
      amount: data.amount,
      billingCycle: data.billing_cycle,
      features: data.plan.features,
      usage: data.usage,
      paymentMethod: data.payment_method,
      billingHistory: billingError ? [] : billingData || []
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
    
    // First, get the plan details
    const { data: planData, error: planError } = await req.supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', subscriptionData.plan_id)
      .single();
    
    if (planError) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }
    
    // Create the subscription
    const { data, error } = await req.supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    // If not a trial, create the first billing record
    if (subscriptionData.status === 'active') {
      const billingRecord = {
        subscription_id: data.id,
        date: new Date().toISOString(),
        amount: subscriptionData.amount,
        status: 'paid',
        description: `${planData.name} Plan - ${subscriptionData.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
        invoice_number: `INV-${Date.now()}`,
        tax_amount: subscriptionData.amount * 0.08, // Assuming 8% tax
        subtotal: subscriptionData.amount * 0.92
      };
      
      const { error: billingError } = await req.supabase
        .from('billing_history')
        .insert(billingRecord);
      
      if (billingError) {
        console.error('Error creating billing record:', billingError);
      }
    }
    
    res.status(201).json(data);
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
      const { data: planData, error: planError } = await req.supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', subscriptionData.plan_id)
        .single();
      
      if (planError) {
        return res.status(400).json({ error: 'Invalid plan ID' });
      }
      
      // Update with new plan limits
      if (subscriptionData.usage) {
        subscriptionData.usage = {
          ...subscriptionData.usage,
          bookingsLimit: planData.limits.bookings,
          staffLimit: planData.limits.staff,
          locationsLimit: planData.limits.locations
        };
      }
    }
    
    const { data, error } = await req.supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel a subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await req.supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get subscription plans
exports.getSubscriptionPlans = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('subscription_plans')
      .select('*');
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data || []);
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