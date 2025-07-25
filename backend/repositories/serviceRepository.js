const { Service, Salon } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all services with optional filtering
 * @param {Object} query - Query parameters for filtering
 * @returns {Promise<Object>} Object with rows and count
 */
exports.findAll = async (query = {}) => {
  const where = {};
  
  if (query.status) {
    where.status = query.status;
  }
  
  if (query.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${query.search}%` } },
      { description: { [Op.iLike]: `%${query.search}%` } }
    ];
  }
  
  if (query.is_popular !== undefined) {
    where.is_popular = query.is_popular === 'true';
  }
  
  const limit = query.limit ? parseInt(query.limit, 10) : 50;
  const offset = query.page ? (parseInt(query.page, 10) - 1) * limit : 0;
  
  return await Service.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });
};

/**
 * Find service by ID
 * @param {string} id - Service ID
 * @returns {Promise<Object|null>} Service or null
 */
exports.findById = async (id) => {
  return await Service.findByPk(id, {
    include: [{
      model: Salon,
      as: 'salons',
      attributes: ['id', 'name', 'email']
    }]
  });
};

/**
 * Create a new service
 * @param {Object} serviceData - Service data
 * @returns {Promise<Object>} Created service
 */
exports.create = async (serviceData) => {
  return await Service.create(serviceData);
};

/**
 * Update service by ID
 * @param {string} id - Service ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated service or null
 */
exports.update = async (id, updateData) => {
  try {
    // First check if the service exists
    const existingService = await Service.findByPk(id);
    if (!existingService) {
      return null;
    }

    // Perform the update
    const [updatedRowsCount] = await Service.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return null;
    }

    // Return the updated service
    return await Service.findByPk(id, {
      include: [{
        model: Salon,
        as: 'salons',
        attributes: ['id', 'name', 'email']
      }]
    });
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

/**
 * Delete service by ID
 * @param {string} id - Service ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
exports.delete = async (id) => {
  const deletedRowsCount = await Service.destroy({
    where: { id }
  });

  return deletedRowsCount > 0;
};

/**
 * Get services for a specific salon
 * @param {string} salonId - Salon ID
 * @returns {Promise<Array>} Array of services for the salon
 */
exports.findBySalonId = async (salonId) => {
  const salon = await Salon.findByPk(salonId, {
    include: [{
      model: Service,
      as: 'services'
    }]
  });
  
  return salon ? salon.services : [];
};

/**
 * Add service to salon
 * @param {string} salonId - Salon ID
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>} Result of the association
 */
exports.addServiceToSalon = async (salonId, serviceId) => {
  const salon = await Salon.findByPk(salonId);
  const service = await Service.findByPk(serviceId);
  
  if (!salon || !service) {
    throw new Error('Salon or Service not found');
  }
  
  return await salon.addService(service);
};

/**
 * Remove service from salon
 * @param {string} salonId - Salon ID
 * @param {string} serviceId - Service ID
 * @returns {Promise<number>} Number of affected rows
 */
exports.removeServiceFromSalon = async (salonId, serviceId) => {
  const salon = await Salon.findByPk(salonId);
  
  if (!salon) {
    throw new Error('Salon not found');
  }
  
  return await salon.removeService(serviceId);
};

/**
 * Find service by ID if it belongs to the specified salon
 * @param {string} serviceId - Service ID
 * @param {string} salonId - Salon ID
 * @returns {Promise<Object|null>} Service or null
 */
exports.findByIdForSalon = async (serviceId, salonId) => {
  const salon = await Salon.findByPk(salonId, {
    include: [{
      model: Service,
      as: 'services',
      where: { id: serviceId },
      required: false
    }]
  });
  
  if (!salon || !salon.services || salon.services.length === 0) {
    return null;
  }
  
  return salon.services[0];
};

/**
 * Check if service name exists for a specific salon
 * @param {string} name - Service name
 * @param {string} salonId - Salon ID
 * @param {string} excludeServiceId - Service ID to exclude (for updates)
 * @returns {Promise<boolean>} True if name exists
 */
exports.nameExistsForSalon = async (name, salonId, excludeServiceId = null) => {
  const whereClause = { name };
  
  if (excludeServiceId) {
    whereClause.id = { [require('sequelize').Op.ne]: excludeServiceId };
  }
  
  const existingService = await Service.findOne({
    include: [{
      model: Salon,
      as: 'salons',
      where: { id: salonId },
      required: true
    }],
    where: whereClause
  });
  
  return !!existingService;
}; 