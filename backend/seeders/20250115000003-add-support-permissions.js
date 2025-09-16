"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get role IDs
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles WHERE name IN ('super admin', 'admin', 'salon owner', 'customer')`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (roles.length === 0) {
      console.log('No roles found, skipping support permissions seeding.');
      return;
    }
    
    const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));
    const now = new Date();
    const permissions = [];
    const ACTIONS = ["view", "add", "edit", "delete"];

    // Check if support permissions already exist
    const existingSupportPermissions = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM permissions WHERE resource = ?',
      { 
        replacements: ['support'],
        type: Sequelize.QueryTypes.SELECT 
      }
    ).catch(() => [{ count: 0 }]);
    
    if (existingSupportPermissions[0].count > 0) {
      console.log('Support permissions already exist, skipping support permissions seeding.');
      return;
    }

    // super admin: all support permissions
    for (const action of ACTIONS) {
      permissions.push({
        id: uuidv4(),
        role_id: roleMap["super admin"],
        resource: "support",
        action,
        allowed: true,
        created_at: now,
        updated_at: now,
      });
    }

    // admin: all support permissions
    for (const action of ACTIONS) {
      permissions.push({
        id: uuidv4(),
        role_id: roleMap["admin"],
        resource: "support",
        action,
        allowed: true,
        created_at: now,
        updated_at: now,
      });
    }

    // salon owner: view and add support tickets (can create tickets for their salon issues)
    permissions.push({
      id: uuidv4(),
      role_id: roleMap["salon owner"],
      resource: "support",
      action: "view",
      allowed: true,
      created_at: now,
      updated_at: now,
    });

    permissions.push({
      id: uuidv4(),
      role_id: roleMap["salon owner"],
      resource: "support",
      action: "add",
      allowed: true,
      created_at: now,
      updated_at: now,
    });

    // salon owner: no edit/delete permissions (only admins can manage tickets)
    permissions.push({
      id: uuidv4(),
      role_id: roleMap["salon owner"],
      resource: "support",
      action: "edit",
      allowed: false,
      created_at: now,
      updated_at: now,
    });

    permissions.push({
      id: uuidv4(),
      role_id: roleMap["salon owner"],
      resource: "support",
      action: "delete",
      allowed: false,
      created_at: now,
      updated_at: now,
    });

    // customer: view and add support tickets (can create tickets for their issues)
    permissions.push({
      id: uuidv4(),
      role_id: roleMap["customer"],
      resource: "support",
      action: "view",
      allowed: true,
      created_at: now,
      updated_at: now,
    });

    permissions.push({
      id: uuidv4(),
      role_id: roleMap["customer"],
      resource: "support",
      action: "add",
      allowed: true,
      created_at: now,
      updated_at: now,
    });

    // customer: no edit/delete permissions (only admins can manage tickets)
    permissions.push({
      id: uuidv4(),
      role_id: roleMap["customer"],
      resource: "support",
      action: "edit",
      allowed: false,
      created_at: now,
      updated_at: now,
    });

    permissions.push({
      id: uuidv4(),
      role_id: roleMap["customer"],
      resource: "support",
      action: "delete",
      allowed: false,
      created_at: now,
      updated_at: now,
    });

    await queryInterface.bulkInsert("permissions", permissions);
    console.log('Support permissions seeded successfully.');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("permissions", {
      resource: "support"
    });
  }
};
