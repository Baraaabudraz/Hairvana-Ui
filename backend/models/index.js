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
const Appointment = require('./appointment');
const Notification = require('./notification');
const NotificationTemplate = require('./notification_template');
const UserSettings = require('./user_settings');
const BillingHistory = require('./billing_history');
const BillingSettings = require('./billing_settings');
const ReportTemplate = require('./report_template')(sequelize);
const Report = require('./report');
const Hairstyle = require('./hairstyle');
const Staff = require('./staff');
const Service = require('./service');
const Payment = require('./payment');
const AppointmentService = require('./appointment_service');

// Initialize models
const models = {
  User: User(sequelize, Sequelize.DataTypes),
  Customer: Customer(sequelize, Sequelize.DataTypes),
  SalonOwner: SalonOwner(sequelize, Sequelize.DataTypes),
  Salon: Salon(sequelize, Sequelize.DataTypes),
  SubscriptionPlan: SubscriptionPlan(sequelize, Sequelize.DataTypes),
  Subscription: Subscription(sequelize, Sequelize.DataTypes),
  Appointment: Appointment(sequelize, Sequelize.DataTypes),
  Notification: Notification(sequelize, Sequelize.DataTypes),
  NotificationTemplate: NotificationTemplate(sequelize, Sequelize.DataTypes),
  UserSettings: UserSettings(sequelize, Sequelize.DataTypes),
  BillingHistory: BillingHistory(sequelize, Sequelize.DataTypes),
  BillingSettings: BillingSettings(sequelize, Sequelize.DataTypes),
  ReportTemplate: ReportTemplate,
  Report: Report(sequelize, Sequelize.DataTypes),
  Hairstyle: Hairstyle(sequelize, Sequelize.DataTypes),
  Staff: Staff(sequelize, Sequelize.DataTypes),
  Service: Service(sequelize, Sequelize.DataTypes),
  Payment: Payment(sequelize, Sequelize.DataTypes),
  AppointmentService: AppointmentService(sequelize, Sequelize.DataTypes)
};

// Initialize associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

// Export models and Sequelize instance
module.exports = {
  ...models,
  sequelize,
  Sequelize
};
