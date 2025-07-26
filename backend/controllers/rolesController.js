const { Role, Permission } = require("../models");

// List all roles with their permissions
exports.getRolesWithPermissions = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [{ model: Permission, as: "permissions" }],
      order: [["name", "ASC"]],
    });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch roles and permissions." });
  }
};

// Update permissions for a role
exports.updateRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body; // [{ resource, action, allowed }]
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: "Permissions must be an array." });
    }
    // Remove old permissions
    await Permission.destroy({ where: { role_id: roleId } });
    // Add new permissions
    const newPermissions = permissions.map((p) => ({ ...p, role_id: roleId }));
    await Permission.bulkCreate(newPermissions);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update permissions." });
  }
};

// Create a new role
exports.createRole = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const role = await Role.create({ name, description, color });
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ error: "Failed to create role." });
  }
};

// Update role name/description/color
exports.updateRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { name, description, color } = req.body;
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ error: "Role not found." });
    }
    if (name) role.name = name;
    if (description !== undefined) role.description = description;
    if (color !== undefined) role.color = color;
    await role.save();
    res.json(role);
  } catch (err) {
    res.status(500).json({ error: "Failed to update role." });
  }
};

// Delete a role
exports.deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    await Permission.destroy({ where: { role_id: roleId } });
    await Role.destroy({ where: { id: roleId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete role." });
  }
};

// Get all roles without permissions (for dropdowns)
exports.getRolesList = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: ["id", "name", "color", "description"],
      order: [["name", "ASC"]],
    });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch roles." });
  }
};
