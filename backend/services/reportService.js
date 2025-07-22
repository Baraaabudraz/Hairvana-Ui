const reportRepository = require('../repositories/reportRepository');

exports.getAllReports = async () => {
  return reportRepository.findAll();
};

exports.getReportById = async (id) => {
  return reportRepository.findById(id);
};

exports.createReport = async (data) => {
  return reportRepository.create(data);
};

exports.updateReport = async (id, data) => {
  return reportRepository.update(id, data);
};

exports.deleteReport = async (id) => {
  return reportRepository.delete(id);
};

exports.generateReport = async (body, user) => {
  return reportRepository.generate(body, user);
}; 