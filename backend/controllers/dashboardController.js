const { Salon, User, Appointment, Subscription } = require('../models');
const dashboardService = require('../services/dashboardService');

// Get dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};