const salonService = require('../../../services/salonService');

/**
 * Get all salons for the authenticated owner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getAllSalonsForOwner = async (req, res, next) => {
  try {
    const salons = await salonService.getAllSalonsByOwnerId(req.user.id, req);
    
    return res.status(200).json({ 
      success: true, 
      data: salons,
      total: salons.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get salon by ID for the authenticated owner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getSalonById = async (req, res, next) => {
  try {
    const salon = await salonService.getSalonById(req.params.id, req);
    
    if (!salon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Salon not found' 
      });
    }

    // Verify ownership
    if (salon.owner_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only view your own salons.' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: salon 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new salon for the authenticated owner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.createSalon = async (req, res, next) => {
  try {
    // Validate required file uploads
    if (!req.files || !req.files['avatar'] || req.files['avatar'].length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Avatar image is required'
      });
    }

    // Set the owner_id to the authenticated user's ID
    req.body.owner_id = req.user.id;
    
    const newSalon = await salonService.createSalon(req);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Salon created successfully',
      data: newSalon 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a salon for the authenticated owner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.deleteSalon = async (req, res, next) => {
  try {
    const salon = await salonService.getSalonById(req.params.id, req);
    
    if (!salon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Salon not found' 
      });
    }

    // Verify ownership
    if (salon.owner_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only delete your own salons.' 
      });
    }

    const result = await salonService.deleteSalon(req.params.id);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Salon deleted successfully',
      data: result 
    });
  } catch (error) {
    next(error);
  }
}; 