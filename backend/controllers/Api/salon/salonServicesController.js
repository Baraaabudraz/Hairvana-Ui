const serviceRepository = require('../../../repositories/serviceRepository');
const salonRepository = require('../../../repositories/salonRepository');
const { getFileInfo } = require('../../../helpers/uploadHelper');
const { buildUrl } = require('../../../helpers/urlHelper');

/**
 * Get all services for a specific salon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getSalonServices = async (req, res, next) => {
  try {
    const salonId = req.params.salonId;
    
    // Verify that the authenticated user owns this salon
    const salon = await salonRepository.findById(salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }
    
    if (salon.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view services for your own salon.'
      });
    }
    
    const services = await serviceRepository.findBySalonId(salonId);
    
    // Build full image URLs for all services
    const servicesWithFullUrls = services.map(service => {
      if (service.image_url) {
        service.image_url = buildUrl(service.image_url, 'service', { req });
      }
      return service;
    });
    
    return res.status(200).json({
      success: true,
      message: `Found ${servicesWithFullUrls.length} service(s) for this salon`,
      data: servicesWithFullUrls,
      total: servicesWithFullUrls.length
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
    
    // Build full image URLs for all services
    const servicesWithFullUrls = services.map(service => {
      if (service.image_url) {
        service.image_url = buildUrl(service.image_url, 'service', { req });
      }
      return service;
    });
    
    return res.status(200).json({
      success: true,
      data: servicesWithFullUrls,
      total: count
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new service for a specific salon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.createService = async (req, res, next) => {
  try {
    const salonId = req.params.salonId;
    const serviceData = req.body;
    
    // Handle image upload if file is present
    if (req.file) {
      const fileInfo = getFileInfo(req.file, '/images/services');
      serviceData.image_url = fileInfo.storedName; // Store only filename
      serviceData.image_filename = fileInfo.storedName;
      serviceData.image_original_name = fileInfo.originalName;
    }
    
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
    
    // Verify that the authenticated user owns this salon
    const salon = await salonRepository.findById(salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }
    
    if (salon.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only create services for your own salon.'
      });
    }
    
    // Additional check for unique name in salon (double validation)
    const nameExists = await serviceRepository.nameExistsForSalon(serviceData.name, salonId);
    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: 'A service with this name already exists in this salon'
      });
    }
    
    // Create the service
    const newService = await serviceRepository.create(serviceData);
    
    // Automatically add the service to the salon
    await serviceRepository.addServiceToSalon(salonId, newService.id);
    
    // Return the created service with salon information
    const serviceWithSalon = await serviceRepository.findById(newService.id);
    
    // Build full image URL if image exists
    if (serviceWithSalon.image_url) {
      serviceWithSalon.image_url = buildUrl(serviceWithSalon.image_url, 'service', { req });
    }
    
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
    const { serviceId, salonId } = req.params;
    
    // Verify that the authenticated user owns this salon
    const salon = await salonRepository.findById(salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }
    
    if (salon.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only remove services from your own salon.'
      });
    }
    
    // Remove service from salon
    const result = await serviceRepository.removeServiceFromSalon(salonId, serviceId);
    
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
    const { serviceId, salonId } = req.params;
    const updateData = req.body;
    
    // Handle image upload if file is present
    if (req.file) {
      const fileInfo = getFileInfo(req.file, '/images/services');
      updateData.image_url = fileInfo.storedName; // Store only filename
      updateData.image_filename = fileInfo.storedName;
      updateData.image_original_name = fileInfo.originalName;
    }
    
    // Verify that the authenticated user owns this salon
    const salon = await salonRepository.findById(salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }
    
    if (salon.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update services for your own salon.'
      });
    }
    
    // Check if the service belongs to the salon before updating
    const existingService = await serviceRepository.findByIdForSalon(serviceId, salonId);
    
    if (!existingService) {
      // Debug: Check if service exists globally for troubleshooting
      const globalService = await serviceRepository.findById(serviceId);
      
      return res.status(404).json({
        success: false,
        message: 'Service not found in your salon',
        debug: {
          serviceId: serviceId,
          salonId: salonId,
          salonName: salon.name,
          serviceExistsGlobally: !!globalService,
          globalServiceSalons: globalService ? globalService.salons : null
        }
      });
    }
    
    // Clean and validate update data
    const cleanedUpdateData = {};
    
    // Only include valid fields for update
    const allowedFields = ['name', 'description', 'price', 'duration', 'status', 'is_popular', 'image_url', 'image_filename', 'image_original_name', 'special_offers'];
    
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
      const nameExists = await serviceRepository.nameExistsForSalon(cleanedUpdateData.name, salonId, serviceId);
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
      
      // Build full image URL if image exists
      if (updatedService.image_url) {
        updatedService.image_url = buildUrl(updatedService.image_url, 'service', { req });
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
    const { serviceId, salonId } = req.params;
    
    // Verify that the authenticated user owns this salon
    const salon = await salonRepository.findById(salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }
    
    if (salon.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view services for your own salon.'
      });
    }
    
    // Debug: Check if service exists globally
    const globalService = await serviceRepository.findById(serviceId);
    
    // Find service only if it belongs to the salon
    const service = await serviceRepository.findByIdForSalon(serviceId, salonId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found in your salon',
        debug: {
          serviceId: serviceId,
          salonId: salonId,
          salonName: salon.name,
          serviceExistsGlobally: !!globalService,
          globalServiceSalons: globalService ? globalService.salons : null
        }
      });
    }
    
    // Build full image URL if image exists
    if (service.image_url) {
      service.image_url = buildUrl(service.image_url, 'service', { req });
    }
    
    return res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
}; 