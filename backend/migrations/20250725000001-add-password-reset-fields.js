'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'reset_token', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Hashed password reset token'
    });

    await queryInterface.addColumn('users', 'reset_token_expires', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Expiration date for password reset token'
    });

    // Add index for better performance when searching by reset token
    await queryInterface.addIndex('users', ['reset_token'], {
      name: 'idx_users_reset_token'
    });

    // Add index for reset token expiration
    await queryInterface.addIndex('users', ['reset_token_expires'], {
      name: 'idx_users_reset_token_expires'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('users', 'idx_users_reset_token');
    await queryInterface.removeIndex('users', 'idx_users_reset_token_expires');

    // Remove columns
    await queryInterface.removeColumn('users', 'reset_token');
    await queryInterface.removeColumn('users', 'reset_token_expires');
  }
}; 