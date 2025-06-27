import { NextRequest, NextResponse } from 'next/server';

// Demo subscription data
const subscriptions = [
  {
    id: '1',
    salonId: '1',
    salonName: 'Luxe Hair Studio',
    ownerId: '3',
    ownerName: 'Maria Rodriguez',
    ownerEmail: 'maria@luxehair.com',
    plan: 'Premium',
    status: 'active',
    startDate: '2024-01-15',
    nextBillingDate: '2024-07-15',
    amount: 99.99,
    billingCycle: 'monthly',
    features: [
      'Unlimited bookings',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'Marketing tools',
      'Multi-location support',
      'Staff management',
      'Inventory tracking'
    ],
    usage: {
      bookings: 156,
      bookingsLimit: 'unlimited',
      staff: 8,
      staffLimit: 'unlimited',
      locations: 2,
      locationsLimit: 'unlimited'
    },
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025
    },
    billingHistory: [
      {
        id: 'inv_001',
        date: '2024-06-15',
        amount: 99.99,
        status: 'paid',
        description: 'Premium Plan - Monthly'
      },
      {
        id: 'inv_002',
        date: '2024-05-15',
        amount: 99.99,
        status: 'paid',
        description: 'Premium Plan - Monthly'
      },
      {
        id: 'inv_003',
        date: '2024-04-15',
        amount: 99.99,
        status: 'paid',
        description: 'Premium Plan - Monthly'
      }
    ]
  },
  {
    id: '2',
    salonId: '4',
    salonName: 'Luxe Hair Downtown',
    ownerId: '3',
    ownerName: 'Maria Rodriguez',
    ownerEmail: 'maria@luxehair.com',
    plan: 'Standard',
    status: 'active',
    startDate: '2024-02-01',
    nextBillingDate: '2024-07-01',
    amount: 49.99,
    billingCycle: 'monthly',
    features: [
      'Up to 500 bookings/month',
      'Basic analytics',
      'Email support',
      'Online booking',
      'Customer management',
      'Basic reporting'
    ],
    usage: {
      bookings: 89,
      bookingsLimit: 500,
      staff: 4,
      staffLimit: 10,
      locations: 1,
      locationsLimit: 1
    },
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025
    },
    billingHistory: [
      {
        id: 'inv_004',
        date: '2024-06-01',
        amount: 49.99,
        status: 'paid',
        description: 'Standard Plan - Monthly'
      },
      {
        id: 'inv_005',
        date: '2024-05-01',
        amount: 49.99,
        status: 'paid',
        description: 'Standard Plan - Monthly'
      }
    ]
  },
  {
    id: '3',
    salonId: '2',
    salonName: 'Urban Cuts',
    ownerId: '4',
    ownerName: 'David Chen',
    ownerEmail: 'david@urbancuts.com',
    plan: 'Standard',
    status: 'active',
    startDate: '2024-02-20',
    nextBillingDate: '2024-07-20',
    amount: 49.99,
    billingCycle: 'monthly',
    features: [
      'Up to 500 bookings/month',
      'Basic analytics',
      'Email support',
      'Online booking',
      'Customer management',
      'Basic reporting'
    ],
    usage: {
      bookings: 134,
      bookingsLimit: 500,
      staff: 6,
      staffLimit: 10,
      locations: 1,
      locationsLimit: 1
    },
    paymentMethod: {
      type: 'card',
      last4: '5555',
      brand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2026
    },
    billingHistory: [
      {
        id: 'inv_006',
        date: '2024-06-20',
        amount: 49.99,
        status: 'paid',
        description: 'Standard Plan - Monthly'
      }
    ]
  },
  {
    id: '4',
    salonId: '6',
    salonName: 'Hair Empire - Austin',
    ownerId: '11',
    ownerName: 'Robert Wilson',
    ownerEmail: 'robert@hairempire.com',
    plan: 'Premium',
    status: 'active',
    startDate: '2024-01-20',
    nextBillingDate: '2024-07-20',
    amount: 99.99,
    billingCycle: 'monthly',
    features: [
      'Unlimited bookings',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'Marketing tools',
      'Multi-location support',
      'Staff management',
      'Inventory tracking'
    ],
    usage: {
      bookings: 198,
      bookingsLimit: 'unlimited',
      staff: 12,
      staffLimit: 'unlimited',
      locations: 3,
      locationsLimit: 'unlimited'
    },
    paymentMethod: {
      type: 'card',
      last4: '1234',
      brand: 'American Express',
      expiryMonth: 3,
      expiryYear: 2027
    },
    billingHistory: [
      {
        id: 'inv_007',
        date: '2024-06-20',
        amount: 99.99,
        status: 'paid',
        description: 'Premium Plan - Monthly'
      }
    ]
  },
  {
    id: '5',
    salonId: '3',
    salonName: 'Style & Grace',
    ownerId: '5',
    ownerName: 'Lisa Thompson',
    ownerEmail: 'lisa@styleandgrace.com',
    plan: 'Basic',
    status: 'trial',
    startDate: '2024-03-10',
    nextBillingDate: '2024-07-10',
    amount: 19.99,
    billingCycle: 'monthly',
    features: [
      'Up to 100 bookings/month',
      'Basic support',
      'Online booking',
      'Customer management'
    ],
    usage: {
      bookings: 0,
      bookingsLimit: 100,
      staff: 2,
      staffLimit: 3,
      locations: 1,
      locationsLimit: 1
    },
    paymentMethod: null,
    billingHistory: []
  }
];

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 19.99,
    yearlyPrice: 199.99,
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
    yearlyPrice: 499.99,
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
    yearlyPrice: 999.99,
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const salonId = searchParams.get('salonId');
    const status = searchParams.get('status');
    const includePlans = searchParams.get('includePlans') === 'true';

    let filteredSubscriptions = subscriptions;

    if (ownerId) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.ownerId === ownerId);
    }

    if (salonId) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.salonId === salonId);
    }

    if (status && status !== 'all') {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.status === status);
    }

    const response: any = {
      subscriptions: filteredSubscriptions,
      total: filteredSubscriptions.length,
      stats: {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.status === 'active').length,
        trial: subscriptions.filter(s => s.status === 'trial').length,
        cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
        totalRevenue: subscriptions
          .filter(s => s.status === 'active')
          .reduce((sum, s) => sum + s.amount, 0),
      }
    };

    if (includePlans) {
      response.plans = plans;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const subscriptionData = await request.json();
    
    // Validate required fields
    const requiredFields = ['salonId', 'plan'];
    for (const field of requiredFields) {
      if (!subscriptionData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create new subscription
    const newSubscription = {
      id: (subscriptions.length + 1).toString(),
      ...subscriptionData,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      billingHistory: [],
    };

    subscriptions.push(newSubscription);

    return NextResponse.json(newSubscription, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}