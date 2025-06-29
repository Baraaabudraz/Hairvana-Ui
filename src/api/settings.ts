import { apiFetch } from '@/lib/api';

export interface UserSettings {
  profile: {
    // Core user data (from users table)
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    role: string;
    status: string;
    join_date: string;
    last_login: string;
    // Settings data (from user_settings table)
    department?: string;
    timezone?: string;
    language?: string;
    bio?: string;
  };
  security: any;
  notifications: any;
  billing: any;
  backup: any;
}

export interface ProfileSettings {
  // Core user fields
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  // Settings fields
  department?: string;
  timezone?: string;
  language?: string;
  bio?: string;
}

export async function fetchUserSettings() {
  try {
    return await apiFetch('/api/settings');
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
}

export async function updateProfileSettings(profileData: any) {
  try {
    return await apiFetch('/api/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  } catch (error) {
    console.error('Error updating profile settings:', error);
    throw error;
  }
}

export async function updateSecuritySettings(securityData: any) {
  try {
    return await apiFetch('/api/settings/security', {
      method: 'PUT',
      body: JSON.stringify(securityData),
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    throw error;
  }
}

export async function updateNotificationPreferences(notificationData: any) {
  try {
    return await apiFetch('/api/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(notificationData),
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
}

export async function updateBillingSettings(billingData: any) {
  try {
    return await apiFetch('/api/settings/billing', {
      method: 'PUT',
      body: JSON.stringify(billingData),
    });
  } catch (error) {
    console.error('Error updating billing settings:', error);
    throw error;
  }
}

export async function updateBackupSettings(backupData: any) {
  try {
    return await apiFetch('/api/settings/backup', {
      method: 'PUT',
      body: JSON.stringify(backupData),
    });
  } catch (error) {
    console.error('Error updating backup settings:', error);
    throw error;
  }
}

export async function fetchPlatformSettings() {
  try {
    return await apiFetch('/api/settings/platform');
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    throw error;
  }
}

export async function updatePlatformSettings(platformData: any) {
  try {
    return await apiFetch('/api/settings/platform', {
      method: 'PUT',
      body: JSON.stringify(platformData),
    });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    throw error;
  }
}

export async function fetchIntegrationSettings() {
  try {
    return await apiFetch('/api/settings/integrations');
  } catch (error) {
    console.error('Error fetching integration settings:', error);
    throw error;
  }
}

export async function updateIntegrationSettings(integrationData: any) {
  try {
    return await apiFetch('/api/settings/integrations', {
      method: 'PUT',
      body: JSON.stringify(integrationData),
    });
  } catch (error) {
    console.error('Error updating integration settings:', error);
    throw error;
  }
}