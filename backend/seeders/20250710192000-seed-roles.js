"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert("roles", [
      {
        id: uuidv4(),
        name: "super_admin",
        description: "Super Administrator",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "admin",
        description: "Administrator",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "salon",
        description: "Salon Owner/Manager",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "user",
        description: "Regular User/Customer",
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("roles", {
      name: ["super_admin", "admin", "salon", "user"],
    });
  },
};
