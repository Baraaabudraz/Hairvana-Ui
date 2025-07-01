const { Staff } = require('../models');
const { Op } = require('sequelize');

// Get all staff
exports.getAllStaff = async (req, res, next) => {
  try {
    const { salonId, serviceId } = req.query;
    const where = {};
    if (salonId) where.salon_id = salonId;
    if (serviceId) where.services = { [Op.contains]: [serviceId] };
    const staff = await Staff.findAll({ where });
    res.json(staff);
  } catch (error) {
    next(error);
  }
};

// Get staff by ID
exports.getStaffById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findOne({ where: { id } });
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json(staff);
  } catch (error) {
    next(error);
  }
};

// Create a new staff member
exports.createStaff = async (req, res, next) => {
  try {
    const staffData = req.body;
    const newStaff = await Staff.create(staffData);
    res.status(201).json(newStaff);
  } catch (error) {
    next(error);
  }
};

// Update a staff member
exports.updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staffData = req.body;
    const [affectedRows, [updatedStaff]] = await Staff.update(staffData, {
      where: { id },
      returning: true
    });
    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json(updatedStaff);
  } catch (error) {
    next(error);
  }
};

// Delete a staff member
exports.deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Staff.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Assign service to staff
exports.assignService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { serviceId } = req.body;
    const staff = await Staff.findOne({ where: { id } });
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    const currentServices = staff.services || [];
    if (!currentServices.includes(serviceId)) {
      staff.services = [...currentServices, serviceId];
      await staff.save();
    }
    res.json({ message: 'Service assigned successfully' });
  } catch (error) {
    next(error);
  }
};

// Remove service from staff
exports.removeService = async (req, res, next) => {
  try {
    const { id, serviceId } = req.params;
    const staff = await Staff.findOne({ where: { id } });
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    const currentServices = staff.services || [];
    staff.services = currentServices.filter(sid => sid !== serviceId);
    await staff.save();
    res.json({ message: 'Service removed successfully' });
  } catch (error) {
    next(error);
  }
};