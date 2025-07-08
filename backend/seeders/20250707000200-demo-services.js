'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('services', [
      {
        id: uuidv4(),
        name: 'Haircut',
        description: 'Professional haircut for men and women.',
        price: 30.00,
        duration: 30,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Hair Color',
        description: 'Full hair coloring service.',
        price: 80.00,
        duration: 90,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Beard Trim',
        description: 'Beard shaping and trimming.',
        price: 20.00,
        duration: 20,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Hair Styling',
        description: 'Styling for special occasions.',
        price: 50.00,
        duration: 45,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Hair Treatment',
        description: 'Deep conditioning and treatment.',
        price: 60.00,
        duration: 60,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('services', null, {});
  }
}; 