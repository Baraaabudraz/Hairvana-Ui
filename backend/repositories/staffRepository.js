const { Staff } = require('../models');
const { Op } = require('sequelize');

exports.getAllStaff = async (query) => {
  const where = {};
  if (query.salonId) where.salon_id = query.salonId;
  if (query.serviceId) where.services = { [Op.contains]: [query.serviceId] };
  return Staff.findAll({ where });
};

exports.getStaffById = async (id) => {
  return Staff.findOne({ where: { id } });
};

exports.createStaff = async (staffData) => {
  return Staff.create(staffData);
};

exports.updateStaff = async (id, staffData) => {
  const [affectedRows, [updatedStaff]] = await Staff.update(staffData, {
    where: { id },
    returning: true
  });
  return updatedStaff;
};

exports.deleteStaff = async (id) => {
  return Staff.destroy({ where: { id } });
};

exports.assignService = async (id, serviceId) => {
  const staff = await Staff.findOne({ where: { id } });
  if (!staff) return { message: 'Staff member not found' };
  const currentServices = staff.services || [];
  if (!currentServices.includes(serviceId)) {
    staff.services = [...currentServices, serviceId];
    await staff.save();
  }
  return { message: 'Service assigned successfully' };
};

exports.removeService = async (id, serviceId) => {
  const staff = await Staff.findOne({ where: { id } });
  if (!staff) return { message: 'Staff member not found' };
  const currentServices = staff.services || [];
  staff.services = currentServices.filter(sid => sid !== serviceId);
  await staff.save();
  return { message: 'Service removed successfully' };
}; 