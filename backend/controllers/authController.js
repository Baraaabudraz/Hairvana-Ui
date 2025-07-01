const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, SalonOwner, Customer } = require('../models');
// Placeholder for future Supabase client usage
// const supabase = require('../lib/supabaseClient');

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Find user in DB
    const user = await User.findOne({ where: { email } });
    if (!user) {
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
    await user.update({ last_login: new Date() });
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
    const { password_hash, ...userWithoutPassword } = user.toJSON();
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
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    // Create user in our users table
    const newUser = await User.create({
      email,
      name,
      phone: phone || null,
      role,
      status: 'active',
      password_hash: passwordHash
    });
    // Create role-specific record
    if (role === 'salon') {
      await SalonOwner.create({
        user_id: newUser.id,
        total_salons: 0,
        total_revenue: 0,
        total_bookings: 0
      });
    } else if (role === 'user') {
      await Customer.create({
        user_id: newUser.id,
        total_spent: 0,
        total_bookings: 0,
        favorite_services: []
      });
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
    const { password_hash, ...userWithoutPassword } = newUser.toJSON();
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
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findOne({
      where: { id: userId },
      include: [
        { model: SalonOwner, as: 'salonOwner' },
        { model: Customer, as: 'customer' }
      ]
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // If user is a salon owner, fetch their salons (optional, can be added if needed)
    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user.toJSON();
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
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
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
    await user.update({ password_hash: hashedPassword });
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};