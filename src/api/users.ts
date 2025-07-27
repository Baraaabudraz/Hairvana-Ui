import { apiFetch } from "@/lib/api";
import { fetchRoles } from "@/api/roles";

export async function fetchUsers(
  params: {
    role_id?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  try {
    const queryParams = new URLSearchParams();

    if (params.role_id && params.role_id !== "all") {
      queryParams.append("role_id", params.role_id);
    }

    if (params.status && params.status !== "all") {
      queryParams.append("status", params.status);
    }

    if (params.search) {
      queryParams.append("search", params.search);
    }

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    return await apiFetch(`/users?${queryParams.toString()}`);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// Helper function to fetch users by role name
export async function fetchUsersByRole(
  roleName: string,
  params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  try {
    // First fetch roles to get the role ID
    const roles = await fetchRoles();
    const role = roles?.find((r: any) => r.name === roleName);
    
    if (!role) {
      throw new Error(`Role '${roleName}' not found`);
    }
    
    // Then fetch users with the role ID
    return await fetchUsers({ ...params, role_id: role.id });
  } catch (error) {
    console.error(`Error fetching users by role '${roleName}':`, error);
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
    return await apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function updateUser(id: string, userData: any) {
  try {
    let formData = new FormData();

    // If userData is already FormData, use it directly
    if (userData instanceof FormData) {
      formData = userData;
    } else {
      // Convert userData object to FormData
      Object.keys(userData).forEach((key) => {
        if (key === "avatar" && userData[key] instanceof File) {
          formData.append("avatar", userData[key]);
        } else if (userData[key] !== undefined && userData[key] !== null) {
          formData.append(key, userData[key].toString());
        }
      });
    }

    const response = await apiFetch(`/users/${id}`, {
      method: "PUT",
      body: formData,
      // Don't set Content-Type - browser will set it automatically with boundary
      headers: {},
    });
    return response;
  } catch (error: any) {
    // If the error is a 422 Unprocessable Entity, show validation messages
    if (error.response && error.response.status === 422) {
      const errorData = await error.response.json();
      let message = errorData.message || "Validation error";
      if (errorData.errors && Array.isArray(errorData.errors)) {
        message +=
          "\n" +
          errorData.errors
            .map((e: any) => `${e.path}: ${e.message}`)
            .join("\n");
      }
      throw new Error(message);
    }
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    return await apiFetch(`/users/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw error;
  }
}

export async function updateUserStatus(
  id: string,
  status: "active" | "pending" | "suspended"
) {
  try {
    return await apiFetch(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.error(`Error updating status for user with ID ${id}:`, error);
    throw error;
  }
}
