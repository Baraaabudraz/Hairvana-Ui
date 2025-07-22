const serviceService = require('../services/serviceService');
const { serializeService } = require('../serializers/serviceSerializer');

// Get all services
exports.getAllServices = async (req, res, next) => {
  try {
    const services = await serviceService.getAllServices(req.query);
    res.json(services.map(serializeService));
  } catch (error) {
    next(error);
  }
};

// Get service by ID
exports.getServiceById = async (req, res, next) => {
  try {
    const service = await serviceService.getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(serializeService(service));
  } catch (error) {
    next(error);
  }
};

// Create a new service
exports.createService = async (req, res, next) => {
  try {
    const newService = await serviceService.createService(req.body);
    res.status(201).json(serializeService(newService));
  } catch (error) {
    next(error);
  }
};

// Update a service
exports.updateService = async (req, res, next) => {
  try {
    const updatedService = await serviceService.updateService(req.params.id, req.body);
    if (!updatedService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(serializeService(updatedService));
  } catch (error) {
    next(error);
  }
};

// Delete a service
exports.deleteService = async (req, res, next) => {
  try {
    const deleted = await serviceService.deleteService(req.params.id);
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
    const categories = await serviceService.getServiceCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};