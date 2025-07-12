const { User, Salon, Appointment, Service, BillingHistory, ReportTemplate, Report } = require('../models');

// Get analytics data
exports.getAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const startDate = getStartDateForPeriod(period);

    // Helper function to safely count with fallback
    const safeCount = async (model, where = {}) => {
      try {
        return await model.count({ where });
      } catch (error) {
        console.warn(`Error counting ${model.name}:`, error.message);
        return 0;
      }
    };

    // Helper function to safely sum with fallback
    const safeSum = async (model, field, where = {}) => {
      try {
        const result = await model.sum(field, { where });
        return result || 0;
      } catch (error) {
        console.warn(`Error summing ${field} from ${model.name}:`, error.message);
        return 0;
      }
    };

    // Helper function to safely find all with fallback
    const safeFindAll = async (model, options = {}) => {
      try {
        return await model.findAll(options);
      } catch (error) {
        console.warn(`Error finding all ${model.name}:`, error.message);
        return [];
      }
    };

    // Overview data with safe queries
    const totalSalons = await safeCount(Salon);
    const activeSalons = await safeCount(Salon, { status: 'active' });
    const totalUsers = await safeCount(User);
    const activeUsers = await safeCount(User, { status: 'active' });
    const totalBookings = await safeCount(Appointment);
    const completedBookings = await safeCount(Appointment, { status: 'completed' });

    // Revenue calculations with safe queries
    const revenueCurrent = await safeSum(BillingHistory, 'amount', { 
      date: { [require('sequelize').Op.gte]: startDate } 
    });

    // Previous period revenue for growth calculation
    const prevStartDate = new Date(startDate);
    if (period === '7d') prevStartDate.setDate(prevStartDate.getDate() - 7);
    else if (period === '30d') prevStartDate.setDate(prevStartDate.getDate() - 30);
    else if (period === '90d') prevStartDate.setDate(prevStartDate.getDate() - 90);
    else if (period === '1y') prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
    
    const revenuePrevious = await safeSum(BillingHistory, 'amount', { 
      date: { [require('sequelize').Op.gte]: prevStartDate, [require('sequelize').Op.lt]: startDate } 
    });
    const revenueGrowth = revenuePrevious && revenuePrevious > 0 ? ((revenueCurrent - revenuePrevious) / revenuePrevious) * 100 : 0;

    // Bookings with safe queries
    const bookingsTotal = await safeCount(Appointment, { date: { [require('sequelize').Op.gte]: startDate } });
    const bookingsCompleted = await safeCount(Appointment, { 
      status: 'completed', 
      date: { [require('sequelize').Op.gte]: startDate } 
    });
    const bookingsCancelled = await safeCount(Appointment, { 
      status: 'cancelled', 
      date: { [require('sequelize').Op.gte]: startDate } 
    });
    const bookingsNoShow = await safeCount(Appointment, { 
      status: 'no_show', 
      date: { [require('sequelize').Op.gte]: startDate } 
    });

    // User Growth with safe queries
    const newUsers = await safeCount(User, { join_date: { [require('sequelize').Op.gte]: startDate } });
    const returningUsers = 0; // Not implemented yet

    // Top Services with safe queries
    let topServices = [];
    try {
      const topServicesRaw = await Appointment.findAll({
        attributes: ['service_id', [require('sequelize').fn('COUNT', require('sequelize').col('service_id')), 'bookings']],
        where: { date: { [require('sequelize').Op.gte]: startDate } },
        group: ['service_id'],
        order: [[require('sequelize').fn('COUNT', require('sequelize').col('service_id')), 'DESC']],
        limit: 5
      });
      
      topServices = await Promise.all(topServicesRaw.map(async (row) => {
        try {
          const service = await Service.findByPk(row.service_id);
          return {
            name: service ? service.name : 'Unknown Service',
            bookings: row.get('bookings') || 0,
            revenue: 0, // Can be calculated later
            growth: 0 // Not implemented
          };
        } catch (error) {
          console.warn('Error fetching service:', error.message);
          return {
            name: 'Unknown Service',
            bookings: row.get('bookings') || 0,
            revenue: 0,
            growth: 0
          };
        }
      }));
    } catch (error) {
      console.warn('Error fetching top services:', error.message);
      topServices = [];
    }

    // Geographic Data with safe queries
    let geographicData = [];
    try {
      const salons = await safeFindAll(Salon);
      const geoMap = {};
      salons.forEach(salon => {
        const loc = salon.location || 'Unknown Location';
        if (!geoMap[loc]) geoMap[loc] = { location: loc, salons: 0, users: 0, revenue: 0 };
        geoMap[loc].salons += 1;
        geoMap[loc].revenue += Number(salon.revenue || 0);
      });
      geographicData = Object.values(geoMap);
    } catch (error) {
      console.warn('Error fetching geographic data:', error.message);
      geographicData = [];
    }

    // Performance Metrics with safe calculations
    const averageBookingValue = bookingsTotal > 0 ? (revenueCurrent / bookingsTotal) : 0;
    const customerRetentionRate = 0; // Not implemented
    const salonUtilizationRate = 0; // Not implemented
    
    let averageRating = 0;
    try {
      const salons = await safeFindAll(Salon);
      if (salons.length > 0) {
        const totalRating = salons.reduce((sum, s) => sum + Number(s.rating || 0), 0);
        averageRating = totalRating / salons.length;
      }
    } catch (error) {
      console.warn('Error calculating average rating:', error.message);
      averageRating = 0;
    }

    // Generate real chart data from database
    const generateChartData = async () => {
      try {
        // Get real monthly data for the last 6 months
        const months = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = date.toLocaleString('default', { month: 'short' });
          
          // Get real data for this month
          const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
          const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          
          const monthlyRevenue = await BillingHistory.sum('amount', {
            where: {
              date: {
                [require('sequelize').Op.between]: [startOfMonth, endOfMonth]
              }
            }
          }) || 0;
          
          const monthlyBookings = await Appointment.count({
            where: {
              date: {
                [require('sequelize').Op.between]: [startOfMonth, endOfMonth]
              }
            }
          }) || 0;
          
          const monthlyNewUsers = await User.count({
            where: {
              createdAt: {
                [require('sequelize').Op.between]: [startOfMonth, endOfMonth]
              }
            }
          }) || 0;
          
          months.push({
            month: monthName,
            revenue: monthlyRevenue,
            bookings: monthlyBookings,
            newUsers: monthlyNewUsers,
            date: startOfMonth.toISOString().split('T')[0]
          });
        }
        
        return months;
      } catch (error) {
        console.warn('Error generating chart data:', error.message);
        return [];
      }
    };

    const chartData = await generateChartData();

    const analytics = {
      overview: {
        totalSalons,
        activeSalons,
        totalUsers,
        activeUsers,
        totalBookings,
        completedBookings,
        totalRevenue: revenueCurrent,
        monthlyGrowth: revenueGrowth
      },
      revenue: {
        current: revenueCurrent,
        previous: revenuePrevious,
        growth: revenueGrowth,
        data: chartData
      },
      bookings: {
        total: bookingsTotal,
        completed: bookingsCompleted,
        cancelled: bookingsCancelled,
        noShow: bookingsNoShow,
        data: chartData
      },
      userGrowth: {
        newUsers,
        returningUsers,
        data: chartData
      },
      topServices: topServices,
      geographicData: geographicData,
      performanceMetrics: {
        averageBookingValue,
        customerRetentionRate,
        salonUtilizationRate,
        averageRating
      }
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    // Return empty data structure instead of mock data
    res.json({
      overview: {
        totalSalons: 0,
        activeSalons: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalBookings: 0,
        completedBookings: 0,
        totalRevenue: 0,
        monthlyGrowth: 0
      },
      revenue: {
        current: 0,
        previous: 0,
        growth: 0,
        data: []
      },
      bookings: {
        total: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0,
        data: []
      },
      userGrowth: {
        newUsers: 0,
        returningUsers: 0,
        data: []
      },
      topServices: [],
      geographicData: [],
      performanceMetrics: {
        averageBookingValue: 0,
        customerRetentionRate: 0,
        salonUtilizationRate: 0,
        averageRating: 0
      }
    });
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

    // Save the report to the database
    const generatedAt = new Date();
    
    // Map dateRange to period enum
    const getPeriodFromDateRange = (dateRange) => {
      switch (dateRange) {
        case '7d': return 'weekly';
        case '30d': return 'monthly';
        case '90d': return 'quarterly';
        case '1y': return 'yearly';
        case 'custom': return 'custom';
        default: return 'monthly';
      }
    };

    // Map template type to Report model enum
    const mapTemplateTypeToReportType = (templateType) => {
      switch (templateType) {
        case 'financial': return 'revenue';
        case 'salon': return 'analytics';
        case 'user': return 'customers';
        case 'operational': return 'analytics';
        case 'custom': return 'custom';
        default: return 'analytics';
      }
    };

    // Get user and salon information
    let userId = null;
    let salonId = null;
    
    console.log('Debug - req.user:', req.user); // Debug log
    
    if (req.user && req.user.userId) {
      userId = req.user.userId;
      console.log('Debug - User ID found:', userId); // Debug log
      
      // If user is a salon owner, get their salon
      if (req.user.role === 'salon') {
        try {
          const salon = await Salon.findOne({ where: { owner_id: req.user.userId } });
          if (salon) {
            salonId = salon.id;
            console.log('Debug - Salon ID found:', salonId); // Debug log
          }
        } catch (error) {
          console.warn('Error fetching user salon:', error.message);
        }
      }
    } else {
      console.log('Debug - No user found in request'); // Debug log
    }

    const reportRecord = await Report.create({
      user_id: userId,
      salon_id: salonId,
      type: mapTemplateTypeToReportType(template.type),
      period: getPeriodFromDateRange(parameters?.dateRange || '30d'),
      data: {
        name: template.name,
        description: template.description,
        status: 'completed',
        createdBy: req.user ? req.user.email : 'System',
        size: '2.5 MB',
        downloadUrl: '#',
        parameters: parameters || {},
        ...reportData
      },
      generated_at: generatedAt,
      status: 'completed',
      parameters: parameters || {}
    });

    return res.json({ 
      success: true, 
      reportId: reportRecord.id, 
      data: reportData, 
      generatedAt: generatedAt.toISOString() 
    });
  } catch (error) {
    console.error('Error generating report:', error);
    next(error);
  }
};

// List all reports
exports.getAllReports = async (req, res) => {
  try {
    let reports = [];
    try {
      reports = await Report.findAll();
    } catch (dbError) {
      console.warn('Database error fetching reports:', dbError.message);
      reports = [];
    }
    const mapped = reports.map(r => {
      const data = r.data || {};
      return {
        id: r.id,
        name: data.name || `Report ${r.id}`,
        description: data.description || 'Generated report',
        type: r.type || 'analytics',
        status: data.status || 'completed',
        createdAt: r.createdAt,
        generatedAt: r.generated_at,
        createdBy: data.createdBy || 'System',
        size: data.size || '2.5 MB',
        downloadUrl: data.downloadUrl || '#',
        parameters: data.parameters || {},
      };
    });
    res.json(mapped);
  } catch (error) {
    console.error('Error in getAllReports:', error);
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
};

// Get a single report by ID
exports.getReportById = async (req, res) => {
  try {
    let r;
    try {
      r = await Report.findByPk(req.params.id);
    } catch (dbError) {
      console.warn('Database error fetching report:', dbError.message);
      r = null;
    }
    if (!r) {
      return res.status(404).json({ error: 'Report not found' });
    }
    const data = r.data || {};
    const mapped = {
      id: r.id,
      name: data.name || `Report ${r.id}`,
      description: data.description || 'Generated report',
      type: r.type || 'analytics',
      status: data.status || 'completed',
      createdAt: r.createdAt,
      generatedAt: r.generated_at,
      createdBy: data.createdBy || 'System',
      size: data.size || '2.5 MB',
      downloadUrl: data.downloadUrl || '#',
      parameters: data.parameters || {},
    };
    res.json(mapped);
  } catch (error) {
    console.error('Error in getReportById:', error);
    res.status(500).json({ error: 'Failed to fetch report.' });
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