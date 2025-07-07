'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('platform_settings', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      site_name: {
        type: Sequelize.TEXT,
        defaultValue: 'Hairvana',
      },
      site_description: {
        type: Sequelize.TEXT,
        defaultValue: 'Professional Salon Management Platform',
      },
      logo: {
        type: Sequelize.TEXT,
      },
      favicon: {
        type: Sequelize.TEXT,
      },
      primary_color: {
        type: Sequelize.TEXT,
        defaultValue: '#8b5cf6',
      },
      secondary_color: {
        type: Sequelize.TEXT,
        defaultValue: '#ec4899',
      },
      timezone: {
        type: Sequelize.TEXT,
        defaultValue: 'UTC',
      },
      currency: {
        type: Sequelize.TEXT,
        defaultValue: 'USD',
      },
      language: {
        type: Sequelize.TEXT,
        defaultValue: 'en',
      },
      maintenance_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      registration_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      email_verification_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      max_file_upload_size: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      allowed_file_types: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
      },
      session_timeout: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
      },
      password_policy: {
        type: Sequelize.JSONB,
        defaultValue: { min_length: 8, require_uppercase: true, require_lowercase: true, require_numbers: true, require_special_chars: true },
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('platform_settings');
  },
}; 