const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
const config = require('../config/config.json');
const db = require('../models');

// Main seeder function
async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Seed in sequence to avoid race conditions
    await seedUsers();
    await seedSalons();
    await seedSubscriptionPlans();
    await seedSubscriptions();
    
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
    
    // Get salon owners
    const salonOwners = await db.User.findAll({
      where: { role: 'salon' },
      attributes: ['id']
    });
    
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
        services: ['Haircut', 'Hair Color', 'Hair Styling', 'Hair Treatment', 'Beard Trim', 'Eyebrow Threading'],
        hours: {
          monday: '9:00 AM - 8:00 PM',
          tuesday: '9:00 AM - 8:00 PM',
          wednesday: '9:00 AM - 8:00 PM',
          thursday: '9:00 AM - 8:00 PM',
          friday: '9:00 AM - 9:00 PM',
          saturday: '8:00 AM - 9:00 PM',
          sunday: '10:00 AM - 6:00 PM'
        }
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
        services: ['Haircut', 'Beard Trim', 'Hair Styling', 'Shave'],
        hours: {
          monday: '10:00 AM - 7:00 PM',
          tuesday: '10:00 AM - 7:00 PM',
          wednesday: '10:00 AM - 7:00 PM',
          thursday: '10:00 AM - 7:00 PM',
          friday: '10:00 AM - 8:00 PM',
          saturday: '9:00 AM - 8:00 PM',
          sunday: 'Closed'
        }
      }
    ];
    
    await db.Salon.bulkCreate(salons);
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
    // Clean slate - delete existing plans
    await db.SubscriptionPlan.destroy({ where: {} });
    
    // Example subscription plan data
    const plans = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Basic',
        description: 'Perfect for small salons just getting started',
        price: 29.99,
        yearly_price: 299.99,
        billing_period: 'monthly',
        features: [
          'Max staff: 5',
          'Max services: 10',
          'Online booking',
          'Analytics: basic',
          'Support: email',
          'Custom branding: false'
        ],
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Professional',
        description: 'Ideal for growing salons with multiple staff members',
        price: 59.99,
        yearly_price: 599.99,
        billing_period: 'monthly',
        features: [
          'Max staff: 15',
          'Max services: 30',
          'Online booking',
          'Analytics: advanced',
          'Support: 24/7',
          'Custom branding: true'
        ],
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Enterprise',
        description: 'Full-featured solution for large salon chains',
        price: 99.99,
        yearly_price: 999.99,
        billing_period: 'monthly',
        features: [
          'Max staff: unlimited',
          'Max services: unlimited',
          'Online booking',
          'Analytics: premium',
          'Support: dedicated',
          'Custom branding: true'
        ],
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    await db.SubscriptionPlan.bulkCreate(plans, { fields: [
      'id', 'name', 'description', 'price', 'yearly_price', 'billing_period', 'features', 'status', 'created_at', 'updated_at'
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
    // Clean slate - delete existing subscriptions
    await db.Subscription.destroy({ where: {} });
    
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

// Run seeder if called directly
if (require.main === module) {
  seed();
}