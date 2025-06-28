import { apiFetch } from '@/lib/api';

export async function loginUser(email: string, password: string) {
  try {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store token in localStorage for subsequent requests
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function registerUser(userData: {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'salon';
  phone?: string;
}) {
  try {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store token in localStorage if provided
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await apiFetch('/api/auth/logout', {
      method: 'POST',
    });
    
    // Remove token from localStorage
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    return await apiFetch('/api/auth/me');
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function updatePassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    return await apiFetch('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
}