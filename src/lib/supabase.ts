import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations

// Users
export async function fetchUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*, salon_owners(*), customers(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function fetchUsers(params: { role?: string; status?: string; search?: string } = {}) {
  let query = supabase
    .from('users')
    .select('*, salon_owners(*), customers(*)');
  
  if (params.role && params.role !== 'all') {
    if (params.role === 'admin') {
      query = query.in('role', ['admin', 'super_admin']);
    } else {
      query = query.eq('role', params.role);
    }
  }
  
  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }
  
  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  
  // For salon owners, fetch their salons
  if (data) {
    const salonOwnerIds = data
      .filter(user => user.role === 'salon')
      .map(user => user.id);
    
    if (salonOwnerIds.length > 0) {
      const { data: salonsData, error: salonsError } = await supabase
        .from('salons')
        .select('*')
        .in('owner_id', salonOwnerIds);
      
      if (!salonsError && salonsData) {
        // Group salons by owner_id
        const salonsByOwner = salonsData.reduce((acc, salon) => {
          if (!acc[salon.owner_id]) {
            acc[salon.owner_id] = [];
          }
          acc[salon.owner_id].push(salon);
          return acc;
        }, {} as Record<string, any[]>);
        
        // Add salons to each salon owner
        data.forEach(user => {
          if (user.role === 'salon' && salonsByOwner[user.id]) {
            user.salons = salonsByOwner[user.id];
          }
        });
      }
    }
  }
  
  return data || [];
}

export async function createUser(userData: any) {
  // First create the user in auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
        role: userData.role
      }
    }
  });
  
  if (authError) throw authError;
  
  if (!authData.user) {
    throw new Error('Failed to create user in auth');
  }
  
  // Then create the user in the users table
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      status: 'active',
      avatar: userData.avatar,
      permissions: userData.permissions,
      password_hash: 'placeholder' // In a real app, you'd hash the password
    })
    .select()
    .single();
  
  if (error) {
    // If there's an error, clean up the auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw error;
  }
  
  // Create role-specific records
  if (userData.role === 'salon') {
    const { error: ownerError } = await supabase
      .from('salon_owners')
      .insert({
        user_id: authData.user.id,
        total_salons: 0,
        total_revenue: 0,
        total_bookings: 0
      });
    
    if (ownerError) throw ownerError;
    
    // If salon data is provided, create a salon
    if (userData.salonName) {
      const { error: salonError } = await supabase
        .from('salons')
        .insert({
          name: userData.salonName,
          email: userData.email,
          phone: userData.phone,
          address: userData.salonAddress,
          owner_id: authData.user.id,
          owner_name: userData.name,
          owner_email: userData.email,
          business_license: userData.businessLicense,
          status: 'pending'
        });
      
      if (salonError) throw salonError;
    }
  } else if (userData.role === 'user') {
    const { error: customerError } = await supabase
      .from('customers')
      .insert({
        user_id: authData.user.id,
        total_spent: 0,
        total_bookings: 0,
        favorite_services: []
      });
    
    if (customerError) throw customerError;
  }
  
  return data;
}

export async function updateUser(id: string, userData: any) {
  const { data, error } = await supabase
    .from('users')
    .update(userData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteUser(id: string) {
  // In a real app, you'd use Supabase admin functions to delete the auth user
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return { success: true };
}

// Salons
export async function fetchSalons(params: { status?: string; search?: string; ownerId?: string } = {}) {
  let query = supabase
    .from('salons')
    .select('*');
  
  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }
  
  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,location.ilike.%${params.search}%,owner_name.ilike.%${params.search}%`);
  }
  
  if (params.ownerId) {
    query = query.eq('owner_id', params.ownerId);
  }
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  return { salons: data || [], total: count || 0 };
}

export async function fetchSalonById(id: string) {
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return data;
}

export async function createSalon(salonData: any) {
  const { data, error } = await supabase
    .from('salons')
    .insert(salonData)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
}

export async function updateSalon(id: string, salonData: any) {
  const { data, error } = await supabase
    .from('salons')
    .update(salonData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
}

export async function deleteSalon(id: string) {
  const { error } = await supabase
    .from('salons')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  
  return { success: true };
}

// Subscriptions
export async function fetchSubscriptions(params: { status?: string; salonId?: string; ownerId?: string; search?: string } = {}) {
  let query = supabase
    .from('subscriptions')
    .select(`
      *,
      salon:salons(*),
      plan:subscription_plans(*)
    `);
  
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
      .in('subscription_id', subscriptionIds);
    
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
  
  // Calculate stats
  const stats = {
    total: data?.length || 0,
    active: data?.filter(s => s.status === 'active').length || 0,
    trial: data?.filter(s => s.status === 'trial').length || 0,
    cancelled: data?.filter(s => s.status === 'cancelled').length || 0,
    totalRevenue: data?.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0) || 0,
  };
  
  return { 
    subscriptions: data || [], 
    total: count || 0,
    stats
  };
}

export async function fetchSubscriptionById(id: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      salon:salons(*),
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
  
  if (!billingError) {
    data.billingHistory = billingData || [];
  }
  
  return data;
}

export async function createSubscription(subscriptionData: any) {
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
}

export async function updateSubscription(id: string, subscriptionData: any) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(subscriptionData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
}

export async function cancelSubscription(id: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
}

// Services
export async function fetchServices(params: { salonId?: string; category?: string } = {}) {
  let query = supabase
    .from('services')
    .select('*');
  
  if (params.salonId) {
    query = query.eq('salon_id', params.salonId);
  }
  
  if (params.category) {
    query = query.eq('category', params.category);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return data || [];
}

export async function createService(serviceData: any) {
  const { data, error } = await supabase
    .from('services')
    .insert(serviceData)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
}

// Staff
export async function fetchStaff(params: { salonId?: string; serviceId?: string } = {}) {
  let query = supabase
    .from('staff')
    .select('*');
  
  if (params.salonId) {
    query = query.eq('salon_id', params.salonId);
  }
  
  if (params.serviceId) {
    query = query.contains('services', [params.serviceId]);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return data || [];
}

export async function createStaff(staffData: any) {
  const { data, error } = await supabase
    .from('staff')
    .insert(staffData)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
}

// Appointments
export async function fetchAppointments(params: { 
  userId?: string; 
  salonId?: string; 
  status?: string;
  from?: string;
  to?: string;
} = {}) {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      salon:salons(id, name, location, images),
      service:services(id, name, price, duration),
      staff:staff(id, name, avatar)
    `);
  
  if (params.userId) {
    query = query.eq('user_id', params.userId);
  }
  
  if (params.salonId) {
    query = query.eq('salon_id', params.salonId);
  }
  
  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }
  
  if (params.from) {
    query = query.gte('date', params.from);
  }
  
  if (params.to) {
    query = query.lte('date', params.to);
  }
  
  // Order by date
  query = query.order('date', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return data || [];
}

export async function createAppointment(appointmentData: any) {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
}

export async function updateAppointment(id: string, appointmentData: any) {
  const { data, error } = await supabase
    .from('appointments')
    .update(appointmentData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
}

export async function cancelAppointment(id: string) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
}

// Analytics
export async function fetchAnalytics(period: string = '30d') {
  // In a real app, you'd query aggregated data from your database
  // For this demo, we'll return mock data
  
  // You could implement actual queries like:
  /*
  const { data: revenueData, error: revenueError } = await supabase
    .from('billing_history')
    .select('date, amount')
    .gte('date', getStartDateForPeriod(period))
    .order('date', { ascending: true });
  
  const { data: bookingsData, error: bookingsError } = await supabase
    .from('appointments')
    .select('date, status')
    .gte('date', getStartDateForPeriod(period))
    .order('date', { ascending: true });
  
  // Then process this data to create the analytics object
  */
  
  // For now, return mock data
  return {
    overview: {
      totalSalons: 1247,
      activeSalons: 1156,
      totalUsers: 45231,
      activeUsers: 38942,
      totalBookings: 8942,
      completedBookings: 8234,
      totalRevenue: 127450,
      monthlyGrowth: 23,
    },
    revenue: {
      current: 127450,
      previous: 103620,
      growth: 23,
      data: [
        { month: 'Jan', revenue: 65000, subscriptions: 45000, commissions: 20000 },
        { month: 'Feb', revenue: 72000, subscriptions: 52000, commissions: 20000 },
        { month: 'Mar', revenue: 68000, subscriptions: 48000, commissions: 20000 },
        { month: 'Apr', revenue: 85000, subscriptions: 62000, commissions: 23000 },
        { month: 'May', revenue: 92000, subscriptions: 67000, commissions: 25000 },
        { month: 'Jun', revenue: 127450, subscriptions: 89450, commissions: 38000 },
      ],
    },
    // ... other analytics data
  };
}

// Helper function to get start date for a period
function getStartDateForPeriod(period: string): string {
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case '7d':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case '30d':
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
    case '90d':
      startDate = new Date(now.setDate(now.getDate() - 90));
      break;
    case '1y':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 30));
  }
  
  return startDate.toISOString();
}