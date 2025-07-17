'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('salons', 'revenue');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('salons', 'revenue', {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    });
  }
}; 