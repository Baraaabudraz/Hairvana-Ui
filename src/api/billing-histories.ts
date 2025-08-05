import { apiFetch } from '@/lib/api';

export interface BillingHistoryParams {
  subscriptionId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CreateBillingHistoryData {
  subscription_id: string;
  date: string;
  amount: number;
  status: string;
  description: string;
  invoice_number?: string;
  tax_amount?: number;
  notes?: string;
}

export async function fetchBillingHistories(params: BillingHistoryParams = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.subscriptionId) {
      queryParams.append('subscriptionId', params.subscriptionId);
    }
    
    if (params.status) {
      queryParams.append('status', params.status);
    }
    
    if (params.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    
    if (params.endDate) {
      queryParams.append('endDate', params.endDate);
    }
    
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    return await apiFetch(`/billing-histories?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error fetching billing histories:', error);
    throw error;
  }
}

export async function fetchBillingHistoryById(id: string) {
  try {
    return await apiFetch(`/billing-histories/${id}`);
  } catch (error) {
    console.error(`Error fetching billing history with ID ${id}:`, error);
    throw error;
  }
}

export async function createBillingHistory(billingData: CreateBillingHistoryData) {
  try {
    return await apiFetch('/billing-histories', {
      method: 'POST',
      body: JSON.stringify(billingData),
    });
  } catch (error) {
    console.error('Error creating billing history:', error);
    throw error;
  }
}

export async function updateBillingHistory(id: string, billingData: Partial<CreateBillingHistoryData>) {
  try {
    return await apiFetch(`/billing-histories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(billingData),
    });
  } catch (error) {
    console.error(`Error updating billing history with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteBillingHistory(id: string) {
  try {
    return await apiFetch(`/billing-histories/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error deleting billing history with ID ${id}:`, error);
    throw error;
  }
}

export async function exportBillingHistories(params: BillingHistoryParams = {}, format: string = 'csv') {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.subscriptionId) {
      queryParams.append('subscriptionId', params.subscriptionId);
    }
    
    if (params.status) {
      queryParams.append('status', params.status);
    }
    
    if (params.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    
    if (params.endDate) {
      queryParams.append('endDate', params.endDate);
    }
    
    queryParams.append('format', format);
    
    return await apiFetch(`/billing-histories/export?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error exporting billing histories:', error);
    throw error;
  }
} 