'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Cleanup: delete demo user_settings and users first
    await queryInterface.bulkDelete('user_settings', {
      user_id: [
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002'
      ]
    }, {});
    await queryInterface.bulkDelete('users', {
      id: [
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002'
      ]
    }, {});

    // Create super admin user
    await queryInterface.bulkInsert('users', [{
      id: '00000000-0000-0000-0000-000000000001',
      email: 'superadmin@hairvana.com',
      name: 'Sarah Johnson',
      phone: '+1 (555) 234-5678',
      role: 'super_admin',
      status: 'active',
      join_date: '2024-01-01',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      permissions: ['full_access'],
      password_hash: '$2a$10$XHCm0tGpT0Yw1XcCRHZM8.WW8Zq4kvVnJHtHxHeFpHl.jnJjFIzLa', // hashed 'admin123'
      created_at: new Date(),
      updated_at: new Date()
    }], {});
    // Create super admin user_settings
    await queryInterface.bulkInsert('user_settings', [{
      id: Sequelize.literal('gen_random_uuid()'),
      user_id: '00000000-0000-0000-0000-000000000001',
      department: 'Administration',
      timezone: 'America/New_York',
      language: 'en',
      bio: 'Super admin of the platform',
      created_at: new Date(),
      updated_at: new Date()
    }], {});

    // Create admin user
    await queryInterface.bulkInsert('users', [{
      id: '00000000-0000-0000-0000-000000000002',
      email: 'admin@hairvana.com',
      name: 'John Smith',
      phone: '+1 (555) 123-4567',
      role: 'admin',
      status: 'active',
      join_date: '2024-01-01',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      permissions: ['manage_salons', 'manage_users', 'view_analytics', 'manage_subscriptions'],
      password_hash: '$2a$10$XHCm0tGpT0Yw1XcCRHZM8.WW8Zq4kvVnJHtHxHeFpHl.jnJjFIzLa', // hashed 'admin123'
      created_at: new Date(),
      updated_at: new Date()
    }], {});
    // Create admin user_settings
    await queryInterface.bulkInsert('user_settings', [{
      id: Sequelize.literal('gen_random_uuid()'),
      user_id: '00000000-0000-0000-0000-000000000002',
      department: 'Management',
      timezone: 'America/Chicago',
      language: 'en',
      bio: 'Admin user for Hairvana',
      created_at: new Date(),
      updated_at: new Date()
    }], {});

    // Create platform settings
    await queryInterface.bulkInsert('platform_settings', [{
      id: Sequelize.literal('gen_random_uuid()'),
      site_name: 'Hairvana',
      site_description: 'Professional Salon Management Platform',
      primary_color: '#8b5cf6',
      secondary_color: '#ec4899',
      created_at: new Date(),
      updated_at: new Date()
    }], {});

    // Create integration settings
    await queryInterface.bulkInsert('integration_settings', [{
      id: Sequelize.literal('gen_random_uuid()'),
      email_provider: 'sendgrid',
      sms_provider: 'twilio',
      payment_gateway: 'stripe',
      analytics_provider: 'google',
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('integration_settings', null, {});
    await queryInterface.bulkDelete('platform_settings', null, {});
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: ['superadmin@hairvana.com', 'admin@hairvana.com']
      }
    }, {});
  }
};
