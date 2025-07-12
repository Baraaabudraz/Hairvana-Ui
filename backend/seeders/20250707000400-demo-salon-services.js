'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Always clear the table before inserting
    await queryInterface.bulkDelete('salon_services', null, {});
    // Real salon UUIDs from seeders
    const salonIds = [
      '00000000-0000-0000-0000-000000000001', // Luxe Hair Studio
      '00000000-0000-0000-0000-000000000002'  // Urban Cuts
    ];
    // Fetch all service IDs from the services table
    const services = await queryInterface.sequelize.query(
      'SELECT id FROM services;',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const serviceIds = services.map(s => s.id);
    // Link each salon to all services
    const salonServices = [];
    for (const salonId of salonIds) {
      for (const serviceId of serviceIds) {
        salonServices.push({
          salon_id: salonId,
          service_id: serviceId,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }
    await queryInterface.bulkInsert('salon_services', salonServices, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('salon_services', null, {});
  }
}; 