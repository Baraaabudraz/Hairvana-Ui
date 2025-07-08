'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Real salon UUIDs from seeders
    const salonIds = [
      '00000000-0000-0000-0000-000000000001', // Luxe Hair Studio
      '00000000-0000-0000-0000-000000000002'  // Urban Cuts
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
      },
      {
        id: uuidv4(),
        name: 'Layered Cut',
        description: 'Layered hairstyle for added volume.',
        tags: ['layered', 'volume', 'medium'],
        image_url: 'https://example.com/layered.jpg',
        ar_model_url: null,
        gender: 'female',
        length: 'medium',
        color: 'blonde',
        salon_id: salonIds[0],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Buzz Cut',
        description: 'Very short, low-maintenance buzz cut.',
        tags: ['buzz', 'short', 'men'],
        image_url: 'https://example.com/buzz.jpg',
        ar_model_url: null,
        gender: 'male',
        length: 'short',
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