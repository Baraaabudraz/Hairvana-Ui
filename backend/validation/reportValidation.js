const { body } = require('express-validator');
const { commonRules } = require('./index');

// Validation for creating/updating reports
const validateReport = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Report name must be a non-empty string'),
  
  body('description')
    .optional()
    .isString()
    .withMessage('Report description must be a string'),
  
  body('period')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'])
    .withMessage('Period must be one of: daily, weekly, monthly, quarterly, yearly, custom'),
  
  body('parameters')
    .optional()
    .isObject()
    .withMessage('Parameters must be an object'),
  
  body('parameters.fields')
    .optional()
    .isArray()
    .withMessage('Parameters fields must be an array'),
  
  body('parameters.fields.*')
    .optional()
    .isIn([
      // Financial fields
      'Total Revenue', 'Subscription Revenue', 'Commission Revenue', 'Growth Rate',
      'Revenue', 'Expenses', 'Profit Margin', 'Cash Flow', 'Financial Ratios',
      'Cost Analysis', 'Budget vs Actual', 'Revenue per Salon', 'Revenue per Service',
      'Monthly Trends', 'Year-over-Year Comparison', 'Regional Revenue',
      
      // Salon fields
      'Active Salons', 'Booking Volume', 'Average Rating', 'Utilization Rate',
      'Top Performers', 'Customer Satisfaction', 'Service Popularity',
      'Service Duration', 'Service Quality', 'Pricing Analysis', 'Service Trends',
      'Location Performance', 'Territory Analysis',
      
      // User fields
      'New Users', 'Active Users', 'Retention Rate', 'User Journey', 'Demographics',
      'Engagement Metrics', 'Churn Analysis', 'Customer Segments', 'Purchase Patterns',
      'Satisfaction Scores', 'Feedback Analysis', 'Lifetime Value', 'Preference Trends',
      'Service Ratings',
      
      // Operational fields
      'System Uptime', 'Response Times', 'Error Rates', 'User Sessions',
      'Platform Health', 'Performance Metrics', 'Infrastructure Status',
      'Completion Rate', 'Popular Services', 'Peak Times', 'Cancellation Analysis',
      'Seasonal Patterns', 'Service Preferences', 'Campaign Performance',
      'Customer Acquisition Cost', 'Conversion Rates', 'Marketing ROI',
      'Channel Effectiveness', 'Lead Generation', 'Brand Awareness',
      'Market Penetration', 'Geographic Growth', 'Regional Preferences',
      'Market Opportunities',
      
      // Geographic fields
      'Geographic Breakdown'
    ])
    .withMessage('Invalid field in parameters.fields array')
];

// Validation for generating reports
const validateGenerateReport = [
  body('templateId')
    .trim()
    .notEmpty()
    .withMessage('Template ID is required')
    .isUUID()
    .withMessage('Template ID must be a valid UUID'),
  
  body('parameters')
    .optional()
    .isObject()
    .withMessage('Parameters must be an object'),
  
  body('parameters.dateRange')
    .optional()
    .isIn(['7d', '30d', '90d', '1y', 'custom'])
    .withMessage('Date range must be one of: 7d, 30d, 90d, 1y, custom'),
  
  body('parameters.fields')
    .optional()
    .isArray()
    .withMessage('Parameters fields must be an array'),
  
  body('parameters.fields.*')
    .optional()
    .isIn([
      // Financial fields
      'Total Revenue', 'Subscription Revenue', 'Commission Revenue', 'Growth Rate',
      'Revenue', 'Expenses', 'Profit Margin', 'Cash Flow', 'Financial Ratios',
      'Cost Analysis', 'Budget vs Actual', 'Revenue per Salon', 'Revenue per Service',
      'Monthly Trends', 'Year-over-Year Comparison', 'Regional Revenue',
      
      // Salon fields
      'Active Salons', 'Booking Volume', 'Average Rating', 'Utilization Rate',
      'Top Performers', 'Customer Satisfaction', 'Service Popularity',
      'Service Duration', 'Service Quality', 'Pricing Analysis', 'Service Trends',
      'Location Performance', 'Territory Analysis',
      
      // User fields
      'New Users', 'Active Users', 'Retention Rate', 'User Journey', 'Demographics',
      'Engagement Metrics', 'Churn Analysis', 'Customer Segments', 'Purchase Patterns',
      'Satisfaction Scores', 'Feedback Analysis', 'Lifetime Value', 'Preference Trends',
      'Service Ratings',
      
      // Operational fields
      'System Uptime', 'Response Times', 'Error Rates', 'User Sessions',
      'Platform Health', 'Performance Metrics', 'Infrastructure Status',
      'Completion Rate', 'Popular Services', 'Peak Times', 'Cancellation Analysis',
      'Seasonal Patterns', 'Service Preferences', 'Campaign Performance',
      'Customer Acquisition Cost', 'Conversion Rates', 'Marketing ROI',
      'Channel Effectiveness', 'Lead Generation', 'Brand Awareness',
      'Market Penetration', 'Geographic Growth', 'Regional Preferences',
      'Market Opportunities',
      
      // Geographic fields
      'Geographic Breakdown'
    ])
    .withMessage('Invalid field in parameters.fields array')
];

// Validation for report templates
const validateReportTemplate = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Template name must be a non-empty string'),
  
  body('description')
    .optional()
    .isString()
    .withMessage('Template description must be a string'),
  
  body('type')
    .optional()
    .isIn(['financial', 'salon', 'user', 'operational', 'custom'])
    .withMessage('Type must be one of: financial, salon, user, operational, custom'),
  
  body('fields')
    .optional()
    .isArray()
    .withMessage('Fields must be an array'),
  
  body('fields.*')
    .optional()
    .isIn([
      // Financial fields
      'Total Revenue', 'Subscription Revenue', 'Commission Revenue', 'Growth Rate',
      'Revenue', 'Expenses', 'Profit Margin', 'Cash Flow', 'Financial Ratios',
      'Cost Analysis', 'Budget vs Actual', 'Revenue per Salon', 'Revenue per Service',
      'Monthly Trends', 'Year-over-Year Comparison', 'Regional Revenue',
      
      // Salon fields
      'Active Salons', 'Booking Volume', 'Average Rating', 'Utilization Rate',
      'Top Performers', 'Customer Satisfaction', 'Service Popularity',
      'Service Duration', 'Service Quality', 'Pricing Analysis', 'Service Trends',
      'Location Performance', 'Territory Analysis',
      
      // User fields
      'New Users', 'Active Users', 'Retention Rate', 'User Journey', 'Demographics',
      'Engagement Metrics', 'Churn Analysis', 'Customer Segments', 'Purchase Patterns',
      'Satisfaction Scores', 'Feedback Analysis', 'Lifetime Value', 'Preference Trends',
      'Service Ratings',
      
      // Operational fields
      'System Uptime', 'Response Times', 'Error Rates', 'User Sessions',
      'Platform Health', 'Performance Metrics', 'Infrastructure Status',
      'Completion Rate', 'Popular Services', 'Peak Times', 'Cancellation Analysis',
      'Seasonal Patterns', 'Service Preferences', 'Campaign Performance',
      'Customer Acquisition Cost', 'Conversion Rates', 'Marketing ROI',
      'Channel Effectiveness', 'Lead Generation', 'Brand Awareness',
      'Market Penetration', 'Geographic Growth', 'Regional Preferences',
      'Market Opportunities',
      
      // Geographic fields
      'Geographic Breakdown'
    ])
    .withMessage('Invalid field in fields array'),
  
  body('parameters')
    .optional()
    .isObject()
    .withMessage('Parameters must be an object')
];

module.exports = {
  validateReport,
  validateGenerateReport,
  validateReportTemplate
}; 