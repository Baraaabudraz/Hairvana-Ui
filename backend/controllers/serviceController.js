const { Service } = require('../models');
const { Op } = require('sequelize');

// Get all services
exports.getAllServices = async (req, res, next) => {
  try {
    const { salonId, category } = req.query;
    const where = {};
    if (salonId) where.salon_id = salonId;
    if (category) where.category = category;
    const services = await Service.findAll({ where });
    res.json(services);
  } catch (error) {
    next(error);
  }
};

// Get service by ID
exports.getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findOne({ where: { id } });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
};

// Create a new service
exports.createService = async (req, res, next) => {
  try {
    const serviceData = req.body;
    const newService = await Service.create(serviceData);
    res.status(201).json(newService);
  } catch (error) {
    next(error);
  }
};

// Update a service
exports.updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const serviceData = req.body;
    const [affectedRows, [updatedService]] = await Service.update(serviceData, {
      where: { id },
      returning: true
    });
    if (!updatedService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(updatedService);
  } catch (error) {
    next(error);
  }
};

// Delete a service
exports.deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Service.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get service categories
exports.getServiceCategories = async (req, res, next) => {
  try {
    // In a real app, you might have a categories table
    // For this demo, we'll return a predefined list
    const categories = [
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
    
    res.json(categories);
  } catch (error) {
    next(error);
  }
};