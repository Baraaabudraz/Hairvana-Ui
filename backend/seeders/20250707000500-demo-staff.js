'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Real salon UUIDs from seeders
    const salonIds = [
      '00000000-0000-0000-0000-000000000001', // Luxe Hair Studio
      '00000000-0000-0000-0000-000000000002'  // Urban Cuts
    ];
    await queryInterface.bulkInsert('staff', [
      {
        id: uuidv4(),
        salon_id: salonIds[0],
        name: 'Jessica Lee',
        role: 'Stylist',
        email: 'jessica@luxehair.com',
        phone: '+1 (555) 111-2222',
        bio: 'Expert in modern cuts and color.',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        salon_id: salonIds[0],
        name: 'Carlos Rivera',
        role: 'Barber',
        email: 'carlos@luxehair.com',
        phone: '+1 (555) 333-4444',
        bio: 'Specialist in fades and beard trims.',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        salon_id: salonIds[1],
        name: 'Emily Zhang',
        role: 'Colorist',
        email: 'emily@urbancuts.com',
        phone: '+1 (555) 555-6666',
        bio: 'Creative color and highlights expert.',
        avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        salon_id: salonIds[1],
        name: 'Mike Johnson',
        role: 'Stylist',
        email: 'mike@urbancuts.com',
        phone: '+1 (555) 777-8888',
        bio: 'Classic and modern men’s styles.',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('staff', null, {});
  }
}; 