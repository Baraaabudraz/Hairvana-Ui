const { Salon, User, Appointment, Subscription } = require('../models');

exports.getStats = async () => {
  const [totalSalons, activeSalons, totalUsers, activeUsers, totalBookings, completedBookings, activeSubscriptions] = await Promise.all([
    Salon.count(),
    Salon.count({ where: { status: 'active' } }),
    User.count(),
    User.count({ where: { status: 'active' } }),
    Appointment.count(),
    Appointment.count({ where: { status: 'completed' } }),
    Subscription.findAll({ where: { status: 'active' } })
  ]);
  const totalRevenue = activeSubscriptions.reduce((sum, sub) => sum + Number(sub.amount || 0), 0);
  return {
    totalSalons: totalSalons || 0,
    activeSalons: activeSalons || 0,
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    totalBookings: totalBookings || 0,
    completedBookings: completedBookings || 0,
    totalRevenue: totalRevenue || 0,
    monthlyGrowth: 0 // Placeholder for now
  };
}; 