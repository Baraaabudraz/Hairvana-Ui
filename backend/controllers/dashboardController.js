const { Salon, User, Appointment, Subscription } = require('../models');

// Get dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get total salons count
    const totalSalons = await Salon.count();
    // Get active salons count
    const activeSalons = await Salon.count({ where: { status: 'active' } });
    // Get total users count
    const totalUsers = await User.count();
    // Get active users count
    const activeUsers = await User.count({ where: { status: 'active' } });
    // Get total bookings count
    const totalBookings = await Appointment.count();
    // Get completed bookings count
    const completedBookings = await Appointment.count({ where: { status: 'completed' } });
    // Calculate total revenue from active subscriptions
    const activeSubscriptions = await Subscription.findAll({ where: { status: 'active' } });
    const totalRevenue = activeSubscriptions.reduce((sum, sub) => sum + Number(sub.amount || 0), 0);
    // Return dashboard stats
    res.json({
      totalSalons: totalSalons || 0,
      activeSalons: activeSalons || 0,
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalBookings: totalBookings || 0,
      completedBookings: completedBookings || 0,
      totalRevenue: totalRevenue || 0,
      monthlyGrowth: 0 // Placeholder for now
    });
  } catch (error) {
    next(error);
  }
};