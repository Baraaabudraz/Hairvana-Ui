const salonRepository = require('../repositories/salonRepository');
const addressService = require('./addressService');
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

exports.getSalonByOwnerId = async (ownerId, req) => {
  const salon = await salonRepository.findByOwnerId(ownerId);
  if (!salon) return null;
  const revenue = await salonRepository.getRevenue(salon.id);
  const bookings = await salonRepository.getBookings(salon.id);
  const rating = await salonRepository.getRating(salon.id);
  return serializeSalon({ ...salon.toJSON(), revenue, bookings, rating }, { req });
};

exports.getAllSalonsByOwnerId = async (ownerId, req) => {
  const salons = await salonRepository.findAllByOwnerId(ownerId);
  const salonsWithStats = await Promise.all(salons.map(async salon => {
    const revenue = await salonRepository.getRevenue(salon.id);
    const bookings = await salonRepository.getBookings(salon.id);
    const rating = await salonRepository.getRating(salon.id);
    return serializeSalon({ ...salon.toJSON(), revenue, bookings, rating }, { req });
  }));
  return salonsWithStats;
};

exports.createSalon = async (req) => {
  const salonData = req.body;
  
  // Ensure owner_id is set
  if (!salonData.owner_id) {
    throw new Error('Owner ID is required for salon creation');
  }
  
  // Create address first if address data is provided
  let addressId = null;
  if (salonData.street_address && salonData.city && salonData.state) {
    const addressData = {
      street_address: salonData.street_address,
      city: salonData.city,
      state: salonData.state,
      zip_code: salonData.zip_code || '',
      country: salonData.country || 'US'
    };
    
    const newAddress = await addressService.createAddress(addressData);
    addressId = newAddress.id;
  }
  
  // Handle image uploads
  let avatar = null;
  let gallery = [];
  if (req.files && req.files['avatar'] && req.files['avatar'][0]) {
    avatar = req.files['avatar'][0].filename;
  }
  if (req.files && req.files['gallery']) {
    gallery = req.files['gallery'].map(f => f.filename);
  }
  
  // Prepare salon data (remove address fields from salon data)
  const {
    street_address,
    city,
    state,
    zip_code,
    country,
    ...cleanSalonData
  } = salonData;
  
  // Set image data and address_id
  cleanSalonData.avatar = avatar;
  cleanSalonData.gallery = gallery;
  cleanSalonData.address_id = addressId;
  
  const newSalon = await salonRepository.create(cleanSalonData);
  return serializeSalon(newSalon, { req });
};

exports.updateSalon = async (id, data, req) => {
  // Get the old salon before updating
  const oldSalon = await salonRepository.findById(id);
  // Handle image uploads and existing gallery
  let avatar = oldSalon ? oldSalon.avatar : null;
  let gallery = oldSalon && Array.isArray(oldSalon.gallery) ? [...oldSalon.gallery] : [];
  if (req.files && req.files['avatar'] && req.files['avatar'][0]) {
    // Delete old avatar if it exists
    if (avatar) {
      const oldAvatarPath = path.join(__dirname, '../public/uploads/salons', avatar);
      fs.unlink(oldAvatarPath, (err) => { /* ignore error if file doesn't exist */ });
    }
    avatar = req.files['avatar'][0].filename;
  }
  if (req.files && req.files['gallery']) {
    gallery = req.files['gallery'].map(f => f.filename);
  }
  if (req.body.gallery) {
    if (Array.isArray(req.body.gallery)) {
      gallery = gallery.concat(req.body.gallery);
    } else if (typeof req.body.gallery === 'string') {
      gallery = gallery.concat([req.body.gallery]);
    }
  }
  // Delete removed gallery images from disk
  if (oldSalon && Array.isArray(oldSalon.gallery)) {
    const removedImages = oldSalon.gallery.filter(img => !gallery.includes(img));
    removedImages.forEach(img => {
      const imgPath = path.join(__dirname, '../public/uploads/salons', img);
      fs.unlink(imgPath, (err) => { /* ignore error if file doesn't exist */ });
    });
  }
  data.avatar = avatar;
  data.gallery = gallery;
  const updatedSalon = await salonRepository.update(id, data);
  return updatedSalon ? serializeSalon(updatedSalon, { req }) : null;
};

exports.updateSalonProfile = async (id, data, req) => {
  // Get the old salon before updating
  const oldSalon = await salonRepository.findById(id);
  if (!oldSalon) return null;
  
  // Handle avatar upload
  let avatar = oldSalon.avatar;
  if (data.avatar) {
    // Delete old avatar if it exists and new one is provided
    if (avatar && avatar !== data.avatar) {
      const oldAvatarPath = path.join(__dirname, '../public/uploads/salons', avatar);
      fs.unlink(oldAvatarPath, (err) => { /* ignore error if file doesn't exist */ });
    }
    avatar = data.avatar;
  }
  
  // Handle gallery images
  let gallery = oldSalon.gallery && Array.isArray(oldSalon.gallery) ? [...oldSalon.gallery] : [];
  if (data.gallery) {
    // If new gallery is provided, replace the old one
    gallery = Array.isArray(data.gallery) ? data.gallery : [data.gallery];
    
    // Delete removed gallery images from disk
    if (oldSalon.gallery && Array.isArray(oldSalon.gallery)) {
      const removedImages = oldSalon.gallery.filter(img => !gallery.includes(img));
      removedImages.forEach(img => {
        const imgPath = path.join(__dirname, '../public/uploads/salons', img);
        fs.unlink(imgPath, (err) => { /* ignore error if file doesn't exist */ });
      });
    }
  }
  
  // Update data with processed image fields
  const updateData = {
    ...data,
    avatar,
    gallery
  };
  
  const updatedSalon = await salonRepository.update(id, updateData);
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
