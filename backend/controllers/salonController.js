const { Salon, User, Service, Staff, Appointment, Review } = require('../models');
const { Op, Sequelize } = require('sequelize');
const salonService = require('../services/salonService');
const { serializeSalon } = require('../serializers/salonSerializer');

// Get all salons
exports.getAllSalons = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { salons, total } = await salonService.getAllSalons(req.query, req);
    res.json({
      salons,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

// Get salon by ID
exports.getSalonById = async (req, res, next) => {
  try {
    const salon = await salonService.getSalonById(req.params.id, req);
    if (!salon) return res.status(404).json({ message: 'Salon not found' });
    res.json(salon);
  } catch (error) {
    next(error);
  }
};

// Create a new salon
exports.createSalon = async (req, res, next) => {
  try {
    const salon = await salonService.createSalon(req);
    res.status(201).json(salon);
  } catch (error) {
    next(error);
  }
};

// Update a salon
exports.updateSalon = async (req, res, next) => {
  try {
    // Combine body data with file info if present
    const salonData = { ...req.body };
    
    // Handle multiple images
    if (req.files && req.files.length > 0) {
      salonData.images = req.files.map(file => file.filename);
    }
    
    // Handle existing images
    if (req.body.existingImages) {
      const existingImages = Array.isArray(req.body.existingImages) 
        ? req.body.existingImages 
        : [req.body.existingImages];
      salonData.images = [...(salonData.images || []), ...existingImages];
    }
    
    const salon = await salonService.updateSalon(req.params.id, salonData, req);
    if (!salon) return res.status(404).json({ message: 'Salon not found' });
    res.json(salon);
  } catch (error) {
    next(error);
  }
};

// Delete a salon
exports.deleteSalon = async (req, res, next) => {
  try {
    const deleted = await salonService.deleteSalon(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Salon not found' });
    res.json({ message: 'Salon deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Update salon status
exports.updateSalonStatus = async (req, res, next) => {
  try {
    const salon = await salonService.updateSalonStatus(req.params.id, req.body.status, req);
    if (!salon) return res.status(404).json({ message: 'Salon not found' });
    res.json(salon);
  } catch (error) {
    next(error);
  }
};

// Get salon services
exports.getSalonServices = async (req, res, next) => {
  try {
    const services = await salonService.getSalonServices(req.params.id);
    res.json(services || []);
  } catch (error) {
    next(error);
  }
};

// Get salon staff
exports.getSalonStaff = async (req, res, next) => {
  try {
    const staff = await salonService.getSalonStaff(req.params.id);
    res.json(staff || []);
  } catch (error) {
    next(error);
  }
};

// Get salon appointments
exports.getSalonAppointments = async (req, res, next) => {
  try {
    const appointments = await salonService.getSalonAppointments(req.params.id, req.query);
    res.json(appointments || []);
  } catch (error) {
    next(error);
  }
};