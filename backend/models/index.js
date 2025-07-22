'use strict';

const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];

// Create Sequelize instance
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: config.logging
  }
);

// Import model definitions
const User = require('./user');
const Customer = require('./customer');
const SalonOwner = require('./salon_owner');
const Salon = require('./salon');
const SubscriptionPlan = require('./subscription_plan');
const Subscription = require('./subscription');
const Service = require('./service');
const Staff = require('./staff');
const Appointment = require('./appointment');
const Payment = require('./payment');
const AppointmentService = require('./appointment_service');
const Notification = require('./notification');
const NotificationTemplate = require('./notification_template');
const NotificationUser = require('./notification_user');
const UserSettings = require('./user_settings');
const BillingHistory = require('./billing_history');
const BillingSettings = require('./billing_settings');
const ReportTemplate = require('./report_template');
const Report = require('./report');
const Hairstyle = require('./hairstyle');
const SecuritySettings = require('./security_settings');
const IntegrationSettings = require('./integration_settings')(sequelize);
const Review = require('./review');
const MobileDevice = require('./mobile_device');
const OwnerDocument = require('./owner_document');

// Initialize models in dependency order
const models = {
  User: User(sequelize, Sequelize.DataTypes),
  Customer: Customer(sequelize, Sequelize.DataTypes),
  SalonOwner: SalonOwner(sequelize, Sequelize.DataTypes),
  Salon: Salon(sequelize, Sequelize.DataTypes),
  SubscriptionPlan: SubscriptionPlan(sequelize, Sequelize.DataTypes),
  Subscription: Subscription(sequelize, Sequelize.DataTypes),
  Service: Service(sequelize, Sequelize.DataTypes),
  Staff: Staff(sequelize, Sequelize.DataTypes),
  Appointment: Appointment(sequelize, Sequelize.DataTypes),
  Payment: Payment(sequelize, Sequelize.DataTypes),
  AppointmentService: AppointmentService(sequelize, Sequelize.DataTypes),
  Notification: Notification(sequelize, Sequelize.DataTypes),
  NotificationTemplate: NotificationTemplate(sequelize, Sequelize.DataTypes),
  NotificationUser: NotificationUser(sequelize, Sequelize.DataTypes),
  UserSettings: UserSettings(sequelize, Sequelize.DataTypes),
  BillingHistory: BillingHistory(sequelize, Sequelize.DataTypes),
  BillingSettings: BillingSettings(sequelize, Sequelize.DataTypes),
  ReportTemplate: ReportTemplate(sequelize),
  Report: Report(sequelize, Sequelize.DataTypes),
  Hairstyle: Hairstyle(sequelize, Sequelize.DataTypes),
  SecuritySettings: SecuritySettings(sequelize, Sequelize.DataTypes),
  IntegrationSettings: IntegrationSettings,
  Review: Review(sequelize, Sequelize.DataTypes),
  MobileDevice: MobileDevice(sequelize, Sequelize.DataTypes),
  OwnerDocument: OwnerDocument(sequelize, Sequelize.DataTypes)
};

// Initialize associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

// Custom sync function that ensures proper table creation order
async function syncOrdered(options = {}) {
  try {
    console.log('🔄 Starting ordered database sync...');
    
    // Drop all tables first if force is true
    if (options.force) {
      await sequelize.drop();
      console.log('🗑️  All tables dropped');
    }
    
    // Create tables in dependency order
    const tableOrder = [
      'users',
      'salons', 
      'subscription_plans',
      'hairstyles',
      'notification_templates',
      'report_templates',
      'services',
      'staff',
      'subscriptions',
      'appointments',
      'payments',
      'appointment_services',
      'notifications',
      'notification_users',
      'user_settings',
      'billing_histories',
      'billing_settings',
      'reports',
      'security_settings',
      'reviews',
      'owner_documents'
    ];
    
    for (const tableName of tableOrder) {
      const model = Object.values(models).find(m => m.tableName === tableName);
      if (model) {
        await model.sync({ force: false });
        console.log(`✅ Created table: ${tableName}`);
      }
    }
    
    console.log('✅ Database synced successfully with correct table order!');
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    throw error;
  }
}

// Export models and Sequelize instance
module.exports = {
  ...models,
  sequelize,
  Sequelize,
  syncOrdered
};
