'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if salon_id column exists
    const tableDescription = await queryInterface.describeTable('subscription_payments');
    
    if (tableDescription.salon_id) {
      // First, remove the foreign key constraint to avoid conflicts
      try {
        await queryInterface.removeConstraint('subscription_payments', 'subscription_payments_salon_id_fkey');
      } catch (error) {
        console.log('Foreign key constraint already removed or doesn\'t exist');
      }

      // Update existing data to use the correct owner_id from salons table
      // Only update records where the salon exists and has an owner_id
      await queryInterface.sequelize.query(`
        UPDATE subscription_payments 
        SET salon_id = (
          SELECT owner_id 
          FROM salons 
          WHERE salons.id = subscription_payments.salon_id
        )
        WHERE salon_id IN (
          SELECT s.id 
          FROM salons s 
          WHERE s.owner_id IS NOT NULL
        )
      `);

      // For records where salon doesn't exist, set to a default user or null
      // First, let's find a valid user to use as default
      const [users] = await queryInterface.sequelize.query(`
        SELECT id FROM users LIMIT 1
      `);
      
      if (users.length > 0) {
        const defaultUserId = users[0].id;
        await queryInterface.sequelize.query(`
          UPDATE subscription_payments 
          SET salon_id = '${defaultUserId}'
          WHERE salon_id NOT IN (
            SELECT s.id 
            FROM salons s 
            WHERE s.owner_id IS NOT NULL
          )
        `);
      }

      // Rename salon_id to owner_id
      await queryInterface.renameColumn('subscription_payments', 'salon_id', 'owner_id');
      
      // Add the new foreign key constraint
      await queryInterface.addConstraint('subscription_payments', {
        fields: ['owner_id'],
        type: 'foreign key',
        name: 'subscription_payments_owner_id_fkey',
        references: {
          table: 'users',
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    } else if (!tableDescription.owner_id) {
      // If neither column exists, add owner_id
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
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('subscription_payments');
    
    if (tableDescription.owner_id) {
      // Remove the foreign key constraint
      try {
        await queryInterface.removeConstraint('subscription_payments', 'subscription_payments_owner_id_fkey');
      } catch (error) {
        console.log('Foreign key constraint already removed or doesn\'t exist');
      }
      
      // Rename owner_id back to salon_id
      await queryInterface.renameColumn('subscription_payments', 'owner_id', 'salon_id');
      
      // Add back the salon foreign key constraint
      await queryInterface.addConstraint('subscription_payments', {
        fields: ['salon_id'],
        type: 'foreign key',
        name: 'subscription_payments_salon_id_fkey',
        references: {
          table: 'salons',
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    }
  }
};
