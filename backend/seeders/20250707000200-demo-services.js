'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('services', [
      {
        id: uuidv4(),
        name: 'Massage',
        description: 'Relaxing massage therapy for stress relief and wellness.',
        price: 70.00,
        duration: 60,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Pedicure',
        description: 'Professional foot care and nail treatment.',
        price: 45.00,
        duration: 45,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Beard Trim',
        description: 'Professional beard shaping and trimming service.',
        price: 25.00,
        duration: 20,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Haircut',
        description: 'Professional haircut for men and women.',
        price: 35.00,
        duration: 30,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Hair Color',
        description: 'Full hair coloring and highlighting service.',
        price: 85.00,
        duration: 90,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Eyebrow Threading',
        description: 'Precise eyebrow shaping using traditional threading technique.',
        price: 15.00,
        duration: 15,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Hair Styling',
        description: 'Professional hair styling for special occasions and events.',
        price: 55.00,
        duration: 45,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Facial',
        description: 'Rejuvenating facial treatment for healthy, glowing skin.',
        price: 65.00,
        duration: 60,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Hair Treatment',
        description: 'Deep conditioning and therapeutic hair treatment.',
        price: 60.00,
        duration: 60,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Manicure',
        description: 'Professional hand care and nail treatment.',
        price: 35.00,
        duration: 30,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('services', null, {});
  }
}; 