import { apiFetch } from '@/lib/api';

export async function fetchSalons(params: { status?: string; search?: string; ownerId?: string } = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.ownerId) queryParams.append('ownerId', params.ownerId);
    
    return await apiFetch(`/api/salons?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error fetching salons:', error);
    throw error;
  }
}

export async function fetchSalonById(id: string) {
  try {
    return await apiFetch(`/api/salons/${id}`);
  } catch (error) {
    console.error(`Error fetching salon with ID ${id}:`, error);
    throw error;
  }
}

export async function createSalon(salonData: any) {
  try {
    return await apiFetch('/api/salons', {
      method: 'POST',
      body: JSON.stringify(salonData),
    });
  } catch (error) {
    console.error('Error creating salon:', error);
    throw error;
  }
}

export async function updateSalon(id: string, salonData: any) {
  try {
    return await apiFetch(`/api/salons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(salonData),
    });
  } catch (error) {
    console.error(`Error updating salon with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteSalon(id: string) {
  try {
    return await apiFetch(`/api/salons/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error deleting salon with ID ${id}:`, error);
    throw error;
  }
}

export async function fetchSalonServices(salonId: string) {
  try {
    return await apiFetch(`/api/salons/${salonId}/services`);
  } catch (error) {
    console.error(`Error fetching services for salon with ID ${salonId}:`, error);
    throw error;
  }
}

export async function fetchSalonStaff(salonId: string) {
  try {
    return await apiFetch(`/api/salons/${salonId}/staff`);
  } catch (error) {
    console.error(`Error fetching staff for salon with ID ${salonId}:`, error);
    throw error;
  }
}

export async function fetchSalonAppointments(salonId: string, params: { status?: string; from?: string; to?: string } = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    
    return await apiFetch(`/api/salons/${salonId}/appointments?${queryParams.toString()}`);
  } catch (error) {
    console.error(`Error fetching appointments for salon with ID ${salonId}:`, error);
    throw error;
  }
}

export async function updateSalonStatus(id: string, status: 'active' | 'pending' | 'suspended') {
  try {
    return await apiFetch(`/api/salons/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.error(`Error updating status for salon with ID ${id}:`, error);
    throw error;
  }
}