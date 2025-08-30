'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if salon_id column exists
    const tableDescription = await queryInterface.describeTable('subscription_payments');
    
    if (tableDescription.salon_id) {
      // Update existing data to use the correct owner_id from salons table
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

      // Rename salon_id to owner_id
      await queryInterface.renameColumn('subscription_payments', 'salon_id', 'owner_id');
      
      // Update the foreign key constraint
      await queryInterface.removeConstraint('subscription_payments', 'subscription_payments_salon_id_fkey');
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
      await queryInterface.removeConstraint('subscription_payments', 'subscription_payments_owner_id_fkey');
      
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
