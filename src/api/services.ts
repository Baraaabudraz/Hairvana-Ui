import { supabase } from '@/lib/supabase';

export async function fetchServices(params: { salonId?: string; category?: string } = {}) {
  try {
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
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
}

export async function fetchServiceById(id: string) {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error fetching service with ID ${id}:`, error);
    throw error;
  }
}

export async function createService(serviceData: any) {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
}

export async function updateService(id: string, serviceData: any) {
  try {
    const { data, error } = await supabase
      .from('services')
      .update(serviceData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error updating service with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteService(id: string) {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting service with ID ${id}:`, error);
    throw error;
  }
}

export async function fetchServiceCategories() {
  try {
    // In a real app, you might have a categories table
    // For this demo, we'll return a predefined list
    return [
      'Haircut',
      'Hair Color',
      'Hair Styling',
      'Hair Treatment',
      'Beard Trim',
      'Eyebrow Threading',
      'Facial',
      'Manicure',
      'Pedicure',
      'Massage'
    ];
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw error;
  }
}