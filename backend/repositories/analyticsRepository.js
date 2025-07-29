const { User, Salon, Appointment, Service, BillingHistory } = require('../models');
const { Op, Sequelize } = require('sequelize');

function getStartDateForPeriod(period = '30d') {
  const now = new Date();
  if (period === '7d') now.setDate(now.getDate() - 7);
  else if (period === '30d') now.setDate(now.getDate() - 30);
  else if (period === '90d') now.setDate(now.getDate() - 90);
  else if (period === '1y') now.setFullYear(now.getFullYear() - 1);
  return now;
}

exports.getAnalyticsData = async (query) => {
  const period = query.period || '30d';
  const startDate = getStartDateForPeriod(period);

  // Helper functions
  const safeCount = async (model, where = {}) => {
    try { return await model.count({ where }); } catch { return 0; }
  };
  const safeSum = async (model, field, where = {}) => {
    try { return (await model.sum(field, { where })) || 0; } catch { return 0; }
  };
  const safeFindAll = async (model, options = {}) => {
    try { return await model.findAll(options); } catch { return []; }
  };

  // Overview
  const totalSalons = await safeCount(Salon);
  const activeSalons = await safeCount(Salon, { status: 'active' });
  const totalUsers = await safeCount(User);
  const activeUsers = await safeCount(User, { status: 'active' });
  const totalBookings = await safeCount(Appointment);
  const completedBookings = await safeCount(Appointment, { status: 'completed' });

  // Revenue
  const revenueCurrent = await safeSum(BillingHistory, 'amount', { date: { [Op.gte]: startDate } });
  const prevStartDate = getStartDateForPeriod(period === '7d' ? '14d' : period === '30d' ? '60d' : period === '90d' ? '180d' : '2y');
  const revenuePrevious = await safeSum(BillingHistory, 'amount', { date: { [Op.gte]: prevStartDate, [Op.lt]: startDate } });
  const revenueGrowth = revenuePrevious && revenuePrevious > 0 ? ((revenueCurrent - revenuePrevious) / revenuePrevious) * 100 : 0;

  // Bookings
  const bookingsTotal = await safeCount(Appointment, { date: { [Op.gte]: startDate } });
  const bookingsCompleted = await safeCount(Appointment, { status: 'completed', date: { [Op.gte]: startDate } });
  const bookingsCancelled = await safeCount(Appointment, { status: 'cancelled', date: { [Op.gte]: startDate } });
  const bookingsNoShow = await safeCount(Appointment, { status: 'no_show', date: { [Op.gte]: startDate } });

  // User Growth
  const newUsers = await safeCount(User, { join_date: { [Op.gte]: startDate } });
  const returningUsers = 0; // Not implemented

  // Top Services
  let topServices = [];
  try {
    const topServicesRaw = await Appointment.findAll({
      attributes: ['service_id', [Sequelize.fn('COUNT', Sequelize.col('service_id')), 'bookings']],
      where: { date: { [Op.gte]: startDate } },
      group: ['service_id'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('service_id')), 'DESC']],
      limit: 5
    });
    topServices = await Promise.all(topServicesRaw.map(async (row) => {
      try {
        const service = await Service.findByPk(row.service_id);
        return {
          name: service ? service.name : 'Unknown Service',
          bookings: row.get('bookings') || 0,
          revenue: 0,
          growth: 0
        };
      } catch {
        return { name: 'Unknown Service', bookings: row.get('bookings') || 0, revenue: 0, growth: 0 };
      }
    }));
  } catch { topServices = []; }

  // Geographic Data
  let geographicData = [];
  try {
    const salons = await Salon.findAll({
      include: [{
        model: require('../models').Address,
        as: 'address',
        attributes: ['city', 'state']
      }]
    });
    const geoMap = {};
    salons.forEach(salon => {
      const loc = salon.address ? `${salon.address.city}, ${salon.address.state}` : 'Unknown Location';
      if (!geoMap[loc]) geoMap[loc] = { location: loc, salons: 0, users: 0, revenue: 0 };
      geoMap[loc].salons += 1;
      geoMap[loc].revenue += Number(salon.revenue || 0);
    });
    geographicData = Object.values(geoMap);
  } catch { geographicData = []; }

  // Performance Metrics
  const averageBookingValue = bookingsTotal > 0 ? (revenueCurrent / bookingsTotal) : 0;
  const customerRetentionRate = 0;
  const salonUtilizationRate = 0;
  let averageRating = 0;
  try {
    const salons = await safeFindAll(Salon);
    if (salons.length > 0) {
      const totalRating = salons.reduce((sum, s) => sum + Number(s.rating || 0), 0);
      averageRating = totalRating / salons.length;
    }
  } catch { averageRating = 0; }

  // Chart Data
  const generateChartData = async () => {
    try {
      const months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const monthlyRevenue = await BillingHistory.sum('amount', { where: { date: { [Op.between]: [startOfMonth, endOfMonth] } } }) || 0;
        const monthlyBookings = await Appointment.count({ where: { date: { [Op.between]: [startOfMonth, endOfMonth] } } }) || 0;
        const monthlyNewUsers = await User.count({ where: { createdAt: { [Op.between]: [startOfMonth, endOfMonth] } } }) || 0;
        months.push({ month: monthName, revenue: monthlyRevenue, bookings: monthlyBookings, newUsers: monthlyNewUsers, date: startOfMonth.toISOString().split('T')[0] });
      }
      return months;
    } catch { return []; }
  };
  const chartData = await generateChartData();

  return {
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
    topServices,
    geographicData,
    performanceMetrics: {
      averageBookingValue,
      customerRetentionRate,
      salonUtilizationRate,
      averageRating
    }
  };
}; 