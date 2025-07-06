'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change billing_address to TEXT if it was previously JSON/JSONB
    await queryInterface.changeColumn('billing_settings', 'billing_address', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    // If you want to revert, you could set it back to JSONB (if needed)
    await queryInterface.changeColumn('billing_settings', 'billing_address', {
      type: Sequelize.JSONB,
      allowNull: true
    });
  }
}; 