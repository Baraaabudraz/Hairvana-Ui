import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch appointment with related data
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        salon:salons(id, name, location, address, phone, email, images),
        service:services(id, name, price, duration, description),
        staff:staff(id, name, avatar, bio)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching appointment:', error);
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Return appointment data
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error in appointment details API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status, date, notes } = await request.json();

    // Validate the appointment exists
    const { data: existingAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching appointment:', fetchError);
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (date) {
      updateData.date = new Date(date).toISOString();
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update appointment
    const { data: updatedAppointment, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating appointment:', error);
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      );
    }

    // Return updated appointment
    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error in update appointment API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Instead of deleting, update status to cancelled
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling appointment:', error);
      return NextResponse.json(
        { error: 'Failed to cancel appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Appointment cancelled successfully',
      appointment: data
    });
  } catch (error) {
    console.error('Error in cancel appointment API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}