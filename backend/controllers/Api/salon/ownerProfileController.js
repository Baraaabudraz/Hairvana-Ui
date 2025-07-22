const { User } = require('../../../models');
const bcrypt = require('bcryptjs');
const { getFileInfo } = require('../../../helpers/uploadHelper');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone', 'avatar', 'status', 'role', 'createdAt', 'updatedAt']
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, avatar } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;
    await user.save();
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No avatar file uploaded' });
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const avatarInfo = getFileInfo(req.file, '/uploads/avatars');
    user.avatar = avatarInfo.storedName; // Store only the filename
    await user.save();
    // Return the full URL in the response
    const baseUrl = req.protocol + '://' + req.get('host');
    return res.json({ success: true, avatar: baseUrl + avatarInfo.url });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to upload avatar' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new password are required' });
    }
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const valid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Old password is incorrect' });
    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to change password' });
  }
}; 