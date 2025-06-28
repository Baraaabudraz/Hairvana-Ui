import { apiFetch } from '@/lib/api';

export interface SubscriptionParams {
  status?: string;
  salonId?: string;
  ownerId?: string;
  search?: string;
  includePlans?: boolean;
}

export async function fetchSubscriptions(params: SubscriptionParams = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.status && params.status !== 'all') {
      queryParams.append('status', params.status);
    }
    
    if (params.salonId) {
      queryParams.append('salonId', params.salonId);
    }
    
    if (params.ownerId) {
      queryParams.append('ownerId', params.ownerId);
    }
    
    if (params.search) {
      queryParams.append('search', params.search);
    }
    
    if (params.includePlans) {
      queryParams.append('includePlans', 'true');
    }
    
    return await apiFetch(`/api/subscriptions?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
}

export async function fetchSubscriptionById(id: string) {
  try {
    return await apiFetch(`/api/subscriptions/${id}`);
  } catch (error) {
    console.error(`Error fetching subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function createSubscription(subscriptionData: any) {
  try {
    return await apiFetch('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function updateSubscription(id: string, subscriptionData: any) {
  try {
    return await apiFetch(`/api/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subscriptionData),
    });
  } catch (error) {
    console.error(`Error updating subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function cancelSubscription(id: string) {
  try {
    return await apiFetch(`/api/subscriptions/${id}/cancel`, {
      method: 'PATCH',
    });
  } catch (error) {
    console.error(`Error cancelling subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function syncBilling() {
  try {
    return await apiFetch('/api/subscriptions/sync', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error syncing billing data:', error);
    throw error;
  }
}

export async function generateReport(id: string, reportData: any) {
  try {
    return await apiFetch(`/api/subscriptions/${id}/report`, {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  } catch (error) {
    console.error(`Error generating report for subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function exportInvoices(id: string, format: string = 'csv') {
  try {
    return await apiFetch(`/api/subscriptions/${id}/export?format=${format}`);
  } catch (error) {
    console.error(`Error exporting invoices for subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function updatePaymentMethod(id: string, paymentData: any) {
  try {
    return await apiFetch(`/api/subscriptions/${id}/payment`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  } catch (error) {
    console.error(`Error updating payment method for subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function fetchSubscriptionPlans() {
  try {
    return await apiFetch('/api/subscriptions/plans');
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
}