'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check current table structure
    const tableDescription = await queryInterface.describeTable('subscription_payments');
    
    // If user_id exists and owner_id doesn't, migrate the data
    if (tableDescription.user_id && !tableDescription.owner_id) {
      // Add owner_id column
      await queryInterface.addColumn('subscription_payments', 'owner_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });

      // Copy data from user_id to owner_id
      await queryInterface.sequelize.query(`
        UPDATE subscription_payments 
        SET owner_id = user_id 
        WHERE user_id IS NOT NULL
      `);

      // Make owner_id not null
      await queryInterface.changeColumn('subscription_payments', 'owner_id', {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });

      // Remove user_id column
      await queryInterface.removeColumn('subscription_payments', 'user_id');
    }
    
    // If both user_id and owner_id exist, remove user_id
    if (tableDescription.user_id && tableDescription.owner_id) {
      await queryInterface.removeColumn('subscription_payments', 'user_id');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('subscription_payments');
    
    if (tableDescription.owner_id && !tableDescription.user_id) {
      // Add user_id column back
      await queryInterface.addColumn('subscription_payments', 'user_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });

      // Copy data from owner_id to user_id
      await queryInterface.sequelize.query(`
        UPDATE subscription_payments 
        SET user_id = owner_id 
        WHERE owner_id IS NOT NULL
      `);

      // Make user_id not null
      await queryInterface.changeColumn('subscription_payments', 'user_id', {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });

      // Remove owner_id column
      await queryInterface.removeColumn('subscription_payments', 'owner_id');
    }
  }
};
