'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Replace these with actual salon UUIDs from your database
    const salonIds = [
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002'
    ];
    await queryInterface.bulkInsert('hairstyles', [
      {
        id: uuidv4(),
        name: 'Classic Bob',
        description: 'A timeless bob cut for all ages.',
        tags: ['bob', 'classic', 'short'],
        image_url: 'https://example.com/bob.jpg',
        ar_model_url: null,
        gender: 'female',
        length: 'short',
        color: 'brown',
        salon_id: salonIds[0],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Modern Pompadour',
        description: 'Trendy pompadour style for men.',
        tags: ['pompadour', 'modern', 'men'],
        image_url: 'https://example.com/pompadour.jpg',
        ar_model_url: null,
        gender: 'male',
        length: 'medium',
        color: 'black',
        salon_id: salonIds[1],
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('hairstyles', null, {});
  }
}; 