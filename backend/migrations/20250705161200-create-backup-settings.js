'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('backup_settings', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      auto_backup: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      backup_frequency: {
        type: Sequelize.TEXT,
        defaultValue: 'daily',
      },
      backup_time: {
        type: Sequelize.TIME,
        defaultValue: '00:00:00',
      },
      retention_days: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
      },
      storage_provider: {
        type: Sequelize.TEXT,
        defaultValue: 'local',
      },
      storage_path: {
        type: Sequelize.TEXT,
      },
      cloud_credentials: {
        type: Sequelize.JSONB,
      },
      last_backup: {
        type: Sequelize.DATE,
      },
      backup_history: {
        type: Sequelize.ARRAY(Sequelize.JSONB),
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
    await queryInterface.dropTable('backup_settings');
  },
}; 