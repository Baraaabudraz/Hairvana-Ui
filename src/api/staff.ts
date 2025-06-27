import { supabase } from '@/lib/supabase';

export async function fetchStaff(params: { salonId?: string; serviceId?: string } = {}) {
  try {
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
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw error;
  }
}

export async function fetchStaffById(id: string) {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error fetching staff member with ID ${id}:`, error);
    throw error;
  }
}

export async function createStaff(staffData: any) {
  try {
    const { data, error } = await supabase
      .from('staff')
      .insert(staffData)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating staff member:', error);
    throw error;
  }
}

export async function updateStaff(id: string, staffData: any) {
  try {
    const { data, error } = await supabase
      .from('staff')
      .update(staffData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error updating staff member with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteStaff(id: string) {
  try {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting staff member with ID ${id}:`, error);
    throw error;
  }
}

export async function assignServiceToStaff(staffId: string, serviceId: string) {
  try {
    // First get current services
    const { data: staffData, error: fetchError } = await supabase
      .from('staff')
      .select('services')
      .eq('id', staffId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Add the new service if it's not already assigned
    const currentServices = staffData.services || [];
    if (!currentServices.includes(serviceId)) {
      const { error: updateError } = await supabase
        .from('staff')
        .update({ services: [...currentServices, serviceId] })
        .eq('id', staffId);
      
      if (updateError) throw updateError;
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error assigning service ${serviceId} to staff ${staffId}:`, error);
    throw error;
  }
}

export async function removeServiceFromStaff(staffId: string, serviceId: string) {
  try {
    // First get current services
    const { data: staffData, error: fetchError } = await supabase
      .from('staff')
      .select('services')
      .eq('id', staffId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Remove the service
    const currentServices = staffData.services || [];
    const updatedServices = currentServices.filter(id => id !== serviceId);
    
    const { error: updateError } = await supabase
      .from('staff')
      .update({ services: updatedServices })
      .eq('id', staffId);
    
    if (updateError) throw updateError;
    
    return { success: true };
  } catch (error) {
    console.error(`Error removing service ${serviceId} from staff ${staffId}:`, error);
    throw error;
  }
}