import { supabase } from '@/lib/supabase';

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

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}