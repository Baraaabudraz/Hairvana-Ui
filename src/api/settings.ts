import { supabase } from '@/lib/supabase';

export interface UserSettings {
  profile: any;
  security: any;
  notifications: any;
  billing: any;
  backup: any;
}

export async function fetchUserSettings() {
  try {
    const response = await fetch('/api/settings', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user settings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
}

export async function updateProfileSettings(profileData: any) {
  try {
    const response = await fetch('/api/settings/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile settings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating profile settings:', error);
    throw error;
  }
}

export async function updateSecuritySettings(securityData: any) {
  try {
    const response = await fetch('/api/settings/security', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(securityData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update security settings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating security settings:', error);
    throw error;
  }
}

export async function updateNotificationPreferences(notificationData: any) {
  try {
    const response = await fetch('/api/settings/notifications', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(notificationData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update notification preferences');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
}

export async function updateBillingSettings(billingData: any) {
  try {
    const response = await fetch('/api/settings/billing', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(billingData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update billing settings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating billing settings:', error);
    throw error;
  }
}

export async function updateBackupSettings(backupData: any) {
  try {
    const response = await fetch('/api/settings/backup', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(backupData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update backup settings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating backup settings:', error);
    throw error;
  }
}

export async function fetchPlatformSettings() {
  try {
    const response = await fetch('/api/settings/platform', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch platform settings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    throw error;
  }
}

export async function updatePlatformSettings(platformData: any) {
  try {
    const response = await fetch('/api/settings/platform', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(platformData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update platform settings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating platform settings:', error);
    throw error;
  }
}

export async function fetchIntegrationSettings() {
  try {
    const response = await fetch('/api/settings/integrations', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch integration settings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching integration settings:', error);
    throw error;
  }
}

export async function updateIntegrationSettings(integrationData: any) {
  try {
    const response = await fetch('/api/settings/integrations', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(integrationData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update integration settings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating integration settings:', error);
    throw error;
  }
}