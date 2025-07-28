'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Clean up existing data to avoid duplicates
    await queryInterface.bulkDelete('salon_services', null, {});
    await queryInterface.bulkDelete('salons', null, {});
    // Don't delete addresses as they are needed for foreign key constraints
    
    // Get salon owners from users table
    const salonOwners = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE role_id IN (SELECT id FROM roles WHERE name = \'salon owner\') LIMIT 3',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (salonOwners.length === 0) {
      console.log('No salon owners found, skipping salon seeding');
      return;
    }

    const salons = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        owner_id: salonOwners[0].id,
        name: 'Luxe Hair Studio',
        email: 'contact@luxehair.com',
        phone: '+1 (555) 123-4567',
        address_id: '00000000-0000-0000-0000-000000000011',
        status: 'active',
        join_date: new Date('2024-01-15'),
        website: 'https://luxehair.com',
        description: 'Premium hair salon offering luxury hair services in Beverly Hills. We specialize in high-end cuts, color, and styling for discerning clients.',
        business_license: 'CA123456789',
        tax_id: '12-3456789',
        avatar: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        hours: JSON.stringify({
          monday: '9:00 AM - 8:00 PM',
          tuesday: '9:00 AM - 8:00 PM',
          wednesday: '9:00 AM - 8:00 PM',
          thursday: '9:00 AM - 8:00 PM',
          friday: '9:00 AM - 9:00 PM',
          saturday: '8:00 AM - 9:00 PM',
          sunday: '10:00 AM - 6:00 PM'
        }),
        gallery: [
          'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/3993450/pexels-photo-3993450.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/3993452/pexels-photo-3993452.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/3993453/pexels-photo-3993453.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        owner_id: salonOwners[1]?.id || salonOwners[0].id,
        name: 'Urban Cuts',
        email: 'info@urbancuts.com',
        phone: '+1 (555) 234-5678',
        address_id: '00000000-0000-0000-0000-000000000012',
        status: 'active',
        join_date: new Date('2024-02-20'),
        website: 'https://urbancuts.com',
        description: 'Modern hair salon in downtown Los Angeles. We offer contemporary cuts, trendy styles, and professional services in a relaxed atmosphere.',
        business_license: 'CA987654321',
        tax_id: '98-7654321',
        avatar: 'https://images.pexels.com/photos/3993451/pexels-photo-3993451.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        hours: JSON.stringify({
          monday: '10:00 AM - 7:00 PM',
          tuesday: '10:00 AM - 7:00 PM',
          wednesday: '10:00 AM - 7:00 PM',
          thursday: '10:00 AM - 7:00 PM',
          friday: '10:00 AM - 8:00 PM',
          saturday: '9:00 AM - 8:00 PM',
          sunday: 'Closed'
        }),
        gallery: [
          'https://images.pexels.com/photos/3993451/pexels-photo-3993451.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/3993454/pexels-photo-3993454.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/3993455/pexels-photo-3993455.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        owner_id: salonOwners[2]?.id || salonOwners[0].id,
        name: 'Style & Grace Salon',
        email: 'hello@styleandgrace.com',
        phone: '+1 (555) 345-6789',
        address_id: '00000000-0000-0000-0000-000000000013',
        status: 'pending',
        join_date: new Date('2024-03-10'),
        website: 'https://styleandgrace.com',
        description: 'Boutique salon specializing in personalized hair care and styling. We focus on creating unique looks that reflect each client\'s personality.',
        business_license: 'NY111222333',
        tax_id: '11-2223334',
        avatar: 'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        hours: JSON.stringify({
          monday: '9:00 AM - 7:00 PM',
          tuesday: '9:00 AM - 7:00 PM',
          wednesday: '9:00 AM - 7:00 PM',
          thursday: '9:00 AM - 7:00 PM',
          friday: '9:00 AM - 8:00 PM',
          saturday: '9:00 AM - 6:00 PM',
          sunday: 'Closed'
        }),
        gallery: [
          'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/3993457/pexels-photo-3993457.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Only create salons for available owners
    const salonsToCreate = salons.slice(0, salonOwners.length);
    
    await queryInterface.bulkInsert('salons', salonsToCreate, {});
    console.log(`Seeded ${salonsToCreate.length} salons successfully.`);

    // Associate salons with services
    const services = await queryInterface.sequelize.query(
      'SELECT id FROM services LIMIT 5',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (services.length > 0) {
      for (const salon of salonsToCreate) {
        // Pick 2-3 random services for each salon
        const shuffled = services.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.floor(Math.random() * 2) + 2); // 2-3 services
        
        const salonServiceRelations = selected.map(service => ({
          salon_id: salon.id,
          service_id: service.id,
          created_at: new Date(),
          updated_at: new Date()
        }));
        
        // Use ignoreDuplicates option to skip existing relationships
        try {
          await queryInterface.bulkInsert('salon_services', salonServiceRelations, {
            ignoreDuplicates: true
          });
        } catch (error) {
          // If ignoreDuplicates is not supported, try individual inserts with error handling
          for (const relation of salonServiceRelations) {
            try {
              await queryInterface.bulkInsert('salon_services', [relation], {});
            } catch (insertError) {
              // Skip if duplicate
              if (!insertError.message.includes('unique')) {
                throw insertError;
              }
            }
          }
        }
      }
      console.log('Associated salons with services successfully.');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('salons', null, {});
  }
}; 