'use strict';
const { Hairstyle } = require('../../models');

exports.getHairstyles = async (req, res) => {
  try {
    const { gender, length, color, name } = req.query;
    const where = {};
    if (gender) where.gender = gender;
    if (length) where.length = length;
    if (color) where.color = color;
    if (name) where.name = { $iLike: `%${name}%` };
    const hairstyles = await Hairstyle.findAll({ where });
    return res.json({ success: true, hairstyles });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch hairstyles' });
  }
};

exports.getHairstyleById = async (req, res) => {
  try {
    const hairstyle = await Hairstyle.findByPk(req.params.id);
    if (!hairstyle) return res.status(404).json({ error: 'Hairstyle not found' });
    return res.json({ success: true, hairstyle });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch hairstyle' });
  }
}; 