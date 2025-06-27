import { supabase } from '@/lib/supabase';

// In a real app, you'd have a notifications table in your database
// For this demo, we'll use mock data and functions

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

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Welcome to Hairvana Platform',
    message: 'Welcome to the Hairvana platform! We\'re excited to help you grow your salon business.',
    type: 'success',
    priority: 'medium',
    status: 'sent',
    targetAudience: 'salons',
    channels: ['email', 'in-app'],
    sentAt: '2024-06-15T10:30:00Z',
    createdAt: '2024-06-15T09:00:00Z',
    createdBy: 'Sarah Johnson',
    recipients: {
      total: 1247,
      sent: 1247,
      delivered: 1198,
      opened: 856,
      clicked: 234
    }
  },
  {
    id: '2',
    title: 'Subscription Renewal Reminder',
    message: 'Your Premium subscription expires in 3 days. Renew now to continue enjoying all features.',
    type: 'warning',
    priority: 'high',
    status: 'sent',
    targetAudience: 'salons',
    channels: ['email', 'push', 'in-app'],
    sentAt: '2024-06-14T16:45:00Z',
    createdAt: '2024-06-14T16:00:00Z',
    createdBy: 'John Smith',
    recipients: {
      total: 89,
      sent: 89,
      delivered: 87,
      opened: 72,
      clicked: 45
    }
  },
  {
    id: '3',
    title: 'New Features Available',
    message: 'We\'ve added exciting new analytics features to help you track your salon\'s performance better.',
    type: 'announcement',
    priority: 'medium',
    status: 'scheduled',
    targetAudience: 'all',
    channels: ['email', 'push'],
    scheduledAt: '2024-06-16T09:00:00Z',
    createdAt: '2024-06-15T14:20:00Z',
    createdBy: 'Mike Davis',
    recipients: {
      total: 45231,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0
    }
  },
  {
    id: '4',
    title: 'Special Promotion: 30% Off Premium',
    message: 'Limited time offer! Upgrade to Premium and save 30% on your first year.',
    type: 'promotion',
    priority: 'high',
    status: 'draft',
    targetAudience: 'salons',
    channels: ['email', 'push'],
    createdAt: '2024-06-15T11:30:00Z',
    createdBy: 'Lisa Thompson',
    recipients: {
      total: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0
    },
    customFilters: {
      subscriptionPlan: ['Basic', 'Standard']
    }
  },
  {
    id: '5',
    title: 'System Maintenance Notice',
    message: 'Scheduled maintenance on Sunday, June 16th from 2:00 AM to 4:00 AM EST.',
    type: 'warning',
    priority: 'urgent',
    status: 'failed',
    targetAudience: 'all',
    channels: ['email', 'in-app'],
    createdAt: '2024-06-15T08:15:00Z',
    createdBy: 'System Admin',
    recipients: {
      total: 45231,
      sent: 12456,
      delivered: 0,
      opened: 0,
      clicked: 0
    }
  }
];

// In a real app, you'd store and retrieve notifications from your database
let notifications = [...mockNotifications];

export async function fetchNotifications(params: { 
  type?: string; 
  status?: string; 
  search?: string;
} = {}) {
  try {
    // In a real app, you'd query your database
    // For this demo, we'll filter the mock data
    
    let filteredNotifications = [...notifications];
    
    if (params.type && params.type !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.type === params.type);
    }
    
    if (params.status && params.status !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.status === params.status);
    }
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredNotifications = filteredNotifications.filter(n => 
        n.title.toLowerCase().includes(searchLower) || 
        n.message.toLowerCase().includes(searchLower)
      );
    }
    
    return filteredNotifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

export async function createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>) {
  try {
    // In a real app, you'd insert into your database
    // For this demo, we'll add to our mock data
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      ...notificationData,
      createdAt: new Date().toISOString()
    };
    
    notifications.unshift(newNotification);
    
    // In a real app, you'd also trigger the actual notification sending
    // through email, push, etc. based on the channels
    
    return newNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function updateNotification(id: string, notificationData: Partial<Notification>) {
  try {
    // In a real app, you'd update your database
    // For this demo, we'll update our mock data
    
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) {
      throw new Error('Notification not found');
    }
    
    notifications[index] = {
      ...notifications[index],
      ...notificationData
    };
    
    return notifications[index];
  } catch (error) {
    console.error(`Error updating notification with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteNotification(id: string) {
  try {
    // In a real app, you'd delete from your database
    // For this demo, we'll remove from our mock data
    
    const initialLength = notifications.length;
    notifications = notifications.filter(n => n.id !== id);
    
    if (notifications.length === initialLength) {
      throw new Error('Notification not found');
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting notification with ID ${id}:`, error);
    throw error;
  }
}

export async function sendNotification(id: string) {
  try {
    // In a real app, you'd update the status and trigger sending
    // For this demo, we'll just update the status
    
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) {
      throw new Error('Notification not found');
    }
    
    notifications[index] = {
      ...notifications[index],
      status: 'sent',
      sentAt: new Date().toISOString()
    };
    
    return notifications[index];
  } catch (error) {
    console.error(`Error sending notification with ID ${id}:`, error);
    throw error;
  }
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

// Mock notification templates
const notificationTemplates: NotificationTemplate[] = [
  {
    id: 'welcome-salon',
    name: 'Welcome New Salon',
    description: 'Welcome message for newly registered salons',
    type: 'success',
    category: 'transactional',
    subject: 'Welcome to Hairvana! 🎉',
    content: 'Welcome {{salonName}} to the Hairvana platform! We\'re excited to help you grow your business.',
    channels: ['email', 'in-app'],
    variables: ['salonName', 'ownerName', 'setupLink'],
    popular: true
  },
  {
    id: 'subscription-reminder',
    name: 'Subscription Renewal Reminder',
    description: 'Remind salons about upcoming subscription renewal',
    type: 'warning',
    category: 'transactional',
    subject: 'Your subscription expires in 3 days',
    content: 'Hi {{ownerName}}, your {{planName}} subscription for {{salonName}} expires on {{expiryDate}}.',
    channels: ['email', 'push', 'in-app'],
    variables: ['ownerName', 'salonName', 'planName', 'expiryDate', 'renewLink'],
    popular: true
  },
  // ... other templates
];

export async function fetchNotificationTemplates() {
  try {
    // In a real app, you'd query your database
    // For this demo, we'll return the mock data
    return notificationTemplates;
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    throw error;
  }
}

export async function fetchNotificationTemplateById(id: string) {
  try {
    // In a real app, you'd query your database
    // For this demo, we'll find in the mock data
    const template = notificationTemplates.find(t => t.id === id);
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    return template;
  } catch (error) {
    console.error(`Error fetching notification template with ID ${id}:`, error);
    throw error;
  }
}