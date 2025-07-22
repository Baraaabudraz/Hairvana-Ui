const analyticsRepository = require('../repositories/analyticsRepository');

exports.getAnalytics = async (query) => {
  return analyticsRepository.getAnalyticsData(query);
}; 