const { Report, ReportTemplate, User, Salon, Appointment, Service, BillingHistory } = require('../models');
const { Op, fn, col } = require('sequelize');

function mapTemplateTypeToReportType(templateType) {
  switch (templateType) {
    case 'financial': return 'revenue';
    case 'salon': return 'analytics';
    case 'user': return 'customers';
    case 'operational': return 'analytics';
    case 'custom': return 'custom';
    default: return 'analytics';
  }
}

exports.findAll = async () => {
  let reports = [];
  try {
    reports = await Report.findAll();
  } catch (dbError) {
    console.warn('Database error fetching reports:', dbError.message);
    reports = [];
  }
  return reports.map(r => {
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
      ...data // Include all report content (sections, metadata, etc.)
    };
  });
};

exports.findById = async (id) => {
  let r;
  try {
    r = await Report.findByPk(id);
  } catch (dbError) {
    console.warn('Database error fetching report:', dbError.message);
    r = null;
  }
  if (!r) return null;
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
    size: data.size || '1.5 MB',
    downloadUrl: data.downloadUrl || '#',
    parameters: data.parameters || {},
    ...data // Include all report content (sections, metadata, etc.)
  };
};

exports.create = async (data) => {
  // Expect: data.name, data.description, data.period, data.parameters.fields (array of field names)
  const name = data.name || 'Manual Report';
  const description = data.description || 'Generated report';
  const period = data.period || 'monthly';
  const fields = (data.parameters && Array.isArray(data.parameters.fields)) ? data.parameters.fields : [];
  const parameters = data.parameters || {};

  // Helper for date range
  function getStartDateForPeriod(period) {
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d': startDate = new Date(now.setDate(now.getDate() - 7)); break;
      case '30d': startDate = new Date(now.setDate(now.getDate() - 30)); break;
      case '90d': startDate = new Date(now.setDate(now.getDate() - 90)); break;
      case '1y': startDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
      default: startDate = new Date(now.setDate(now.getDate() - 30));
    }
    return startDate.toISOString();
  }

  // Build the report data section based on selected fields
  const sectionData = {};
  for (const field of fields) {
    switch (field) {
      case 'New Users':
        sectionData.newUsers = await User.count({ where: { createdAt: { [Op.gte]: getStartDateForPeriod(parameters.dateRange || '30d') } } });
        break;
      case 'Active Users':
        sectionData.activeUsers = await User.count({ where: { status: 'active' } });
        break;
      case 'Total Users':
        sectionData.totalUsers = await User.count();
        break;
      case 'Total Salons':
        sectionData.totalSalons = await Salon.count();
        break;
      case 'Total Bookings':
        sectionData.totalBookings = await Appointment.count();
        break;
      case 'Subscription Revenue':
        sectionData.subscriptionRevenue = 0;
        break;
      case 'Commission Revenue':
        sectionData.commissionRevenue = 0;
        break;
      case 'Monthly Trends':
        sectionData.monthlyTrends = 'N/A';
        break;
      case 'Year-over-Year Comparison':
        sectionData.yearOverYearComparison = 'N/A';
        break;
      case 'Retention Rate':
        sectionData.retentionRate = 'N/A';
        break;
      case 'User Journey':
        sectionData.userJourney = 'N/A';
        break;
      case 'Engagement Metrics':
        sectionData.engagementMetrics = 'N/A';
        break;
      case 'Churn Analysis':
        sectionData.churnAnalysis = 'N/A';
        break;
      case 'Demographics':
        sectionData.demographics = 'N/A';
        break;
      default:
        sectionData[field] = 'N/A';
    }
  }
  sectionData.note = 'Auto-generated summary for manual report';

  // Build the report object
  const reportObj = {
    name,
    description,
    status: 'completed',
    createdBy: data.createdBy || 'System',
    size: '1.5 MB',
    downloadUrl: '#',
    parameters,
    metadata: {
      period,
      createdAt: new Date().toISOString(),
      autoFilled: true,
    },
    title: name,
    sections: [
      {
        title: 'Key Metrics',
        type: 'summary',
        data: sectionData
      }
    ]
  };

  // Save the report
  const reportRecord = await Report.create({
    type: mapTemplateTypeToReportType(data.type || 'analytics'),
    period,
    data: reportObj,
    generated_at: new Date(),
    status: 'completed',
    parameters
  });

  return reportRecord;
};

exports.update = async (id, data) => {
  const report = await Report.findByPk(id);
  if (!report) return null;
  await report.update(data);
  return report;
};

exports.delete = async (id) => {
  const report = await Report.findByPk(id);
  if (!report) return null;
  await report.destroy();
  return true;
};

exports.generate = async (body, reqUser) => {
  const { templateId, parameters } = body;

  // Input validation (should already be done in validation layer)
  if (!templateId) throw new Error('Template ID is required');
  if (!parameters || typeof parameters !== 'object') throw new Error('Parameters object is required');
  if (!reqUser || (!reqUser.userId && reqUser.role !== 'system')) throw Object.assign(new Error('User authentication required'), { status: 401 });

  const template = await ReportTemplate.findByPk(templateId);
  if (!template) throw Object.assign(new Error('Report template not found'), { status: 404 });

  // Parse fields (ensure it's an array)
  let fields = template.fields;
  if (typeof fields === 'string') {
    try { fields = JSON.parse(fields); } catch { fields = []; }
  }
  // Use only the fields provided by the frontend, if present
  if (parameters && Array.isArray(parameters.fields) && parameters.fields.length > 0) {
    fields = fields.filter(f => parameters.fields.includes(f));
  }

  // Helper functions
  function getStartDateForPeriod(period) {
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d': startDate = new Date(now.setDate(now.getDate() - 7)); break;
      case '30d': startDate = new Date(now.setDate(now.getDate() - 30)); break;
      case '90d': startDate = new Date(now.setDate(now.getDate() - 90)); break;
      case '1y': startDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
      default: startDate = new Date(now.setDate(now.getDate() - 30));
    }
    return startDate.toISOString();
  }
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
  function getPeriodFromDateRange(dateRange) {
    switch (dateRange) {
      case '7d': return 'weekly';
      case '30d': return 'monthly';
      case '90d': return 'quarterly';
      case '1y': return 'yearly';
      case 'custom': return 'custom';
      default: return 'monthly';
    }
  }
  function mapTemplateTypeToReportType(templateType) {
    switch (templateType) {
      case 'financial': return 'revenue';
      case 'salon': return 'analytics';
      case 'user': return 'customers';
      case 'operational': return 'analytics';
      case 'custom': return 'custom';
      default: return 'analytics';
    }
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
        const revenueCurrent = await BillingHistory.sum('amount', { where: { date: { [Op.gte]: start } } });
        const revenuePrevious = await BillingHistory.sum('amount', { where: { date: { [Op.gte]: prevStart, [Op.lt]: start } } });
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
        data.utilizationRate = 'N/A';
        break;
      case 'Top Performers': {
        const topSalonsRaw = await Appointment.findAll({
          attributes: ['salon_id', [fn('COUNT', col('salon_id')), 'bookings']],
          group: ['salon_id'],
          order: [[fn('COUNT', col('salon_id')), 'DESC']],
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
        data.newUsers = await User.count({ where: { createdAt: { [Op.gte]: getStartDateForPeriod(parameters.dateRange || '30d') } } });
        break;
      case 'Active Users':
        data.activeUsers = await User.count({ where: { status: 'active' } });
        break;
      case 'Retention Rate':
        data.retentionRate = 'N/A';
        break;
      case 'User Journey':
        data.userJourney = 'N/A';
        break;
      case 'Demographics':
        data.demographics = 'N/A';
        break;
      case 'System Uptime':
        data.systemUptime = 'N/A';
        break;
      case 'Response Times':
        data.responseTimes = 'N/A';
        break;
      case 'Error Rates':
        data.errorRates = 'N/A';
        break;
      case 'User Sessions':
        data.userSessions = 'N/A';
        break;
      case 'Platform Health':
        data.platformHealth = 'N/A';
        break;
      case 'Revenue':
        data.revenue = await BillingHistory.sum('amount');
        break;
      case 'Expenses':
        data.expenses = 0;
        break;
      case 'Profit Margin':
        data.profitMargin = 'N/A';
        break;
      case 'Cash Flow':
        data.cashFlow = 'N/A';
        break;
      case 'Financial Ratios':
        data.financialRatios = 'N/A';
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

  // Get user and salon information
  let userId = null;
  let salonId = null;
  let userRole = null;
  if (reqUser && reqUser.userId) {
    userId = reqUser.userId;
    userRole = reqUser.role;
    switch (userRole) {
      case 'salon':
        try {
          const salon = await Salon.findOne({ where: { owner_id: reqUser.userId }, attributes: ['id', 'name', 'status'] });
          if (salon && salon.status === 'active') {
            salonId = salon.id;
          }
        } catch (error) {}
        break;
      case 'admin':
      case 'super_admin':
        if (parameters && parameters.salonId) {
          try {
            const specifiedSalon = await Salon.findOne({ where: { id: parameters.salonId }, attributes: ['id', 'name', 'status'] });
            if (specifiedSalon && specifiedSalon.status === 'active') {
              salonId = specifiedSalon.id;
            }
          } catch (error) {}
        }
        break;
      case 'user':
        break;
      default:
        break;
    }
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
      createdBy: reqUser ? reqUser.email : 'System',
      size: '2.5 MB',
      downloadUrl: '#',
      parameters: parameters || {},
      userRole: userRole,
      ...reportData
    },
    generated_at: generatedAt,
    status: 'completed',
    parameters: parameters || {}
  });

  return {
    success: true,
    reportId: reportRecord.id,
    data: reportData,
    generatedAt: generatedAt.toISOString()
  };
}; 