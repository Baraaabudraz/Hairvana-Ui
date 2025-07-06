'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('salons', 'gallery', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('salons', 'gallery');
  }
}; 