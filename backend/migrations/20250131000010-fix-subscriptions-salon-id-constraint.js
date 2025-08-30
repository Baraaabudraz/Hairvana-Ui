'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First, remove any existing foreign key constraints
      const constraints = await queryInterface.sequelize.query(`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'subscriptions' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%salon_id%'
      `);
      
      for (const constraint of constraints[0]) {
        try {
          await queryInterface.removeConstraint('subscriptions', constraint.constraint_name);
          console.log(`Removed constraint: ${constraint.constraint_name}`);
        } catch (error) {
          console.log(`Constraint ${constraint.constraint_name} already removed or doesn't exist`);
        }
      }

      // Now change the column to allow null
      await queryInterface.changeColumn('subscriptions', 'salon_id', {
        type: Sequelize.UUID,
        allowNull: true
      });
      
      // Add back the foreign key constraint with allowNull: true
      await queryInterface.addConstraint('subscriptions', {
        fields: ['salon_id'],
        type: 'foreign key',
        name: 'subscriptions_salon_id_fkey',
        references: {
          table: 'salons',
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
      
      console.log('✅ Successfully made salon_id nullable in subscriptions table');
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Remove the foreign key constraint
      await queryInterface.removeConstraint('subscriptions', 'subscriptions_salon_id_fkey');
      
      // Change column back to not null
      await queryInterface.changeColumn('subscriptions', 'salon_id', {
        type: Sequelize.UUID,
        allowNull: false
      });
      
      // Add back the foreign key constraint with allowNull: false
      await queryInterface.addConstraint('subscriptions', {
        fields: ['salon_id'],
        type: 'foreign key',
        name: 'subscriptions_salon_id_fkey',
        references: {
          table: 'salons',
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    } catch (error) {
      console.error('Error in migration down:', error);
      throw error;
    }
  }
};
