import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, deviceToken, deviceType } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        phone: phone || null,
        role: 'user',
        status: 'active',
        password_hash: passwordHash
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create customer record
    const { error: customerError } = await supabase
      .from('customers')
      .insert({
        user_id: newUser.id,
        total_spent: 0,
        total_bookings: 0,
        favorite_services: []
      });

    if (customerError) {
      console.error('Error creating customer record:', customerError);
      // Continue anyway, as the user was created successfully
    }

    // Register device if token provided
    if (deviceToken && deviceType) {
      const { error: deviceError } = await supabase
        .from('mobile_devices')
        .insert({
          user_id: newUser.id,
          device_token: deviceToken,
          device_type: deviceType
        });

      if (deviceError) {
        console.error('Error registering device:', deviceError);
        // Continue anyway, as the user was created successfully
      }
    }

    // Generate auth token using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_id: newUser.id,
          name: name
        }
      }
    });

    if (authError) {
      console.error('Error with Supabase auth:', authError);
      return NextResponse.json(
        { error: 'Failed to authenticate user' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      session: authData.session
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}