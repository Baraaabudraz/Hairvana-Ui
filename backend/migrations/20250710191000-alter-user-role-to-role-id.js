"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove old fields
    await queryInterface.removeColumn("users", "role");
    await queryInterface.removeColumn("users", "permissions");

    // Add new role_id field as nullable
    await queryInterface.addColumn("users", "role_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "roles",
        key: "id",
      },
      onDelete: "SET NULL",
      after: "phone", // Place after phone if supported
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove new field
    await queryInterface.removeColumn("users", "role_id");

    // Add old fields back
    await queryInterface.addColumn("users", "role", {
      type: Sequelize.ENUM("super_admin", "admin", "salon", "user"),
      allowNull: false,
    });
    await queryInterface.addColumn("users", "permissions", {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      defaultValue: [],
    });
  },
};
