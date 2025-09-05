'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('billing_histories', 'transaction_id', {
			type: Sequelize.STRING,
			allowNull: true,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('billing_histories', 'transaction_id');
	}
};


