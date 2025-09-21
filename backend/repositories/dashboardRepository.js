const { Salon, User, Appointment, Subscription, SubscriptionPlan } = require('../models');

exports.getStats = async () => {
  const [totalSalons, activeSalons, totalUsers, activeUsers, totalSubscriptions, activeSubscriptions, cancelledSubscriptions, monthlySubscriptions, yearlySubscriptions] = await Promise.all([
    Salon.count(),
    Salon.count({ where: { status: 'active' } }),
    User.count(),
    User.count({ where: { status: 'active' } }),
    Subscription.count(),
    Subscription.findAll({ where: { status: 'active' } }),
    Subscription.count({ where: { status: 'cancelled' } }),
    Subscription.findAll({ where: { status: 'active', billingCycle: 'monthly' } }),
    Subscription.findAll({ where: { status: 'active', billingCycle: 'yearly' } })
  ]);
  
  // Calculate subscription revenue metrics
  const totalRevenue = activeSubscriptions.reduce((sum, sub) => sum + Number(sub.amount || 0), 0);
  const monthlyRevenue = monthlySubscriptions.reduce((sum, sub) => sum + Number(sub.amount || 0), 0);
  const yearlyRevenue = yearlySubscriptions.reduce((sum, sub) => sum + Number(sub.amount || 0), 0);
  
  // Calculate growth (simplified - could be enhanced with historical data)
  const monthlyGrowth = 0; // Placeholder for now
  
  return {
    totalSalons: totalSalons || 0,
    activeSalons: activeSalons || 0,
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    totalSubscriptions: totalSubscriptions || 0,
    activeSubscriptions: activeSubscriptions.length || 0,
    cancelledSubscriptions: cancelledSubscriptions || 0,
    totalRevenue: totalRevenue || 0,
    monthlyRevenue: monthlyRevenue || 0,
    yearlyRevenue: yearlyRevenue || 0,
    monthlyGrowth: monthlyGrowth
  };
};

exports.getRecentActivity = async (page = 1, limit = 10) => {
  try {
    const activities = [];
    const offset = (page - 1) * limit;
    
    // Get recent user registrations
    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: Math.ceil(limit * 0.3), // 30% of activities
      raw: false
    });

    // Get recent salon registrations with safe includes
    const recentSalons = await Salon.findAll({
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Math.ceil(limit * 0.25), // 25% of activities
      raw: false
    });

    // Get recent subscription activities with safe includes
    const recentSubscriptions = await Subscription.findAll({
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['name', 'price'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Math.ceil(limit * 0.25), // 25% of activities
      raw: false
    });

    // Get recent cancellations with safe includes
    const recentCancellations = await Subscription.findAll({
      where: { status: 'cancelled' },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['name', 'price'],
          required: false
        }
      ],
      order: [['updatedAt', 'DESC']],
      limit: Math.ceil(limit * 0.1), // 10% of activities
      raw: false
    });

    // Get users with recent login activity (using updatedAt as proxy for last login)
    const recentLogins = await User.findAll({
      where: {
        updatedAt: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      order: [['updatedAt', 'DESC']],
      limit: Math.ceil(limit * 0.1), // 10% of activities
      raw: false
    });

    // Process new user registrations
    recentUsers.forEach((user) => {
      try {
        const userName = user.name || user.email || 'Unknown User';
        const userRole = user.role || 'user';
        
        activities.push({
          id: `user-${user.id}`,
          type: 'user_registration',
          title: 'New User Registered',
          description: `${userName} joined the platform as ${userRole}`,
          user: userName,
          avatar: null,
          timestamp: user.createdAt,
          status: 'success',
          userRole: userRole
        });
      } catch (error) {
        console.error('Error processing user registration activity:', error);
      }
    });

    // Process salon registration activities with safe data access
    recentSalons.forEach((salon) => {
      try {
        const ownerName = salon.owner?.name || salon.owner?.email || 'Unknown User';
        const salonName = salon.name || 'Unnamed Salon';
        
        activities.push({
          id: `salon-${salon.id}`,
          type: 'salon_registration',
          title: 'New Salon Registered',
          description: `${ownerName} registered "${salonName}"`,
          user: ownerName,
          avatar: null,
          timestamp: salon.createdAt,
          status: 'success',
          salonName: salonName
        });
      } catch (error) {
        console.error('Error processing salon activity:', error);
      }
    });

    // Process subscription activities with safe data access
    recentSubscriptions.forEach((sub) => {
      try {
        const ownerName = sub.owner?.name || sub.owner?.email || 'Unknown User';
        const planName = sub.plan?.name || 'Unknown Plan';
        
        activities.push({
          id: `sub-${sub.id}`,
          type: 'subscription',
          title: 'New Subscription',
          description: `${ownerName} subscribed to ${planName}`,
          user: ownerName,
          avatar: null,
          timestamp: sub.createdAt,
          status: 'success',
          amount: Number(sub.amount) || 0,
          planName: planName
        });
      } catch (error) {
        console.error('Error processing subscription activity:', error);
      }
    });

    // Process cancellation activities with safe data access
    recentCancellations.forEach((sub) => {
      try {
        const ownerName = sub.owner?.name || sub.owner?.email || 'Unknown User';
        const planName = sub.plan?.name || 'Unknown Plan';
        
        activities.push({
          id: `cancel-${sub.id}`,
          type: 'cancellation',
          title: 'Subscription Cancelled',
          description: `${ownerName} cancelled ${planName}`,
          user: ownerName,
          avatar: null,
          timestamp: sub.updatedAt,
          status: 'urgent',
          amount: Number(sub.amount) || 0,
          planName: planName
        });
      } catch (error) {
        console.error('Error processing cancellation activity:', error);
      }
    });

    // Process recent login activities
    recentLogins.forEach((user) => {
      try {
        const userName = user.name || user.email || 'Unknown User';
        const userRole = user.role || 'user';
        
        activities.push({
          id: `login-${user.id}`,
          type: 'login',
          title: 'User Login',
          description: `${userName} (${userRole}) logged in`,
          user: userName,
          avatar: null,
          timestamp: user.updatedAt,
          status: 'pending',
          userRole: userRole
        });
      } catch (error) {
        console.error('Error processing login activity:', error);
      }
    });

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const paginatedActivities = activities.slice(offset, offset + limit);
    
    // Get total count for pagination metadata
    const totalActivities = activities.length;
    const totalPages = Math.ceil(totalActivities / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      activities: paginatedActivities,
      pagination: {
        currentPage: page,
        totalPages,
        totalActivities,
        limit,
        hasNextPage,
        hasPrevPage
      }
    };

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return {
      activities: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalActivities: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }
}; 