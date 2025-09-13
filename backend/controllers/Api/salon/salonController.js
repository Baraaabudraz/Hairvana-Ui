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

    // Check subscription limits before creating salon
    const { Subscription, Salon, SubscriptionPlan } = require('../../../models');
    
    // Get user's active subscription
    const subscription = await Subscription.findOne({
      where: { 
        owner_id: req.user.id,
        status: 'active'
      },
      include: [
        { model: SubscriptionPlan, as: 'plan' }
      ]
    });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'No active subscription found. Please subscribe to create salons.',
        code: 'NO_ACTIVE_SUBSCRIPTION'
      });
    }

    // Get current salon count for this owner
    const currentSalonCount = await Salon.count({
      where: { owner_id: req.user.id }
    });

    // Check salon limit
    const salonLimit = subscription.plan?.limits?.max_salons;
    if (salonLimit !== 'unlimited' && currentSalonCount >= salonLimit) {
      return res.status(403).json({
        success: false,
        message: `Salon limit reached. You can only have ${salonLimit} salon(s) with your current plan. Please upgrade your subscription to create more salons.`,
        code: 'SALON_LIMIT_REACHED',
        currentUsage: currentSalonCount,
        limit: salonLimit,
        upgradeRequired: true
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

/**
 * Get monthly revenue for a specific salon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getMonthlyRevenue = async (req, res, next) => {
  try {
    const { salonId } = req.params;
    const { year, month } = req.query;
    
    // Verify salon ownership
    const salon = await salonService.getSalonById(salonId, req);
    if (!salon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Salon not found' 
      });
    }

    if (salon.owner_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only view revenue for your own salons.' 
      });
    }

    const monthlyRevenue = await salonService.getMonthlyRevenue(salonId, year, month);
    
    return res.status(200).json({ 
      success: true, 
      data: monthlyRevenue 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction history for a specific salon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getTransactionHistory = async (req, res, next) => {
  try {
    const { salonId } = req.params;
    const { page = 1, limit = 10, status, from, to } = req.query;
    
    // Verify salon ownership
    const salon = await salonService.getSalonById(salonId, req);
    if (!salon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Salon not found' 
      });
    }

    if (salon.owner_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only view transaction history for your own salons.' 
      });
    }

    const transactionHistory = await salonService.getTransactionHistory(salonId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      from,
      to
    });
    
    return res.status(200).json({ 
      success: true, 
      data: transactionHistory 
    });
  } catch (error) {
    next(error);
  }
}; 