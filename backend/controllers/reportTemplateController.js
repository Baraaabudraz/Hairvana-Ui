const { ReportTemplate } = require('../models');
const reportTemplateService = require('../services/reportTemplateService');

exports.getAllReportTemplates = async (req, res, next) => {
  try {
    const templates = await reportTemplateService.getAllReportTemplates();
    res.json(templates);
  } catch (error) {
    next(error);
  }
};

exports.getReportTemplateById = async (req, res, next) => {
  try {
    const template = await reportTemplateService.getReportTemplateById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Not found' });
    res.json(template);
  } catch (error) {
    next(error);
  }
};

exports.createReportTemplate = async (req, res, next) => {
  try {
    const template = await reportTemplateService.createReportTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
};

exports.updateReportTemplate = async (req, res, next) => {
  try {
    const updated = await reportTemplateService.updateReportTemplate(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.deleteReportTemplate = async (req, res, next) => {
  try {
    const deleted = await reportTemplateService.deleteReportTemplate(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    next(error);
  }
};

 