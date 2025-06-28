import { supabase } from '@/lib/supabase';

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
    
    const response = await fetch(`/api/subscriptions?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch subscriptions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
}

export async function fetchSubscriptionById(id: string) {
  try {
    const response = await fetch(`/api/subscriptions/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch subscription');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function createSubscription(subscriptionData: any) {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(subscriptionData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create subscription');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function updateSubscription(id: string, subscriptionData: any) {
  try {
    const response = await fetch(`/api/subscriptions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(subscriptionData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update subscription');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function cancelSubscription(id: string) {
  try {
    const response = await fetch(`/api/subscriptions/${id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error cancelling subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function syncBilling(id: string) {
  try {
    const response = await fetch(`/api/subscriptions/${id}/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync billing data');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error syncing billing for subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function generateReport(id: string, reportData: any) {
  try {
    const response = await fetch(`/api/subscriptions/${id}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(reportData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate report');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error generating report for subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function exportInvoices(id: string, format: string = 'csv') {
  try {
    const response = await fetch(`/api/subscriptions/${id}/export?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to export invoices');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error exporting invoices for subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function updatePaymentMethod(id: string, paymentData: any) {
  try {
    const response = await fetch(`/api/subscriptions/${id}/payment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(paymentData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update payment method');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating payment method for subscription with ID ${id}:`, error);
    throw error;
  }
}

export async function fetchSubscriptionPlans() {
  try {
    const response = await fetch('/api/subscriptions/plans', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch subscription plans');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
}