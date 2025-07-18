'use strict';
const { User, Customer, MobileDevice } = require('../../../../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../../../config/config.json');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash: hash, phone, role: 'user', status: 'active' });
    await Customer.create({ user_id: user.id });
    return res.status(201).json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    return res.status(500).json({ error: 'Registration failed.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret || process.env.JWT_SECRET, { expiresIn: '7d' });


    return res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed.' });
  }
};

exports.logout = async (req, res) => {
  try {
    // Best practice: require device token to remove from MobileDevice table
    const { device_token } = req.body;
    if (!device_token) {
      return res.status(400).json({ error: 'Device token is required.' });
    }
    // Find the user from the JWT (if using auth middleware) or from the request
    // For now, we'll use the token payload if available
    let userId;
    if (req.user && req.user.id) {
      userId = req.user.id;
    } else if (req.body.userId) {
      userId = req.body.userId;
    } else {
      return res.status(401).json({ error: 'User not authenticated.' });
    }
    // Remove the device token for this user
    await MobileDevice.destroy({ where: { user_id: userId, device_token: device_token } });
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Logout failed.' });
  }
}; 