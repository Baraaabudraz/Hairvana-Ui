'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('report_templates', [
      {
        id: uuidv4(),
        name: 'Revenue Summary',
        description: 'Comprehensive revenue analysis with breakdowns by source, time period, and geography',
        type: 'financial',
        icon: 'DollarSign',
        color: 'from-green-600 to-emerald-600',
        fields: JSON.stringify([
          'Total Revenue',
          'Subscription Revenue', 
          'Commission Revenue',
          'Growth Rate',
          'Geographic Breakdown',
          'Monthly Trends',
          'Year-over-Year Comparison'
        ]),
        popular: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Salon Performance',
        description: 'Detailed analysis of salon metrics including bookings, ratings, and utilization',
        type: 'salon',
        icon: 'Building2',
        color: 'from-blue-600 to-cyan-600',
        fields: JSON.stringify([
          'Active Salons',
          'Booking Volume',
          'Average Rating',
          'Utilization Rate',
          'Top Performers',
          'Revenue per Salon',
          'Customer Satisfaction'
        ]),
        popular: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'User Analytics',
        description: 'User behavior analysis including acquisition, retention, and engagement metrics',
        type: 'user',
        icon: 'Users',
        color: 'from-purple-600 to-pink-600',
        fields: JSON.stringify([
          'New Users',
          'Active Users',
          'Retention Rate',
          'User Journey',
          'Demographics',
          'Engagement Metrics',
          'Churn Analysis'
        ]),
        popular: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Booking Trends',
        description: 'Booking patterns, seasonal trends, and service popularity analysis',
        type: 'operational',
        icon: 'Calendar',
        color: 'from-orange-600 to-red-600',
        fields: JSON.stringify([
          'Booking Volume',
          'Completion Rate',
          'Popular Services',
          'Peak Times',
          'Cancellation Analysis',
          'Seasonal Patterns',
          'Service Preferences'
        ]),
        popular: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Financial Overview',
        description: 'Complete financial dashboard with P&L, cash flow, and key financial metrics',
        type: 'financial',
        icon: 'BarChart3',
        color: 'from-indigo-600 to-purple-600',
        fields: JSON.stringify([
          'Revenue',
          'Expenses',
          'Profit Margin',
          'Cash Flow',
          'Financial Ratios',
          'Cost Analysis',
          'Budget vs Actual'
        ]),
        popular: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Operational Metrics',
        description: 'Platform operational health including uptime, performance, and system metrics',
        type: 'operational',
        icon: 'Activity',
        color: 'from-teal-600 to-green-600',
        fields: JSON.stringify([
          'System Uptime',
          'Response Times',
          'Error Rates',
          'User Sessions',
          'Platform Health',
          'Performance Metrics',
          'Infrastructure Status'
        ]),
        popular: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Customer Insights',
        description: 'Deep dive into customer behavior, preferences, and satisfaction metrics',
        type: 'user',
        icon: 'UserCheck',
        color: 'from-pink-600 to-rose-600',
        fields: JSON.stringify([
          'Customer Segments',
          'Purchase Patterns',
          'Satisfaction Scores',
          'Feedback Analysis',
          'Lifetime Value',
          'Preference Trends',
          'Service Ratings'
        ]),
        popular: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Marketing Performance',
        description: 'Marketing campaign effectiveness and customer acquisition analysis',
        type: 'operational',
        icon: 'TrendingUp',
        color: 'from-yellow-600 to-orange-600',
        fields: JSON.stringify([
          'Campaign Performance',
          'Customer Acquisition Cost',
          'Conversion Rates',
          'Marketing ROI',
          'Channel Effectiveness',
          'Lead Generation',
          'Brand Awareness'
        ]),
        popular: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Service Analytics',
        description: 'Analysis of service performance, popularity, and profitability',
        type: 'salon',
        icon: 'Scissors',
        color: 'from-emerald-600 to-teal-600',
        fields: JSON.stringify([
          'Service Popularity',
          'Revenue per Service',
          'Service Duration',
          'Customer Preferences',
          'Service Quality',
          'Pricing Analysis',
          'Service Trends'
        ]),
        popular: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Geographic Analysis',
        description: 'Regional performance analysis and market penetration insights',
        type: 'operational',
        icon: 'MapPin',
        color: 'from-violet-600 to-purple-600',
        fields: JSON.stringify([
          'Regional Revenue',
          'Market Penetration',
          'Geographic Growth',
          'Regional Preferences',
          'Market Opportunities',
          'Location Performance',
          'Territory Analysis'
        ]),
        popular: false,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('report_templates', null, {});
  }
}; 