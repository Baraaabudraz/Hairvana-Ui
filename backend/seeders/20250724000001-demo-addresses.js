'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if addresses already exist
    const existingAddresses = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM addresses',
      { type: Sequelize.QueryTypes.SELECT }
    ).catch(() => [{ count: 0 }]);
    
    if (existingAddresses[0].count > 0) {
      console.log('Addresses already exist, skipping address seeding.');
      return;
    }

    const addresses = [
      {
        id: '00000000-0000-0000-0000-000000000011',
        street_address: '123 Rodeo Drive',
        city: 'Beverly Hills',
        state: 'CA',
        zip_code: '90210',
        country: 'US',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '00000000-0000-0000-0000-000000000012',
        street_address: '456 Main Street',
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90012',
        country: 'US',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '00000000-0000-0000-0000-000000000013',
        street_address: '789 Fashion Avenue',
        city: 'New York',
        state: 'NY',
        zip_code: '10001',
        country: 'US',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '00000000-0000-0000-0000-000000000014',
        street_address: '321 Park Street',
        city: 'Miami',
        state: 'FL',
        zip_code: '33101',
        country: 'US',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '00000000-0000-0000-0000-000000000015',
        street_address: '654 Downtown Blvd',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60601',
        country: 'US',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('addresses', addresses, {});
    console.log(`Seeded ${addresses.length} addresses successfully.`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('addresses', null, {});
  }
}; 