const { ReportTemplate } = require('../models');
const { User, Salon, Appointment, BillingHistory, Service } = require('../models');

// Get analytics data
exports.getAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    // Calculate start date for the period
    const startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else if (period === '1y') startDate.setFullYear(startDate.getFullYear() - 1);

    // Overview
    const [totalSalons, activeSalons, totalUsers, activeUsers, totalBookings, completedBookings, totalRevenue] = await Promise.all([
      Salon.count(),
      Salon.count({ where: { status: 'active' } }),
      User.count(),
      User.count({ where: { status: 'active' } }),
      Appointment.count(),
      Appointment.count({ where: { status: 'completed' } }),
      BillingHistory.sum('amount')
    ]);

    // Revenue (current period and previous period)
    const revenueCurrent = await BillingHistory.sum('amount', { where: { date: { [require('sequelize').Op.gte]: startDate } } });
    const prevStartDate = new Date(startDate);
    if (period === '7d') prevStartDate.setDate(prevStartDate.getDate() - 7);
    else if (period === '30d') prevStartDate.setDate(prevStartDate.getDate() - 30);
    else if (period === '90d') prevStartDate.setDate(prevStartDate.getDate() - 90);
    else if (period === '1y') prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
    const revenuePrevious = await BillingHistory.sum('amount', { where: { date: { [require('sequelize').Op.gte]: prevStartDate, [require('sequelize').Op.lt]: startDate } } });
    const revenueGrowth = revenuePrevious && revenuePrevious > 0 ? ((revenueCurrent - revenuePrevious) / revenuePrevious) * 100 : 0;

    // Bookings
    const bookingsTotal = await Appointment.count({ where: { date: { [require('sequelize').Op.gte]: startDate } } });
    const bookingsCompleted = await Appointment.count({ where: { status: 'completed', date: { [require('sequelize').Op.gte]: startDate } } });
    const bookingsCancelled = await Appointment.count({ where: { status: 'cancelled', date: { [require('sequelize').Op.gte]: startDate } } });
    const bookingsNoShow = await Appointment.count({ where: { status: 'no_show', date: { [require('sequelize').Op.gte]: startDate } } });

    // User Growth
    const newUsers = await User.count({ where: { join_date: { [require('sequelize').Op.gte]: startDate } } });
    // For returning users, you may need a more complex query; for now, set to 0
    const returningUsers = 0;

    // Top Services (by bookings)
    // This requires joining appointments and services; for now, just count by service_id
    const topServicesRaw = await Appointment.findAll({
      attributes: ['service_id', [require('sequelize').fn('COUNT', require('sequelize').col('service_id')), 'bookings']],
      where: { date: { [require('sequelize').Op.gte]: startDate } },
      group: ['service_id'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('service_id')), 'DESC']],
      limit: 5
    });
    const topServices = await Promise.all(topServicesRaw.map(async (row) => {
      const service = await Service.findByPk(row.service_id);
      return {
        name: service ? service.name : 'Unknown',
        bookings: row.get('bookings'),
        revenue: 0, // You can sum price from appointments if needed
        growth: 0 // Not implemented
      };
    }));

    // Geographic Data (by salon location)
    const salons = await Salon.findAll();
    const geoMap = {};
    salons.forEach(salon => {
      const loc = salon.location || 'Unknown';
      if (!geoMap[loc]) geoMap[loc] = { location: loc, salons: 0, users: 0, revenue: 0 };
      geoMap[loc].salons += 1;
      geoMap[loc].revenue += Number(salon.revenue || 0);
    });
    // Count users by location (if you have user location info, otherwise skip)
    const geographicData = Object.values(geoMap);

    // Performance Metrics (example calculations)
    const averageBookingValue = bookingsTotal > 0 ? (revenueCurrent / bookingsTotal) : 0;
    const customerRetentionRate = 0; // Not implemented
    const salonUtilizationRate = 0; // Not implemented
    const averageRating = salons.length > 0 ? (salons.reduce((sum, s) => sum + Number(s.rating || 0), 0) / salons.length) : 0;

    const analytics = {
      overview: {
        totalSalons,
        activeSalons,
        totalUsers,
        activeUsers,
        totalBookings,
        completedBookings,
        totalRevenue,
        monthlyGrowth: revenueGrowth
      },
      revenue: {
        current: revenueCurrent,
        previous: revenuePrevious,
        growth: revenueGrowth,
        data: [] // You can add monthly breakdown if needed
      },
      bookings: {
        total: bookingsTotal,
        completed: bookingsCompleted,
        cancelled: bookingsCancelled,
        noShow: bookingsNoShow,
        data: [] // You can add daily breakdown if needed
      },
      userGrowth: {
        newUsers,
        returningUsers,
        data: [] // You can add monthly breakdown if needed
      },
      topServices,
      geographicData,
      performanceMetrics: {
        averageBookingValue,
        customerRetentionRate,
        salonUtilizationRate,
        averageRating
      }
    };
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

// Generate a report
exports.generateReport = async (req, res, next) => {
  try {
    const { templateId, parameters } = req.body;
    const template = await ReportTemplate.findByPk(templateId);
    if (!template) {
      // Template not found, return error
      return res.status(404).json({ success: false, error: 'Report template not found' });
    }

    // Parse fields (ensure it's an array)
    let fields = template.fields;
    if (typeof fields === 'string') {
      try { fields = JSON.parse(fields); } catch { fields = []; }
    }

    // Prepare data object dynamically
    const data = {};
    for (const field of fields) {
      switch (field) {
        case 'Total Revenue':
          data.totalRevenue = await BillingHistory.sum('amount');
          break;
        case 'Subscription Revenue':
          data.subscriptionRevenue = 0;
          break;
        case 'Commission Revenue':
          data.commissionRevenue = 0;
          break;
        case 'Growth Rate': {
          const startDate = parameters && parameters.dateRange ? getStartDateForPeriod(parameters.dateRange) : getStartDateForPeriod('30d');
          const start = new Date(startDate);
          const prevStart = new Date(start);
          prevStart.setDate(prevStart.getDate() - (parameters.dateRange === '7d' ? 7 : parameters.dateRange === '30d' ? 30 : 30));
          const revenueCurrent = await BillingHistory.sum('amount', { where: { date: { [require('sequelize').Op.gte]: start } } });
          const revenuePrevious = await BillingHistory.sum('amount', { where: { date: { [require('sequelize').Op.gte]: prevStart, [require('sequelize').Op.lt]: start } } });
          data.growthRate = revenuePrevious && revenuePrevious > 0 ? ((revenueCurrent - revenuePrevious) / revenuePrevious) * 100 : 0;
          break;
        }
        case 'Geographic Breakdown': {
          const salons = await Salon.findAll();
          const geoMap = {};
          for (const salon of salons) {
            const loc = salon.location || 'Unknown';
            if (!geoMap[loc]) geoMap[loc] = { location: loc, salons: 0, revenue: 0 };
            geoMap[loc].salons += 1;
            geoMap[loc].revenue += 0;
          }
          data.geographicBreakdown = Object.values(geoMap);
          break;
        }
        case 'Active Salons':
          data.activeSalons = await Salon.count({ where: { status: 'active' } });
          break;
        case 'Booking Volume':
          data.bookingVolume = await Appointment.count();
          break;
        case 'Average Rating': {
          const salons = await Salon.findAll();
          data.averageRating = salons.length > 0 ? (salons.reduce((sum, s) => sum + Number(s.rating || 0), 0) / salons.length).toFixed(2) : 'N/A';
          break;
        }
        case 'Utilization Rate':
          data.utilizationRate = 'N/A'; // Not implemented
          break;
        case 'Top Performers': {
          const topSalonsRaw = await Appointment.findAll({
            attributes: ['salon_id', [require('sequelize').fn('COUNT', require('sequelize').col('salon_id')), 'bookings']],
            group: ['salon_id'],
            order: [[require('sequelize').fn('COUNT', require('sequelize').col('salon_id')), 'DESC']],
            limit: 5
          });
          data.topPerformers = await Promise.all(topSalonsRaw.map(async (row) => {
            const salon = await Salon.findByPk(row.salon_id);
            return {
              name: salon ? salon.name : 'Unknown',
              bookings: row.get('bookings'),
              rating: salon ? salon.rating : 'N/A',
            };
          }));
          break;
        }
        case 'New Users':
          data.newUsers = await User.count({ where: { createdAt: { [require('sequelize').Op.gte]: getStartDateForPeriod(parameters.dateRange || '30d') } } });
          break;
        case 'Active Users':
          data.activeUsers = await User.count({ where: { status: 'active' } });
          break;
        case 'Retention Rate':
          data.retentionRate = 'N/A'; // Not implemented
          break;
        case 'User Journey':
          data.userJourney = 'N/A'; // Not implemented
          break;
        case 'Demographics':
          data.demographics = 'N/A'; // Not implemented
          break;
        case 'System Uptime':
          data.systemUptime = 'N/A'; // Not implemented
          break;
        case 'Response Times':
          data.responseTimes = 'N/A'; // Not implemented
          break;
        case 'Error Rates':
          data.errorRates = 'N/A'; // Not implemented
          break;
        case 'User Sessions':
          data.userSessions = 'N/A'; // Not implemented
          break;
        case 'Platform Health':
          data.platformHealth = 'N/A'; // Not implemented
          break;
        case 'Revenue':
          data.revenue = await BillingHistory.sum('amount');
          break;
        case 'Expenses':
          data.expenses = 0; // Not implemented
          break;
        case 'Profit Margin':
          data.profitMargin = 'N/A'; // Not implemented
          break;
        case 'Cash Flow':
          data.cashFlow = 'N/A'; // Not implemented
          break;
        case 'Financial Ratios':
          data.financialRatios = 'N/A'; // Not implemented
          break;
        default:
          data[field] = 'N/A';
      }
    }

    // Build the report
    const reportData = {
    metadata: {
      templateId,
      generatedAt: new Date().toISOString(),
      parameters,
      reportPeriod: getDateRangeLabel(parameters.dateRange),
      },
      title: template.name,
        sections: [
          {
            title: 'Executive Summary',
            type: 'summary',
          data
        }
      ]
    };

    return res.json({ success: true, reportId: `report_${Date.now()}`, data: reportData, generatedAt: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

function getDateRangeLabel(range) {
  switch (range) {
    case '7d': return 'Last 7 days';
    case '30d': return 'Last 30 days';
    case '90d': return 'Last 90 days';
    case '1y': return 'Last year';
    case 'custom': return 'Custom range';
    default: return range;
  }
}

// Helper function to get start date for a period
function getStartDateForPeriod(period) {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case '7d':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case '30d':
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
    case '90d':
      startDate = new Date(now.setDate(now.getDate() - 90));
      break;
    case '1y':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 30));
  }
  
  return startDate.toISOString();
}