import { NextRequest, NextResponse } from 'next/server';

// Demo salon data - Updated to include ownerId reference
const salons = [
  {
    id: '1',
    name: 'Luxe Hair Studio',
    email: 'contact@luxehair.com',
    phone: '+1 (555) 123-4567',
    address: '123 Rodeo Drive, Beverly Hills, CA 90210',
    location: 'Beverly Hills, CA',
    status: 'active',
    subscription: 'Premium',
    joinDate: '2024-01-15',
    revenue: 12450,
    bookings: 156,
    rating: 4.9,
    services: ['Haircut', 'Color', 'Styling', 'Treatment'],
    ownerId: '3', // Maria Rodriguez
    ownerName: 'Maria Rodriguez',
    ownerEmail: 'maria@luxehair.com',
    hours: {
      monday: '9:00 AM - 8:00 PM',
      tuesday: '9:00 AM - 8:00 PM',
      wednesday: '9:00 AM - 8:00 PM',
      thursday: '9:00 AM - 8:00 PM',
      friday: '9:00 AM - 9:00 PM',
      saturday: '8:00 AM - 9:00 PM',
      sunday: '10:00 AM - 6:00 PM',
    },
  },
  {
    id: '2',
    name: 'Urban Cuts',
    email: 'info@urbancuts.com',
    phone: '+1 (555) 234-5678',
    address: '456 Broadway, Manhattan, NY 10013',
    location: 'Manhattan, NY',
    status: 'active',
    subscription: 'Standard',
    joinDate: '2024-02-20',
    revenue: 9820,
    bookings: 134,
    rating: 4.8,
    services: ['Haircut', 'Beard Trim', 'Styling'],
    ownerId: '4', // David Chen
    ownerName: 'David Chen',
    ownerEmail: 'david@urbancuts.com',
    hours: {
      monday: '10:00 AM - 7:00 PM',
      tuesday: '10:00 AM - 7:00 PM',
      wednesday: '10:00 AM - 7:00 PM',
      thursday: '10:00 AM - 7:00 PM',
      friday: '10:00 AM - 8:00 PM',
      saturday: '9:00 AM - 8:00 PM',
      sunday: 'Closed',
    },
  },
  {
    id: '3',
    name: 'Style & Grace',
    email: 'hello@styleandgrace.com',
    phone: '+1 (555) 345-6789',
    address: '789 Ocean Drive, Miami, FL 33139',
    location: 'Miami, FL',
    status: 'pending',
    subscription: 'Basic',
    joinDate: '2024-03-10',
    revenue: 0,
    bookings: 0,
    rating: 0,
    services: ['Haircut', 'Color', 'Styling'],
    ownerId: '5', // Lisa Thompson
    ownerName: 'Lisa Thompson',
    ownerEmail: 'lisa@styleandgrace.com',
    hours: {
      monday: '9:00 AM - 7:00 PM',
      tuesday: '9:00 AM - 7:00 PM',
      wednesday: '9:00 AM - 7:00 PM',
      thursday: '9:00 AM - 7:00 PM',
      friday: '9:00 AM - 8:00 PM',
      saturday: '8:00 AM - 8:00 PM',
      sunday: '10:00 AM - 5:00 PM',
    },
  },
  {
    id: '4',
    name: 'Luxe Hair Downtown',
    email: 'downtown@luxehair.com',
    phone: '+1 (555) 123-4568',
    address: '456 Spring Street, Downtown LA, CA 90013',
    location: 'Downtown LA, CA',
    status: 'active',
    subscription: 'Standard',
    joinDate: '2024-02-01',
    revenue: 7800,
    bookings: 89,
    rating: 4.7,
    services: ['Haircut', 'Color', 'Styling'],
    ownerId: '3', // Maria Rodriguez (same owner as Luxe Hair Studio)
    ownerName: 'Maria Rodriguez',
    ownerEmail: 'maria@luxehair.com',
    hours: {
      monday: '9:00 AM - 8:00 PM',
      tuesday: '9:00 AM - 8:00 PM',
      wednesday: '9:00 AM - 8:00 PM',
      thursday: '9:00 AM - 8:00 PM',
      friday: '9:00 AM - 9:00 PM',
      saturday: '8:00 AM - 9:00 PM',
      sunday: '10:00 AM - 6:00 PM',
    },
  },
  {
    id: '5',
    name: 'Style & Grace Spa',
    email: 'spa@styleandgrace.com',
    phone: '+1 (555) 345-6790',
    address: '321 Collins Avenue, Miami Beach, FL 33139',
    location: 'Miami Beach, FL',
    status: 'pending',
    subscription: 'Premium',
    joinDate: '2024-03-15',
    revenue: 0,
    bookings: 0,
    rating: 0,
    services: ['Haircut', 'Color', 'Styling', 'Spa Services'],
    ownerId: '5', // Lisa Thompson (same owner as Style & Grace)
    ownerName: 'Lisa Thompson',
    ownerEmail: 'lisa@styleandgrace.com',
    hours: {
      monday: '9:00 AM - 8:00 PM',
      tuesday: '9:00 AM - 8:00 PM',
      wednesday: '9:00 AM - 8:00 PM',
      thursday: '9:00 AM - 8:00 PM',
      friday: '9:00 AM - 9:00 PM',
      saturday: '8:00 AM - 9:00 PM',
      sunday: '10:00 AM - 6:00 PM',
    },
  },
  {
    id: '6',
    name: 'Hair Empire - Austin',
    email: 'austin@hairempire.com',
    phone: '+1 (555) 111-2223',
    address: '123 South Congress, Austin, TX 78704',
    location: 'Austin, TX',
    status: 'active',
    subscription: 'Premium',
    joinDate: '2024-01-20',
    revenue: 15600,
    bookings: 198,
    rating: 4.9,
    services: ['Haircut', 'Color', 'Styling', 'Treatment', 'Beard Trim'],
    ownerId: '11', // Robert Wilson
    ownerName: 'Robert Wilson',
    ownerEmail: 'robert@hairempire.com',
    hours: {
      monday: '8:00 AM - 9:00 PM',
      tuesday: '8:00 AM - 9:00 PM',
      wednesday: '8:00 AM - 9:00 PM',
      thursday: '8:00 AM - 9:00 PM',
      friday: '8:00 AM - 10:00 PM',
      saturday: '7:00 AM - 10:00 PM',
      sunday: '9:00 AM - 7:00 PM',
    },
  },
  {
    id: '7',
    name: 'Hair Empire - Dallas',
    email: 'dallas@hairempire.com',
    phone: '+1 (555) 111-2224',
    address: '456 Main Street, Dallas, TX 75201',
    location: 'Dallas, TX',
    status: 'active',
    subscription: 'Premium',
    joinDate: '2024-01-25',
    revenue: 13200,
    bookings: 167,
    rating: 4.8,
    services: ['Haircut', 'Color', 'Styling', 'Treatment'],
    ownerId: '11', // Robert Wilson (same owner)
    ownerName: 'Robert Wilson',
    ownerEmail: 'robert@hairempire.com',
    hours: {
      monday: '8:00 AM - 9:00 PM',
      tuesday: '8:00 AM - 9:00 PM',
      wednesday: '8:00 AM - 9:00 PM',
      thursday: '8:00 AM - 9:00 PM',
      friday: '8:00 AM - 10:00 PM',
      saturday: '7:00 AM - 10:00 PM',
      sunday: '9:00 AM - 7:00 PM',
    },
  },
  {
    id: '8',
    name: 'Hair Empire - Houston',
    email: 'houston@hairempire.com',
    phone: '+1 (555) 111-2225',
    address: '789 Westheimer Road, Houston, TX 77027',
    location: 'Houston, TX',
    status: 'active',
    subscription: 'Standard',
    joinDate: '2024-02-10',
    revenue: 11800,
    bookings: 145,
    rating: 4.7,
    services: ['Haircut', 'Color', 'Styling'],
    ownerId: '11', // Robert Wilson (same owner)
    ownerName: 'Robert Wilson',
    ownerEmail: 'robert@hairempire.com',
    hours: {
      monday: '8:00 AM - 8:00 PM',
      tuesday: '8:00 AM - 8:00 PM',
      wednesday: '8:00 AM - 8:00 PM',
      thursday: '8:00 AM - 8:00 PM',
      friday: '8:00 AM - 9:00 PM',
      saturday: '7:00 AM - 9:00 PM',
      sunday: '9:00 AM - 6:00 PM',
    },
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const ownerId = searchParams.get('ownerId'); // New parameter to filter by owner

    let filteredSalons = salons;

    if (status && status !== 'all') {
      filteredSalons = filteredSalons.filter(salon => salon.status === status);
    }

    if (ownerId) {
      filteredSalons = filteredSalons.filter(salon => salon.ownerId === ownerId);
    }

    if (search) {
      filteredSalons = filteredSalons.filter(salon =>
        salon.name.toLowerCase().includes(search.toLowerCase()) ||
        salon.location.toLowerCase().includes(search.toLowerCase()) ||
        salon.ownerName.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({
      salons: filteredSalons,
      total: filteredSalons.length,
    });
  } catch (error) {
    console.error('Error fetching salons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const salonData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'address', 'ownerId'];
    for (const field of requiredFields) {
      if (!salonData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create new salon
    const newSalon = {
      id: (salons.length + 1).toString(),
      ...salonData,
      status: 'pending',
      subscription: 'Basic',
      joinDate: new Date().toISOString().split('T')[0],
      revenue: 0,
      bookings: 0,
      rating: 0,
    };

    salons.push(newSalon);

    return NextResponse.json(newSalon, { status: 201 });
  } catch (error) {
    console.error('Error creating salon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}