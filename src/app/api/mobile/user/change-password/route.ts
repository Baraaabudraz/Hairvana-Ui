import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'User ID, current password, and new password are required' },
        { status: 400 }
      );
    }

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    const { error } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId);

    if (error) {
      console.error('Error updating password:', error);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Update Supabase Auth password as well
    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (authError) {
      console.error('Error updating auth password:', authError);
      // Continue anyway as the database password was updated
    }

    return NextResponse.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error in change password API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}