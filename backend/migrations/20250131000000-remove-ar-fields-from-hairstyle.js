'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Remove AR-related fields from hairstyles table
        await queryInterface.removeColumn('hairstyles', 'ar_model_url');
        await queryInterface.removeColumn('hairstyles', 'segmented_image_url');
    },

    async down(queryInterface, Sequelize) {
        // Add back AR-related fields if migration is rolled back
        await queryInterface.addColumn('hairstyles', 'ar_model_url', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.addColumn('hairstyles', 'segmented_image_url', {
            type: Sequelize.STRING,
            allowNull: true
        });
    }
};
