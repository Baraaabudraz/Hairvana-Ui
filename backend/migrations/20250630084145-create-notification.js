'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create user_settings table
    await queryInterface.createTable('user_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      email: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      phone: {
        type: Sequelize.TEXT
      },
      department: {
        type: Sequelize.TEXT
      },
      timezone: {
        type: Sequelize.TEXT,
        defaultValue: 'UTC'
      },
      language: {
        type: Sequelize.TEXT,
        defaultValue: 'en'
      },
      bio: {
        type: Sequelize.TEXT
      },
      avatar: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create security_settings table
    await queryInterface.createTable('security_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      two_factor_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      password_last_changed: {
        type: Sequelize.DATE
      },
      login_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      last_login_ip: {
        type: Sequelize.TEXT
      },
      allowed_ips: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
      },
      session_timeout: {
        type: Sequelize.INTEGER,
        defaultValue: 30
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create notification_preferences table
    await queryInterface.createTable('notification_preferences', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      email: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      push: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      sms: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      desktop: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      marketing_emails: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      system_notifications: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create billing_settings table
    await queryInterface.createTable('billing_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      default_payment_method: {
        type: Sequelize.JSONB
      },
      billing_address: {
        type: Sequelize.JSONB
      },
      tax_id: {
        type: Sequelize.TEXT
      },
      invoice_email: {
        type: Sequelize.TEXT
      },
      auto_pay: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      payment_methods: {
        type: Sequelize.ARRAY(Sequelize.JSONB)
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create backup_settings table
    await queryInterface.createTable('backup_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      auto_backup: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      backup_frequency: {
        type: Sequelize.TEXT,
        defaultValue: 'daily'
      },
      backup_time: {
        type: Sequelize.TIME,
        defaultValue: '00:00:00'
      },
      retention_days: {
        type: Sequelize.INTEGER,
        defaultValue: 30
      },
      storage_provider: {
        type: Sequelize.TEXT,
        defaultValue: 'local'
      },
      storage_path: {
        type: Sequelize.TEXT
      },
      cloud_credentials: {
        type: Sequelize.JSONB
      },
      last_backup: {
        type: Sequelize.DATE
      },
      backup_history: {
        type: Sequelize.ARRAY(Sequelize.JSONB)
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create platform_settings table
    await queryInterface.createTable('platform_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      site_name: {
        type: Sequelize.TEXT,
        defaultValue: 'Hairvana'
      },
      site_description: {
        type: Sequelize.TEXT,
        defaultValue: 'Professional Salon Management Platform'
      },
      logo: {
        type: Sequelize.TEXT
      },
      favicon: {
        type: Sequelize.TEXT
      },
      primary_color: {
        type: Sequelize.TEXT,
        defaultValue: '#8b5cf6'
      },
      secondary_color: {
        type: Sequelize.TEXT,
        defaultValue: '#ec4899'
      },
      timezone: {
        type: Sequelize.TEXT,
        defaultValue: 'UTC'
      },
      currency: {
        type: Sequelize.TEXT,
        defaultValue: 'USD'
      },
      language: {
        type: Sequelize.TEXT,
        defaultValue: 'en'
      },
      maintenance_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      registration_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      email_verification_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      max_file_upload_size: {
        type: Sequelize.INTEGER,
        defaultValue: 10
      },
      allowed_file_types: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: ['jpg', 'jpeg', 'png', 'gif', 'pdf']
      },
      session_timeout: {
        type: Sequelize.INTEGER,
        defaultValue: 30
      },
      password_policy: {
        type: Sequelize.JSONB,
        defaultValue: {
          min_length: 8,
          require_uppercase: true,
          require_lowercase: true,
          require_numbers: true,
          require_special_chars: true
        }
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create integration_settings table
    await queryInterface.createTable('integration_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      email_provider: {
        type: Sequelize.TEXT,
        defaultValue: 'sendgrid'
      },
      email_api_key: {
        type: Sequelize.TEXT
      },
      sms_provider: {
        type: Sequelize.TEXT,
        defaultValue: 'twilio'
      },
      sms_api_key: {
        type: Sequelize.TEXT
      },
      payment_gateway: {
        type: Sequelize.TEXT,
        defaultValue: 'stripe'
      },
      payment_api_key: {
        type: Sequelize.TEXT
      },
      analytics_provider: {
        type: Sequelize.TEXT,
        defaultValue: 'google'
      },
      analytics_tracking_id: {
        type: Sequelize.TEXT
      },
      social_logins: {
        type: Sequelize.JSONB,
        defaultValue: {
          google: true,
          facebook: false,
          apple: false
        }
      },
      webhooks: {
        type: Sequelize.ARRAY(Sequelize.JSONB)
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create triggers for updated_at
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_user_settings_updated_at
        BEFORE UPDATE ON user_settings
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();

      CREATE TRIGGER update_security_settings_updated_at
        BEFORE UPDATE ON security_settings
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();

      CREATE TRIGGER update_notification_preferences_updated_at
        BEFORE UPDATE ON notification_preferences
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();

      CREATE TRIGGER update_billing_settings_updated_at
        BEFORE UPDATE ON billing_settings
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();

      CREATE TRIGGER update_backup_settings_updated_at
        BEFORE UPDATE ON backup_settings
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();

      CREATE TRIGGER update_platform_settings_updated_at
        BEFORE UPDATE ON platform_settings
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();

      CREATE TRIGGER update_integration_settings_updated_at
        BEFORE UPDATE ON integration_settings
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
    `);
  },
  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order
    await queryInterface.dropTable('integration_settings');
    await queryInterface.dropTable('platform_settings');
    await queryInterface.dropTable('backup_settings');
    await queryInterface.dropTable('billing_settings');
    await queryInterface.dropTable('notification_preferences');
    await queryInterface.dropTable('security_settings');
    await queryInterface.dropTable('user_settings');
  }
};