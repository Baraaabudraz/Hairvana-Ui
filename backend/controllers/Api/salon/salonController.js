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

/**
 * Get all clients/customers who have appointments for a specific salon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getClients = async (req, res, next) => {
  try {
    const { Customer, User, Appointment } = require('../../../models');
    const { salonId } = req.params;
    
    console.log('Getting clients for salon:', salonId);
    
    if (!salonId) {
      return res.status(400).json({
        success: false,
        message: 'Salon ID is required'
      });
    }

    // Get all customers who have appointments for the specific salon
    // Since Customer and Appointment are not directly associated, we need to go through User
    const clients = await Customer.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'avatar', 'created_at'],
          required: true, // This ensures only customers with valid user data are returned
          include: [
            {
              model: Appointment,
              as: 'appointments',
              where: { salon_id: salonId },
              required: true, // This ensures only customers with appointments for this salon are returned
              attributes: ['id', 'start_at', 'end_at', 'status', 'total_price']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // // Debug logging
    // console.log('Found clients:', clients.length);
    // if (clients.length > 0) {
    //   console.log('Sample client data:', {
    //     user_id: clients[0].user_id,
    //     hasUser: !!clients[0].user,
    //     userName: clients[0].user?.name,
    //     appointmentsCount: clients[0].user?.appointments?.length
    //   });
    // }

    // Format the response - filter out clients without user data
    const formattedClients = clients
      .filter(client => {
        if (!client.user || !client.user.id) {
          console.log('Filtering out client without user data:', client.user_id);
          return false;
        }
        return true;
      })
      .map(client => {
        try {
          return {
            id: client.user_id,
            name: client.user?.name || 'Unknown',
            email: client.user?.email || '',
            phone: client.user?.phone || '',
            avatarUrl: client.user?.avatar || '',
            totalSpent: client.total_spent || 0,
            totalBookings: client.total_bookings || 0,
            createdAt: client.user?.created_at || client.created_at,
            appointmentsForThisSalon: client.user?.appointments ? client.user.appointments.length : 0,
            appointments: client.user?.appointments || []
          };
        } catch (error) {
          console.error('Error formatting client:', client.user_id, error);
          return null;
        }
      })
      .filter(client => client !== null); // Remove any null entries from formatting errors

    console.log('Returning formatted clients:', formattedClients.length);
    
    // Add a helpful message when no clients are found
    const message = formattedClients.length === 0 
      ? 'No clients found for this salon. This salon may not have any appointments yet.'
      : `Found ${formattedClients.length} client${formattedClients.length === 1 ? '' : 's'} with appointments for this salon.`;
    
    return res.status(200).json({
      success: true,
      data: formattedClients,
      total: formattedClients.length,
      salonId: salonId,
      message: message
    });
  } catch (error) {
    console.error('Error in getClients:', error);
    next(error);
  }
};

/**
 * Get earnings summary for the authenticated salon owner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getEarnings = async (req, res, next) => {
  try {
    const { Appointment, Payment } = require('../../../models');
    const ownerId = req.user.id;
    
    console.log('Getting earnings for owner:', ownerId);
    
    // Get all appointments for the owner's salons
    const appointments = await Appointment.findAll({
      where: {
        '$salon.owner_id$': ownerId
      },
      include: [
        {
          model: require('../../../models').Salon,
          as: 'salon',
          attributes: ['id', 'name']
        },
        {
          model: Payment,
          as: 'payment',
          attributes: ['id', 'amount', 'status', 'created_at']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate earnings summary
    const totalEarnings = appointments.reduce((sum, appointment) => {
      if (appointment.payment && appointment.payment.status === 'paid') {
        return sum + parseFloat(appointment.payment.amount || 0);
      }
      return sum;
    }, 0);

    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const pendingPayments = appointments.filter(apt => 
      apt.payment && apt.payment.status === 'pending'
    ).length;

    // Group by salon
    const earningsBySalon = appointments.reduce((acc, appointment) => {
      const salonId = appointment.salon.id;
      const salonName = appointment.salon.name;
      
      if (!acc[salonId]) {
        acc[salonId] = {
          salonId,
          salonName,
          totalEarnings: 0,
          totalAppointments: 0,
          completedAppointments: 0
        };
      }
      
      acc[salonId].totalAppointments++;
      if (appointment.status === 'completed') {
        acc[salonId].completedAppointments++;
      }
      if (appointment.payment && appointment.payment.status === 'paid') {
        acc[salonId].totalEarnings += parseFloat(appointment.payment.amount || 0);
      }
      
      return acc;
    }, {});

    const message = totalAppointments === 0 
      ? 'No earnings data found. This owner may not have any appointments yet.'
      : `Found earnings data for ${Object.keys(earningsBySalon).length} salon${Object.keys(earningsBySalon).length === 1 ? '' : 's'}.`;

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEarnings: totalEarnings.toFixed(2),
          totalAppointments,
          completedAppointments,
          pendingPayments
        },
        earningsBySalon: Object.values(earningsBySalon),
        recentAppointments: appointments.slice(0, 10).map(apt => ({
          id: apt.id,
          salonName: apt.salon.name,
          startAt: apt.start_at,
          status: apt.status,
          totalPrice: apt.total_price,
          paymentStatus: apt.payment?.status || 'no_payment'
        }))
      },
      message: message
    });
  } catch (error) {
    console.error('Error in getEarnings:', error);
    next(error);
  }
}; 