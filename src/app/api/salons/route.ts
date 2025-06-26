import { NextRequest, NextResponse } from 'next/server';

// Demo salon data
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
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let filteredSalons = salons;

    if (status && status !== 'all') {
      filteredSalons = filteredSalons.filter(salon => salon.status === status);
    }

    if (search) {
      filteredSalons = filteredSalons.filter(salon =>
        salon.name.toLowerCase().includes(search.toLowerCase()) ||
        salon.location.toLowerCase().includes(search.toLowerCase())
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
    const requiredFields = ['name', 'email', 'phone', 'address'];
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