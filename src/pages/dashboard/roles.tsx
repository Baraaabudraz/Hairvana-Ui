import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";

const RESOURCES = [
  "users",
  "salons",
  "reports",
  "staff",
  "services",
  "appointments",
  "subscriptions",
  "notifications",
  "billing",
  "settings",
  "reviews",
  "analytics",
  "roles", // Added roles as a resource
];
const ACTIONS = ["view", "add", "edit", "delete"];

export default function RolesPermissionsMatrixPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissionsMap, setPermissionsMap] = useState<Record<string, any[]>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    color: "#7c3aed",
  });
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState({
    name: "",
    description: "",
    color: "#7c3aed",
  });
  const createRoleNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    const res = await apiFetch("/roles");
    setRoles(res);
    // Build a map: roleId -> permissions[]
    const map: Record<string, any[]> = {};
    res.forEach((role: any) => {
      map[role.id] = role.permissions;
    });
    setPermissionsMap(map);
    setLoading(false);
  };

  const handleToggle = (roleId: string, resource: string, action: string) => {
    setPermissionsMap((prev) => {
      const perms = prev[roleId] || [];
      const idx = perms.findIndex(
        (p: any) => p.resource === resource && p.action === action
      );
      let updated;
      if (idx > -1) {
        updated = [...perms];
        updated[idx] = { ...updated[idx], allowed: !updated[idx].allowed };
      } else {
        updated = [...perms, { resource, action, allowed: true }];
      }
      return { ...prev, [roleId]: updated };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    // For each role, update its permissions
    await Promise.all(
      roles.map((role) =>
        apiFetch(`/roles/${role.id}/permissions`, {
          method: "PUT",
          body: JSON.stringify({ permissions: permissionsMap[role.id] }),
        })
      )
    );
    await fetchRoles();
    setSaving(false);
    alert("Permissions updated!");
  };

  // --- CRUD for Roles ---
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.name.trim()) return;
    await apiFetch("/roles", {
      method: "POST",
      body: JSON.stringify(newRole),
    });
    setShowCreateModal(false);
    setNewRole({ name: "", description: "", color: "#7c3aed" });
    await fetchRoles();
  };

  const handleDeleteRole = async (roleId: string) => {
    await apiFetch(`/roles/${roleId}`, { method: "DELETE" });
    setDeletingRoleId(null);
    await fetchRoles();
  };

  const handleEditRole = (role: any) => {
    setEditingRoleId(role.id);
    setEditRole({
      name: role.name,
      description: role.description || "",
      color: role.color || "#7c3aed",
    });
  };

  const handleUpdateRole = async (roleId: string) => {
    await apiFetch(`/roles/${roleId}`, {
      method: "PUT",
      body: JSON.stringify(editRole),
    });
    setEditingRoleId(null);
    await fetchRoles();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Roles & Permissions
          </h1>
          <button
            className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 transition"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Role
          </button>
        </div>
        {/* Roles List (with edit/delete) */}
        <div className="mb-8 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-left">
                  Role Name
                </th>
                <th className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-left">
                  Description
                </th>
                <th className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="bg-white even:bg-gray-50">
                  <td className="px-4 py-2 border-b border-gray-100 font-medium text-gray-700">
                    {editingRoleId === role.id ? (
                      <>
                        <input
                          className="border rounded px-2 py-1 w-full mb-2"
                          value={editRole.name}
                          onChange={(e) =>
                            setEditRole({ ...editRole, name: e.target.value })
                          }
                        />
                        <input
                          type="color"
                          className="w-12 h-8 p-0 border-none bg-transparent cursor-pointer mb-2"
                          value={editRole.color}
                          onChange={(e) =>
                            setEditRole({ ...editRole, color: e.target.value })
                          }
                        />
                      </>
                    ) : (
                      <span
                        style={{
                          background: role.color,
                          color: "#fff",
                          borderRadius: 4,
                          padding: "2px 8px",
                          display: "inline-block",
                        }}
                      >
                        {role.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-100 text-gray-600">
                    {editingRoleId === role.id ? (
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={editRole.description}
                        onChange={(e) =>
                          setEditRole({
                            ...editRole,
                            description: e.target.value,
                          })
                        }
                      />
                    ) : (
                      role.description
                    )}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-100 text-center">
                    {editingRoleId === role.id ? (
                      <>
                        <button
                          className="text-green-600 hover:underline mr-2"
                          onClick={() => handleUpdateRole(role.id)}
                        >
                          Save
                        </button>
                        <button
                          className="text-gray-500 hover:underline"
                          onClick={() => setEditingRoleId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="text-blue-600 hover:underline mr-2"
                          onClick={() => handleEditRole(role)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => setDeletingRoleId(role.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Permissions Matrix */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-semibold px-4 py-3 border-b border-gray-200 text-left align-bottom sticky left-0 z-10">
                  Resource
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    colSpan={ACTIONS.length}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-semibold px-4 py-3 border-b border-gray-200 text-center"
                  >
                    {role.name}
                  </th>
                ))}
              </tr>
              <tr>
                <th className="bg-gray-50 px-4 py-2 border-b border-gray-200 sticky left-0 z-10"></th>
                {roles.map((role) =>
                  ACTIONS.map((action) => (
                    <th
                      key={role.id + "-" + action}
                      className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-normal text-gray-500 text-center"
                    >
                      {action}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {RESOURCES.map((resource, rIdx) => (
                <tr
                  key={resource}
                  className={rIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-2 border-b border-gray-100 font-medium text-gray-700 sticky left-0 z-10 bg-inherit">
                    {resource.charAt(0).toUpperCase() + resource.slice(1)}
                  </td>
                  {roles.map((role) =>
                    ACTIONS.map((action) => {
                      const perms = permissionsMap[role.id] || [];
                      const perm = perms.find(
                        (p: any) =>
                          p.resource === resource && p.action === action
                      );
                      return (
                        <td
                          key={role.id + "-" + resource + "-" + action}
                          className="px-4 py-2 border-b border-gray-100 text-center"
                        >
                          <input
                            type="checkbox"
                            checked={!!perm?.allowed}
                            onChange={() =>
                              handleToggle(role.id, resource, action)
                            }
                            className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-2 focus:ring-pink-400 transition duration-150"
                          />
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-8 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              "Save All"
            )}
          </button>
        </div>
        {loading && (
          <div className="flex justify-center items-center mt-4">
            <span className="text-gray-500">Loading...</span>
          </div>
        )}
      </div>
      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Create New Role</h2>
            <form onSubmit={handleCreateRole}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Role Name
                </label>
                <input
                  ref={createRoleNameRef}
                  className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-400"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  required
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <input
                  className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-400"
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow hover:from-purple-700 hover:to-pink-700"
                >
                  Create
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="color"
                  className="w-12 h-8 p-0 border-none bg-transparent cursor-pointer"
                  value={newRole.color}
                  onChange={(e) =>
                    setNewRole({ ...newRole, color: e.target.value })
                  }
                />
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Role Confirmation */}
      {deletingRoleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-red-600">Delete Role</h2>
            <p className="mb-6">
              Are you sure you want to delete this role? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setDeletingRoleId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow hover:from-red-700 hover:to-pink-700"
                onClick={() => handleDeleteRole(deletingRoleId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
