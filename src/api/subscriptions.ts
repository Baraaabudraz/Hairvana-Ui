import { supabase } from '@/lib/supabase';

export async function fetchSubscriptions(params: { 
  status?: string; 
  salonId?: string; 
  ownerId?: string; 
  search?: string;
  includePlans?: boolean;
} = {}) {
  try {
    let query = supabase
      .from('subscriptions')
      .select(`
        *,
        salon:salons(id, name, location, owner_id, owner_name, owner_email),
        plan:subscription_plans(*)
      `, { count: 'exact' });
    
    if (params.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }
    
    if (params.salonId) {
      query = query.eq('salon_id', params.salonId);
    }
    
    if (params.ownerId) {
      query = query.eq('salon.owner_id', params.ownerId);
    }
    
    if (params.search) {
      // This is a bit more complex as we need to search in related tables
      // In a real app, you might use a more sophisticated approach
      query = query.or(`salon.name.ilike.%${params.search}%,salon.owner_name.ilike.%${params.search}%`);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Fetch billing history for each subscription
    if (data && data.length > 0) {
      const subscriptionIds = data.map(sub => sub.id);
      
      const { data: billingData, error: billingError } = await supabase
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
        }, {} as Record<string, any[]>);
        
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
    
    const response: any = {
      subscriptions: formattedSubscriptions,
      total: count || 0,
      stats
    };
    
    // Include plans if requested
    if (params.includePlans) {
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*');
      
      if (!plansError) {
        response.plans = plansData;
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
}

export async function fetchSubscriptionById(id: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        salon:salons(id, name, location, owner_id, owner_name, owner_email),
        plan:subscription_plans(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Fetch billing history
    const { data: billingData, error: billingError } = await supabase
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
    
    return formattedSubscription;
  } catch (error) {
    console.error(`Error fetching subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function createSubscription(subscriptionData: any) {
  try {
    // First, get the plan details
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', subscriptionData.plan.toLowerCase())
      .single();
    
    if (planError) throw planError;
    
    // Calculate next billing date
    const startDate = new Date(subscriptionData.startDate);
    const nextBillingDate = new Date(startDate);
    
    if (subscriptionData.billingCycle === 'monthly') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }
    
    // Prepare subscription data
    const newSubscription = {
      salon_id: subscriptionData.salonId,
      plan_id: planData.id,
      status: subscriptionData.trialDays > 0 ? 'trial' : 'active',
      start_date: startDate.toISOString(),
      next_billing_date: nextBillingDate.toISOString(),
      amount: subscriptionData.billingCycle === 'monthly' ? planData.price : planData.yearly_price,
      billing_cycle: subscriptionData.billingCycle,
      usage: {
        bookings: 0,
        bookingsLimit: planData.limits.bookings,
        staff: 0,
        staffLimit: planData.limits.staff,
        locations: 0,
        locationsLimit: planData.limits.locations
      },
      payment_method: {
        type: 'card',
        last4: subscriptionData.paymentMethod.cardNumber.slice(-4),
        brand: 'Visa', // In a real app, you'd detect this from the card number
        expiryMonth: subscriptionData.paymentMethod.expiryMonth,
        expiryYear: subscriptionData.paymentMethod.expiryYear
      }
    };
    
    // Create the subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(newSubscription)
      .select()
      .single();
    
    if (error) throw error;
    
    // If not a trial, create the first billing record
    if (subscriptionData.trialDays === 0) {
      const billingRecord = {
        subscription_id: data.id,
        date: new Date().toISOString(),
        amount: newSubscription.amount,
        status: 'paid',
        description: `${planData.name} Plan - ${subscriptionData.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
        invoice_number: `INV-${Date.now()}`,
        tax_amount: newSubscription.amount * 0.08, // Assuming 8% tax
        subtotal: newSubscription.amount * 0.92
      };
      
      const { error: billingError } = await supabase
        .from('billing_history')
        .insert(billingRecord);
      
      if (billingError) console.error('Error creating billing record:', billingError);
    }
    
    return data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function updateSubscription(id: string, subscriptionData: any) {
  try {
    // If changing plan, get the new plan details
    if (subscriptionData.plan) {
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', subscriptionData.plan.toLowerCase())
        .single();
      
      if (planError) throw planError;
      
      // Update with new plan limits
      subscriptionData.plan_id = planData.id;
      subscriptionData.usage = {
        ...subscriptionData.usage,
        bookingsLimit: planData.limits.bookings,
        staffLimit: planData.limits.staff,
        locationsLimit: planData.limits.locations
      };
    }
    
    const { data, error } = await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error updating subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function cancelSubscription(id: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error cancelling subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function fetchSubscriptionPlans() {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
}

export async function createBillingRecord(billingData: any) {
  try {
    const { data, error } = await supabase
      .from('billing_history')
      .insert(billingData)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating billing record:', error);
    throw error;
  }
}