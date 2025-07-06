'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Enable the uuid-ossp extension for UUID generation
    await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
  },

  async down(queryInterface, Sequelize) {
    // Disable the uuid-ossp extension
    await queryInterface.sequelize.query(`
      DROP EXTENSION IF EXISTS "uuid-ossp";
    `);
  }
}; 