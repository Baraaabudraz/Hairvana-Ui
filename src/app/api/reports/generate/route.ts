import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { templateId, parameters } = await request.json();

    // Simulate report generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock report data based on template
    const reportData = generateReportData(templateId, parameters);

    return NextResponse.json({
      success: true,
      reportId: `report_${Date.now()}`,
      data: reportData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

function generateReportData(templateId: string, parameters: any) {
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
          },
          {
            title: 'Booking Trends',
            type: 'chart',
            chartType: 'area',
            data: [
              { date: '2024-06-01', bookings: 145, completed: 132, cancelled: 8 },
              { date: '2024-06-02', bookings: 167, completed: 154, cancelled: 9 },
              { date: '2024-06-03', bookings: 134, completed: 125, cancelled: 6 },
              { date: '2024-06-04', bookings: 189, completed: 175, cancelled: 10 },
              { date: '2024-06-05', bookings: 156, completed: 143, cancelled: 8 },
              { date: '2024-06-06', bookings: 178, completed: 164, cancelled: 9 },
              { date: '2024-06-07', bookings: 142, completed: 131, cancelled: 7 }
            ]
          },
          {
            title: 'Service Popularity',
            type: 'chart',
            chartType: 'pie',
            data: [
              { name: 'Haircut', value: 3245, percentage: 36.3 },
              { name: 'Hair Color', value: 2156, percentage: 24.1 },
              { name: 'Styling', value: 1834, percentage: 20.5 },
              { name: 'Treatment', value: 1245, percentage: 13.9 },
              { name: 'Beard Trim', value: 462, percentage: 5.2 }
            ]
          }
        ]
      };

    case 'user-analytics':
      return {
        ...baseData,
        title: 'User Analytics Report',
        sections: [
          {
            title: 'User Growth Summary',
            type: 'summary',
            data: {
              totalUsers: 45231,
              activeUsers: 38942,
              newUsers: 1234,
              retentionRate: 78.5,
              keyInsights: [
                'User base grew by 15.2% this month',
                'Customer retention rate improved to 78.5%',
                'Mobile app usage increased by 32%',
                'Average session duration: 12.5 minutes'
              ]
            }
          },
          {
            title: 'User Acquisition',
            type: 'chart',
            chartType: 'line',
            data: [
              { month: 'Jan', newUsers: 856, returningUsers: 5234, totalUsers: 6090 },
              { month: 'Feb', newUsers: 923, returningUsers: 6123, totalUsers: 7046 },
              { month: 'Mar', newUsers: 1045, returningUsers: 6789, totalUsers: 7834 },
              { month: 'Apr', newUsers: 1156, returningUsers: 7234, totalUsers: 8390 },
              { month: 'May', newUsers: 1089, returningUsers: 7456, totalUsers: 8545 },
              { month: 'Jun', newUsers: 1234, returningUsers: 7890, totalUsers: 9124 }
            ]
          },
          {
            title: 'User Demographics',
            type: 'table',
            headers: ['Age Group', 'Users', 'Percentage', 'Avg. Bookings', 'Avg. Spend'],
            data: [
              ['18-25', '8,456', '18.7%', '2.3', '$45'],
              ['26-35', '15,234', '33.7%', '3.8', '$78'],
              ['36-45', '12,890', '28.5%', '4.2', '$95'],
              ['46-55', '6,789', '15.0%', '3.1', '$82'],
              ['55+', '1,862', '4.1%', '2.8', '$67']
            ]
          },
          {
            title: 'User Engagement',
            type: 'chart',
            chartType: 'bar',
            data: [
              { metric: 'Daily Active Users', value: 12456, target: 15000 },
              { metric: 'Weekly Active Users', value: 28934, target: 30000 },
              { metric: 'Monthly Active Users', value: 38942, target: 40000 },
              { metric: 'Session Duration (min)', value: 12.5, target: 15 }
            ]
          }
        ]
      };

    case 'booking-trends':
      return {
        ...baseData,
        title: 'Booking Trends Analysis',
        sections: [
          {
            title: 'Booking Overview',
            type: 'summary',
            data: {
              totalBookings: 8942,
              completedBookings: 8234,
              completionRate: 92.1,
              averageBookingValue: 67.50,
              insights: [
                'Booking completion rate: 92.1%',
                'Peak booking time: 2-4 PM weekdays',
                'Most popular service: Haircut (36.3%)',
                'Weekend bookings increased by 18%'
              ]
            }
          },
          {
            title: 'Daily Booking Patterns',
            type: 'chart',
            chartType: 'line',
            data: [
              { day: 'Monday', bookings: 1245, completed: 1156, cancelled: 89 },
              { day: 'Tuesday', bookings: 1356, completed: 1267, cancelled: 89 },
              { day: 'Wednesday', bookings: 1289, completed: 1198, cancelled: 91 },
              { day: 'Thursday', bookings: 1423, completed: 1334, cancelled: 89 },
              { day: 'Friday', bookings: 1567, completed: 1456, cancelled: 111 },
              { day: 'Saturday', bookings: 1789, completed: 1634, cancelled: 155 },
              { day: 'Sunday', bookings: 1273, completed: 1189, cancelled: 84 }
            ]
          },
          {
            title: 'Service Booking Distribution',
            type: 'chart',
            chartType: 'pie',
            data: [
              { name: 'Haircut', bookings: 3245, revenue: 48675 },
              { name: 'Hair Color', bookings: 2156, revenue: 64680 },
              { name: 'Styling', bookings: 1834, revenue: 27510 },
              { name: 'Treatment', bookings: 1245, revenue: 37350 },
              { name: 'Beard Trim', bookings: 462, revenue: 4620 }
            ]
          },
          {
            title: 'Seasonal Trends',
            type: 'table',
            headers: ['Month', 'Bookings', 'Growth', 'Popular Service', 'Avg. Value'],
            data: [
              ['January', '7,234', '+5.2%', 'Haircut', '$62'],
              ['February', '7,456', '+3.1%', 'Hair Color', '$68'],
              ['March', '7,890', '+5.8%', 'Styling', '$71'],
              ['April', '8,234', '+4.4%', 'Haircut', '$65'],
              ['May', '8,567', '+4.0%', 'Treatment', '$73'],
              ['June', '8,942', '+4.4%', 'Hair Color', '$68']
            ]
          }
        ]
      };

    case 'financial-overview':
      return {
        ...baseData,
        title: 'Financial Overview Report',
        sections: [
          {
            title: 'Financial Summary',
            type: 'summary',
            data: {
              totalRevenue: 127450,
              totalExpenses: 89320,
              netProfit: 38130,
              profitMargin: 29.9,
              highlights: [
                'Net profit margin: 29.9%',
                'Operating expenses decreased by 5.2%',
                'Cash flow positive for 6 consecutive months',
                'ROI on marketing spend: 340%'
              ]
            }
          },
          {
            title: 'Profit & Loss',
            type: 'table',
            headers: ['Category', 'Amount', 'Percentage', 'vs. Previous', 'Trend'],
            data: [
              ['Total Revenue', '$127,450', '100%', '+23.5%', '↗'],
              ['Subscription Revenue', '$89,450', '70.2%', '+28.1%', '↗'],
              ['Commission Revenue', '$38,000', '29.8%', '+15.2%', '↗'],
              ['Operating Expenses', '$89,320', '70.1%', '-5.2%', '↘'],
              ['Net Profit', '$38,130', '29.9%', '+67.8%', '↗']
            ]
          },
          {
            title: 'Cash Flow Analysis',
            type: 'chart',
            chartType: 'line',
            data: [
              { month: 'Jan', inflow: 65000, outflow: 48000, net: 17000 },
              { month: 'Feb', inflow: 72000, outflow: 52000, net: 20000 },
              { month: 'Mar', inflow: 68000, outflow: 49000, net: 19000 },
              { month: 'Apr', inflow: 85000, outflow: 58000, net: 27000 },
              { month: 'May', inflow: 92000, outflow: 62000, net: 30000 },
              { month: 'Jun', inflow: 127450, outflow: 89320, net: 38130 }
            ]
          },
          {
            title: 'Key Financial Ratios',
            type: 'chart',
            chartType: 'bar',
            data: [
              { metric: 'Gross Margin', value: 72.5, benchmark: 70 },
              { metric: 'Operating Margin', value: 35.2, benchmark: 30 },
              { metric: 'Net Margin', value: 29.9, benchmark: 25 },
              { metric: 'ROI', value: 42.3, benchmark: 35 }
            ]
          }
        ]
      };

    case 'operational-metrics':
      return {
        ...baseData,
        title: 'Operational Metrics Report',
        sections: [
          {
            title: 'System Performance',
            type: 'summary',
            data: {
              uptime: 99.97,
              avgResponseTime: 245,
              errorRate: 0.03,
              activeUsers: 38942,
              systemHealth: [
                'System uptime: 99.97%',
                'Average response time: 245ms',
                'Error rate: 0.03%',
                'Peak concurrent users: 5,234'
              ]
            }
          },
          {
            title: 'Performance Metrics',
            type: 'chart',
            chartType: 'line',
            data: [
              { date: '2024-06-01', responseTime: 234, uptime: 99.98, errors: 12 },
              { date: '2024-06-02', responseTime: 245, uptime: 99.97, errors: 8 },
              { date: '2024-06-03', responseTime: 223, uptime: 99.99, errors: 5 },
              { date: '2024-06-04', responseTime: 267, uptime: 99.95, errors: 15 },
              { date: '2024-06-05', responseTime: 241, uptime: 99.98, errors: 7 },
              { date: '2024-06-06', responseTime: 238, uptime: 99.97, errors: 9 },
              { date: '2024-06-07', responseTime: 252, uptime: 99.96, errors: 11 }
            ]
          },
          {
            title: 'System Resources',
            type: 'table',
            headers: ['Resource', 'Current Usage', 'Peak Usage', 'Capacity', 'Status'],
            data: [
              ['CPU', '45%', '78%', '100%', 'Healthy'],
              ['Memory', '62%', '89%', '100%', 'Healthy'],
              ['Storage', '34%', '45%', '100%', 'Healthy'],
              ['Bandwidth', '23%', '67%', '100%', 'Healthy'],
              ['Database', '41%', '72%', '100%', 'Healthy']
            ]
          },
          {
            title: 'User Activity',
            type: 'chart',
            chartType: 'area',
            data: [
              { hour: '00:00', users: 1234, sessions: 2456 },
              { hour: '06:00', users: 2345, sessions: 3567 },
              { hour: '12:00', users: 5234, sessions: 7890 },
              { hour: '18:00', users: 4567, sessions: 6789 },
              { hour: '23:00', users: 1890, sessions: 2345 }
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

function getDateRangeLabel(range: string) {
  switch (range) {
    case '7d': return 'Last 7 days';
    case '30d': return 'Last 30 days';
    case '90d': return 'Last 90 days';
    case '1y': return 'Last year';
    case 'custom': return 'Custom range';
    default: return range;
  }
}