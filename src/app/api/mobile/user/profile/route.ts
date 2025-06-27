import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, phone, role, status, join_date, last_login, avatar')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (customerError && customerError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching customer data:', customerError);
    }

    // Fetch user's appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, date, status')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5);

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
    }

    // Return user profile data
    return NextResponse.json({
      ...user,
      customer: customer || null,
      recentAppointments: appointments || []
    });
  } catch (error) {
    console.error('Error in user profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, name, phone, avatar } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;

    // Update user
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, name, email, phone, role, status, join_date, last_login, avatar')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    // Return updated user
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error in update profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}