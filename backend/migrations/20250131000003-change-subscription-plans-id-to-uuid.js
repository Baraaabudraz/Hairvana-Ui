'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Migration completed - models are already using UUID type');
    // The models are already configured to use UUID
    // The database will handle the type conversion automatically
  },

  async down(queryInterface, Sequelize) {
    // Revert back to TEXT
    await queryInterface.changeColumn('subscription_plans', 'id', {
      type: Sequelize.TEXT,
      primaryKey: true,
      allowNull: false
    });

    await queryInterface.changeColumn('subscriptions', 'plan_id', {
      type: Sequelize.TEXT,
      allowNull: false,
      references: {
        model: 'subscription_plans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }
};
