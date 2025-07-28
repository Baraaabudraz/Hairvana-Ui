"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    // Check if roles already exist
    const existingRoles = await queryInterface.sequelize.query(
      'SELECT name FROM roles',
      { type: Sequelize.QueryTypes.SELECT }
    ).catch(() => []);
    
    const existingRoleNames = existingRoles.map(r => r.name);
    
    const rolesToInsert = [
      {
        id: uuidv4(),
        name: "super admin",
        description: "Super Administrator with full system access",
        color: "#dc2626",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "admin",
        description: "Administrator with management access",
        color: "#2563eb",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "salon owner",
        description: "Salon Owner with business management access",
        color: "#16a34a",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "customer",
        description: "Customer with limited access",
        color: "#6B7280",
        created_at: now,
        updated_at: now,
      },
    ].filter(role => !existingRoleNames.includes(role.name));

    if (rolesToInsert.length > 0) {
      await queryInterface.bulkInsert("roles", rolesToInsert);
      console.log(`Seeded ${rolesToInsert.length} roles successfully.`);
    } else {
      console.log('All roles already exist, skipping roles seeding.');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("roles", {
      name: ["super admin", "admin", "salon owner", "customer"],
    });
  },
};
