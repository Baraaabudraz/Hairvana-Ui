'use strict';
const { User } = require('../../../models');
const { serializeUser } = require('../../../serializers/userSerializer');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone', 'avatar', 'preferences', 'createdAt', 'updatedAt']
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, user: serializeUser(user, req) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, preferences } = req.body;
    let avatar = req.body.avatar;
    
    // If a new file was uploaded, store only the filename (UUID)
    if (req.file) {
      avatar = req.file.filename; // Store only the UUID filename
    }
    
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (preferences) user.preferences = preferences;
    
    await user.save();
    
    return res.json({ success: true, user: serializeUser(user, req) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}; 