import { supabase } from '@/lib/supabase';

export async function fetchSalons(params: { status?: string; search?: string; ownerId?: string } = {}) {
  try {
    let query = supabase
      .from('salons')
      .select('*', { count: 'exact' });
    
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
  } catch (error) {
    console.error('Error fetching salons:', error);
    throw error;
  }
}

export async function fetchSalonById(id: string) {
  try {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error fetching salon with ID ${id}:`, error);
    throw error;
  }
}

export async function createSalon(salonData: any) {
  try {
    const { data, error } = await supabase
      .from('salons')
      .insert(salonData)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating salon:', error);
    throw error;
  }
}

export async function updateSalon(id: string, salonData: any) {
  try {
    const { data, error } = await supabase
      .from('salons')
      .update(salonData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error updating salon with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteSalon(id: string) {
  try {
    const { error } = await supabase
      .from('salons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting salon with ID ${id}:`, error);
    throw error;
  }
}

export async function fetchSalonServices(salonId: string) {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching services for salon with ID ${salonId}:`, error);
    throw error;
  }
}

export async function fetchSalonStaff(salonId: string) {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('salon_id', salonId);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching staff for salon with ID ${salonId}:`, error);
    throw error;
  }
}

export async function fetchSalonAppointments(salonId: string, params: { status?: string; from?: string; to?: string } = {}) {
  try {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        user:users(id, name, email, phone, avatar),
        service:services(id, name, price, duration),
        staff:staff(id, name, avatar)
      `)
      .eq('salon_id', salonId);
    
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
  } catch (error) {
    console.error(`Error fetching appointments for salon with ID ${salonId}:`, error);
    throw error;
  }
}

export async function updateSalonStatus(id: string, status: 'active' | 'pending' | 'suspended') {
  try {
    const { data, error } = await supabase
      .from('salons')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error updating status for salon with ID ${id}:`, error);
    throw error;
  }
}