'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add owner_id column to subscriptions table
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

    // Make salon_id optional (allowNull: true)
    await queryInterface.changeColumn('subscriptions', 'salon_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'salons',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove owner_id column
    await queryInterface.removeColumn('subscriptions', 'owner_id');
    
    // Make salon_id required again
    await queryInterface.changeColumn('subscriptions', 'salon_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'salons',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }
};
