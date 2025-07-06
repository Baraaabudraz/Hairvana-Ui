'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create services table
    await queryInterface.createTable('services', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      salon_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'salons',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      category: {
        type: Sequelize.TEXT
      },
      image: {
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

    // Create staff table
    await queryInterface.createTable('staff', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      salon_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'salons',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      email: {
        type: Sequelize.TEXT
      },
      phone: {
        type: Sequelize.TEXT
      },
      role: {
        type: Sequelize.TEXT
      },
      bio: {
        type: Sequelize.TEXT
      },
      avatar: {
        type: Sequelize.TEXT
      },
      services: {
        type: Sequelize.ARRAY(Sequelize.UUID)
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

    // Create appointments table
    await queryInterface.createTable('appointments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      salon_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'salons',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      service_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'services',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      staff_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'staff',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          isIn: [['pending', 'confirmed', 'cancelled', 'completed', 'no_show']]
        }
      },
      notes: {
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

    // Create triggers for updated_at
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_mobile_devices_updated_at
        BEFORE UPDATE ON mobile_devices
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();

      CREATE TRIGGER update_services_updated_at
        BEFORE UPDATE ON services
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();

      CREATE TRIGGER update_staff_updated_at
        BEFORE UPDATE ON staff
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();

      CREATE TRIGGER update_appointments_updated_at
        BEFORE UPDATE ON appointments
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order
    await queryInterface.dropTable('appointments');
    await queryInterface.dropTable('staff');
    await queryInterface.dropTable('services');
    await queryInterface.dropTable('mobile_devices');
  }
};