const { Report } = require('../models');

// List all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.findAll();
    // Map DB fields to frontend shape
    const mapped = reports.map(r => {
      const data = r.data || {};
      return {
        id: r.id,
        name: data.name || '',
        description: data.description || '',
        type: r.type,
        status: data.status || 'completed',
        createdAt: r.createdAt,
        generatedAt: r.generated_at,
        createdBy: data.createdBy || '',
        size: data.size || '',
        downloadUrl: data.downloadUrl || '',
        parameters: data.parameters || {},
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
};

// Get a single report by ID
exports.getReportById = async (req, res) => {
  try {
    const r = await Report.findByPk(req.params.id);
    if (!r) return res.status(404).json({ error: 'Not found' });
    const data = r.data || {};
    const mapped = {
      id: r.id,
      name: data.name || '',
      description: data.description || '',
      type: r.type,
      status: data.status || 'completed',
      createdAt: r.createdAt,
      generatedAt: r.generated_at,
      createdBy: data.createdBy || '',
      size: data.size || '',
      downloadUrl: data.downloadUrl || '',
      parameters: data.parameters || {},
    };
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report.' });
  }
};

// Create a new report
exports.createReport = async (req, res) => {
  try {
    // Store all extra fields in the data column
    const { name, description, status, createdBy, size, downloadUrl, parameters, ...rest } = req.body;
    const report = await Report.create({
      ...rest,
      data: { name, description, status, createdBy, size, downloadUrl, parameters },
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create report.' });
  }
};

// Update a report
exports.updateReport = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Not found' });
    await report.update(req.body);
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update report.' });
  }
};

// Delete a report
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Not found' });
    await report.destroy();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete report.' });
  }
}; 