'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove default before changing type
    await queryInterface.sequelize.query('ALTER TABLE "appointments" ALTER COLUMN "status" DROP DEFAULT;');
    // Change type to ENUM
    await queryInterface.changeColumn('appointments', 'status', {
      type: Sequelize.ENUM('booked', 'cancelled', 'completed')
    });
    // Set default after type change
    await queryInterface.sequelize.query('ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT \'booked\';');
    // Add payment_id column if not present
    await queryInterface.addColumn('appointments', 'payment_id', {
      type: Sequelize.UUID,
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Only revert what is added/changed in up
    await queryInterface.changeColumn('appointments', 'status', {
      type: Sequelize.ENUM('booked', 'cancelled', 'completed')
    });
    await queryInterface.removeColumn('appointments', 'created_at');
    await queryInterface.removeColumn('appointments', 'updated_at');
  }
}; 