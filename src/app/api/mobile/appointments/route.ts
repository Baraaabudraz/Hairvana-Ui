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
    const { userId, salonId, serviceId, staffId, date, notes } = await request.json();

    // Validate required fields
    if (!userId || !salonId || !serviceId || !staffId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get service details for duration
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration, price')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if the time slot is available
    const appointmentDate = new Date(date);
    const endTime = new Date(appointmentDate.getTime() + service.duration * 60000);

    const { data: existingAppointments, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('staff_id', staffId)
      .eq('status', 'confirmed')
      .lt('date', endTime.toISOString())
      .gt('date', appointmentDate.toISOString());

    if (appointmentError) {
      console.error('Error checking appointment availability:', appointmentError);
      return NextResponse.json(
        { error: 'Failed to check appointment availability' },
        { status: 500 }
      );
    }

    if (existingAppointments && existingAppointments.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is not available' },
        { status: 409 }
      );
    }

    // Create appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        user_id: userId,
        salon_id: salonId,
        service_id: serviceId,
        staff_id: staffId,
        date: appointmentDate.toISOString(),
        duration: service.duration,
        status: 'pending',
        notes: notes || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      );
    }

    // Return the created appointment
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error in create appointment API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}