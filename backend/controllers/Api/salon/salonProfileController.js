const salonService = require('../../../services/salonService');

/**
 * Get salon profile for the authenticated owner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getSalonProfile = async (req, res, next) => {
  try {
    const salon = await salonService.getSalonByOwnerId(req.user.id, req);
    
    if (!salon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Salon not found for this owner' 
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
 * Update salon profile for the authenticated owner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.updateSalonProfile = async (req, res, next) => {
  try {
    // Get existing salon to verify ownership
    const existingSalon = await salonService.getSalonByOwnerId(req.user.id, req);
    if (!existingSalon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Salon not found for this owner' 
      });
    }

    // Prepare update data
    const updateData = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      location: req.body.location,
      website: req.body.website,
      description: req.body.description,
      business_license: req.body.business_license,
      tax_id: req.body.tax_id,
      hours: req.body.hours
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Handle hours field - ensure it's properly formatted
    if (updateData.hours) {
      // If hours is an array, convert it to a more structured format
      if (Array.isArray(updateData.hours)) {
        const hoursObject = {};
        updateData.hours.forEach((hour, index) => {
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
        updateData.hours = hoursObject;
      }
      // If hours is already an object, keep it as is
      // If hours is a string, keep it as is
    }

    // Handle image uploads
    if (req.files) {
      // Handle avatar upload
      if (req.files['avatar'] && req.files['avatar'][0]) {
        updateData.avatar = req.files['avatar'][0].filename;
      }
      
      // Handle gallery images upload
      if (req.files['gallery'] && req.files['gallery'].length > 0) {
        updateData.gallery = req.files['gallery'].map(file => file.filename);
      }
    }
    
    // Handle gallery from request body (for non-upload updates)
    if (req.body.gallery && !req.files) {
      updateData.gallery = Array.isArray(req.body.gallery) 
        ? req.body.gallery 
        : [req.body.gallery];
    }

    // Update salon
    const updatedSalon = await salonService.updateSalonProfile(existingSalon.id, updateData, req);
    
    if (!updatedSalon) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update salon profile' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Salon profile updated successfully',
      data: updatedSalon 
    });
  } catch (error) {
    next(error);
  }
}; 