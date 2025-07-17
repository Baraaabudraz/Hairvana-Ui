'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('salons', 'rating');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('salons', 'rating', {
      type: Sequelize.DECIMAL(3, 1),
      defaultValue: 0,
    });
  }
}; 