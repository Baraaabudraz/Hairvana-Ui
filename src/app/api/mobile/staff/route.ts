import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');
    const serviceId = searchParams.get('serviceId');

    if (!salonId) {
      return NextResponse.json(
        { error: 'Salon ID is required' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('staff')
      .select('*')
      .eq('salon_id', salonId);

    // If serviceId is provided, filter staff who can perform this service
    if (serviceId) {
      query = query.contains('services', [serviceId]);
    }

    // Execute query
    const { data: staff, error } = await query;

    if (error) {
      console.error('Error fetching staff:', error);
      return NextResponse.json(
        { error: 'Failed to fetch staff' },
        { status: 500 }
      );
    }

    // Return staff
    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Error in staff API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}