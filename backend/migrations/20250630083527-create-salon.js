'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('salons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
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
      address: {
        type: Sequelize.TEXT
      },
      location: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: [['active', 'pending', 'suspended']]
        }
      },
      join_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      revenue: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      bookings: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      rating: {
        type: Sequelize.DECIMAL(3, 1),
        defaultValue: 0
      },
      services: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
      },
      hours: {
        type: Sequelize.JSONB
      },
      website: {
        type: Sequelize.TEXT
      },
      description: {
        type: Sequelize.TEXT
      },
      business_license: {
        type: Sequelize.TEXT
      },
      tax_id: {
        type: Sequelize.TEXT
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      owner_name: {
        type: Sequelize.TEXT
      },
      owner_email: {
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

    // Create trigger for updated_at
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_salons_updated_at
        BEFORE UPDATE ON salons
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
    `);

    // Create function and trigger to update salon_owner stats
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_salon_owner_stats()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Update salon_owners table with new stats
        IF TG_OP = 'INSERT' THEN
          UPDATE salon_owners
          SET 
            total_salons = total_salons + 1,
            total_revenue = total_revenue + COALESCE(NEW.revenue, 0),
            total_bookings = total_bookings + COALESCE(NEW.bookings, 0),
            updated_at = now()
          WHERE user_id = NEW.owner_id;
        ELSIF TG_OP = 'UPDATE' THEN
          -- Only update if revenue or bookings changed
          IF OLD.revenue != NEW.revenue OR OLD.bookings != NEW.bookings THEN
            UPDATE salon_owners
            SET 
              total_revenue = total_revenue - COALESCE(OLD.revenue, 0) + COALESCE(NEW.revenue, 0),
              total_bookings = total_bookings - COALESCE(OLD.bookings, 0) + COALESCE(NEW.bookings, 0),
              updated_at = now()
            WHERE user_id = NEW.owner_id;
          END IF;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE salon_owners
          SET 
            total_salons = total_salons - 1,
            total_revenue = total_revenue - COALESCE(OLD.revenue, 0),
            total_bookings = total_bookings - COALESCE(OLD.bookings, 0),
            updated_at = now()
          WHERE user_id = OLD.owner_id;
        END IF;
        
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER salon_stats_trigger
      AFTER INSERT OR UPDATE OR DELETE ON salons
      FOR EACH ROW
      EXECUTE FUNCTION update_salon_owner_stats();
    `);
  },
  async down(queryInterface, Sequelize) {
    // Drop triggers and functions first
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS salon_stats_trigger ON salons;
      DROP FUNCTION IF EXISTS update_salon_owner_stats();
      DROP TRIGGER IF EXISTS update_salons_updated_at ON salons;
    `);

    // Drop the table
    await queryInterface.dropTable('salons');
  }
};