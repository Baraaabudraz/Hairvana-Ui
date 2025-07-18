const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
const config = require('../config/config.json');
const db = require('../models');
const { v4: uuidv4 } = require('uuid');

// Main seeder function
async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Seed in sequence to avoid race conditions
    await seedUsers();
    await seedSalons();
    await seedSubscriptionPlans();
    await seedSubscriptions();
    await seedNotificationTemplates();
    // await seedNotifications();
    await seedServices();
    await seedHairstyles();
    await seedSalonServices();
    await seedStaff();
    await seedIntegrationSettings();
    await seedReportTemplates();
  
    
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Seed users
async function seedUsers() {
  console.log('Seeding users...');
  
  try {
  // Clean slate - delete existing data in proper order
    await db.Customer.destroy({ where: {} });
    await db.SalonOwner.destroy({ where: {} });
    await db.User.destroy({ where: {} });
  
  // Hash password for all users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);
  
  // Define users to seed
  const users = [
    {
      id: '00000000-0000-0000-0000-000000000001',
        name: 'Sarah Johnson',
      email: 'superadmin@hairvana.com',
        password_hash: passwordHash,
      phone: '+1 (555) 234-5678',
      role: 'super_admin',
      status: 'active',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      permissions: ['full_access'],
        join_date: new Date('2024-01-01'),
        last_login: new Date(),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
        name: 'John Smith',
      email: 'admin@hairvana.com',
        password_hash: passwordHash,
      phone: '+1 (555) 123-4567',
      role: 'admin',
      status: 'active',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      permissions: ['manage_salons', 'manage_users', 'view_analytics', 'manage_subscriptions'],
        join_date: new Date('2024-01-01'),
        last_login: new Date(),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'maria@luxehair.com',
      name: 'Maria Rodriguez',
      phone: '+1 (555) 345-6789',
      role: 'salon',
      status: 'active',
        join_date: new Date('2024-01-15'),
        last_login: new Date(),
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      password_hash: passwordHash
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      email: 'david@urbancuts.com',
      name: 'David Chen',
      phone: '+1 (555) 456-7890',
      role: 'salon',
      status: 'active',
        join_date: new Date('2024-02-20'),
        last_login: new Date(),
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      password_hash: passwordHash
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      email: 'lisa@styleandgrace.com',
      name: 'Lisa Thompson',
      phone: '+1 (555) 567-8901',
      role: 'salon',
      status: 'pending',
        join_date: new Date('2024-03-10'),
        last_login: new Date(),
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      password_hash: passwordHash
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      email: 'emily.davis@email.com',
      name: 'Emily Davis',
      phone: '+1 (555) 678-9012',
      role: 'user',
      status: 'active',
        join_date: new Date('2024-02-01'),
        last_login: new Date(),
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      password_hash: passwordHash
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      email: 'michael.brown@email.com',
      name: 'Michael Brown',
      phone: '+1 (555) 789-0123',
      role: 'user',
      status: 'active',
        join_date: new Date('2024-03-15'),
        last_login: new Date(),
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      password_hash: passwordHash
    }
  ];
  
  // Insert users
    await db.User.bulkCreate(users);
  
  // Create salon owners records
  const salonOwners = users
    .filter(user => user.role === 'salon')
    .map(user => ({
      user_id: user.id,
      total_salons: 0,
      total_revenue: 0,
      total_bookings: 0
    }));
  
  if (salonOwners.length > 0) {
      await db.SalonOwner.bulkCreate(salonOwners);
  }
  
  // Create customer records
  const customers = users
    .filter(user => user.role === 'user')
    .map(user => ({
      user_id: user.id,
      total_spent: 0,
      total_bookings: 0,
        favorite_services: [],
        created_at: new Date(),
        updated_at: new Date()
    }));
  
  if (customers.length > 0) {
      await db.Customer.bulkCreate(customers);
    }
    
    // After inserting users, create user_settings for each user
    const userSettings = users.map(user => ({
      id: String(uuidv4()), // ensure id is a string
      user_id: user.id,
      department: user.role === 'super_admin' ? 'Administration'
                : user.role === 'admin' ? 'Management'
                : user.role === 'salon' ? 'Salon'
                : 'Customer',
      timezone: 'America/New_York',
      language: 'en',
      bio: `${user.name} - ${user.role}`,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await db.UserSettings.bulkCreate(userSettings);
    console.log(`Seeded ${users.length} user settings successfully.`);
    console.log(`Seeded ${users.length} users successfully.`);
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

// Seed salons
async function seedSalons() {
  console.log('Seeding salons...');
  
  try {
  // Clean slate - delete existing salons
    await db.Salon.destroy({ where: {} });
    // Clean up salon_services join table
    if (db.sequelize.getQueryInterface().bulkDelete) {
      await db.sequelize.getQueryInterface().bulkDelete('salon_services', null, {});
    }
    // Get salon owners
    const salonOwners = await db.User.findAll({
      where: { role: 'salon' },
      attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role']
    });
    // Get all services
    const allServices = await db.Service.findAll();
  // Define salons to seed
  const salons = [
    {
      id: '00000000-0000-0000-0000-000000000001',
        owner_id: salonOwners[0].id,
      name: 'Luxe Hair Studio',
      email: 'contact@luxehair.com',
      phone: '+1 (555) 123-4567',
      address: '123 Rodeo Drive, Beverly Hills, CA 90210',
      location: 'Beverly Hills, CA',
      status: 'active',
        join_date: new Date('2024-01-15'),
      revenue: 12450,
      bookings: 156,
      rating: 4.9,
      hours: {
        monday: '9:00 AM - 8:00 PM',
        tuesday: '9:00 AM - 8:00 PM',
        wednesday: '9:00 AM - 8:00 PM',
        thursday: '9:00 AM - 8:00 PM',
        friday: '9:00 AM - 9:00 PM',
        saturday: '8:00 AM - 9:00 PM',
        sunday: '10:00 AM - 6:00 PM'
      },
        website: 'https://luxehair.com',
        description: 'Premium hair salon offering luxury hair services in Beverly Hills.',
        business_license: 'CA123456789',
      tax_id: '12-3456789',
      images: [
          'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/3993450/pexels-photo-3993450.jpeg?auto=compress&cs=tinysrgb&w=800'
        ]
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
        owner_id: salonOwners[1].id,
      name: 'Urban Cuts',
      email: 'info@urbancuts.com',
      phone: '+1 (555) 234-5678',
        address: '456 Main Street, Los Angeles, CA 90012',
        location: 'Los Angeles, CA',
      status: 'active',
        join_date: new Date('2024-02-20'),
        revenue: 8750,
        bookings: 98,
        rating: 4.7,
      hours: {
        monday: '10:00 AM - 7:00 PM',
        tuesday: '10:00 AM - 7:00 PM',
        wednesday: '10:00 AM - 7:00 PM',
        thursday: '10:00 AM - 7:00 PM',
        friday: '10:00 AM - 8:00 PM',
        saturday: '9:00 AM - 8:00 PM',
        sunday: 'Closed'
      },
        website: 'https://urbancuts.com',
        description: 'Modern hair salon in downtown Los Angeles.',
        business_license: 'CA987654321',
      tax_id: '98-7654321',
      images: [
          'https://images.pexels.com/photos/3993451/pexels-photo-3993451.jpeg?auto=compress&cs=tinysrgb&w=800'
        ]
      }
    ];
    await db.Salon.bulkCreate(salons, {
      fields: [
        'id', 'name', 'email', 'phone', 'address', 'location', 'website', 
        'description', 'business_license', 'tax_id', 'owner_id', 'status', 
        'join_date', 'revenue', 'bookings', 'rating', 'hours', 'images'
      ]
    });
    // Associate each salon with 2 random services
  for (const salon of salons) {
      const salonInstance = await db.Salon.findByPk(salon.id);
      if (salonInstance && allServices.length > 0) {
        // Pick 2 random services for each salon
        const shuffled = allServices.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 2);
        await salonInstance.setServices(selected.map(s => s.id));
      }
    }
    console.log(`Seeded ${salons.length} salons successfully.`);
  } catch (error) {
    console.error('Error seeding salons:', error);
    throw error;
  }
}

// Seed subscription plans
async function seedSubscriptionPlans() {
  console.log('Seeding subscription plans...');
  try {
    // Clean slate - delete existing subscriptions first to avoid foreign key constraint
    await db.Subscription.destroy({ where: {} });
    // Then delete existing plans
    await db.SubscriptionPlan.destroy({ where: {} });
  
    // Plans matching the frontend
  const plans = [
    {
        id: '00000000-0000-0000-0000-000000000001',
      name: 'Basic',
        description: 'Perfect for small salons getting started',
      price: 19.99,
      yearly_price: 199.99,
        billing_period: 'monthly',
      features: [
        'Up to 100 bookings/month',
        'Up to 3 staff members',
        'Basic customer management',
        'Online booking widget',
        'Email support',
        'Basic reporting'
      ],
      limits: {
        bookings: 100,
        staff: 3,
        locations: 1
      },
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: '00000000-0000-0000-0000-000000000002',
      name: 'Standard',
        description: 'Great for growing salons with more features',
      price: 49.99,
      yearly_price: 499.99,
        billing_period: 'monthly',
      features: [
        'Up to 500 bookings/month',
        'Up to 10 staff members',
        'Advanced customer management',
        'Online booking & scheduling',
        'Email & chat support',
        'Advanced reporting',
        'SMS notifications',
        'Inventory management'
      ],
      limits: {
        bookings: 500,
        staff: 10,
        locations: 1
      },
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: '00000000-0000-0000-0000-000000000003',
      name: 'Premium',
        description: 'Complete solution for established salons',
      price: 99.99,
      yearly_price: 999.99,
        billing_period: 'monthly',
      features: [
        'Unlimited bookings',
        'Unlimited staff members',
        'Multi-location support',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'Marketing tools',
        'API access',
        'Staff management',
        'Inventory tracking',
        'Financial reporting'
      ],
      limits: {
        bookings: 'unlimited',
        staff: 'unlimited',
        locations: 'unlimited'
      },
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    await db.SubscriptionPlan.bulkCreate(plans, { fields: [
      'id', 'name', 'description', 'price', 'yearly_price', 'billing_period', 'features', 'limits', 'status', 'created_at', 'updated_at'
    ] });
    console.log(`Seeded ${plans.length} subscription plans successfully.`);
  } catch (error) {
    console.error('Error seeding subscription plans:', error);
    throw error;
  }
}

// Seed subscriptions
async function seedSubscriptions() {
  console.log('Seeding subscriptions...');
  
  try {
    // Subscriptions are already deleted in seedSubscriptionPlans, so no need to delete again
    
    // Get salons and plans
    const salons = await db.Salon.findAll({ attributes: ['id'] });
    const plans = await db.SubscriptionPlan.findAll({ attributes: ['id'] });

    const subscriptions = salons.map((salon, index) => ({
      id: `00000000-0000-0000-0000-00000000000${index + 1}`,
      salon_id: salon.id,
      plan_id: plans[index % plans.length].id,
      status: 'active',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-12-31'),
      billing_period: 'monthly',
      billing_cycle: 'monthly',
      next_billing_date: new Date('2024-04-01'),
      amount: index % plans.length === 0 ? 29.99 : index % plans.length === 1 ? 59.99 : 99.99
    }));
    
    await db.Subscription.bulkCreate(subscriptions);
    console.log(`Seeded ${subscriptions.length} subscriptions successfully.`);
  } catch (error) {
    console.error('Error seeding subscriptions:', error);
    throw error;
  }
}

// Seed notification templates
async function seedNotificationTemplates() {
  console.log('Seeding notification templates...');
  try {
    await db.NotificationTemplate.destroy({ where: {} });
    const templates = [
      {
        name: 'Welcome Email',
        description: 'Send a welcome email to new users',
        type: 'info',
        category: 'system',
        subject: 'Welcome to Hairvana!',
        content: 'Hi {{name}}, welcome to Hairvana! We are excited to have you.',
        channels: ['email'],
        variables: ['name'],
        popular: true
      },
      {
        name: 'Booking Confirmation',
        description: 'Notify users when their booking is confirmed',
        type: 'success',
        category: 'transactional',
        subject: 'Your booking is confirmed',
        content: 'Hi {{name}}, your booking for {{service}} at {{salon}} is confirmed for {{date}}.',
        channels: ['email', 'push', 'in-app'],
        variables: ['name', 'service', 'salon', 'date'],
        popular: true
      },
      {
        name: 'Promotion Alert',
        description: 'Send users a promotional offer',
        type: 'promotion',
        category: 'marketing',
        subject: 'Special Offer Just for You!',
        content: 'Hi {{name}}, enjoy {{discount}} off your next booking. Use code: {{code}}.',
        channels: ['email', 'push'],
        variables: ['name', 'discount', 'code'],
        popular: false
      }
    ];
    await db.NotificationTemplate.bulkCreate(templates);
    console.log(`Seeded ${templates.length} notification templates successfully.`);
  } catch (error) {
    console.error('Error seeding notification templates:', error);
    throw error;
  }
}

// Add the new seeders
async function seedServices() {
  console.log('Seeding services...');
  const seeder = require('./20250707000200-demo-services.js');
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

async function seedHairstyles() {
  console.log('Seeding hairstyles...');
  const seeder = require('./20250707000300-demo-hairstyles.js');
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

async function seedSalonServices() {
  console.log('Seeding salon_services...');
  const seeder = require('./20250707000400-demo-salon-services.js');
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

async function seedStaff() {
  console.log('Seeding staff...');
  const seeder = require('./20250707000500-demo-staff.js');
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

// Seed integration settings
async function seedIntegrationSettings() {
  console.log('Seeding integration settings...');
  const seeder = require('./20250709000100-demo-integration-settings.js');
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

// Seed report templates
async function seedReportTemplates() {
  console.log('Seeding report templates...');
  const seeder = require('./20250703150000-demo-report-templates.js');
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

async function seedNotifications() {
  console.log('Seeding notifications...');
  const seeder = require('./20250709001000-demo-notifications.js');
  await seeder.up(db.sequelize.getQueryInterface(), Sequelize);
}

// Run seeder if called directly
if (require.main === module) {
  seed();
}

module.exports = { seed };