const db = require("../models");

class PermissionService {
  // Get all permissions for a user
  static async getUserPermissions(userId) {
    try {
      const user = await db.User.findOne({
        where: { id: userId },
        include: [{ model: db.Role, as: 'role' }]
      });

      if (!user || !user.role) {
        return [];
      }

      const permissions = await db.Permission.findAll({
        where: {
          role_id: user.role.id,
          allowed: true
        }
      });

      return permissions.map(p => ({
        resource: p.resource,
        action: p.action,
        allowed: p.allowed
      }));
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  // Check if user has specific permission
  static async hasPermission(userId, resource, action) {
    try {
      const user = await db.User.findOne({
        where: { id: userId },
        include: [{ model: db.Role, as: 'role' }]
      });

      if (!user || !user.role) {
        return false;
      }

      const permission = await db.Permission.findOne({
        where: {
          role_id: user.role.id,
          resource,
          action,
          allowed: true
        }
      });

      return !!permission;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // Get user's accessible resources
  static async getAccessibleResources(userId) {
    try {
      const permissions = await this.getUserPermissions(userId);
      const resources = new Set();
      
      permissions.forEach(p => {
        if (p.allowed) {
          resources.add(p.resource);
        }
      });

      return Array.from(resources);
    } catch (error) {
      console.error('Error getting accessible resources:', error);
      return [];
    }
  }

  // Get user's role name
  static async getUserRole(userId) {
    try {
      const user = await db.User.findOne({
        where: { id: userId },
        include: [{ model: db.Role, as: 'role' }]
      });

      return user?.role?.name || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }
}

module.exports = PermissionService; 