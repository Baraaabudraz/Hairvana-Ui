const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { serializeUser } = require('../serializers/userSerializer');
const { getFileInfo } = require('../helpers/uploadHelper');

exports.getAllUsers = async (query, req) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = query;
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
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    const parsedLimit = parseInt(limit, 10) || 10;
    const parsedPage = parseInt(page, 10) || 1;
    const offset = (parsedPage - 1) * parsedLimit;
    const { rows, count } = await userRepository.findAll({ where, limit: parsedLimit, offset });
    const users = rows.map(user => serializeUser(user, { req }));
    const stats = {
      total: count,
      admin: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
      salon: users.filter(u => u.role === 'salon').length,
      user: users.filter(u => u.role === 'user').length,
      active: users.filter(u => u.status === 'active').length,
      pending: users.filter(u => u.status === 'pending').length,
      suspended: users.filter(u => u.status === 'suspended').length,
    };
    return {
      users,
      stats,
      total: count,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit)
    };
  } catch (err) {
    throw new Error('Failed to get users: ' + err.message);
  }
};

exports.getUserById = async (id, req) => {
  if (!id) throw new Error('User ID is required');
  try {
    const user = await userRepository.findById(id);
    if (!user) return null;
    return serializeUser(user, { req });
  } catch (err) {
    throw new Error('Failed to get user: ' + err.message);
  }
};

exports.createUser = async (userData, req) => {
  if (!userData || typeof userData !== 'object') throw new Error('User data is required');
  if (!userData.password) throw new Error('Password is required');
  try {
    // Handle avatar upload
    if (req.file) {
      userData.avatar = req.file.filename;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    userData.password_hash = hashedPassword; // Use snake_case to match model
    delete userData.password;
    userData.status = 'active';
    const newUser = await userRepository.create(userData);
    // Role-specific logic (still in service)
    if (userData.role === 'salon') {
      const { SalonOwner, Salon } = require('../models');
      await SalonOwner.create({
        userId: newUser.id,
        totalSalons: 0,
        totalRevenue: 0,
        totalBookings: 0
      });
      if (userData.salonName) {
        await Salon.create({
          name: userData.salonName,
          email: userData.email,
          phone: userData.phone || null,
          address: userData.salonAddress,
          ownerId: newUser.id,
          status: 'pending'
        });
      }
    } else if (userData.role === 'user') {
      const { Customer } = require('../models');
      await Customer.create({
        user_id: newUser.id,
        total_spent: 0,
        total_bookings: 0,
        favorite_services: []
      });
    }
    return serializeUser(newUser, { req, avatarFilenameOnly: true });
  } catch (err) {
    if (err.name && err.name === 'SequelizeValidationError') {
      throw Object.assign(new Error('Validation error'), { errors: err.errors });
    }
    throw new Error('Failed to create user: ' + err.message);
  }
};

exports.updateUser = async (id, userData, req) => {
  if (!id) throw new Error('User ID is required');
  if (!userData || typeof userData !== 'object') throw new Error('User data is required');
  try {
    // Handle avatar upload
    if (req.file) {
      userData.avatar = req.file.filename;
    }
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password_hash = await bcrypt.hash(userData.password, salt);
      delete userData.password;
    }
    const [affectedRows, [updatedUser]] = await userRepository.update(id, userData);
    if (!updatedUser) return null;
    return serializeUser(updatedUser, { req, avatarFilenameOnly: true });
  } catch (err) {
    if (err.name && err.name === 'SequelizeValidationError') {
      throw Object.assign(new Error('Validation error: ' + err.message), { errors: err.errors });
    }
    throw new Error('Failed to update user: ' + err.message);
  }
};

exports.deleteUser = async (id) => {
  if (!id) throw new Error('User ID is required');
  try {
    const deleted = await userRepository.delete(id);
    if (!deleted) return null;
    return { message: 'User deleted successfully' };
  } catch (err) {
    throw new Error('Failed to delete user: ' + err.message);
  }
};

exports.updateUserStatus = async (id, status, req) => {
  if (!id) throw new Error('User ID is required');
  if (!['active', 'pending', 'suspended'].includes(status)) throw new Error('Invalid status');
  try {
    const [affectedRows] = await userRepository.updateStatus(id, status);
    if (!affectedRows) return null;
    const updatedUser = await userRepository.findById(id);
    return serializeUser(updatedUser, { req });
  } catch (err) {
    throw new Error('Failed to update user status: ' + err.message);
  }
}; 