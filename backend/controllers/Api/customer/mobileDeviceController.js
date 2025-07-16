const { MobileDevice } = require('../../../models');

exports.registerDevice = async (req, res) => {
  try {
    const user_id = req.user.id; // set by authenticateToken middleware
    const { device_token, device_type } = req.body;

    if (!device_token || !device_type) {
      return res.status(400).json({ error: 'device_token and device_type are required.' });
    }

    await MobileDevice.upsert({
      user_id,
      device_token,
      device_type,
      last_login: new Date()
    }, {
      where: { user_id, device_token }
    });

    return res.json({ success: true, message: 'Device registered/updated.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to register device.' });
  }
}; 