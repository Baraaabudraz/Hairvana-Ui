'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create notification_templates table
    await queryInterface.createTable('notification_templates', {
      id: {
        type: Sequelize.TEXT,
        primaryKey: true
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          isIn: [['info', 'success', 'warning', 'error', 'announcement', 'promotion']]
        }
      },
      category: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          isIn: [['system', 'marketing', 'transactional', 'operational']]
        }
      },
      subject: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      channels: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false
      },
      variables: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false
      },
      popular: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create triggers for updated_at
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_notification_templates_updated_at
        BEFORE UPDATE ON notification_templates
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
    `);

    // Seed notification templates
    await queryInterface.bulkInsert('notification_templates', [
      {
        id: 'welcome-salon',
        name: 'Welcome New Salon',
        description: 'Welcome message for newly registered salons',
        type: 'success',
        category: 'transactional',
        subject: 'Welcome to Hairvana! 🎉',
        content: 'Welcome {{salonName}} to the Hairvana platform! We\'re excited to help you grow your business.',
        channels: ['email', 'in-app'],
        variables: ['salonName', 'ownerName', 'setupLink'],
        popular: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'subscription-reminder',
        name: 'Subscription Renewal Reminder',
        description: 'Remind salons about upcoming subscription renewal',
        type: 'warning',
        category: 'transactional',
        subject: 'Your subscription expires in 3 days',
        content: 'Hi {{ownerName}}, your {{planName}} subscription for {{salonName}} expires on {{expiryDate}}.',
        channels: ['email', 'push', 'in-app'],
        variables: ['ownerName', 'salonName', 'planName', 'expiryDate', 'renewLink'],
        popular: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'platform-update',
        name: 'Platform Update Announcement',
        description: 'Notify users about new features and updates',
        type: 'announcement',
        category: 'operational',
        subject: 'New Features Available! 🚀',
        content: 'We\'ve added exciting new features to improve your experience. Check out what\'s new!',
        channels: ['email', 'push', 'in-app'],
        variables: ['featureList', 'updateDate', 'learnMoreLink'],
        popular: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'promotional-offer',
        name: 'Promotional Offer',
        description: 'Send promotional offers and discounts',
        type: 'promotion',
        category: 'marketing',
        subject: 'Special Offer: {{discountPercent}}% Off!',
        content: 'Limited time offer! Get {{discountPercent}}% off your next subscription upgrade.',
        channels: ['email', 'push'],
        variables: ['discountPercent', 'offerCode', 'expiryDate', 'upgradeLink'],
        popular: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'system-maintenance',
        name: 'System Maintenance Notice',
        description: 'Notify about scheduled maintenance',
        type: 'warning',
        category: 'system',
        subject: 'Scheduled Maintenance: {{maintenanceDate}}',
        content: 'We\'ll be performing system maintenance on {{maintenanceDate}} from {{startTime}} to {{endTime}}.',
        channels: ['email', 'in-app'],
        variables: ['maintenanceDate', 'startTime', 'endTime', 'duration'],
        popular: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'payment-failed',
        name: 'Payment Failed Alert',
        description: 'Alert when payment processing fails',
        type: 'error',
        category: 'transactional',
        subject: 'Payment Failed - Action Required',
        content: 'We couldn\'t process your payment for {{salonName}}. Please update your payment method.',
        channels: ['email', 'push', 'in-app'],
        variables: ['salonName', 'amount', 'failureReason', 'updateLink'],
        popular: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    // Only drop notification_templates table
    await queryInterface.dropTable('notification_templates');
  }
};