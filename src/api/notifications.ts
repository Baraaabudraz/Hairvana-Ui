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
  page?: number;
  limit?: number;
} = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.type && params.type !== 'all') queryParams.append('type', params.type);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    return await apiFetch(`/notifications/admin?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

export async function createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>) {
  try {
    return await apiFetch('/notifications', {
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
    return await apiFetch(`/notifications/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error deleting notification with ID ${id}:`, error);
    throw error;
  }
}

export async function sendNotification(id: string) {
  try {
    return await apiFetch(`/notifications/${id}/send`, {
      method: 'POST',
    });
  } catch (error) {
    console.error(`Error sending notification with ID ${id}:`, error);
    throw error;
  }
}

export async function fetchNotificationTemplates() {
  try {
    return await apiFetch('/notifications/templates');
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    throw error;
  }
}

// User dashboard notifications (for header dropdown)
export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'promotion';
  priority?: 'low' | 'medium' | 'high' | 'urgent'; // Optional since column doesn't exist in DB
  is_read: boolean;
  created_at: string;
  updated_at: string;
  data?: any; // Optional since column doesn't exist in DB
}

export async function fetchUserNotifications(params: {
  limit?: number;
  unread_only?: boolean;
} = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.unread_only) queryParams.append('unread_only', 'true');
    
    return await apiFetch(`/notifications?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    return await apiFetch(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export async function markAllNotificationsAsRead() {
  try {
    return await apiFetch('/notifications/mark-all-read', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}