const salonRepository = require('../repositories/salonRepository');
const { formatAddress, formatLocation } = require('../helpers/formatHelper');
const { serializeSalon } = require('../serializers/salonSerializer');
const fs = require('fs');
const path = require('path');

exports.getAllSalons = async (query, req) => {
  const { rows, count } = await salonRepository.findAll(query);
  const salons = await Promise.all(rows.map(async salon => {
    const revenue = await salonRepository.getRevenue(salon.id);
    const bookings = await salonRepository.getBookings(salon.id);
    const rating = await salonRepository.getRating(salon.id);
    return serializeSalon({ ...salon.toJSON(), revenue, bookings, rating }, { req });
  }));
  return { salons, total: count };
};

exports.getSalonById = async (id, req) => {
  const salon = await salonRepository.findById(id);
  if (!salon) return null;
  const revenue = await salonRepository.getRevenue(id);
  const bookings = await salonRepository.getBookings(id);
  const rating = await salonRepository.getRating(id);
  return serializeSalon({ ...salon.toJSON(), revenue, bookings, rating }, { req });
};

exports.createSalon = async (req) => {
  const salonData = req.body;
  // Handle image uploads
  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map(f => f.filename);
  }
  // Handle existing images from req.body (from form)
  if (req.body.images) {
    if (Array.isArray(req.body.images)) {
      images = images.concat(req.body.images);
    } else if (typeof req.body.images === 'string') {
      images = images.concat([req.body.images]);
    }
  }
  salonData.images = images;
  const address = formatAddress(salonData);
  const location = formatLocation(salonData);
  const newSalon = await salonRepository.create(salonData);
  return serializeSalon(newSalon, { req });
};

exports.updateSalon = async (id, data, req) => {
  // Get the old salon before updating
  const oldSalon = await salonRepository.findById(id);
  // Handle image uploads and existing images
  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map(f => f.filename);
  }
  if (req.body.images) {
    if (Array.isArray(req.body.images)) {
      images = images.concat(req.body.images);
    } else if (typeof req.body.images === 'string') {
      images = images.concat([req.body.images]);
    }
  }
  // Delete images that are no longer referenced
  if (oldSalon && Array.isArray(oldSalon.images)) {
    oldSalon.images.forEach(img => {
      if (!images.includes(img)) {
        const imgPath = path.join(__dirname, '../public/uploads/salons', img);
        fs.unlink(imgPath, (err) => { /* ignore error if file doesn't exist */ });
      }
    });
  }
  data.images = images;
  const updatedSalon = await salonRepository.update(id, data);
  return updatedSalon ? serializeSalon(updatedSalon, { req }) : null;
};

exports.deleteSalon = async (id) => {
  // Get the salon before deleting
  const salon = await salonRepository.findById(id);
  // Delete the salon
  const deleted = await salonRepository.delete(id);
  if (!deleted) return null;
  // Delete all images from disk
  if (salon && Array.isArray(salon.images)) {
    salon.images.forEach(img => {
      const imgPath = path.join(__dirname, '../public/uploads/salons', img);
      fs.unlink(imgPath, (err) => { /* ignore error if file doesn't exist */ });
    });
  }
  return { message: 'Salon deleted successfully' };
};

exports.updateSalonStatus = async (id, status, req) => {
  const updatedSalon = await salonRepository.updateStatus(id, status);
  return updatedSalon ? serializeSalon(updatedSalon, { req }) : null;
};

exports.getSalonServices = async (id) => {
  return salonRepository.getServices(id);
};

exports.getSalonStaff = async (id) => {
  return salonRepository.getStaff(id);
};

exports.getSalonAppointments = async (id, query) => {
  return salonRepository.getAppointments(id, query);
}; 