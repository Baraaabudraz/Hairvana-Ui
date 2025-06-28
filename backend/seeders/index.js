const bcrypt = require('bcryptjs');
const { supabase } = require('../lib/supabase');

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
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Seed users
async function seedUsers() {
  console.log('Seeding users...');
  
  // Clean slate - delete existing data in proper order
  await supabase.from('customers').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('salon_owners').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // Hash password for all users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);
  
  // Define users to seed
  const users = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'superadmin@hairvana.com',
      name: 'Sarah Johnson',
      phone: '+1 (555) 234-5678',
      role: 'super_admin',
      status: 'active',
      join_date: new Date('2024-01-01').toISOString(),
      last_login: new Date().toISOString(),
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      permissions: ['full_access'],
      password_hash: passwordHash
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'admin@hairvana.com',
      name: 'John Smith',
      phone: '+1 (555) 123-4567',
      role: 'admin',
      status: 'active',
      join_date: new Date('2024-01-01').toISOString(),
      last_login: new Date().toISOString(),
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      permissions: ['manage_salons', 'manage_users', 'view_analytics', 'manage_subscriptions'],
      password_hash: passwordHash
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'maria@luxehair.com',
      name: 'Maria Rodriguez',
      phone: '+1 (555) 345-6789',
      role: 'salon',
      status: 'active',
      join_date: new Date('2024-01-15').toISOString(),
      last_login: new Date().toISOString(),
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
      join_date: new Date('2024-02-20').toISOString(),
      last_login: new Date().toISOString(),
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
      join_date: new Date('2024-03-10').toISOString(),
      last_login: new Date().toISOString(),
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
      join_date: new Date('2024-02-01').toISOString(),
      last_login: new Date().toISOString(),
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
      join_date: new Date('2024-03-15').toISOString(),
      last_login: new Date().toISOString(),
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      password_hash: passwordHash
    }
  ];
  
  // Insert users
  const { error } = await supabase
    .from('users')
    .insert(users);
  
  if (error) throw error;
  
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
    const { error: ownerError } = await supabase
      .from('salon_owners')
      .insert(salonOwners);
    
    if (ownerError) throw ownerError;
  }
  
  // Create customer records
  const customers = users
    .filter(user => user.role === 'user')
    .map(user => ({
      user_id: user.id,
      total_spent: 0,
      total_bookings: 0,
      favorite_services: []
    }));
  
  if (customers.length > 0) {
    const { error: customerError } = await supabase
      .from('customers')
      .insert(customers);
    
    if (customerError) throw customerError;
  }
  
  console.log(`Seeded ${users.length} users successfully.`);
}

// Seed salons
async function seedSalons() {
  console.log('Seeding salons...');
  
  // Clean slate - delete existing salons
  await supabase.from('salons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // Define salons to seed
  const salons = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Luxe Hair Studio',
      email: 'contact@luxehair.com',
      phone: '+1 (555) 123-4567',
      address: '123 Rodeo Drive, Beverly Hills, CA 90210',
      location: 'Beverly Hills, CA',
      status: 'active',
      join_date: new Date('2024-01-15').toISOString(),
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
      },
      website: 'https://www.luxehair.com',
      description: 'Luxe Hair Studio is a premier destination for hair care and styling in Beverly Hills. We offer a full range of services from cuts and color to treatments and styling, all delivered by our team of expert stylists in a luxurious, relaxing environment.',
      business_license: 'BL123456789',
      tax_id: '12-3456789',
      images: [
        'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
        'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
        'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'
      ],
      owner_id: '00000000-0000-0000-0000-000000000003',
      owner_name: 'Maria Rodriguez',
      owner_email: 'maria@luxehair.com'
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Urban Cuts',
      email: 'info@urbancuts.com',
      phone: '+1 (555) 234-5678',
      address: '456 Broadway, Manhattan, NY 10013',
      location: 'Manhattan, NY',
      status: 'active',
      join_date: new Date('2024-02-20').toISOString(),
      revenue: 9820,
      bookings: 134,
      rating: 4.8,
      services: ['Haircut', 'Beard Trim', 'Styling'],
      hours: {
        monday: '10:00 AM - 7:00 PM',
        tuesday: '10:00 AM - 7:00 PM',
        wednesday: '10:00 AM - 7:00 PM',
        thursday: '10:00 AM - 7:00 PM',
        friday: '10:00 AM - 8:00 PM',
        saturday: '9:00 AM - 8:00 PM',
        sunday: 'Closed'
      },
      website: 'https://www.urbancuts.com',
      description: 'Urban Cuts is a modern barbershop in the heart of Manhattan. We specialize in contemporary men\'s haircuts, beard trims, and styling services in a relaxed, urban environment.',
      business_license: 'BL987654321',
      tax_id: '98-7654321',
      images: [
        'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
        'https://images.pexels.com/photos/897262/pexels-photo-897262.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'
      ],
      owner_id: '00000000-0000-0000-0000-000000000004',
      owner_name: 'David Chen',
      owner_email: 'david@urbancuts.com'
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Style & Grace',
      email: 'hello@styleandgrace.com',
      phone: '+1 (555) 345-6789',
      address: '789 Ocean Drive, Miami, FL 33139',
      location: 'Miami, FL',
      status: 'pending',
      join_date: new Date('2024-03-10').toISOString(),
      revenue: 0,
      bookings: 0,
      rating: 0,
      services: ['Haircut', 'Hair Color', 'Styling'],
      hours: {
        monday: '9:00 AM - 7:00 PM',
        tuesday: '9:00 AM - 7:00 PM',
        wednesday: '9:00 AM - 7:00 PM',
        thursday: '9:00 AM - 7:00 PM',
        friday: '9:00 AM - 8:00 PM',
        saturday: '8:00 AM - 8:00 PM',
        sunday: '10:00 AM - 5:00 PM'
      },
      website: 'https://www.styleandgrace.com',
      description: 'Style & Grace is a boutique salon in Miami offering personalized hair services in a chic, beachy atmosphere. Our focus is on creating styles that enhance your natural beauty and fit your lifestyle.',
      business_license: 'BL567891234',
      tax_id: '56-7891234',
      images: [
        'https://images.pexels.com/photos/3992870/pexels-photo-3992870.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
        'https://images.pexels.com/photos/3993323/pexels-photo-3993323.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'
      ],
      owner_id: '00000000-0000-0000-0000-000000000005',
      owner_name: 'Lisa Thompson',
      owner_email: 'lisa@styleandgrace.com'
    }
  ];
  
  // Insert salons
  const { error } = await supabase
    .from('salons')
    .insert(salons);
  
  if (error) throw error;
  
  // Update salon owner stats
  for (const salon of salons) {
    if (salon.status === 'active') {
      const { data: owner, error: ownerError } = await supabase
        .from('salon_owners')
        .select('*')
        .eq('user_id', salon.owner_id)
        .single();
      
      if (ownerError) throw ownerError;
      
      if (owner) {
        const { error: updateError } = await supabase
          .from('salon_owners')
          .update({
            total_salons: owner.total_salons + 1,
            total_revenue: owner.total_revenue + salon.revenue,
            total_bookings: owner.total_bookings + salon.bookings
          })
          .eq('user_id', salon.owner_id);
        
        if (updateError) throw updateError;
      }
    }
  }
  
  console.log(`Seeded ${salons.length} salons successfully.`);
}

// Seed subscription plans
async function seedSubscriptionPlans() {
  console.log('Seeding subscription plans...');
  
  // Define subscription plans
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 19.99,
      yearly_price: 199.99,
      description: 'Perfect for small salons getting started',
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
      popular: false
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 49.99,
      yearly_price: 499.99,
      description: 'Great for growing salons with more features',
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
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99.99,
      yearly_price: 999.99,
      description: 'Complete solution for established salons',
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
      popular: false
    }
  ];
  
  // Check if plans already exist
  const { data: existingPlans } = await supabase
    .from('subscription_plans')
    .select('id');
  
  if (existingPlans && existingPlans.length > 0) {
    console.log(`Found ${existingPlans.length} existing subscription plans, skipping plan seeding.`);
    return;
  }
  
  // Insert plans
  const { error } = await supabase
    .from('subscription_plans')
    .insert(plans);
  
  if (error) throw error;
  
  console.log(`Seeded ${plans.length} subscription plans successfully.`);
}

// Seed subscriptions
async function seedSubscriptions() {
  console.log('Seeding subscriptions...');
  
  // Define subscriptions
  const subscriptions = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      salon_id: '00000000-0000-0000-0000-000000000001',
      plan_id: 'premium',
      status: 'active',
      start_date: new Date('2024-01-15').toISOString(),
      next_billing_date: new Date('2024-07-15').toISOString(),
      amount: 99.99,
      billing_cycle: 'monthly',
      usage: {
        bookings: 156,
        bookingsLimit: 'unlimited',
        staff: 8,
        staffLimit: 'unlimited',
        locations: 2,
        locationsLimit: 'unlimited'
      },
      payment_method: {
        type: 'card',
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2025
      }
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      salon_id: '00000000-0000-0000-0000-000000000002',
      plan_id: 'standard',
      status: 'active',
      start_date: new Date('2024-02-20').toISOString(),
      next_billing_date: new Date('2024-07-20').toISOString(),
      amount: 49.99,
      billing_cycle: 'monthly',
      usage: {
        bookings: 134,
        bookingsLimit: 500,
        staff: 6,
        staffLimit: 10,
        locations: 1,
        locationsLimit: 1
      },
      payment_method: {
        type: 'card',
        last4: '5555',
        brand: 'Mastercard',
        expiryMonth: 8,
        expiryYear: 2026
      }
    }
  ];
  
  // Check if subscriptions already exist
  const { data: existingSubscriptions } = await supabase
    .from('subscriptions')
    .select('id');
  
  if (existingSubscriptions && existingSubscriptions.length > 0) {
    console.log(`Found ${existingSubscriptions.length} existing subscriptions, skipping subscription seeding.`);
    return;
  }
  
  // Insert subscriptions
  const { error } = await supabase
    .from('subscriptions')
    .insert(subscriptions);
  
  if (error) throw error;
  
  // Create billing history
  const billingHistory = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      subscription_id: '00000000-0000-0000-0000-000000000001',
      date: new Date('2024-06-15').toISOString(),
      amount: 99.99,
      status: 'paid',
      description: 'Premium Plan - Monthly',
      invoice_number: 'INV-2024-001',
      tax_amount: 8.00,
      subtotal: 91.99
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      subscription_id: '00000000-0000-0000-0000-000000000001',
      date: new Date('2024-05-15').toISOString(),
      amount: 99.99,
      status: 'paid',
      description: 'Premium Plan - Monthly',
      invoice_number: 'INV-2024-002',
      tax_amount: 8.00,
      subtotal: 91.99
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      subscription_id: '00000000-0000-0000-0000-000000000002',
      date: new Date('2024-06-20').toISOString(),
      amount: 49.99,
      status: 'paid',
      description: 'Standard Plan - Monthly',
      invoice_number: 'INV-2024-003',
      tax_amount: 4.00,
      subtotal: 45.99
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      subscription_id: '00000000-0000-0000-0000-000000000002',
      date: new Date('2024-05-20').toISOString(),
      amount: 49.99,
      status: 'paid',
      description: 'Standard Plan - Monthly',
      invoice_number: 'INV-2024-004',
      tax_amount: 4.00,
      subtotal: 45.99
    }
  ];
  
  // Check if billing history already exists
  const { data: existingBilling } = await supabase
    .from('billing_history')
    .select('id');
  
  if (existingBilling && existingBilling.length > 0) {
    console.log(`Found ${existingBilling.length} existing billing records, skipping billing history seeding.`);
    return;
  }
  
  // Insert billing history
  const { error: billingError } = await supabase
    .from('billing_history')
    .insert(billingHistory);
  
  if (billingError) throw billingError;
  
  console.log(`Seeded ${subscriptions.length} subscriptions and ${billingHistory.length} billing records successfully.`);
}

// Export the seed function
module.exports = { seed };