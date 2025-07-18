const { Salon, User, Service, Staff, Appointment, Review } = require('../models');
const { Op, Sequelize } = require('sequelize');
const { serializeSalon } = require('../serializers/salonSerializer');

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
        { location: { [Op.iLike]: `%${search}%` } }
        // Removed owner_name from here
      ];
    }
    const salons = await Salon.findAll({
      where,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role'],
          where: search ? {
            [Op.or]: [
              { name: { [Op.iLike]: `%${search}%` } },
              { email: { [Op.iLike]: `%${search}%` } }
            ]
          } : undefined
        }
      ]
    });
    // Calculate revenue for each salon
    const serializedSalons = await Promise.all(salons.map(async salon => {
      let revenue = await Appointment.sum('total_price', {
        where: {
          salon_id: salon.id,
          status: ['booked', 'completed'],
        }
      });
      revenue = revenue || 0;
      let bookings = await Appointment.count({
        where: {
          salon_id: salon.id,
          status: ['booked', 'completed'],
        }
      });
      bookings = bookings || 0;
      const ratingResult = await Review.findOne({
        attributes: [[Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating']],
        where: { salon_id: salon.id }
      });
      let rating = ratingResult && ratingResult.dataValues.avgRating ? parseFloat(ratingResult.dataValues.avgRating) : 0;
      return serializeSalon({ ...salon.toJSON(), revenue, bookings, rating }, { req });
    }));
    res.json({ salons: serializedSalons, total: salons.length });
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
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role'] },
        { model: Service, as: 'services' }
      ]
    });
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }
    // Calculate revenue dynamically
    const revenue = await Appointment.sum('total_price', {
      where: {
        salon_id: id,
        status: ['booked', 'completed'],
      }
    });
    const safeRevenue = revenue || 0;
    let bookings = await Appointment.count({
      where: {
        salon_id: id,
        status: ['booked', 'completed'],
      }
    });
    bookings = bookings || 0;
    const ratingResult = await Review.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating']],
      where: { salon_id: id }
    });
    let rating = ratingResult && ratingResult.dataValues.avgRating ? parseFloat(ratingResult.dataValues.avgRating) : 0;
    // Serialize the salon with all included data and dynamic revenue
    const serializedSalon = serializeSalon({ ...salon.toJSON(), revenue: safeRevenue, bookings, rating }, { req });
    res.json(serializedSalon);
  } catch (error) {
    next(error);
  }
};

// Create a new salon
exports.createSalon = async (req, res, next) => {
  try {
    const salonData = req.body;
<<<<<<< HEAD
<<<<<<< HEAD
    // Compose address and location from separate fields
    const street = salonData.address || '';
    const city = salonData.city || '';
    const state = salonData.state || '';
    const zip = salonData.zipCode || '';
    const fullAddress = `${street}, ${city}, ${state} ${zip}`.replace(/\s+,/g, ',').trim();
    const location = `${city}, ${state}`.replace(/\s+,/g, ',').trim();
    // Assign composed fields
    salonData.address = fullAddress;
    salonData.location = location;
    // Optionally remove the separate fields if not needed in DB
    delete salonData.city;
    delete salonData.state;
    delete salonData.zipCode;
    salonData.ownerId = req.user.userId;
    console.log(salonData )
    console.log(req.user)
=======
>>>>>>> parent of 50bc073 (inprogress)
=======
>>>>>>> parent of 50bc073 (inprogress)
    const newSalon = await Salon.create(salonData);
    res.status(201).json(serializeSalon(newSalon, { req }));
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
    res.json(serializeSalon(updatedSalon, { req }));
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
    res.json(serializeSalon(updatedSalon, { req }));
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