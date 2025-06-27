import { NextRequest, NextResponse } from 'next/server';

// Demo users data - Updated to reflect one-to-many relationship
const users = [
  // Admin Users
  {
    id: '1',
    name: 'John Smith',
    email: 'admin@hairvana.com',
    phone: '+1 (555) 123-4567',
    role: 'admin',
    status: 'active',
    joinDate: '2024-01-01',
    lastLogin: '2024-06-15T10:30:00Z',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    permissions: ['manage_salons', 'manage_users', 'view_analytics', 'manage_subscriptions'],
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'superadmin@hairvana.com',
    phone: '+1 (555) 234-5678',
    role: 'super_admin',
    status: 'active',
    joinDate: '2024-01-01',
    lastLogin: '2024-06-15T09:15:00Z',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    permissions: ['full_access'],
  },
  
  // Salon Owner Users (One owner can have multiple salons)
  {
    id: '3',
    name: 'Maria Rodriguez',
    email: 'maria@luxehair.com',
    phone: '+1 (555) 345-6789',
    role: 'salon',
    status: 'active',
    joinDate: '2024-01-15',
    lastLogin: '2024-06-15T14:20:00Z',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    // This owner has multiple salons
    salons: [
      {
        id: '1',
        name: 'Luxe Hair Studio',
        location: 'Beverly Hills, CA',
        subscription: 'Premium',
        bookingsCount: 156,
        revenue: 12450,
        status: 'active'
      },
      {
        id: '4',
        name: 'Luxe Hair Downtown',
        location: 'Downtown LA, CA',
        subscription: 'Standard',
        bookingsCount: 89,
        revenue: 7800,
        status: 'active'
      }
    ],
    totalSalons: 2,
    totalRevenue: 20250,
    totalBookings: 245,
  },
  {
    id: '4',
    name: 'David Chen',
    email: 'david@urbancuts.com',
    phone: '+1 (555) 456-7890',
    role: 'salon',
    status: 'active',
    joinDate: '2024-02-20',
    lastLogin: '2024-06-15T11:45:00Z',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    // This owner has one salon
    salons: [
      {
        id: '2',
        name: 'Urban Cuts',
        location: 'Manhattan, NY',
        subscription: 'Standard',
        bookingsCount: 134,
        revenue: 9820,
        status: 'active'
      }
    ],
    totalSalons: 1,
    totalRevenue: 9820,
    totalBookings: 134,
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    email: 'lisa@styleandgrace.com',
    phone: '+1 (555) 567-8901',
    role: 'salon',
    status: 'pending',
    joinDate: '2024-03-10',
    lastLogin: '2024-06-14T16:30:00Z',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    // This owner has multiple salons but they're pending
    salons: [
      {
        id: '3',
        name: 'Style & Grace',
        location: 'Miami, FL',
        subscription: 'Basic',
        bookingsCount: 0,
        revenue: 0,
        status: 'pending'
      },
      {
        id: '5',
        name: 'Style & Grace Spa',
        location: 'Miami Beach, FL',
        subscription: 'Premium',
        bookingsCount: 0,
        revenue: 0,
        status: 'pending'
      }
    ],
    totalSalons: 2,
    totalRevenue: 0,
    totalBookings: 0,
  },
  {
    id: '11',
    name: 'Robert Wilson',
    email: 'robert@hairempire.com',
    phone: '+1 (555) 111-2222',
    role: 'salon',
    status: 'active',
    joinDate: '2024-01-10',
    lastLogin: '2024-06-15T16:45:00Z',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    // This owner has multiple salons across different cities
    salons: [
      {
        id: '6',
        name: 'Hair Empire - Austin',
        location: 'Austin, TX',
        subscription: 'Premium',
        bookingsCount: 198,
        revenue: 15600,
        status: 'active'
      },
      {
        id: '7',
        name: 'Hair Empire - Dallas',
        location: 'Dallas, TX',
        subscription: 'Premium',
        bookingsCount: 167,
        revenue: 13200,
        status: 'active'
      },
      {
        id: '8',
        name: 'Hair Empire - Houston',
        location: 'Houston, TX',
        subscription: 'Standard',
        bookingsCount: 145,
        revenue: 11800,
        status: 'active'
      }
    ],
    totalSalons: 3,
    totalRevenue: 40600,
    totalBookings: 510,
  },
  
  // Regular Users
  {
    id: '6',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 678-9012',
    role: 'user',
    status: 'active',
    joinDate: '2024-02-01',
    lastLogin: '2024-06-15T13:20:00Z',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    bookingsCount: 12,
    totalSpent: 850,
    favoriteServices: ['Haircut', 'Hair Color'],
  },
  {
    id: '7',
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    phone: '+1 (555) 789-0123',
    role: 'user',
    status: 'active',
    joinDate: '2024-03-15',
    lastLogin: '2024-06-15T08:45:00Z',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    bookingsCount: 8,
    totalSpent: 420,
    favoriteServices: ['Haircut', 'Beard Trim'],
  },
  {
    id: '8',
    name: 'Jessica Wilson',
    email: 'jessica.wilson@email.com',
    phone: '+1 (555) 890-1234',
    role: 'user',
    status: 'suspended',
    joinDate: '2024-01-20',
    lastLogin: '2024-06-10T15:30:00Z',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    bookingsCount: 5,
    totalSpent: 275,
    favoriteServices: ['Hair Styling'],
    suspensionReason: 'Inappropriate behavior reported',
  },
  {
    id: '9',
    name: 'Robert Taylor',
    email: 'robert.taylor@email.com',
    phone: '+1 (555) 901-2345',
    role: 'user',
    status: 'active',
    joinDate: '2024-04-05',
    lastLogin: '2024-06-15T12:10:00Z',
    avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    bookingsCount: 15,
    totalSpent: 1200,
    favoriteServices: ['Haircut', 'Hair Treatment', 'Massage'],
  },
  {
    id: '10',
    name: 'Amanda Garcia',
    email: 'amanda.garcia@email.com',
    phone: '+1 (555) 012-3456',
    role: 'user',
    status: 'active',
    joinDate: '2024-05-12',
    lastLogin: '2024-06-15T17:25:00Z',
    avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    bookingsCount: 6,
    totalSpent: 380,
    favoriteServices: ['Hair Color', 'Hair Styling', 'Manicure'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let filteredUsers = users;

    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    if (status && status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    if (search) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.role === 'salon' && user.salons?.some(salon => 
          salon.name.toLowerCase().includes(search.toLowerCase())
        ))
      );
    }

    return NextResponse.json({
      users: filteredUsers,
      total: filteredUsers.length,
      stats: {
        total: users.length,
        admin: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
        salon: users.filter(u => u.role === 'salon').length,
        user: users.filter(u => u.role === 'user').length,
        active: users.filter(u => u.status === 'active').length,
        pending: users.filter(u => u.status === 'pending').length,
        suspended: users.filter(u => u.status === 'suspended').length,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'role'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      ...userData,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: null,
      // Initialize salon owner specific fields
      ...(userData.role === 'salon' ? {
        salons: [],
        totalSalons: 0,
        totalRevenue: 0,
        totalBookings: 0,
      } : {}),
    };

    users.push(newUser);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}