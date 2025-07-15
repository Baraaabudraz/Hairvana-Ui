const { Staff } = require('../../../models');

// List staff for a salon by salon_id in the path
exports.getStaffForSalon = async (req, res, next) => {
  try {
    const { salon_id } = req.params;
    if (!salon_id) return res.status(400).json({ message: 'salon_id is required' });
    const staff = await Staff.findAll({ where: { salon_id } });
    res.json(staff);
  } catch (error) {
    next(error);
  }
};

// Get staff details by staff ID
exports.getStaffById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByPk(id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (error) {
    next(error);
  }
}; 