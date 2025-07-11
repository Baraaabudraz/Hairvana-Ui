import { apiFetch } from '@/lib/api';

export async function fetchUsers(params: { role?: string; status?: string; search?: string } = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.role && params.role !== 'all') {
      queryParams.append('role', params.role);
    }
    
    if (params.status && params.status !== 'all') {
      queryParams.append('status', params.status);
    }
    
    if (params.search) {
      queryParams.append('search', params.search);
    }
    
    return await apiFetch(`/users?${queryParams.toString()}`);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function fetchUserById(id: string) {
  try {
    return await apiFetch(`/users/${id}`);
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
}

export async function createUser(userData: any) {
  try {
    return await apiFetch('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(id: string, userData: any) {
  try {
    const response = await apiFetch(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response;
  } catch (error: any) {
    // If the error is a 422 Unprocessable Entity, show validation messages
    if (error.response && error.response.status === 422) {
      const errorData = await error.response.json();
      let message = errorData.message || 'Validation error';
      if (errorData.errors && Array.isArray(errorData.errors)) {
        message += '\n' + errorData.errors.map((e: any) => `${e.path}: ${e.message}`).join('\n');
      }
      throw new Error(message);
    }
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    return await apiFetch(`/users/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw error;
  }
}

export async function updateUserStatus(id: string, status: 'active' | 'pending' | 'suspended') {
  try {
    return await apiFetch(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.error(`Error updating status for user with ID ${id}:`, error);
    throw error;
  }
}