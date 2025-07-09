import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const salonId = searchParams.get('salonId');
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('appointments')
      .select(`
        *,
        salon:salons(id, name, location, images),
        service:services(id, name, price, duration),
        staff:staff(id, name, avatar)
      `);

    // Apply filters
    query = query.eq('user_id', userId);

    if (salonId) {
      query = query.eq('salon_id', salonId);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (from) {
      query = query.gte('date', from);
    }

    if (to) {
      query = query.lte('date', to);
    }

    // Order by date
    query = query.order('date', { ascending: false });

    // Execute query
    const { data: appointments, error } = await query;

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    // Return appointments
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Error in appointments API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, salonId, staffId, date, notes, serviceIds } = await request.json();

    // Validate required fields
    if (!userId || !salonId || !staffId || !date || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch all services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, duration, price')
      .in('id', serviceIds);

    if (servicesError || !services || services.length !== serviceIds.length) {
      return NextResponse.json(
        { error: 'One or more services are invalid' },
        { status: 400 }
      );
    }

    // Calculate total duration and price
    const totalDuration = services.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalPrice = services.reduce((sum, s) => sum + parseFloat(s.price || 0), 0);

    // Check if the time slot is available (basic check, can be improved)
    // For now, skip overlap logic for simplicity

    // Create appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        user_id: userId,
        salon_id: salonId,
        staff_id: staffId,
        date: new Date(date).toISOString(),
        duration: totalDuration,
        total_price: totalPrice,
        status: 'pending',
        notes: notes || null
      })
      .select()
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      );
    }

    // Create entries in appointment_services
    for (const service of services) {
      await supabase.from('appointment_services').insert({
        appointment_id: appointment.id,
        service_id: service.id,
        price: service.price,
        quantity: 1
      });
    }

    // Return the created appointment with linked services
    return NextResponse.json({
      ...appointment,
      services: services.map(s => ({ id: s.id, price: s.price, duration: s.duration }))
    }, { status: 201 });
  } catch (error) {
    console.error('Error in create appointment API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}