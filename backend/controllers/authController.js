const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user in Supabase
    const { data: user, error } = await req.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // For demo purposes, allow both the hashed password and plain text "admin123"
    let isValidPassword = false;
    
    if (password === 'admin123') {
      isValidPassword = true;
    } else {
      isValidPassword = await bcrypt.compare(password, user.password_hash);
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login time
    await req.supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Return user data (without password) and token
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    
    // Check if user already exists
    const { data: existingUser } = await req.supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await req.supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role
      }
    });
    
    if (authError) {
      return res.status(400).json({ message: authError.message });
    }
    
    if (!authData.user) {
      return res.status(400).json({ message: 'Failed to create user' });
    }
    
    // Create user in our users table
    const { data: newUser, error: userError } = await req.supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        phone: phone || null,
        role,
        status: 'active',
        password_hash: passwordHash
      })
      .select()
      .single();
    
    if (userError) {
      // If there's an error, clean up the auth user
      await req.supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ message: userError.message });
    }
    
    // Create role-specific record
    if (role === 'salon') {
      const { error: ownerError } = await req.supabase
        .from('salon_owners')
        .insert({
          user_id: newUser.id,
          total_salons: 0,
          total_revenue: 0,
          total_bookings: 0
        });
      
      if (ownerError) {
        console.error('Error creating salon owner record:', ownerError);
      }
    } else if (role === 'user') {
      const { error: customerError } = await req.supabase
        .from('customers')
        .insert({
          user_id: newUser.id,
          total_spent: 0,
          total_bookings: 0,
          favorite_services: []
        });
      
      if (customerError) {
        console.error('Error creating customer record:', customerError);
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Return success response
    const { password_hash, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    next(error);
  }
};

// Logout
exports.logout = async (req, res, next) => {
  try {
    // In a real app, you might want to invalidate the token
    // For this demo, we'll just return success
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    // The user ID should be available from the auth middleware
    const userId = req.user.userId;
    
    const { data, error } = await req.supabase
      .from('users')
      .select('*, salon_owners(*), customers(*)')
      .eq('id', userId)
      .single();
    
    if (error) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user is a salon owner, fetch their salons
    if (data.role === 'salon') {
      const { data: salonsData, error: salonsError } = await req.supabase
        .from('salons')
        .select('*')
        .eq('owner_id', userId);
      
      if (!salonsError) {
        data.salons = salonsData || [];
      }
    }
    
    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = data;
    
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;
    
    // Verify current password
    const { data: user, error: userError } = await req.supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();
    
    if (userError) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password in users table
    const { error: updateError } = await req.supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', userId);
    
    if (updateError) {
      return res.status(400).json({ message: updateError.message });
    }
    
    // Update password in Supabase Auth
    const { error: authError } = await req.supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );
    
    if (authError) {
      return res.status(400).json({ message: authError.message });
    }
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};