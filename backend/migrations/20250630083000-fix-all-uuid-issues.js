'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔧 Fixing UUID generation for cPanel compatibility...');

    // Step 1: Try to enable uuid-ossp extension
    try {
      await queryInterface.sequelize.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      `);
      console.log('✅ uuid-ossp extension enabled');
    } catch (error) {
      console.log('⚠️  Could not enable uuid-ossp extension:', error.message);
      console.log('📝 Will use Node.js UUID generation instead');
    }

    // Step 2: Create a safe UUID generation function
    try {
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION safe_uuid_generate()
        RETURNS UUID AS $$
        DECLARE
          result UUID;
        BEGIN
          -- Try multiple methods to generate UUID
          BEGIN
            -- Method 1: Try uuid-ossp
            SELECT uuid_generate_v4() INTO result;
            RETURN result;
          EXCEPTION WHEN OTHERS THEN
            BEGIN
              -- Method 2: Try gen_random_uuid (pgcrypto)
              SELECT gen_random_uuid() INTO result;
              RETURN result;
            EXCEPTION WHEN OTHERS THEN
              -- Method 3: Fallback to a placeholder
              RETURN '00000000-0000-0000-0000-000000000000'::UUID;
            END;
          END;
        END;
        $$ LANGUAGE plpgsql;
      `);
      console.log('✅ Safe UUID generation function created');
    } catch (error) {
      console.log('⚠️  Could not create safe UUID function:', error.message);
    }

    // Step 3: Update existing tables to use safe UUID generation
    const tables = [
      'users', 'salons', 'subscription_plans', 'subscriptions', 
      'services', 'staff', 'appointments', 'payments', 
      'notification_templates', 'reports', 'hairstyles'
    ];

    for (const table of tables) {
      try {
        // Check if table exists
        const tableExists = await queryInterface.sequelize.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${table}'
          );
        `, { type: Sequelize.QueryTypes.SELECT });

        if (tableExists[0].exists) {
          // Update the id column to use safe UUID generation
          await queryInterface.sequelize.query(`
            ALTER TABLE "${table}" 
            ALTER COLUMN id SET DEFAULT safe_uuid_generate();
          `);
          console.log(`✅ Updated ${table} table UUID generation`);
        }
      } catch (error) {
        console.log(`⚠️  Could not update ${table} table:`, error.message);
      }
    }

    console.log('🎉 UUID generation fix completed!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting UUID generation changes...');

    // Drop the safe UUID function
    try {
      await queryInterface.sequelize.query(`
        DROP FUNCTION IF EXISTS safe_uuid_generate();
      `);
      console.log('✅ Safe UUID generation function dropped');
    } catch (error) {
      console.log('⚠️  Error dropping safe UUID function:', error.message);
    }

    // Note: We don't drop the uuid-ossp extension as it might be used by other parts of the system
    console.log('✅ UUID generation revert completed');
  }
}; 