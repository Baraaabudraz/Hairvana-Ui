import { apiFetch } from '@/lib/api';

export async function fetchServices(params: { salonId?: string; category?: string } = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.salonId) queryParams.append('salonId', params.salonId);
    if (params.category) queryParams.append('category', params.category);
    
    return await apiFetch(`/api/services?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
}

export async function fetchServiceById(id: string) {
  try {
    return await apiFetch(`/api/services/${id}`);
  } catch (error) {
    console.error(`Error fetching service with ID ${id}:`, error);
    throw error;
  }
}

export async function createService(serviceData: any) {
  try {
    return await apiFetch('/api/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
}

export async function updateService(id: string, serviceData: any) {
  try {
    return await apiFetch(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  } catch (error) {
    console.error(`Error updating service with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteService(id: string) {
  try {
    return await apiFetch(`/api/services/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error deleting service with ID ${id}:`, error);
    throw error;
  }
}

export async function fetchServiceCategories() {
  try {
    return await apiFetch('/api/services/categories');
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw error;
  }
}