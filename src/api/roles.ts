import { apiFetch } from "@/lib/api";

export async function fetchRoles() {
  try {
    return await apiFetch("/roles/list");
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
}

export async function fetchRoleById(id: string) {
  try {
    return await apiFetch(`/roles/${id}`);
  } catch (error) {
    console.error(`Error fetching role with ID ${id}:`, error);
    throw error;
  }
}

export async function createRole(roleData: any) {
  try {
    return await apiFetch("/roles", {
      method: "POST",
      body: JSON.stringify(roleData),
    });
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
}

export async function updateRole(id: string, roleData: any) {
  try {
    return await apiFetch(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(roleData),
    });
  } catch (error) {
    console.error(`Error updating role with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteRole(id: string) {
  try {
    return await apiFetch(`/roles/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(`Error deleting role with ID ${id}:`, error);
    throw error;
  }
} 