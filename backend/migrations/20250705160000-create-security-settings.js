'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('security_settings', {
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
      two_factor_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      password_last_changed: {
        type: Sequelize.DATE,
      },
      login_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      last_login_ip: {
        type: Sequelize.TEXT,
      },
      allowed_ips: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      session_timeout: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
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
    await queryInterface.dropTable('security_settings');
  },
}; 