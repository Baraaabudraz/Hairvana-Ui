import { apiFetch } from '@/lib/api';

export interface SubscriptionParams {
  status?: string;
  salonId?: string;
  ownerId?: string;
  search?: string;
  includePlans?: boolean;
  page?: number;
  limit?: number;
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
    
    return await apiFetch(`/subscriptions?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
}

export async function fetchSubscriptionById(id: string) {
  try {
    return await apiFetch(`/subscriptions/${id}`);
  } catch (error) {
    console.error(`Error fetching subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function createSubscription(subscriptionData: any) {
  try {
    return await apiFetch('/subscriptions', {
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
    return await apiFetch(`/subscriptions/${id}`, {
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
    return await apiFetch(`/subscriptions/${id}/cancel`, {
      method: 'PATCH',
    });
  } catch (error) {
    console.error(`Error cancelling subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function syncBilling() {
  try {
    return await apiFetch('/subscriptions/sync', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error syncing billing data:', error);
    throw error;
  }
}

export async function generateReport(id: string, reportData: any) {
  try {
    return await apiFetch(`/subscriptions/${id}/report`, {
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
    return await apiFetch(`/subscriptions/${id}/export?format=${format}`);
  } catch (error) {
    console.error(`Error exporting invoices for subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function updatePaymentMethod(id: string, paymentData: any) {
  try {
    return await apiFetch(`/subscriptions/${id}/payment`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  } catch (error) {
    console.error(`Error updating payment method for subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function fetchSubscriptionPlans(params: { page?: number; limit?: number; status?: string; search?: string } = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    return await apiFetch(`/subscriptions/plans?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
}

export async function fetchSubscriptionPlanById(id: string) {
  try {
    return await apiFetch(`/subscriptions/plans/${id}`);
  } catch (error) {
    console.error(`Error fetching subscription plan with ID ${id}:`, error);
    throw error;
  }
}

export async function createSubscriptionPlan(planData: any) {
  try {
    return await apiFetch('/subscriptions/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    throw error;
  }
}

export async function updateSubscriptionPlan(id: string, planData: any) {
  try {
    return await apiFetch(`/subscriptions/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  } catch (error) {
    console.error(`Error updating subscription plan with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteSubscriptionPlan(id: string) {
  try {
    return await apiFetch(`/subscriptions/plans/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error deleting subscription plan with ID ${id}:`, error);
    throw error;
  }
}