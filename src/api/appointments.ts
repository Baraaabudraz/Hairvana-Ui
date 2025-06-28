import { apiFetch } from '@/lib/api';

export async function fetchAppointments(params: { 
  userId?: string; 
  salonId?: string; 
  status?: string;
  from?: string;
  to?: string;
} = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.salonId) queryParams.append('salonId', params.salonId);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    
    return await apiFetch(`/api/appointments?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}

export async function fetchAppointmentById(id: string) {
  try {
    return await apiFetch(`/api/appointments/${id}`);
  } catch (error) {
    console.error(`Error fetching appointment with ID ${id}:`, error);
    throw error;
  }
}

export async function createAppointment(appointmentData: any) {
  try {
    return await apiFetch('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

export async function updateAppointment(id: string, appointmentData: any) {
  try {
    return await apiFetch(`/api/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  } catch (error) {
    console.error(`Error updating appointment with ID ${id}:`, error);
    throw error;
  }
}

export async function cancelAppointment(id: string) {
  try {
    return await apiFetch(`/api/appointments/${id}/cancel`, {
      method: 'PATCH',
    });
  } catch (error) {
    console.error(`Error cancelling appointment with ID ${id}:`, error);
    throw error;
  }
}

export async function checkAvailability(params: {
  salonId: string;
  staffId: string;
  serviceId: string;
  date: string;
}) {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('salonId', params.salonId);
    queryParams.append('staffId', params.staffId);
    queryParams.append('serviceId', params.serviceId);
    queryParams.append('date', params.date);
    
    return await apiFetch(`/api/appointments/availability?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}