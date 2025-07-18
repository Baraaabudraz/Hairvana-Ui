const staffService = require('../services/staffService');
const { serializeStaff } = require('../serializers/staffSerializer');

exports.getAllStaff = async (req, res, next) => {
  try {
    const staff = await staffService.getAllStaff(req.query);
    res.json(staff.map(serializeStaff));
  } catch (error) {
    next(error);
  }
};

exports.getStaffById = async (req, res, next) => {
  try {
    const staff = await staffService.getStaffById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json(serializeStaff(staff));
  } catch (error) {
    next(error);
  }
};

exports.createStaff = async (req, res, next) => {
  try {
    const newStaff = await staffService.createStaff(req.body);
    res.status(201).json(serializeStaff(newStaff));
  } catch (error) {
    next(error);
  }
};

exports.updateStaff = async (req, res, next) => {
  try {
    const updatedStaff = await staffService.updateStaff(req.params.id, req.body);
    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json(serializeStaff(updatedStaff));
  } catch (error) {
    next(error);
  }
};

exports.deleteStaff = async (req, res, next) => {
  try {
    const deleted = await staffService.deleteStaff(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.assignService = async (req, res, next) => {
  try {
    const result = await staffService.assignService(req.params.id, req.body.serviceId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.removeService = async (req, res, next) => {
  try {
    const result = await staffService.removeService(req.params.id, req.params.serviceId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};