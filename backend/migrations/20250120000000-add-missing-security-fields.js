'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('security_settings', 'password_expiry_days', {
      type: Sequelize.INTEGER,
      defaultValue: 90,
      allowNull: true
    });

    await queryInterface.addColumn('security_settings', 'data_retention_period', {
      type: Sequelize.INTEGER,
      defaultValue: 365,
      allowNull: true
    });

    await queryInterface.addColumn('security_settings', 'ssl_enabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: true
    });

    await queryInterface.addColumn('security_settings', 'encryption_level', {
      type: Sequelize.STRING,
      defaultValue: 'AES-256',
      allowNull: true
    });

    await queryInterface.addColumn('security_settings', 'audit_logging', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: true
    });

    await queryInterface.addColumn('security_settings', 'backup_frequency', {
      type: Sequelize.STRING,
      defaultValue: 'daily',
      allowNull: true
    });

    await queryInterface.addColumn('security_settings', 'backup_retention', {
      type: Sequelize.INTEGER,
      defaultValue: 30,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('security_settings', 'password_expiry_days');
    await queryInterface.removeColumn('security_settings', 'data_retention_period');
    await queryInterface.removeColumn('security_settings', 'ssl_enabled');
    await queryInterface.removeColumn('security_settings', 'encryption_level');
    await queryInterface.removeColumn('security_settings', 'audit_logging');
    await queryInterface.removeColumn('security_settings', 'backup_frequency');
    await queryInterface.removeColumn('security_settings', 'backup_retention');
  }
};
