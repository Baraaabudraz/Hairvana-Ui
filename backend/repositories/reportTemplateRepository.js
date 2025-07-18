const { ReportTemplate } = require('../models');

exports.findAll = async () => {
  return ReportTemplate.findAll();
};

exports.findById = async (id) => {
  return ReportTemplate.findByPk(id);
};

exports.create = async (data) => {
  return ReportTemplate.create(data);
};

exports.update = async (id, data) => {
  const template = await ReportTemplate.findByPk(id);
  if (!template) return null;
  await template.update(data);
  return template;
};

exports.delete = async (id) => {
  const template = await ReportTemplate.findByPk(id);
  if (!template) return null;
  await template.destroy();
  return true;
}; 