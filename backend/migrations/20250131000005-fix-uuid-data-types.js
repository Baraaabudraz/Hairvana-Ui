'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, let's check what the current column types are
    const subscriptionPlansDescription = await queryInterface.describeTable('subscription_plans');
    const subscriptionsDescription = await queryInterface.describeTable('subscriptions');
    
    console.log('Current subscription_plans.id type:', subscriptionPlansDescription.id.type);
    console.log('Current subscriptions.plan_id type:', subscriptionsDescription.plan_id.type);
    
    // If subscription_plans.id is still TEXT, we need to convert it to UUID
    if (subscriptionPlansDescription.id.type === 'text') {
      console.log('Converting subscription_plans.id from TEXT to UUID...');
      
      // First, drop any foreign key constraints
      try {
        await queryInterface.removeConstraint('subscriptions', 'subscriptions_plan_id_fkey');
      } catch (error) {
        console.log('No existing foreign key constraint to remove');
      }
      
      // Convert the data using raw SQL
      await queryInterface.sequelize.query(`
        ALTER TABLE subscription_plans 
        ALTER COLUMN id TYPE uuid USING id::uuid
      `);
      
      await queryInterface.sequelize.query(`
        ALTER TABLE subscriptions 
        ALTER COLUMN plan_id TYPE uuid USING plan_id::uuid
      `);
      
      // Re-add the foreign key constraint
      await queryInterface.addConstraint('subscriptions', {
        fields: ['plan_id'],
        type: 'foreign key',
        name: 'subscriptions_plan_id_fkey',
        references: {
          table: 'subscription_plans',
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
      
      console.log('Successfully converted columns to UUID type');
    } else {
      console.log('Columns are already UUID type');
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert back to TEXT if needed
    try {
      await queryInterface.removeConstraint('subscriptions', 'subscriptions_plan_id_fkey');
    } catch (error) {
      console.log('No constraint to remove');
    }
    
    await queryInterface.sequelize.query(`
      ALTER TABLE subscription_plans 
      ALTER COLUMN id TYPE text
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE subscriptions 
      ALTER COLUMN plan_id TYPE text
    `);
    
    await queryInterface.addConstraint('subscriptions', {
      fields: ['plan_id'],
      type: 'foreign key',
      name: 'subscriptions_plan_id_fkey',
      references: {
        table: 'subscription_plans',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }
};
