'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('salons', 'bookings');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('salons', 'bookings', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  }
}; 