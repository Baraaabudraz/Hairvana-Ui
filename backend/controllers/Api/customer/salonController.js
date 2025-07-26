'use strict';
const { Salon, Service, Review, Address } = require('../../../models');
const { Sequelize } = require('sequelize');

exports.getSalons = async (req, res) => {
  try {
    const { location, name, rating } = req.query;
    const where = {};
    if (location) where.location = location;
    if (name) where.name = { $iLike: `%${name}%` };
    if (rating) where.rating = rating;
    const salons = await Salon.findAll({
      where,
      include: [
        { model: Service, as: 'services' },
        { model: Address, as: 'address' }
      ]
    });
    // For each salon, calculate avg rating
    const salonsWithRating = await Promise.all(salons.map(async salon => {
      const ratingResult = await Review.findOne({
        attributes: [[Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating']],
        where: { salon_id: salon.id }
      });
      const avgRating = ratingResult && ratingResult.dataValues.avgRating ? parseFloat(ratingResult.dataValues.avgRating) : 0;
      return { ...salon.toJSON(), avgRating };
    }));
    return res.json({ success: true, salons: salonsWithRating });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch salons' });
  }
};

exports.getSalonById = async (req, res) => {
  try {
    const salon = await Salon.findByPk(req.params.id, {
      include: [
        { model: Service, as: 'services' },
        { model: Address, as: 'address' }
      ]
    });
    if (!salon) return res.status(404).json({ error: 'Salon not found' });
    const ratingResult = await Review.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating']],
      where: { salon_id: salon.id }
    });
    const avgRating = ratingResult && ratingResult.dataValues.avgRating ? parseFloat(ratingResult.dataValues.avgRating) : 0;
    return res.json({ success: true, salon: { ...salon.toJSON(), avgRating } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch salon' });
  }
}; 