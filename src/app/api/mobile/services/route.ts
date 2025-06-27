import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');
    const category = searchParams.get('category');

    // Build query
    let query = supabase
      .from('services')
      .select('*');

    // Apply filters
    if (salonId) {
      query = query.eq('salon_id', salonId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    // Execute query
    const { data: services, error } = await query;

    if (error) {
      console.error('Error fetching services:', error);
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: 500 }
      );
    }

    // Return services
    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error in services API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}