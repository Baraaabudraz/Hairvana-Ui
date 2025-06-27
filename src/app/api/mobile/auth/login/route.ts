import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password, deviceToken, deviceType } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('role', 'user') // Only allow regular users to login via mobile API
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is not active', status: user.status },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login time
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Register or update device if token provided
    if (deviceToken && deviceType) {
      // Check if device already exists
      const { data: existingDevice } = await supabase
        .from('mobile_devices')
        .select('id')
        .eq('user_id', user.id)
        .eq('device_token', deviceToken)
        .single();

      if (existingDevice) {
        // Update existing device
        await supabase
          .from('mobile_devices')
          .update({ last_login: new Date().toISOString() })
          .eq('id', existingDevice.id);
      } else {
        // Register new device
        await supabase
          .from('mobile_devices')
          .insert({
            user_id: user.id,
            device_token: deviceToken,
            device_type: deviceType
          });
      }
    }

    // Generate auth token using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Error with Supabase auth:', authError);
      return NextResponse.json(
        { error: 'Failed to authenticate user' },
        { status: 500 }
      );
    }

    // Get customer data
    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Return user data (without password) and token
    const { password_hash, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        customer: customerData || null
      },
      session: authData.session
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}