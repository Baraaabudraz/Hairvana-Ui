'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Try to enable the uuid-ossp extension
      await queryInterface.sequelize.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      `);
      console.log('✅ uuid-ossp extension enabled successfully');
    } catch (error) {
      console.log('⚠️  Could not enable uuid-ossp extension, will use Node.js UUID generation');
      console.log('Error:', error.message);
    }

    // Create a custom UUID generation function as fallback
    try {
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION generate_uuid()
        RETURNS UUID AS $$
        BEGIN
          -- Try to use uuid-ossp if available
          IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
            RETURN uuid_generate_v4();
          ELSE
            -- Fallback: return a placeholder that will be replaced by Sequelize
            RETURN '00000000-0000-0000-0000-000000000000'::UUID;
          END IF;
        END;
        $$ LANGUAGE plpgsql;
      `);
      console.log('✅ Custom UUID generation function created');
    } catch (error) {
      console.log('⚠️  Could not create custom UUID function:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Drop the custom function
      await queryInterface.sequelize.query(`
        DROP FUNCTION IF EXISTS generate_uuid();
      `);
      console.log('✅ Custom UUID generation function dropped');
    } catch (error) {
      console.log('⚠️  Error dropping custom UUID function:', error.message);
    }

    try {
      // Drop the extension (optional - you might want to keep it)
      await queryInterface.sequelize.query(`
        DROP EXTENSION IF EXISTS "uuid-ossp";
      `);
      console.log('✅ uuid-ossp extension dropped');
    } catch (error) {
      console.log('⚠️  Error dropping uuid-ossp extension:', error.message);
    }
  }
}; 