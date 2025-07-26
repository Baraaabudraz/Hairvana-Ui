// backend/migrations/20250711180000-add-color-to-role.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("roles", "color", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "#7c3aed",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("roles", "color");
  },
};
