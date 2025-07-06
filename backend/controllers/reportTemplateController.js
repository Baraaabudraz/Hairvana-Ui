const { ReportTemplate } = require('../models');

// List all report templates
exports.getAllReportTemplates = async (req, res) => {
  try {
    const templates = await ReportTemplate.findAll();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report templates.' });
  }
};

// Get a single report template by ID
exports.getReportTemplateById = async (req, res) => {
  try {
    const template = await ReportTemplate.findByPk(req.params.id);
    if (!template) return res.status(404).json({ error: 'Not found' });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report template.' });
  }
};

// Create a new report template
exports.createReportTemplate = async (req, res) => {
  try {
    const template = await ReportTemplate.create(req.body);
    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create report template.' });
  }
};

// Update a report template
exports.updateReportTemplate = async (req, res) => {
  try {
    const template = await ReportTemplate.findByPk(req.params.id);
    if (!template) return res.status(404).json({ error: 'Not found' });
    await template.update(req.body);
    res.json(template);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update report template.' });
  }
};

// Delete a report template
exports.deleteReportTemplate = async (req, res) => {
  try {
    const template = await ReportTemplate.findByPk(req.params.id);
    if (!template) return res.status(404).json({ error: 'Not found' });
    await template.destroy();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete report template.' });
  }
}; 