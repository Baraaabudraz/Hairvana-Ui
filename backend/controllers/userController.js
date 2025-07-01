const bcrypt = require('bcryptjs');
const { User, SalonOwner, Customer, Salon } = require('../models');

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const where = {};
    if (role && role !== 'all') {
      if (role === 'admin') {
        where.role = ['admin', 'super_admin'];
      } else {
        where.role = role;
      }
    }
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where[User.sequelize.Op.or] = [
        { name: { [User.sequelize.Op.iLike]: `%${search}%` } },
        { email: { [User.sequelize.Op.iLike]: `%${search}%` } }
      ];
    }
    // Fetch users with associations
    let users = await User.findAll({
      where,
      include: [
        { model: SalonOwner, as: 'salonOwner', include: [{ model: Salon, as: 'salons' }] },
        { model: Customer, as: 'customer' },
        { model: Salon, as: 'salons' }
      ]
    });
    users = users.map(u => u.toJSON());
    // Calculate stats
    const stats = {
      total: users.length,
      admin: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
      salon: users.filter(u => u.role === 'salon').length,
      user: users.filter(u => u.role === 'user').length,
      active: users.filter(u => u.status === 'active').length,
      pending: users.filter(u => u.status === 'pending').length,
      suspended: users.filter(u => u.status === 'suspended').length,
    };
    res.json({ users, stats });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({
      where: { id },
      include: [
        { model: SalonOwner, as: 'salonOwner', include: [{ model: Salon, as: 'salons' }] },
        { model: Customer, as: 'customer' }
      ]
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.toJSON());
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
    // Create user
    const newUser = await User.create({
      email: userData.email,
      name: userData.name,
      phone: userData.phone || null,
      role: userData.role,
      status: 'active',
      avatar: userData.avatar || null,
      permissions: (userData.role === 'admin' || userData.role === 'super_admin') ? userData.permissions : null,
      password_hash: hashedPassword
    });
    // Create role-specific record
    if (userData.role === 'salon') {
      await SalonOwner.create({
        user_id: newUser.id,
        total_salons: 0,
        total_revenue: 0,
        total_bookings: 0
      });
      // If salon data is provided, create a salon
      if (userData.salonName) {
        await Salon.create({
          name: userData.salonName,
          email: userData.email,
          phone: userData.phone || null,
          address: userData.salonAddress,
          owner_id: newUser.id,
          // owner_name, owner_email, business_license fields can be added if present in model
          status: 'pending'
        });
      }
    } else if (userData.role === 'user') {
      await Customer.create({
        user_id: newUser.id,
        total_spent: 0,
        total_bookings: 0,
        favorite_services: []
      });
    }
    res.status(201).json(newUser.toJSON());
  } catch (error) {
    next(error);
  }
};

// Update a user
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    console.log('Updating user:', id, userData);
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password_hash = await bcrypt.hash(userData.password, salt);
      delete userData.password;
    }
    try {
      const [affectedRows, [updatedUser]] = await User.update(userData, {
        where: { id },
        returning: true
      });
      console.log('Update result:', affectedRows, updatedUser);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(updatedUser.toJSON());
    } catch (err) {
      console.error('Sequelize update error:', err);
      // If it's a Sequelize validation error, return the message
      if (err.name && err.name === 'SequelizeValidationError') {
        return res.status(422).json({ message: err.message, errors: err.errors });
      }
      // Otherwise, return a generic error
      return res.status(422).json({ message: err.message || 'Unprocessable Entity' });
    }
  } catch (error) {
    next(error);
  }
};

// Delete a user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await User.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
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
    const [affectedRows] = await User.update({ status }, { where: { id } });
    if (!affectedRows) {
      return res.status(404).json({ message: 'User not found' });
    }
    const updatedUser = await User.findOne({ where: { id } });
    res.json(updatedUser.toJSON());
  } catch (error) {
    next(error);
  }
};