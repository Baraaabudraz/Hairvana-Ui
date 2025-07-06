'use strict';
const { User } = require('../../models');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone', 'avatar', 'preferences', 'createdAt', 'updatedAt']
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, preferences } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (preferences) user.preferences = preferences;
    await user.save();
    return res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, preferences: user.preferences } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}; 