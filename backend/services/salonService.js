const salonRepository = require('../repositories/salonRepository');
const addressService = require('./addressService');
const { serializeSalon } = require('../serializers/salonSerializer');
const { Service, Salon, Sequelize } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

const DEFAULT_SERVICE_PRICE = 0;
const DEFAULT_SERVICE_DURATION = 60;

const normalizeServiceName = (name) =>
  typeof name === 'string' ? name.trim() : '';

const parseServiceInputValue = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap(parseServiceInputValue);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.flatMap(parseServiceInputValue);
      }
    } catch (_) {
      // Not JSON, fall through
    }

    if (trimmed.includes(',')) {
      return trimmed.split(',').map((item) => item.trim());
    }

    return [trimmed];
  }

  return [];
};

const extractServicesFromPayload = (payload = {}) => {
  const keys = ['services', 'services[]', 'selectedServices'];
  const sources = [];

  keys.forEach((key) => {
    if (payload[key] !== undefined) {
      sources.push(payload[key]);
    }
  });

  if (sources.length === 0) return null;

  const names = sources
    .flatMap(parseServiceInputValue)
    .map(normalizeServiceName)
    .filter(Boolean);

  const uniqueNames = [];
  const seen = new Set();

  names.forEach((name) => {
    const lower = name.toLowerCase();
    if (seen.has(lower)) return;
    seen.add(lower);
    uniqueNames.push(name);
  });

  return uniqueNames;
};

const removeServicePayloadKeys = (payload = {}) => {
  delete payload.services;
  delete payload['services[]'];
  delete payload.selectedServices;
};

const buildDefaultServicePayload = (name) => ({
  name,
  description: `${name} service`,
  price: DEFAULT_SERVICE_PRICE,
  duration: DEFAULT_SERVICE_DURATION,
  status: 'active'
});

const syncSalonServicesByNames = async (salonId, serviceNames) => {
  if (!Array.isArray(serviceNames) || salonId === undefined || salonId === null) {
    return;
  }

  const salon = await Salon.findByPk(salonId);
  if (!salon) return;

  if (serviceNames.length === 0) {
    await salon.setServices([]);
    return;
  }

  const normalizedLower = [...new Set(serviceNames.map((name) => name.toLowerCase()))];

  const existingServices = await Service.findAll({
    where: Sequelize.where(
      Sequelize.fn('LOWER', Sequelize.col('name')),
      { [Op.in]: normalizedLower }
    )
  });

  const existingNameSet = new Set(existingServices.map((service) => service.name.toLowerCase()));
  const missingNames = serviceNames.filter((name) => !existingNameSet.has(name.toLowerCase()));

  if (missingNames.length > 0) {
    const createdServices = await Service.bulkCreate(
      missingNames.map((name) => buildDefaultServicePayload(name)),
      { returning: true }
    );
    existingServices.push(...createdServices);
  }

  await salon.setServices(existingServices);
};

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
  
  // Get additional stats
  const revenue = await salonRepository.getRevenue(salon.id);
  const bookings = await salonRepository.getBookings(salon.id);
  const rating = await salonRepository.getRating(salon.id);
  
  // Ensure salon data includes address and services from the repository query
  const salonData = {
    ...salon.toJSON(),
    revenue,
    bookings,
    rating
  };
  
  return serializeSalon(salonData, { req });
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
  const selectedServices = extractServicesFromPayload(salonData);
  removeServicePayloadKeys(salonData);
  
  // Ensure owner_id is set
  if (!salonData.owner_id) {
    throw new Error('Owner ID is required for salon creation');
  }
  
  // Create address first if address data is provided
  let addressId = null;
  console.log('Debug - Salon data for address creation:', {
    street_address: salonData.street_address,
    city: salonData.city,
    state: salonData.state,
    zip_code: salonData.zip_code,
    country: salonData.country
  });
  
  if (salonData.street_address && salonData.city && salonData.state) {
    const addressData = {
      street_address: salonData.street_address,
      city: salonData.city,
      state: salonData.state,
      zip_code: salonData.zip_code || '',
      country: salonData.country || 'US'
    };
    
    try {
      const newAddress = await addressService.createAddress(addressData);
      addressId = newAddress.id;
      console.log('Debug - Address created successfully:', addressId);
    } catch (error) {
      console.error('Debug - Address creation failed:', error.message);
      throw new Error(`Failed to create address: ${error.message}`);
    }
  } else {
    console.log('Debug - Skipping address creation - missing required fields');
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
  
  // Handle hours field - ensure it's properly formatted
  if (cleanSalonData.hours) {
    console.log('Debug - Original hours data (create):', cleanSalonData.hours);
    
    // If hours is a JSON string, parse it
    if (typeof cleanSalonData.hours === 'string') {
      try {
        cleanSalonData.hours = JSON.parse(cleanSalonData.hours);
        console.log('Debug - Parsed hours from JSON string:', cleanSalonData.hours);
      } catch (error) {
        console.error('Debug - Failed to parse hours JSON:', error);
        // If parsing fails, keep as string
      }
    }
    
    // Sanitize hours data - clean up incomplete time formats
    if (typeof cleanSalonData.hours === 'object' && cleanSalonData.hours !== null) {
      const sanitizedHours = {};
      for (const [day, time] of Object.entries(cleanSalonData.hours)) {
        if (typeof time === 'string') {
          const trimmedTime = time.trim();
          // Only sanitize truly incomplete formats (just dashes or empty)
          // Don't sanitize valid time ranges or "Closed"
          if (trimmedTime === ' - ' || trimmedTime === '-' || trimmedTime === '' || trimmedTime === ' -') {
            sanitizedHours[day] = 'Closed';
            console.log(`Debug - Sanitized ${day} from "${time}" to "Closed" (incomplete format)`);
          } else if (trimmedTime.toLowerCase() === 'closed') {
            sanitizedHours[day] = 'Closed';
          } else {
            // Keep valid time ranges as-is
            sanitizedHours[day] = trimmedTime;
            console.log(`Debug - Keeping ${day} as "${trimmedTime}" (valid format)`);
          }
        } else {
          sanitizedHours[day] = time;
        }
      }
      cleanSalonData.hours = sanitizedHours;
      console.log('Debug - Sanitized hours data:', cleanSalonData.hours);
    }
    
    // If hours is an array, convert it to a more structured format
    if (Array.isArray(cleanSalonData.hours)) {
      const hoursObject = {};
      cleanSalonData.hours.forEach((hour, index) => {
        if (typeof hour === 'string') {
          // Try to parse "day: time" format (e.g., "friday: 9:00 AM - 9:00 PM")
          const colonIndex = hour.indexOf(':');
          if (colonIndex !== -1) {
            const day = hour.substring(0, colonIndex).trim().toLowerCase();
            const time = hour.substring(colonIndex + 1).trim();
            hoursObject[day] = time;
          } else {
            // If no colon found, use index as key
            hoursObject[`day_${index}`] = hour;
          }
        } else if (typeof hour === 'object' && hour !== null) {
          // If it's already an object, merge it
          Object.assign(hoursObject, hour);
        }
      });
      cleanSalonData.hours = hoursObject;
      console.log('Debug - Processed hours object (create):', cleanSalonData.hours);
    }
    // If hours is already an object, keep it as is
  }
  
  const newSalon = await salonRepository.create(cleanSalonData);

  if (selectedServices !== null) {
    await syncSalonServicesByNames(newSalon.id, selectedServices);
  }

  const hydratedSalon = await salonRepository.findById(newSalon.id);
  return serializeSalon(hydratedSalon || newSalon, { req });
};

exports.updateSalon = async (id, data, req) => {
  const selectedServices = extractServicesFromPayload(data);
  removeServicePayloadKeys(data);
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
  
  // Handle hours field - ensure it's properly formatted
  if (data.hours) {
    console.log('Debug - Original hours data (update):', data.hours);
    
    // If hours is a JSON string, parse it
    if (typeof data.hours === 'string') {
      try {
        data.hours = JSON.parse(data.hours);
        console.log('Debug - Parsed hours from JSON string (update):', data.hours);
      } catch (error) {
        console.error('Debug - Failed to parse hours JSON (update):', error);
        // If parsing fails, keep as string
      }
    }
    
    // Sanitize hours data - clean up incomplete time formats
    if (typeof data.hours === 'object' && data.hours !== null) {
      const sanitizedHours = {};
      for (const [day, time] of Object.entries(data.hours)) {
        if (typeof time === 'string') {
          const trimmedTime = time.trim();
          // Only sanitize truly incomplete formats (just dashes or empty)
          // Don't sanitize valid time ranges or "Closed"
          if (trimmedTime === ' - ' || trimmedTime === '-' || trimmedTime === '' || trimmedTime === ' -') {
            sanitizedHours[day] = 'Closed';
            console.log(`Debug - Sanitized ${day} from "${time}" to "Closed" (incomplete format)`);
          } else if (trimmedTime.toLowerCase() === 'closed') {
            sanitizedHours[day] = 'Closed';
          } else {
            // Keep valid time ranges as-is
            sanitizedHours[day] = trimmedTime;
            console.log(`Debug - Keeping ${day} as "${trimmedTime}" (valid format)`);
          }
        } else {
          sanitizedHours[day] = time;
        }
      }
      data.hours = sanitizedHours;
      console.log('Debug - Sanitized hours data (update):', data.hours);
    }
    
    // If hours is an array, convert it to a more structured format
    if (Array.isArray(data.hours)) {
      const hoursObject = {};
      data.hours.forEach((hour, index) => {
        if (typeof hour === 'string') {
          // Try to parse "day: time" format (e.g., "friday: 9:00 AM - 9:00 PM")
          const colonIndex = hour.indexOf(':');
          if (colonIndex !== -1) {
            const day = hour.substring(0, colonIndex).trim().toLowerCase();
            const time = hour.substring(colonIndex + 1).trim();
            hoursObject[day] = time;
          } else {
            // If no colon found, use index as key
            hoursObject[`day_${index}`] = hour;
          }
        } else if (typeof hour === 'object' && hour !== null) {
          // If it's already an object, merge it
          Object.assign(hoursObject, hour);
        }
      });
      data.hours = hoursObject;
      console.log('Debug - Processed hours object (update):', data.hours);
    }
    // If hours is already an object, keep it as is
  }
  
  // Handle address update
  let addressId = oldSalon ? oldSalon.address_id : null;
  if (data.street_address && data.city && data.state) {
    const addressData = {
      street_address: data.street_address,
      city: data.city,
      state: data.state,
      zip_code: data.zip_code || '',
      country: data.country || 'US'
    };
    
    try {
      // Check if salon already has an address
      if (addressId) {
        // Update existing address
        console.log('Debug - Updating existing address:', addressId);
        await addressService.updateAddress(addressId, addressData);
      } else {
        // Create new address
        console.log('Debug - Creating new address for salon');
        const newAddress = await addressService.createAddress(addressData);
        addressId = newAddress.id;
        console.log('Debug - Address created successfully:', addressId);
      }
    } catch (error) {
      console.error('Debug - Address update/create failed:', error.message);
      throw new Error(`Failed to update address: ${error.message}`);
    }
  }
  
  // Remove address fields from salon data before updating
  const {
    street_address,
    city,
    state,
    zip_code,
    country,
    ...cleanSalonData
  } = data;
  
  // Set address_id if it was updated or created
  if (addressId) {
    cleanSalonData.address_id = addressId;
  }
  
  let updatedSalon = await salonRepository.update(id, cleanSalonData);
  if (!updatedSalon) {
    return null;
  }

  if (selectedServices !== null) {
    await syncSalonServicesByNames(id, selectedServices);
    updatedSalon = await salonRepository.findById(id);
  }

  return serializeSalon(updatedSalon, { req });
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
  
  // Update the salon (now returns full salon with includes)
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

/**
 * Get monthly revenue for a specific salon
 * @param {string} salonId - Salon ID
 * @param {string} year - Year (optional, defaults to current year)
 * @param {string} month - Month (optional, defaults to current month)
 * @returns {Object} Monthly revenue data
 */
exports.getMonthlyRevenue = async (salonId, year, month) => {
  const currentDate = new Date();
  const targetYear = year || currentDate.getFullYear();
  const targetMonth = month || (currentDate.getMonth() + 1);
  
  const monthlyRevenue = await salonRepository.getMonthlyRevenue(salonId, targetYear, targetMonth);
  
  return {
    salonId,
    year: parseInt(targetYear),
    month: parseInt(targetMonth),
    totalRevenue: monthlyRevenue.totalRevenue || 0,
    totalTransactions: monthlyRevenue.totalTransactions || 0,
    averageTransactionValue: monthlyRevenue.averageTransactionValue || 0,
    revenueBreakdown: monthlyRevenue.revenueBreakdown || []
  };
};

/**
 * Get transaction history for a specific salon
 * @param {string} salonId - Salon ID
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.status - Payment status filter
 * @param {string} options.from - Start date filter
 * @param {string} options.to - End date filter
 * @returns {Object} Transaction history data
 */
exports.getTransactionHistory = async (salonId, options) => {
  const transactionHistory = await salonRepository.getTransactionHistory(salonId, options);
  
  // Get services for each appointment
  const transactionsWithServices = await Promise.all(
    transactionHistory.transactions.map(async (transaction) => {
      if (transaction.appointment) {
        const services = await salonRepository.getAppointmentServices(transaction.appointment.id);
        return {
          ...transaction.toJSON ? transaction.toJSON() : transaction,
          appointment: {
            ...transaction.appointment.toJSON ? transaction.appointment.toJSON() : transaction.appointment,
            services: services || []
          }
        };
      }
      return transaction.toJSON ? transaction.toJSON() : transaction;
    })
  );
  
  return {
    salonId,
    transactions: transactionsWithServices || [],
    pagination: {
      page: options.page,
      limit: options.limit,
      total: transactionHistory.total || 0,
      totalPages: Math.ceil((transactionHistory.total || 0) / options.limit)
    },
    summary: {
      totalAmount: transactionHistory.totalAmount || 0,
      totalTransactions: transactionHistory.total || 0,
      averageAmount: transactionHistory.averageAmount || 0
    }
  };
}; 