import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('salons')
      .select(`
        *,
        services:services(*)
      `, { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    } else {
      // By default, only show active salons for mobile app
      query = query.eq('status', 'active');
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
      query = query.contains('services', [category]);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: salons, error, count } = await query;

    if (error) {
      console.error('Error fetching salons:', error);
      return NextResponse.json(
        { error: 'Failed to fetch salons' },
        { status: 500 }
      );
    }

    // Format response
    return NextResponse.json({
      salons,
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: count ? Math.ceil(count / limit) : 0
      }
    });
  } catch (error) {
    console.error('Error in salons API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}