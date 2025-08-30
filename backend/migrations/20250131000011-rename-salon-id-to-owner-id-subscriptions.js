'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First, remove any existing foreign key constraints on salon_id
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

      // Check if salon_id column exists and has data
      const tableDescription = await queryInterface.describeTable('subscriptions');
      
      if (tableDescription.salon_id && tableDescription.owner_id) {
        // Both columns exist, migrate data from salon_id to owner_id
        await queryInterface.sequelize.query(`
          UPDATE subscriptions 
          SET owner_id = (
            SELECT owner_id 
            FROM salons 
            WHERE salons.id = subscriptions.salon_id
          )
          WHERE salon_id IS NOT NULL AND owner_id IS NULL
        `);

        // Remove salon_id column
        await queryInterface.removeColumn('subscriptions', 'salon_id');
        
        // Make owner_id not null after data migration
        await queryInterface.changeColumn('subscriptions', 'owner_id', {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });

        console.log('✅ Successfully migrated salon_id to owner_id in subscriptions table');
      } else if (tableDescription.salon_id && !tableDescription.owner_id) {
        // Only salon_id exists, add owner_id and migrate data
        await queryInterface.addColumn('subscriptions', 'owner_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });

        // Update existing data: copy owner_id from salons table based on salon_id
        await queryInterface.sequelize.query(`
          UPDATE subscriptions 
          SET owner_id = (
            SELECT owner_id 
            FROM salons 
            WHERE salons.id = subscriptions.salon_id
          )
          WHERE salon_id IS NOT NULL
        `);

        // Remove salon_id column
        await queryInterface.removeColumn('subscriptions', 'salon_id');
        
        // Make owner_id not null after data migration
        await queryInterface.changeColumn('subscriptions', 'owner_id', {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });

        console.log('✅ Successfully renamed salon_id to owner_id in subscriptions table');
      } else if (!tableDescription.salon_id && !tableDescription.owner_id) {
        // Neither column exists, add owner_id
        await queryInterface.addColumn('subscriptions', 'owner_id', {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
        
        console.log('✅ Added owner_id column to subscriptions table');
      } else if (!tableDescription.salon_id && tableDescription.owner_id) {
        // Only owner_id exists, make sure it's properly configured
        await queryInterface.changeColumn('subscriptions', 'owner_id', {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
        
        console.log('✅ owner_id column already exists and properly configured');
      }
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Remove owner_id column
      await queryInterface.removeColumn('subscriptions', 'owner_id');
      
      // Add back salon_id column
      await queryInterface.addColumn('subscriptions', 'salon_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'salons',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
      
      console.log('✅ Reverted owner_id back to salon_id in subscriptions table');
    } catch (error) {
      console.error('Error in migration down:', error);
      throw error;
    }
  }
};
