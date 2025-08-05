const addressRepository = require('../../../repositories/addressRepository');
const salonRepository = require('../../../repositories/salonRepository');

/**
 * Create a new address for a specific salon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.createSalonAddress = async (req, res, next) => {
  try {
    const salonId = req.params.salonId;
    const addressData = req.body;
    
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
        message: 'Access denied. You can only create addresses for your own salon.'
      });
    }
    
    // Set default country if not provided
    if (!addressData.country) {
      addressData.country = 'US';
    }
    
    // Create the address
    const newAddress = await addressRepository.create(addressData);
    
    // Update the salon with the new address
    await salonRepository.update(salonId, { address_id: newAddress.id });
    
    // Return the created address with salon information
    const updatedSalon = await salonRepository.findById(salonId);
    
    return res.status(201).json({
      success: true,
      message: 'Address created and assigned to salon successfully',
      data: {
        address: newAddress,
        salon: updatedSalon
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get the address for a specific salon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getSalonAddress = async (req, res, next) => {
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
        message: 'Access denied. You can only view addresses for your own salon.'
      });
    }
    
    if (!salon.address_id) {
      return res.status(404).json({
        success: false,
        message: 'No address found for this salon'
      });
    }
    
    const address = await addressRepository.findById(salon.address_id);
    
    return res.status(200).json({
      success: true,
      message: 'Address retrieved successfully',
      data: address
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update the address for a specific salon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.updateSalonAddress = async (req, res, next) => {
  try {
    const salonId = req.params.salonId;
    const updateData = req.body;
    
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
        message: 'Access denied. You can only update addresses for your own salon.'
      });
    }
    
    if (!salon.address_id) {
      return res.status(404).json({
        success: false,
        message: 'No address found for this salon'
      });
    }
    
    // Update the address
    const updatedAddress = await addressRepository.update(salon.address_id, updateData);
    
    if (!updatedAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: updatedAddress
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete the address for a specific salon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.deleteSalonAddress = async (req, res, next) => {
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
        message: 'Access denied. You can only delete addresses for your own salon.'
      });
    }
    
    if (!salon.address_id) {
      return res.status(404).json({
        success: false,
        message: 'No address found for this salon'
      });
    }
    
    // Delete the address
    const deleted = await addressRepository.delete(salon.address_id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // Update the salon to remove the address reference
    await salonRepository.update(salonId, { address_id: null });
    
    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}; 