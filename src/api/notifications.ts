import { apiFetch } from '@/lib/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  targetAudience: 'all' | 'salons' | 'users' | 'admins' | 'custom';
  channels: ('email' | 'push' | 'in-app' | 'sms')[];
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  createdBy: string;
  recipients: {
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
  customFilters?: {
    userType?: string[];
    location?: string[];
    subscriptionPlan?: string[];
    registrationDate?: string;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'promotion';
  category: 'system' | 'marketing' | 'transactional' | 'operational';
  subject: string;
  content: string;
  channels: ('email' | 'push' | 'in-app' | 'sms')[];
  variables: string[];
  popular: boolean;
}

export async function fetchNotifications(params: { 
  type?: string; 
  status?: string; 
  search?: string;
} = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.type && params.type !== 'all') queryParams.append('type', params.type);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    
    return await apiFetch(`/api/notifications?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

export async function createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>) {
  try {
    return await apiFetch('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function deleteNotification(id: string) {
  try {
    return await apiFetch(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error deleting notification with ID ${id}:`, error);
    throw error;
  }
}

export async function sendNotification(id: string) {
  try {
    return await apiFetch(`/api/notifications/${id}/send`, {
      method: 'POST',
    });
  } catch (error) {
    console.error(`Error sending notification with ID ${id}:`, error);
    throw error;
  }
}

export async function fetchNotificationTemplates() {
  try {
    return await apiFetch('/api/notifications/templates');
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    throw error;
  }
}