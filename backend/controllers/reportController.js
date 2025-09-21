const { Report, ReportTemplate, User, Salon, Appointment, Service, BillingHistory } = require('../models');
const reportService = require('../services/reportService');

// List all reports
exports.getAllReports = async (req, res, next) => {
  try {
    const { page, limit, status, search, sortBy, sortOrder } = req.query;
    const reports = await reportService.getAllReports({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      status,
      search,
      sortBy,
      sortOrder
    });
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

// Get a single report by ID
exports.getReportById = async (req, res, next) => {
  try {
    const report = await reportService.getReportById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (error) {
    next(error);
  }
};

// Create a new report
exports.createReport = async (req, res, next) => {
  try {
    const report = await reportService.createReport(req.body);
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

// Update a report
exports.updateReport = async (req, res, next) => {
  try {
    const updated = await reportService.updateReport(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Report not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Delete a report
exports.deleteReport = async (req, res, next) => {
  try {
    const deleted = await reportService.deleteReport(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    next(error);
  }
};

// Generate a report from template
exports.generateReport = async (req, res, next) => {
  try {
    const result = await reportService.generateReport(req.body, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

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

 