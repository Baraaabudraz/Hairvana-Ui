import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get user by email
export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
  
  return data;
}

// Helper function to get salon by ID
export async function getSalonById(id: string) {
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching salon by ID:', error);
    return null;
  }
  
  return data;
}

// Helper function to get salons by owner ID
export async function getSalonsByOwnerId(ownerId: string) {
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .eq('owner_id', ownerId);
  
  if (error) {
    console.error('Error fetching salons by owner ID:', error);
    return [];
  }
  
  return data;
}

// Helper function to get subscription by salon ID
export async function getSubscriptionBySalonId(salonId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('salon_id', salonId)
    .single();
  
  if (error) {
    console.error('Error fetching subscription by salon ID:', error);
    return null;
  }
  
  return data;
}