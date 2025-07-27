"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create users table
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      phone: {
        type: Sequelize.TEXT,
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "roles",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      status: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: "active",
        validate: {
          isIn: [["active", "pending", "suspended"]],
        },
      },
      join_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      last_login: {
        type: Sequelize.DATE,
      },
      avatar: {
        type: Sequelize.TEXT,
      },
      permissions: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Create salon_owners table
    await queryInterface.createTable("salon_owners", {
      user_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      total_salons: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_revenue: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      total_bookings: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Create customers table
    await queryInterface.createTable("customers", {
      user_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      total_spent: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      total_bookings: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      favorite_services: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      suspension_reason: {
        type: Sequelize.TEXT,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order
    await queryInterface.dropTable("customers");
    await queryInterface.dropTable("salon_owners");
    await queryInterface.dropTable("users");
  },
};
