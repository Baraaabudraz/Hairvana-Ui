const dashboardRepository = require('../repositories/dashboardRepository');

exports.getDashboardStats = async () => {
  return dashboardRepository.getStats();
};

exports.getRecentActivity = async (page = 1, limit = 10) => {
  return dashboardRepository.getRecentActivity(page, limit);
}; 