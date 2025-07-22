const reportTemplateRepository = require('../repositories/reportTemplateRepository');

exports.getAllReportTemplates = async () => {
  return reportTemplateRepository.findAll();
};

exports.getReportTemplateById = async (id) => {
  return reportTemplateRepository.findById(id);
};

exports.createReportTemplate = async (data) => {
  return reportTemplateRepository.create(data);
};

exports.updateReportTemplate = async (id, data) => {
  return reportTemplateRepository.update(id, data);
};

exports.deleteReportTemplate = async (id) => {
  return reportTemplateRepository.delete(id);
}; 