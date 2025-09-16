"use strict";
const { v4: uuidv4 } = require("uuid");

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
  "roles",
  "support",
];
const ACTIONS = ["view", "add", "edit", "delete"];

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if permissions already exist
    const existingPermissions = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM permissions',
      { type: Sequelize.QueryTypes.SELECT }
    ).catch(() => [{ count: 0 }]);
    
    if (existingPermissions[0].count > 0) {
      console.log('Permissions already exist, skipping permissions seeding.');
      return;
    }

    // Get role IDs
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles WHERE name IN ('super admin', 'admin', 'salon owner', 'customer')`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (roles.length === 0) {
      console.log('No roles found, skipping permissions seeding.');
      return;
    }
    
    const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));
    const now = new Date();
    const permissions = [];

    // super admin: all permissions
    for (const resource of RESOURCES) {
      for (const action of ACTIONS) {
        permissions.push({
          id: uuidv4(),
          role_id: roleMap["super admin"],
          resource,
          action,
          allowed: true,
          created_at: now,
          updated_at: now,
        });
      }
    }

    // admin: all except delete on billing/settings
    for (const resource of RESOURCES) {
      for (const action of ACTIONS) {
        let allowed = true;
        if (
          (resource === "billing" || resource === "settings") &&
          action === "delete"
        )
          allowed = false;
        permissions.push({
          id: uuidv4(),
          role_id: roleMap["admin"],
          resource,
          action,
          allowed,
          created_at: now,
          updated_at: now,
        });
      }
    }

    // salon owner: view/add/edit on most, no delete except reviews/appointments
    for (const resource of RESOURCES) {
      for (const action of ACTIONS) {
        let allowed = false;
        if (["view", "add", "edit"].includes(action)) allowed = true;
        if (
          ["reviews", "appointments"].includes(resource) &&
          action === "delete"
        )
          allowed = true;
        permissions.push({
          id: uuidv4(),
          role_id: roleMap["salon owner"],
          resource,
          action,
          allowed,
          created_at: now,
          updated_at: now,
        });
      }
    }

    // customer: view on most, add review/appointment, edit/delete own review/appointment
    for (const resource of RESOURCES) {
      for (const action of ACTIONS) {
        let allowed = false;
        if (action === "view") allowed = true;
        if (["reviews", "appointments"].includes(resource) && action === "add")
          allowed = true;
        if (
          ["reviews", "appointments"].includes(resource) &&
          ["edit", "delete"].includes(action)
        )
          allowed = true;
        permissions.push({
          id: uuidv4(),
          role_id: roleMap["customer"],
          resource,
          action,
          allowed,
          created_at: now,
          updated_at: now,
        });
      }
    }

    await queryInterface.bulkInsert("permissions", permissions);
    console.log(`Seeded ${permissions.length} permissions successfully.`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("permissions", null, {});
  },
};
