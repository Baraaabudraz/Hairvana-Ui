const dashboardRepository = require('../repositories/dashboardRepository');

exports.getDashboardStats = async () => {
  return dashboardRepository.getStats();
}; 