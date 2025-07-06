'use strict';
const { v4: uuidv4 } = require('uuid');
const { BillingHistory } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Replace these with real subscription UUIDs from your DB
    const subscription1 = '00000000-0000-0000-0000-000000000001';
    const subscription2 = '00000000-0000-0000-0000-000000000002';
    await queryInterface.bulkInsert('billing_histories', [
      {
        id: uuidv4(),
        subscription_id: subscription1,
        date: new Date('2024-06-01'),
        amount: 49.99,
        status: 'paid',
        description: 'Standard Plan - Monthly',
        invoice_number: 'INV-2024-001',
        tax_amount: 4.00,
        subtotal: 49.99,
        total: 49.99,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subscription_id: subscription1,
        date: new Date('2024-05-01'),
        amount: 49.99,
        status: 'paid',
        description: 'Standard Plan - Monthly',
        invoice_number: 'INV-2024-002',
        tax_amount: 4.00,
        subtotal: 49.99,
        total: 53.99,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subscription_id: subscription2,
        date: new Date('2024-06-15'),
        amount: 99.99,
        status: 'paid',
        description: 'Premium Plan - Monthly',
        invoice_number: 'INV-2024-003',
        tax_amount: 8.00,
        subtotal: 99.99,
        total: 107.99,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('billing_histories', null, {});
  }
}; 