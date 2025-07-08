'use strict';
const { Salon, Service } = require('../../models');

exports.getSalons = async (req, res) => {
  try {
    const { location, name, rating } = req.query;
    const where = {};
    if (location) where.location = location;
    if (name) where.name = { $iLike: `%${name}%` };
    if (rating) where.rating = rating;
    const salons = await Salon.findAll({
      where,
      include: [{ model: Service, as: 'services' }]
    });
    return res.json({ success: true, salons });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch salons' });
  }
};

exports.getSalonById = async (req, res) => {
  try {
    const salon = await Salon.findByPk(req.params.id, {
      include: [{ model: Service, as: 'services' }]
    });
    if (!salon) return res.status(404).json({ error: 'Salon not found' });
    return res.json({ success: true, salon });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch salon' });
  }
}; 