'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='subscription_plans' AND column_name='limits'
        ) THEN
          ALTER TABLE "subscription_plans" ADD COLUMN "limits" JSON;
        END IF;
      END
      $$;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('subscription_plans', 'limits');
  }
};
