const { Hairstyle } = require('../models');

const create = (data) => Hairstyle.create(data);
const findAllBySalon = (salon_id) => Hairstyle.findAll({ where: { salon_id } });
const findByIdAndSalon = (id, salon_id) => Hairstyle.findOne({ where: { id, salon_id } });
const updateById = (id, data) => Hairstyle.update(data, { where: { id } });
const deleteByIdAndSalon = (id, salon_id) => Hairstyle.destroy({ where: { id, salon_id } });

module.exports = {
  create,
  findAllBySalon,
  findByIdAndSalon,
  updateById,
  deleteByIdAndSalon,
}; 