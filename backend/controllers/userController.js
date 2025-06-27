const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    
    let query = req.supabase
      .from('users')
      .select('*, salon_owners(*), customers(*)');
    
    if (role && role !== 'all') {
      if (role === 'admin') {
        query = query.in('role', ['admin', 'super_admin']);
      } else {
        query = query.eq('role', role);
      }
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // For salon owners, fetch their salons
    const salonOwnerUsers = data?.filter(user => user.role === 'salon') || [];
    
    if (salonOwnerUsers.length > 0) {
      const salonOwnerIds = salonOwnerUsers.map(user => user.id);
      
      const { data: salonsData, error: salonsError } = await req.supabase
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
      }, {});
      
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
    
    res.json({
      users: data || [],
      stats
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await req.supabase
      .from('users')
      .select('*, salon_owners(*), customers(*)')
      .eq('id', id)
      .single();
    
    if (error) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user is a salon owner, fetch their salons
    if (data.role === 'salon') {
      const { data: salonsData, error: salonsError } = await req.supabase
        .from('salons')
        .select('*')
        .eq('owner_id', id);
      
      if (!salonsError) {
        data.salons = salonsData || [];
      }
    }
    
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Create a new user
exports.createUser = async (req, res, next) => {
  try {
    const userData = req.body;
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await req.supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        role: userData.role
      }
    });
    
    if (authError) {
      return res.status(400).json({ message: authError.message });
    }
    
    if (!authData.user) {
      return res.status(400).json({ message: 'Failed to create user' });
    }
    
    // Create user in our users table
    const { data, error } = await req.supabase
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
    
    if (error) {
      // If there's an error, clean up the auth user
      await req.supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ message: error.message });
    }
    
    // Create role-specific record
    if (userData.role === 'salon') {
      const { error: ownerError } = await req.supabase
        .from('salon_owners')
        .insert({
          user_id: data.id,
          total_salons: 0,
          total_revenue: 0,
          total_bookings: 0
        });
      
      if (ownerError) {
        return res.status(400).json({ message: ownerError.message });
      }
      
      // If salon data is provided, create a salon
      if (userData.salonName) {
        const { error: salonError } = await req.supabase
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
        
        if (salonError) {
          return res.status(400).json({ message: salonError.message });
        }
      }
    } else if (userData.role === 'user') {
      const { error: customerError } = await req.supabase
        .from('customers')
        .insert({
          user_id: data.id,
          total_spent: 0,
          total_bookings: 0,
          favorite_services: []
        });
      
      if (customerError) {
        return res.status(400).json({ message: customerError.message });
      }
    }
    
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

// Update a user
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    
    // If password is being updated, hash it
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password_hash = await bcrypt.hash(userData.password, salt);
      delete userData.password;
      
      // Update password in Supabase Auth
      const { error: authError } = await req.supabase.auth.admin.updateUserById(
        id,
        { password: req.body.password }
      );
      
      if (authError) {
        return res.status(400).json({ message: authError.message });
      }
    }
    
    const { data, error } = await req.supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Delete a user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Delete user from Supabase Auth
    const { error: authError } = await req.supabase.auth.admin.deleteUser(id);
    
    if (authError) {
      return res.status(400).json({ message: authError.message });
    }
    
    // The database triggers should handle cascading deletes for related tables
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Update user status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const { data, error } = await req.supabase
      .from('users')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.json(data);
  } catch (error) {
    next(error);
  }
};