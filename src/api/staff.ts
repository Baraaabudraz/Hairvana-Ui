import { apiFetch } from '@/lib/api';

export async function fetchStaff(params: { salonId?: string; serviceId?: string } = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.salonId) queryParams.append('salonId', params.salonId);
    if (params.serviceId) queryParams.append('serviceId', params.serviceId);
    
    return await apiFetch(`/api/staff?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw error;
  }
}

export async function fetchStaffById(id: string) {
  try {
    return await apiFetch(`/api/staff/${id}`);
  } catch (error) {
    console.error(`Error fetching staff member with ID ${id}:`, error);
    throw error;
  }
}

export async function createStaff(staffData: any) {
  try {
    return await apiFetch('/api/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  } catch (error) {
    console.error('Error creating staff member:', error);
    throw error;
  }
}

export async function updateStaff(id: string, staffData: any) {
  try {
    return await apiFetch(`/api/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
  } catch (error) {
    console.error(`Error updating staff member with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteStaff(id: string) {
  try {
    return await apiFetch(`/api/staff/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error deleting staff member with ID ${id}:`, error);
    throw error;
  }
}

export async function assignServiceToStaff(staffId: string, serviceId: string) {
  try {
    return await apiFetch(`/api/staff/${staffId}/services`, {
      method: 'POST',
      body: JSON.stringify({ serviceId }),
    });
  } catch (error) {
    console.error(`Error assigning service ${serviceId} to staff ${staffId}:`, error);
    throw error;
  }
}

export async function removeServiceFromStaff(staffId: string, serviceId: string) {
  try {
    return await apiFetch(`/api/staff/${staffId}/services/${serviceId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error removing service ${serviceId} from staff ${staffId}:`, error);
    throw error;
  }
}