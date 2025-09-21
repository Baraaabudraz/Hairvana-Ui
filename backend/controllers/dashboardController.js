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

// Get recent activity
exports.getRecentActivity = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await dashboardService.getRecentActivity(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};