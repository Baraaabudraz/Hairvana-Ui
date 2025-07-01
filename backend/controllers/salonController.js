const { Salon, User, Service, Staff, Appointment } = require('../models');
const { Op } = require('sequelize');

// Get all salons
exports.getAllSalons = async (req, res, next) => {
  try {
    const { status, search, ownerId } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (ownerId) where.owner_id = ownerId;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
        { owner_name: { [Op.iLike]: `%${search}%` } }
      ];
    }
    const salons = await Salon.findAll({
      where,
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role'] }]
    });
    // Merge owner info
    const processedSalons = salons.map(salon => {
      const s = salon.toJSON();
      if (s.owner) {
        s.owner_name = s.owner_name || s.owner.name;
        s.owner_email = s.owner_email || s.owner.email;
        s.owner_phone = s.owner.phone;
        s.owner_avatar = s.owner.avatar;
        s.owner_role = s.owner.role;
        delete s.owner;
      }
      return s;
    });
    res.json({ salons: processedSalons, total: salons.length });
  } catch (error) {
    next(error);
  }
};

// Get salon by ID
exports.getSalonById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const salon = await Salon.findOne({
      where: { id },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role'] }]
    });
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }
    const s = salon.toJSON();
    if (s.owner) {
      s.owner_name = s.owner_name || s.owner.name;
      s.owner_email = s.owner_email || s.owner.email;
      s.owner_phone = s.owner.phone;
      s.owner_avatar = s.owner.avatar;
      s.owner_role = s.owner.role;
      delete s.owner;
    }
    res.json(s);
  } catch (error) {
    next(error);
  }
};

// Create a new salon
exports.createSalon = async (req, res, next) => {
  try {
    const salonData = req.body;
    const newSalon = await Salon.create(salonData);
    res.status(201).json(newSalon.toJSON());
  } catch (error) {
    next(error);
  }
};

// Update a salon
exports.updateSalon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const salonData = req.body;
    const [affectedRows, [updatedSalon]] = await Salon.update(salonData, {
      where: { id },
      returning: true
    });
    if (!updatedSalon) {
      return res.status(404).json({ message: 'Salon not found' });
    }
    res.json(updatedSalon.toJSON());
  } catch (error) {
    next(error);
  }
};

// Delete a salon
exports.deleteSalon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Salon.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Salon not found' });
    }
    res.json({ message: 'Salon deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Update salon status
exports.updateSalonStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const [affectedRows, [updatedSalon]] = await Salon.update({ status }, {
      where: { id },
      returning: true
    });
    if (!updatedSalon) {
      return res.status(404).json({ message: 'Salon not found' });
    }
    res.json(updatedSalon.toJSON());
  } catch (error) {
    next(error);
  }
};

// Get salon services
exports.getSalonServices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const services = await Service.findAll({ where: { salon_id: id } });
    res.json(services || []);
  } catch (error) {
    next(error);
  }
};

// Get salon staff
exports.getSalonStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findAll({ where: { salon_id: id } });
    res.json(staff || []);
  } catch (error) {
    next(error);
  }
};

// Get salon appointments
exports.getSalonAppointments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, from, to } = req.query;
    const where = { salon_id: id };
    if (status && status !== 'all') where.status = status;
    if (from) where.date = { [Op.gte]: from };
    if (to) where.date = { ...(where.date || {}), [Op.lte]: to };
    const appointments = await Appointment.findAll({
      where,
      order: [['date', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] },
        { model: Service, as: 'service', attributes: ['id', 'name', 'price', 'duration'] },
        { model: Staff, as: 'staff', attributes: ['id', 'name', 'avatar'] }
      ]
    });
    res.json(appointments || []);
  } catch (error) {
    next(error);
  }
};