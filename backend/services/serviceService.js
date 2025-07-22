const { Service } = require('../models');

exports.getAllServices = async (query) => {
  const where = {};
  if (query.salonId) where.salon_id = query.salonId;
  if (query.category) where.category = query.category;
  return Service.findAll({ where });
};

exports.getServiceById = async (id) => {
  return Service.findOne({ where: { id } });
};

exports.createService = async (serviceData) => {
  return Service.create(serviceData);
};

exports.updateService = async (id, serviceData) => {
  const [affectedRows, [updatedService]] = await Service.update(serviceData, {
    where: { id },
    returning: true
  });
  return updatedService;
};

exports.deleteService = async (id) => {
  return Service.destroy({ where: { id } });
};

exports.getServiceCategories = async () => {
  // In a real app, you might have a categories table
  // For this demo, we'll return a predefined list
  return [
    'Haircut',
    'Hair Color',
    'Hair Styling',
    'Hair Treatment',
    'Beard Trim',
    'Eyebrow Threading',
    'Facial',
    'Manicure',
    'Pedicure',
    'Massage'
  ];
}; 