import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function fetchUsers(params: { role?: string; status?: string; search?: string } = {}) {
  try {
    let query = supabase
      .from('users')
      .select('*, salon_owners(*), customers(*)');
    
    if (params.role && params.role !== 'all') {
      if (params.role === 'admin') {
        query = query.in('role', ['admin', 'super_admin']);
      } else {
        query = query.eq('role', params.role);
      }
    }
    
    if (params.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }
    
    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // For salon owners, fetch their salons
    const salonOwnerUsers = data?.filter(user => user.role === 'salon') || [];
    
    if (salonOwnerUsers.length > 0) {
      const salonOwnerIds = salonOwnerUsers.map(user => user.id);
      
      const { data: salonsData, error: salonsError } = await supabase
        .from('salons')
        .select('*')
        .in('owner_id', salonOwnerIds);
      
      if (salonsError) throw salonsError;
      
      // Group salons by owner_id
      const salonsByOwner = (salonsData || []).reduce((acc, salon) => {
        if (!acc[salon.owner_id]) {
          acc[salon.owner_id] = [];
        }
        acc[salon.owner_id].push(salon);
        return acc;
      }, {} as Record<string, any[]>);
      
      // Add salons to each salon owner
      data?.forEach(user => {
        if (user.role === 'salon' && salonsByOwner[user.id]) {
          user.salons = salonsByOwner[user.id];
        }
      });
    }
    
    // Calculate stats
    const stats = {
      total: data?.length || 0,
      admin: data?.filter(u => u.role === 'admin' || u.role === 'super_admin').length || 0,
      salon: data?.filter(u => u.role === 'salon').length || 0,
      user: data?.filter(u => u.role === 'user').length || 0,
      active: data?.filter(u => u.status === 'active').length || 0,
      pending: data?.filter(u => u.status === 'pending').length || 0,
      suspended: data?.filter(u => u.status === 'suspended').length || 0,
    };
    
    return {
      users: data || [],
      stats
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function fetchUserById(id: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*, salon_owners(*), customers(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // If user is a salon owner, fetch their salons
    if (data.role === 'salon') {
      const { data: salonsData, error: salonsError } = await supabase
        .from('salons')
        .select('*')
        .eq('owner_id', id);
      
      if (salonsError) throw salonsError;
      
      data.salons = salonsData || [];
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
}

export async function createUser(userData: any) {
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
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone || null,
        role: userData.role,
        status: 'active',
        avatar: userData.avatar || null,
        permissions: userData.role === 'admin' || userData.role === 'super_admin' ? userData.permissions : null,
        password_hash: hashedPassword
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Create role-specific record
    if (userData.role === 'salon') {
      const { error: ownerError } = await supabase
        .from('salon_owners')
        .insert({
          user_id: data.id,
          total_salons: 0,
          total_revenue: 0,
          total_bookings: 0
        });
      
      if (ownerError) throw ownerError;
      
      // If salon data is provided, create a salon
      if (userData.salonName) {
        const { error: salonError } = await supabase
          .from('salons')
          .insert({
            name: userData.salonName,
            email: userData.email,
            phone: userData.phone || null,
            address: userData.salonAddress,
            owner_id: data.id,
            owner_name: userData.name,
            owner_email: userData.email,
            business_license: userData.businessLicense,
            status: 'pending'
          });
        
        if (salonError) throw salonError;
      }
    } else if (userData.role === 'user') {
      const { error: customerError } = await supabase
        .from('customers')
        .insert({
          user_id: data.id,
          total_spent: 0,
          total_bookings: 0,
          favorite_services: []
        });
      
      if (customerError) throw customerError;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(id: string, userData: any) {
  try {
    // If password is being updated, hash it
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password_hash = await bcrypt.hash(userData.password, salt);
      delete userData.password;
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    // In a real app, you'd use Supabase admin functions to delete the auth user
    // For this demo, we'll just delete from our tables
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw error;
  }
}

export async function updateUserStatus(id: string, status: 'active' | 'pending' | 'suspended') {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error updating status for user with ID ${id}:`, error);
    throw error;
  }
}