const bcrypt = require("bcryptjs");
const { Sequelize } = require("sequelize");
const config = require("../config/config.json");
const db = require("../models");
const { v4: uuidv4 } = require("uuid");

// Main seeder function
async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Seed roles and permissions first
    await seedRoles();
    await seedPermissions();
    // Seed addresses before users and salons
    await seedAddresses();
    // Seed in sequence to avoid race conditions
    await seedUsers();
    await seedSalons();
    await seedSubscriptionPlans();
    await seedSubscriptions();
    await seedNotificationTemplates();
    await seedServices();
    await seedHairstyles();
    await seedSalonServices();
    await seedStaff();
    await seedIntegrationSettings();
    await seedReportTemplates();
    await seedOwnerDocuments();
    // await seedReviews(); // Temporarily disabled
    await seedBillingSettings();
    await seedSecuritySettings();
    await seedPlatformSettings();
    await seedBackupSettings();
    await seedNotificationPreferences();
    await seedMobileDevices();
    await seedBillingHistories();
    await seedNotificationUsers();
    // await seedNotifications(); // Uncomment if needed
  
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Seed users
async function seedUsers() {
  console.log("Seeding users...");

  try {
    // Clean slate - delete existing data in proper order
    await db.Customer.destroy({ where: {} });
    await db.SalonOwner.destroy({ where: {} });
    await db.User.destroy({ where: {} });

    // Hash password for all users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("admin123", salt);

    // Fetch role IDs
    const roles = await db.Role.findAll();
    const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));
    // Define users to seed
    const users = [
      {
        id: "00000000-0000-0000-0000-000000000001",
        name: "Super Admin",
        email: "superadmin@hairvana.com",
        password_hash: passwordHash,
        phone: "+1 (555) 234-5678",
        role_id: roleMap["super admin"],
        status: "active",
        avatar:
          "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
        join_date: new Date("2024-01-01"),
        last_login: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        name: "Admin User",
        email: "admin@hairvana.com",
        password_hash: passwordHash,
        phone: "+1 (555) 123-4567",
        role_id: roleMap["admin"],
        status: "active",
        avatar:
          "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
        join_date: new Date("2024-01-01"),
        last_login: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "00000000-0000-0000-0000-000000000003",
        email: "sarah@beautysalon.com",
        name: "Sarah Johnson",
        phone: "+1 (555) 345-6789",
        role_id: roleMap["salon owner"],
        status: "active",
        join_date: new Date("2024-01-15"),
        last_login: new Date(),
        avatar:
          "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
        password_hash: passwordHash,
      },
      {
        id: "00000000-0000-0000-0000-000000000004",
        email: "michael@stylehub.com",
        name: "Michael Chen",
        phone: "+1 (555) 456-7890",
        role_id: roleMap["salon owner"],
        status: "active",
        join_date: new Date("2024-02-20"),
        last_login: new Date(),
        avatar:
          "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
        password_hash: passwordHash,
      },
      {
        id: "00000000-0000-0000-0000-000000000005",
        email: "emma@glamourcuts.com",
        name: "Emma Rodriguez",
        phone: "+1 (555) 567-8901",
        role_id: roleMap["salon owner"],
        status: "active",
        join_date: new Date("2024-03-10"),
        last_login: new Date(),
        avatar:
          "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
        password_hash: passwordHash,
      },
      {
        id: "00000000-0000-0000-0000-000000000006",
        email: "john.smith@email.com",
        name: "John Smith",
        phone: "+1 (555) 678-9012",
        role_id: roleMap["customer"],
        status: "active",
        join_date: new Date("2024-02-01"),
        last_login: new Date(),
        avatar:
          "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
        password_hash: passwordHash,
      },
      {
        id: "00000000-0000-0000-0000-000000000007",
        email: "lisa.davis@email.com",
        name: "Lisa Davis",
        phone: "+1 (555) 789-0123",
        role_id: roleMap["customer"],
        status: "active",
        join_date: new Date("2024-03-15"),
        last_login: new Date(),
        avatar:
          "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
        password_hash: passwordHash,
      },
    ];

    // Insert users
    await db.User.bulkCreate(users);

    // Create salon owners records
    const salonOwners = users
      .filter((user) => user.role_id === roleMap["salon owner"])
      .map((user) => ({
        user_id: user.id,
        total_salons: 0,
        total_revenue: 0,
        total_bookings: 0,
      }));

    if (salonOwners.length > 0) {
      await db.SalonOwner.bulkCreate(salonOwners);
    }

    // Create customer records
    const customers = users
      .filter((user) => user.role_id === roleMap["customer"])
      .map((user) => ({
        user_id: user.id,
        total_spent: 0,
        total_bookings: 0,
        favorite_services: [],
        created_at: new Date(),
        updated_at: new Date(),
      }));

    if (customers.length > 0) {
      await db.Customer.bulkCreate(customers);
    }

    // After inserting users, create user_settings for each user
    const userSettings = users.map((user) => ({
      id: String(uuidv4()), // ensure id is a string
      user_id: user.id,
      department:
        user.role_id === roleMap["super_admin"]
          ? "Administration"
          : user.role_id === roleMap["admin"]
          ? "Management"
          : user.role_id === roleMap["salon"]
          ? "Salon"
          : "Customer",
      timezone: "America/New_York",
      language: "en",
      bio: `${user.name} - ${
        user.role_id === roleMap["super_admin"]
          ? "Super Admin"
          : user.role_id === roleMap["admin"]
          ? "Admin"
          : user.role_id === roleMap["salon"]
          ? "Salon"
          : "User"
      }`,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await db.UserSettings.bulkCreate(userSettings);
    console.log(`Seeded ${users.length} user settings successfully.`);
    console.log(`Seeded ${users.length} users successfully.`);
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
}

// Seed salons
async function seedSalons() {
  console.log('Seeding salons...');
  const seeder = require('./20250724000000-demo-salons.js');
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

// Seed subscription plans
async function seedSubscriptionPlans() {
  console.log("Seeding subscription plans...");
  try {
    // Clean slate - delete existing subscriptions first to avoid foreign key constraint
    await db.Subscription.destroy({ where: {} });
    // Then delete existing plans
    await db.SubscriptionPlan.destroy({ where: {} });

    // Plans matching the frontend
    const plans = [
      {
        id: "00000000-0000-0000-0000-000000000001",
        name: "Basic",
        description: "Perfect for small salons getting started",
        price: 19.99,
        yearly_price: 199.99,
        billing_period: "monthly",
        features: [
          "Up to 100 bookings/month",
          "Up to 3 staff members",
          "Basic customer management",
          "Online booking widget",
          "Email support",
          "Basic reporting",
        ],
        limits: {
          bookings: 100,
          staff: 3,
          locations: 1,
        },
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        name: "Standard",
        description: "Great for growing salons with more features",
        price: 49.99,
        yearly_price: 499.99,
        billing_period: "monthly",
        features: [
          "Up to 500 bookings/month",
          "Up to 10 staff members",
          "Advanced customer management",
          "Online booking & scheduling",
          "Email & chat support",
          "Advanced reporting",
          "SMS notifications",
          "Inventory management",
        ],
        limits: {
          bookings: 500,
          staff: 10,
          locations: 1,
        },
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "00000000-0000-0000-0000-000000000003",
        name: "Premium",
        description: "Complete solution for established salons",
        price: 99.99,
        yearly_price: 999.99,
        billing_period: "monthly",
        features: [
          "Unlimited bookings",
          "Unlimited staff members",
          "Multi-location support",
          "Advanced analytics",
          "Priority support",
          "Custom branding",
          "Marketing tools",
          "API access",
          "Staff management",
          "Inventory tracking",
          "Financial reporting",
        ],
        limits: {
          bookings: "unlimited",
          staff: "unlimited",
          locations: "unlimited",
        },
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    await db.SubscriptionPlan.bulkCreate(plans, {
      fields: [
        "id",
        "name",
        "description",
        "price",
        "yearly_price",
        "billing_period",
        "features",
        "limits",
        "status",
        "created_at",
        "updated_at",
      ],
    });
    console.log(`Seeded ${plans.length} subscription plans successfully.`);
  } catch (error) {
    console.error("Error seeding subscription plans:", error);
    throw error;
  }
}

// Seed subscriptions
async function seedSubscriptions() {
  console.log("Seeding subscriptions...");

  try {
    // Subscriptions are already deleted in seedSubscriptionPlans, so no need to delete again

    // Get salons and plans
    const salons = await db.Salon.findAll({ attributes: ["id"] });
    const plans = await db.SubscriptionPlan.findAll({ attributes: ["id"] });

    const subscriptions = salons.map((salon, index) => ({
      id: `00000000-0000-0000-0000-00000000000${index + 1}`,
      salonId: salon.id,
      planId: plans[index % plans.length].id,
      status: 'active',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      billingPeriod: 'monthly',
      billingCycle: 'monthly',
      nextBillingDate: new Date('2024-04-01'),
      amount: index % plans.length === 0 ? 29.99 : index % plans.length === 1 ? 59.99 : 99.99
    }));

    await db.Subscription.bulkCreate(subscriptions);
    console.log(`Seeded ${subscriptions.length} subscriptions successfully.`);
  } catch (error) {
    console.error("Error seeding subscriptions:", error);
    throw error;
  }
}

// Seed notification templates
async function seedNotificationTemplates() {
  console.log("Seeding notification templates...");
  try {
    await db.NotificationTemplate.destroy({ where: {} });
    const templates = [
      {
        name: "Welcome Email",
        description: "Send a welcome email to new users",
        type: "info",
        category: "system",
        subject: "Welcome to Hairvana!",
        content:
          "Hi {{name}}, welcome to Hairvana! We are excited to have you.",
        channels: ["email"],
        variables: ["name"],
        popular: true,
      },
      {
        name: "Booking Confirmation",
        description: "Notify users when their booking is confirmed",
        type: "success",
        category: "transactional",
        subject: "Your booking is confirmed",
        content:
          "Hi {{name}}, your booking for {{service}} at {{salon}} is confirmed for {{date}}.",
        channels: ["email", "push", "in-app"],
        variables: ["name", "service", "salon", "date"],
        popular: true,
      },
      {
        name: "Promotion Alert",
        description: "Send users a promotional offer",
        type: "promotion",
        category: "marketing",
        subject: "Special Offer Just for You!",
        content:
          "Hi {{name}}, enjoy {{discount}} off your next booking. Use code: {{code}}.",
        channels: ["email", "push"],
        variables: ["name", "discount", "code"],
        popular: false,
      },
    ];
    await db.NotificationTemplate.bulkCreate(templates);
    console.log(
      `Seeded ${templates.length} notification templates successfully.`
    );
  } catch (error) {
    console.error("Error seeding notification templates:", error);
    throw error;
  }
}

// Add the new seeders
async function seedRoles() {
  console.log("Seeding roles...");
  const seeder = require("./20250710192000-seed-roles.js");
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

async function seedPermissions() {
  console.log("Seeding permissions...");
  const seeder = require("./20250710193000-seed-permissions.js");
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

async function seedAddresses() {
  console.log("Seeding addresses...");
  const seeder = require("./20250724000001-demo-addresses.js");
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

async function seedServices() {
  console.log("Seeding services...");
  const seeder = require("./20250707000200-demo-services.js");
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

async function seedHairstyles() {
  console.log("Seeding hairstyles...");
  const seeder = require("./20250707000300-demo-hairstyles.js");
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

async function seedSalonServices() {
  console.log("Seeding salon_services...");
  const seeder = require("./20250707000400-demo-salon-services.js");
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

async function seedStaff() {
  console.log("Seeding staff...");
  const seeder = require("./20250707000500-demo-staff.js");
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

// Seed integration settings
async function seedIntegrationSettings() {
  console.log("Seeding integration settings...");
  const seeder = require("./20250709000100-demo-integration-settings.js");
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

// Seed report templates
async function seedReportTemplates() {
  console.log('Seeding report templates...');
  const seeder = require('./20250703150000-demo-report-templates.js');
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

// New seeder functions for latest models
async function seedOwnerDocuments() {
  console.log('Seeding owner documents...');
  try {
    await db.OwnerDocument.destroy({ where: {} });
    
    // Get salon owner role ID first
    const salonOwnerRole = await db.Role.findOne({ where: { name: 'salon owner' } });
    if (!salonOwnerRole) {
      console.log('Salon owner role not found, skipping owner documents seeding');
      return;
    }
    
    const salonOwners = await db.User.findAll({
      where: { role_id: salonOwnerRole.id },
      attributes: ['id']
    });

    const ownerDocuments = salonOwners.map(owner => ({
      id: uuidv4(),
      owner_id: owner.id,
      commercial_registration_url: 'https://example.com/commercial-registration.pdf',
      certificate_url: 'https://example.com/certificate.pdf',
      additional_info: 'Additional business information and documentation.',
      created_at: new Date(),
      updated_at: new Date()
    }));

    await db.OwnerDocument.bulkCreate(ownerDocuments);
    console.log(`Seeded ${ownerDocuments.length} owner documents successfully.`);
  } catch (error) {
    console.error('Error seeding owner documents:', error);
    throw error;
  }
}

async function seedReviews() {
  console.log('Seeding reviews...');
  try {
    await db.Review.destroy({ where: {} });
    
    // Get user role ID first
    const userRole = await db.Role.findOne({ where: { name: 'user' } });
    if (!userRole) {
      console.log('User role not found, skipping reviews seeding');
      return;
    }
    
    const users = await db.User.findAll({
      where: { role_id: userRole.id },
      attributes: ['id']
    });
    
    const salons = await db.Salon.findAll({
      attributes: ['id']
    });

    const reviews = [
      {
        id: uuidv4(),
        user_id: users[0].id,
        salon_id: salons[0].id,
        appointment_id: null,
        rating: 5,
        title: 'Excellent Service!',
        comment: 'Amazing haircut and great customer service. Highly recommend!',
        service_quality: 5,
        created_at: new Date('2024-03-15'),
        updated_at: new Date('2024-03-15')
      },
      {
        id: uuidv4(),
        user_id: users[1].id,
        salon_id: salons[1].id,
        appointment_id: null,
        rating: 4,
        title: 'Good Experience',
        comment: 'Nice salon with professional staff. Will visit again.',
        service_quality: 4,
        created_at: new Date('2024-03-10'),
        updated_at: new Date('2024-03-10')
      },
      {
        id: uuidv4(),
        user_id: users[0].id,
        salon_id: salons[1].id,
        appointment_id: null,
        rating: 5,
        title: 'Outstanding!',
        comment: 'Best haircut I\'ve ever had. The stylist was very skilled.',
        service_quality: 5,
        created_at: new Date('2024-03-05'),
        updated_at: new Date('2024-03-05')
      }
    ];

    await db.Review.bulkCreate(reviews);
    console.log(`Seeded ${reviews.length} reviews successfully.`);
  } catch (error) {
    console.error('Error seeding reviews:', error);
    throw error;
  }
}

async function seedBillingSettings() {
  console.log('Seeding billing settings...');
  try {
    await db.BillingSettings.destroy({ where: {} });
    
    // Get salon owner role ID first
    const salonOwnerRole = await db.Role.findOne({ where: { name: 'salon owner' } });
    if (!salonOwnerRole) {
      console.log('Salon owner role not found, skipping billing settings seeding');
      return;
    }
    
    const users = await db.User.findAll({
      where: { role_id: salonOwnerRole.id },
      attributes: ['id']
    });

    const billingSettings = users.map(user => ({
      id: uuidv4(),
      user_id: user.id,
      default_payment_method: 'credit_card',
      billing_address: '123 Business St, City, State 12345',
      tax_id: '12-3456789',
      invoice_email: `billing@${user.id}.com`,
      auto_pay: true,
      payment_methods: {
        credit_card: {
          last4: '1234',
          brand: 'visa',
          exp_month: 12,
          exp_year: 2025
        }
      },
      created_at: new Date(),
      updated_at: new Date()
    }));

    await db.BillingSettings.bulkCreate(billingSettings);
    console.log(`Seeded ${billingSettings.length} billing settings successfully.`);
  } catch (error) {
    console.error('Error seeding billing settings:', error);
    throw error;
  }
}

async function seedSecuritySettings() {
  console.log('Seeding security settings...');
  try {
    await db.SecuritySettings.destroy({ where: {} });
    
    const users = await db.User.findAll({
      attributes: ['id']
    });

    const securitySettings = users.map(user => ({
      id: uuidv4(),
      user_id: user.id,
      two_factor_enabled: false,
      password_last_changed: new Date('2024-01-01'),
      login_attempts: 0,
      last_login_ip: '192.168.1.1',
      allowed_ips: ['192.168.1.1', '10.0.0.1'],
      session_timeout: 30,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await db.SecuritySettings.bulkCreate(securitySettings);
    console.log(`Seeded ${securitySettings.length} security settings successfully.`);
  } catch (error) {
    console.error('Error seeding security settings:', error);
    throw error;
  }
}

async function seedPlatformSettings() {
  console.log('Seeding platform settings...');
  try {
    await db.PlatformSettings.destroy({ where: {} });
    
    const platformSettings = [
      {
        id: uuidv4(),
        setting_key: 'maintenance_mode',
        setting_value: 'false',
        setting_type: 'boolean',
        description: 'Enable maintenance mode for the platform',
        category: 'system',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'max_file_size',
        setting_value: '10485760',
        setting_type: 'number',
        description: 'Maximum file upload size in bytes',
        category: 'uploads',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'allowed_file_types',
        setting_value: 'jpg,jpeg,png,pdf,doc,docx',
        setting_type: 'array',
        description: 'Allowed file types for uploads',
        category: 'uploads',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'default_timezone',
        setting_value: 'America/New_York',
        setting_type: 'string',
        description: 'Default timezone for the platform',
        category: 'localization',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await db.PlatformSettings.bulkCreate(platformSettings);
    console.log(`Seeded ${platformSettings.length} platform settings successfully.`);
  } catch (error) {
    console.error('Error seeding platform settings:', error);
    throw error;
  }
}

async function seedBackupSettings() {
  console.log('Seeding backup settings...');
  try {
    await db.BackupSettings.destroy({ where: {} });
    
    const users = await db.User.findAll({
      attributes: ['id']
    });

    const backupSettings = users.map(user => ({
      id: uuidv4(),
      user_id: user.id,
      auto_backup: true,
      backup_frequency: 'daily',
      backup_time: '02:00:00',
      retention_days: 30,
      storage_provider: 'local',
      storage_path: '/backups',
      cloud_credentials: null,
      last_backup: null,
      backup_history: [],
      created_at: new Date(),
      updated_at: new Date()
    }));

    await db.BackupSettings.bulkCreate(backupSettings);
    console.log(`Seeded ${backupSettings.length} backup settings successfully.`);
  } catch (error) {
    console.error('Error seeding backup settings:', error);
    throw error;
  }
}

async function seedNotificationPreferences() {
  console.log('Seeding notification preferences...');
  try {
    await db.NotificationPreferences.destroy({ where: {} });
    
    const users = await db.User.findAll({
      attributes: ['id']
    });

    const notificationPreferences = users.map(user => ({
      id: uuidv4(),
      user_id: user.id,
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      in_app_notifications: true,
      marketing_emails: true,
      booking_reminders: true,
      promotional_offers: false,
      system_updates: true,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await db.NotificationPreferences.bulkCreate(notificationPreferences);
    console.log(`Seeded ${notificationPreferences.length} notification preferences successfully.`);
  } catch (error) {
    console.error('Error seeding notification preferences:', error);
    throw error;
  }
}

async function seedMobileDevices() {
  console.log('Seeding mobile devices...');
  try {
    await db.MobileDevice.destroy({ where: {} });
    
    // Get user role ID first  
    const userRole = await db.Role.findOne({ where: { name: 'user' } });
    if (!userRole) {
      console.log('User role not found, skipping mobile devices seeding');
      return;
    }
    
    const users = await db.User.findAll({
      where: { role_id: userRole.id },
      attributes: ['id']
    });

    const mobileDevices = users.map(user => ({
      id: uuidv4(),
      user_id: user.id,
      device_token: `device_token_${user.id}`,
      device_type: 'ios',
      app_version: '1.0.0',
      os_version: '15.0',
      is_active: true,
      last_used: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }));

    await db.MobileDevice.bulkCreate(mobileDevices);
    console.log(`Seeded ${mobileDevices.length} mobile devices successfully.`);
  } catch (error) {
    console.error('Error seeding mobile devices:', error);
    throw error;
  }
}

async function seedBillingHistories() {
  console.log('Seeding billing histories...');
  const seeder = require('./20250701141000-demo-billing-histories.js');
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

async function seedNotificationUsers() {
  console.log('Seeding notification users...');
  const seeder = require('./20250709130000-demo-notification-users.js');
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

async function seedNotifications() {
  console.log("Seeding notifications...");
  const seeder = require("./20250709001000-demo-notifications.js");
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

// Run seeder if called directly
if (require.main === module) {
  seed();
}

module.exports = { seed };
