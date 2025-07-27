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
        name: "super_admin",
        description: "Super Administrator",
        color: "#dc2626",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "admin",
        description: "Administrator",
        color: "#2563eb",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "salon",
        description: "Salon Owner/Manager",
        color: "#16a34a",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "user",
        description: "Regular User/Customer",
        color: "#6B7280",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "customer",
        description: "Customer/Regular User",
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
      name: ["super_admin", "admin", "salon", "user"],
    });
  },
};
