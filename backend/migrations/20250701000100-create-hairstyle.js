'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('hairstyles', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: Sequelize.TEXT,
      tags: Sequelize.ARRAY(Sequelize.STRING),
      image_url: Sequelize.STRING,
      ar_model_url: Sequelize.STRING,
      gender: Sequelize.STRING,
      length: Sequelize.STRING,
      color: Sequelize.STRING,
      salon_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'salons',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Remove the salon_id column if it exists before dropping the table
    await queryInterface.removeColumn('hairstyles', 'salon_id').catch(() => {});
    await queryInterface.dropTable('hairstyles');
  }
}; 