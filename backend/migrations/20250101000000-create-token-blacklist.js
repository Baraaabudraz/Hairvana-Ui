'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUM types first
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_token_blacklist_token_type AS ENUM('access', 'refresh');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_token_blacklist_reason AS ENUM('logout', 'logout_all', 'password_change', 'security_breach', 'admin_revoke', 'token_refresh');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create the token_blacklist table
    await queryInterface.createTable('token_blacklist', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      token_jti: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 255]
        },
        comment: 'JWT ID (jti) claim for unique token identification'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      token_type: {
        type: 'enum_token_blacklist_token_type',
        allowNull: false,
        defaultValue: 'access'
      },
      revoked_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Original token expiration time'
      },
      reason: {
        type: 'enum_token_blacklist_reason',
        allowNull: false,
        defaultValue: 'logout'
      },
      device_info: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Device information for tracking and audit purposes'
      },
      ip_address: {
        type: Sequelize.INET,
        allowNull: true,
        comment: 'IP address from which the token was revoked'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent string for audit purposes'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for optimal performance
    await queryInterface.addIndex('token_blacklist', {
      name: 'token_blacklist_jti_idx',
      fields: ['token_jti'],
      unique: true
    });

    await queryInterface.addIndex('token_blacklist', {
      name: 'token_blacklist_user_id_idx',
      fields: ['user_id']
    });

    await queryInterface.addIndex('token_blacklist', {
      name: 'token_blacklist_expires_at_idx',
      fields: ['expires_at']
    });

    await queryInterface.addIndex('token_blacklist', {
      name: 'token_blacklist_revoked_at_idx',
      fields: ['revoked_at']
    });

    await queryInterface.addIndex('token_blacklist', {
      name: 'token_blacklist_user_type_idx',
      fields: ['user_id', 'token_type']
    });

    // Add constraint to ensure expires_at is after revoked_at
    await queryInterface.sequelize.query(`
      ALTER TABLE token_blacklist 
      ADD CONSTRAINT chk_expires_after_revoked 
      CHECK (expires_at >= revoked_at);
    `);

    // Add comment on table
    await queryInterface.sequelize.query(`
      COMMENT ON TABLE token_blacklist IS 'Stores revoked JWT tokens to prevent their reuse';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop the table first
    await queryInterface.dropTable('token_blacklist');

    // Drop ENUM types
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_token_blacklist_token_type;
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_token_blacklist_reason;
    `);
  }
}; 