// Get analytics data
exports.getAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    // In a real app, you'd query aggregated data from your database
    // For this demo, we'll return mock data that matches the expected format
    
    // You could implement actual queries like:
    /*
    const startDate = getStartDateForPeriod(period);
    
    // Get revenue data
    const { data: revenueData, error: revenueError } = await req.supabase
      .from('billing_history')
      .select('date, amount')
      .gte('date', startDate)
      .order('date', { ascending: true });
    
    // Get booking data
    const { data: bookingsData, error: bookingsError } = await req.supabase
      .from('appointments')
      .select('date, status')
      .gte('date', startDate)
      .order('date', { ascending: true });
    
    // Get user growth data
    const { data: usersData, error: usersError } = await req.supabase
      .from('users')
      .select('join_date')
      .gte('join_date', startDate)
      .order('join_date', { ascending: true });
    
    // Then process this data to create the analytics object
    */
    
    // For now, return mock data
    const analytics = {
      overview: {
        totalSalons: 1247,
        activeSalons: 1156,
        totalUsers: 45231,
        activeUsers: 38942,
        totalBookings: 8942,
        completedBookings: 8234,
        totalRevenue: 127450,
        monthlyGrowth: 23,
      },
      revenue: {
        current: 127450,
        previous: 103620,
        growth: 23,
        data: [
          { month: 'Jan', revenue: 65000, subscriptions: 45000, commissions: 20000 },
          { month: 'Feb', revenue: 72000, subscriptions: 52000, commissions: 20000 },
          { month: 'Mar', revenue: 68000, subscriptions: 48000, commissions: 20000 },
          { month: 'Apr', revenue: 85000, subscriptions: 62000, commissions: 23000 },
          { month: 'May', revenue: 92000, subscriptions: 67000, commissions: 25000 },
          { month: 'Jun', revenue: 127450, subscriptions: 89450, commissions: 38000 },
        ],
      },
      bookings: {
        total: 8942,
        completed: 8234,
        cancelled: 456,
        noShow: 252,
        data: [
          { date: '2024-06-01', bookings: 145, completed: 132, cancelled: 8 },
          { date: '2024-06-02', bookings: 167, completed: 154, cancelled: 9 },
          { date: '2024-06-03', bookings: 134, completed: 125, cancelled: 6 },
          { date: '2024-06-04', bookings: 189, completed: 175, cancelled: 10 },
          { date: '2024-06-05', bookings: 156, completed: 143, cancelled: 8 },
          { date: '2024-06-06', bookings: 178, completed: 164, cancelled: 9 },
          { date: '2024-06-07', bookings: 142, completed: 131, cancelled: 7 },
        ],
      },
      userGrowth: {
        newUsers: 1234,
        returningUsers: 37708,
        data: [
          { month: 'Jan', newUsers: 856, returningUsers: 5234, totalUsers: 6090 },
          { month: 'Feb', newUsers: 923, returningUsers: 6123, totalUsers: 7046 },
          { month: 'Mar', newUsers: 1045, returningUsers: 6789, totalUsers: 7834 },
          { month: 'Apr', newUsers: 1156, returningUsers: 7234, totalUsers: 8390 },
          { month: 'May', newUsers: 1089, returningUsers: 7456, totalUsers: 8545 },
          { month: 'Jun', newUsers: 1234, returningUsers: 7890, totalUsers: 9124 },
        ],
      },
      topServices: [
        { name: 'Haircut', bookings: 3245, revenue: 48675, growth: 12.5 },
        { name: 'Hair Color', bookings: 2156, revenue: 64680, growth: 18.3 },
        { name: 'Styling', bookings: 1834, revenue: 27510, growth: 8.7 },
        { name: 'Treatment', bookings: 1245, revenue: 37350, growth: 15.2 },
        { name: 'Beard Trim', bookings: 462, revenue: 4620, growth: -2.1 },
      ],
      geographicData: [
        { location: 'California', salons: 234, users: 12456, revenue: 45230 },
        { location: 'New York', salons: 189, users: 9876, revenue: 38450 },
        { location: 'Texas', salons: 156, users: 8234, revenue: 29870 },
        { location: 'Florida', salons: 134, users: 7123, revenue: 25690 },
        { location: 'Illinois', salons: 98, users: 5432, revenue: 19340 },
        { location: 'Other States', salons: 436, users: 11110, revenue: 38920 },
      ],
      performanceMetrics: {
        averageBookingValue: 67.50,
        customerRetentionRate: 78.5,
        salonUtilizationRate: 82.3,
        averageRating: 4.7,
      },
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
    
    // In a real app, you'd generate a report based on the template and parameters
    // For this demo, we'll return mock data
    
    // Simulate report generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock report data based on template
    const reportData = generateReportData(templateId, parameters);
    
    res.json({
      success: true,
      reportId: `report_${Date.now()}`,
      data: reportData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get mock report data
function generateReportData(templateId, parameters) {
  const baseData = {
    metadata: {
      templateId,
      generatedAt: new Date().toISOString(),
      parameters,
      reportPeriod: getDateRangeLabel(parameters.dateRange),
    }
  };

  switch (templateId) {
    case 'revenue-summary':
      return {
        ...baseData,
        title: 'Revenue Summary Report',
        sections: [
          {
            title: 'Executive Summary',
            type: 'summary',
            data: {
              totalRevenue: 127450,
              growth: 23.5,
              subscriptionRevenue: 89450,
              commissionRevenue: 38000,
              topPerformingRegion: 'California',
              keyInsights: [
                'Revenue increased by 23.5% compared to previous period',
                'Subscription revenue accounts for 70% of total revenue',
                'California region shows strongest performance with $45,230',
                'Premium plan subscriptions grew by 35%'
              ]
            }
          },
          {
            title: 'Revenue Breakdown',
            type: 'chart',
            chartType: 'bar',
            data: [
              { category: 'Subscriptions', amount: 89450, percentage: 70.2 },
              { category: 'Commissions', amount: 38000, percentage: 29.8 }
            ]
          },
          {
            title: 'Monthly Trends',
            type: 'chart',
            chartType: 'line',
            data: [
              { month: 'Jan', revenue: 65000, subscriptions: 45000, commissions: 20000 },
              { month: 'Feb', revenue: 72000, subscriptions: 52000, commissions: 20000 },
              { month: 'Mar', revenue: 68000, subscriptions: 48000, commissions: 20000 },
              { month: 'Apr', revenue: 85000, subscriptions: 62000, commissions: 23000 },
              { month: 'May', revenue: 92000, subscriptions: 67000, commissions: 25000 },
              { month: 'Jun', revenue: 127450, subscriptions: 89450, commissions: 38000 }
            ]
          },
          {
            title: 'Geographic Performance',
            type: 'table',
            headers: ['Region', 'Revenue', 'Growth', 'Salons', 'Market Share'],
            data: [
              ['California', '$45,230', '+15.2%', '234', '35.5%'],
              ['New York', '$38,450', '+12.8%', '189', '30.2%'],
              ['Texas', '$29,870', '+18.5%', '156', '23.4%'],
              ['Florida', '$25,690', '+8.3%', '134', '20.2%'],
              ['Others', '$38,920', '+11.7%', '436', '30.5%']
            ]
          }
        ]
      };
    
    case 'salon-performance':
      return {
        ...baseData,
        title: 'Salon Performance Analysis',
        sections: [
          {
            title: 'Performance Overview',
            type: 'summary',
            data: {
              totalSalons: 1247,
              activeSalons: 1156,
              averageRating: 4.7,
              totalBookings: 8942,
              keyMetrics: [
                'Average salon utilization: 82.3%',
                'Top performing salon: Luxe Hair Studio (4.9★)',
                'Average bookings per salon: 7.7 per day',
                'Customer satisfaction rate: 94.2%'
              ]
            }
          },
          {
            title: 'Top Performing Salons',
            type: 'table',
            headers: ['Salon Name', 'Location', 'Rating', 'Bookings', 'Revenue', 'Growth'],
            data: [
              ['Luxe Hair Studio', 'Beverly Hills, CA', '4.9★', '156', '$12,450', '+23%'],
              ['Urban Cuts', 'Manhattan, NY', '4.8★', '134', '$9,820', '+18%'],
              ['Style & Grace', 'Miami, FL', '4.7★', '98', '$8,650', '+15%'],
              ['Hair Empire', 'Austin, TX', '4.9★', '198', '$15,600', '+28%'],
              ['The Hair Lounge', 'Dallas, TX', '4.6★', '87', '$7,230', '+12%']
            ]
          }
        ]
      };
    
    default:
      return {
        ...baseData,
        title: 'Custom Report',
        sections: [
          {
            title: 'Report Data',
            type: 'summary',
            data: {
              message: 'Custom report data would be generated based on specific parameters',
              parameters: parameters
            }
          }
        ]
      };
  }
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