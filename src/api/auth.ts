import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function loginUser(email: string, password: string) {
  try {
    // For demo purposes, allow direct login with admin credentials
    if (email === 'admin@hairvana.com' && password === 'admin123') {
      return {
        user: {
          id: '1',
          name: 'John Smith',
          email: 'admin@hairvana.com',
          role: 'admin',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        },
        token: 'mock-jwt-token'
      };
    }

    // Otherwise, use Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (!data.user || !data.session) {
      throw new Error('Authentication failed');
    }

    // Fetch user details from your users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;

    return {
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar
      },
      token: data.session.access_token
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function registerUser(userData: {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'salon';
  phone?: string;
}) {
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          role: userData.role
        }
      }
    });
    
    if (authError) throw authError;
    
    if (!authData.user) {
      throw new Error('Failed to create user');
    }
    
    // Create user in our users table
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone || null,
        role: userData.role,
        status: 'pending', // New users start as pending until approved
        password_hash: hashedPassword
      })
      .select()
      .single();
    
    if (dbError) throw dbError;
    
    // Create role-specific record
    if (userData.role === 'salon') {
      const { error: ownerError } = await supabase
        .from('salon_owners')
        .insert({
          user_id: authData.user.id,
          total_salons: 0,
          total_revenue: 0,
          total_bookings: 0
        });
      
      if (ownerError) throw ownerError;
    } else if (userData.role === 'user') {
      const { error: customerError } = await supabase
        .from('customers')
        .insert({
          user_id: authData.user.id,
          total_spent: 0,
          total_bookings: 0,
          favorite_services: []
        });
      
      if (customerError) throw customerError;
    }
    
    return {
      user: dbUser,
      session: authData.session
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    if (!data.user) {
      return null;
    }
    
    // Fetch user details from your users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) throw userError;
    
    return userData;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function updatePassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    // Verify current password
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    const isValidPassword = await bcrypt.compare(currentPassword, userData.password_hash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    // Update password in Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (authError) throw authError;
    
    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
}