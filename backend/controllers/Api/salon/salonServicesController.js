const serviceRepository = require('../../../repositories/serviceRepository');
const salonRepository = require('../../../repositories/salonRepository');

/**
 * Get all services for the authenticated salon owner's salon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getSalonServices = async (req, res, next) => {
  try {
    // Get salon by owner ID to ensure ownership
    const salon = await salonRepository.findByOwnerId(req.user.id);
    
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found for this owner'
      });
    }
    
    const services = await serviceRepository.findBySalonId(salon.id);
    
    return res.status(200).json({
      success: true,
      data: services,
      total: services.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all available services (not necessarily assigned to salon)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getAllServices = async (req, res, next) => {
  try {
    const { rows: services, count } = await serviceRepository.findAll(req.query);
    
    return res.status(200).json({
      success: true,
      data: services,
      total: count
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new service for the salon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.createService = async (req, res, next) => {
  try {
    const serviceData = req.body;
    
    // Transform special_offers if it's an array
    if (serviceData.special_offers && Array.isArray(serviceData.special_offers)) {
      const offersObject = {};
      serviceData.special_offers.forEach((offer, index) => {
        if (typeof offer === 'string') {
          // Try to split by colon if it's in "key: value" format
          const colonIndex = offer.indexOf(':');
          if (colonIndex > -1) {
            const key = offer.substring(0, colonIndex).trim();
            const value = offer.substring(colonIndex + 1).trim();
            offersObject[key] = value;
          } else {
            // Otherwise, use a generic key
            offersObject[`offer_${index + 1}`] = offer;
          }
        } else {
          offersObject[`offer_${index + 1}`] = offer;
        }
      });
      serviceData.special_offers = offersObject;
    }
    
    // Get salon by owner ID to ensure ownership
    const salon = await salonRepository.findByOwnerId(req.user.id);
    
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found for this owner'
      });
    }
    
    // Additional check for unique name in salon (double validation)
    const nameExists = await serviceRepository.nameExistsForSalon(serviceData.name, salon.id);
    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: 'A service with this name already exists in your salon'
      });
    }
    
    // Create the service
    const newService = await serviceRepository.create(serviceData);
    
    // Automatically add the service to the salon
    await serviceRepository.addServiceToSalon(salon.id, newService.id);
    
    // Return the created service with salon information
    const serviceWithSalon = await serviceRepository.findById(newService.id);
    
    return res.status(201).json({
      success: true,
      message: 'Service created and added to salon successfully',
      data: serviceWithSalon
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add an existing service to the salon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.addServiceToSalon = async (req, res, next) => {
  try {
    const { serviceId } = req.body;
    
    // Get salon by owner ID to ensure ownership
    const salon = await salonRepository.findByOwnerId(req.user.id);
    
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found for this owner'
      });
    }
    
    // Check if service exists
    const service = await serviceRepository.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    // Add service to salon
    await serviceRepository.addServiceToSalon(salon.id, serviceId);
    
    return res.status(200).json({
      success: true,
      message: 'Service added to salon successfully',
      data: {
        salon_id: salon.id,
        service_id: serviceId,
        service: service
      }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Service is already added to this salon'
      });
    }
    next(error);
  }
};

/**
 * Remove a service from the salon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.removeServiceFromSalon = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    
    // Get salon by owner ID to ensure ownership
    const salon = await salonRepository.findByOwnerId(req.user.id);
    
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found for this owner'
      });
    }
    
    // Remove service from salon
    const result = await serviceRepository.removeServiceFromSalon(salon.id, serviceId);
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found in this salon'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Service removed from salon successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.updateService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const updateData = req.body;
    
    // Get salon by owner ID to ensure ownership
    const salon = await salonRepository.findByOwnerId(req.user.id);
    
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found for this owner'
      });
    }
    
    // Check if the service belongs to the salon before updating
    const existingService = await serviceRepository.findByIdForSalon(serviceId, salon.id);
    
    if (!existingService) {
      // Debug: Check if service exists globally for troubleshooting
      const globalService = await serviceRepository.findById(serviceId);
      
      return res.status(404).json({
        success: false,
        message: 'Service not found in your salon',
        debug: {
          serviceId: serviceId,
          salonId: salon.id,
          salonName: salon.name,
          serviceExistsGlobally: !!globalService,
          globalServiceSalons: globalService ? globalService.salons : null
        }
      });
    }
    
    // Clean and validate update data
    const cleanedUpdateData = {};
    
    // Only include valid fields for update
    const allowedFields = ['name', 'description', 'price', 'duration', 'status', 'is_popular', 'image_url', 'special_offers'];
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        cleanedUpdateData[field] = updateData[field];
      }
    }
    
    // Transform special_offers if it's an array
    if (cleanedUpdateData.special_offers && Array.isArray(cleanedUpdateData.special_offers)) {
      const offersObject = {};
      cleanedUpdateData.special_offers.forEach((offer, index) => {
        if (typeof offer === 'string') {
          // Try to split by colon if it's in "key: value" format
          const colonIndex = offer.indexOf(':');
          if (colonIndex > -1) {
            const key = offer.substring(0, colonIndex).trim();
            const value = offer.substring(colonIndex + 1).trim();
            offersObject[key] = value;
          } else {
            // Otherwise, use a generic key
            offersObject[`offer_${index + 1}`] = offer;
          }
        } else {
          offersObject[`offer_${index + 1}`] = offer;
        }
      });
      cleanedUpdateData.special_offers = offersObject;
    }
    
    console.log('Cleaned update data:', cleanedUpdateData);
    
    // Additional check for unique name in salon if name is being updated
    if (cleanedUpdateData.name) {
      const nameExists = await serviceRepository.nameExistsForSalon(cleanedUpdateData.name, salon.id, serviceId);
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'A service with this name already exists in your salon'
        });
      }
    }
    
    try {
      const updatedService = await serviceRepository.update(serviceId, cleanedUpdateData);
      
      if (!updatedService) {
        return res.status(400).json({
          success: false,
          message: 'Failed to update service',
          debug: {
            serviceId: serviceId,
            originalUpdateData: updateData,
            cleanedUpdateData: cleanedUpdateData,
            existingService: existingService
          }
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Service updated successfully',
        data: updatedService
      });
    } catch (updateError) {
      console.error('Service update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Database error during service update',
        error: updateError.message,
        debug: {
          serviceId: serviceId,
          originalUpdateData: updateData,
          cleanedUpdateData: cleanedUpdateData
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific service by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getServiceById = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    
    // Get salon by owner ID to ensure ownership
    const salon = await salonRepository.findByOwnerId(req.user.id);
    
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found for this owner'
      });
    }
    
    // Debug: Check if service exists globally
    const globalService = await serviceRepository.findById(serviceId);
    
    // Find service only if it belongs to the salon
    const service = await serviceRepository.findByIdForSalon(serviceId, salon.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found in your salon',
        debug: {
          serviceId: serviceId,
          salonId: salon.id,
          salonName: salon.name,
          serviceExistsGlobally: !!globalService,
          globalServiceSalons: globalService ? globalService.salons : null
        }
      });
    }
    
    return res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
}; 