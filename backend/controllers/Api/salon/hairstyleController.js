const { Salon } = require('../../../models');
const { getFileInfo } = require('../../../helpers/uploadHelper');
const hairstyleService = require('../../../services/hairstyleService');
const { validationResult } = require('express-validator');

// Upload a new hairstyle
exports.uploadHairstyle = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const salon = await Salon.findOne({ where: { owner_id: req.user.id } });
    if (!salon) return res.status(404).json({ error: 'Salon not found' });
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const { name, gender, length, color, tags, description } = req.body;
    const imageInfo = getFileInfo(req.file, '/uploads/hairstyles/original');
    const hairstyle = await hairstyleService.create({
      name,
      gender,
      length,
      color,
      tags: hairstyleService.parseTags(tags),
      description,
      image_url: imageInfo.storedName,
      ar_model_url: null,
      segmented_image_url: null,
      salon_id: salon.id
    });
    hairstyleService.triggerAIJobIfNeeded(imageInfo.storedName, hairstyle.id);
    return res.status(201).json({ success: true, hairstyle: hairstyleService.mapHairstyleResponse(req, hairstyle) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to upload hairstyle', details: err.message });
  }
};

// List all hairstyles for the salon
exports.getHairstyles = async (req, res) => {
  try {
    // Debug: Log the user object to see what's available
    console.log('User object:', req.user);
    console.log('User ID:', req.user?.id);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated or missing user ID' });
    }
    
    const salon = await Salon.findOne({ where: { owner_id: req.user.id } });
    if (!salon) return res.status(404).json({ error: 'Salon not found' });
    const hairstyles = await hairstyleService.findAllBySalon(salon.id);
    return res.json({ success: true, hairstyles: hairstyles.map(h => hairstyleService.mapHairstyleResponse(req, h)) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch hairstyles', details: err.message });
  }
};

// Update a hairstyle
exports.updateHairstyle = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const salon = await Salon.findOne({ where: { owner_id: req.user.id } });
    if (!salon) return res.status(404).json({ error: 'Salon not found' });
    const hairstyle = await hairstyleService.findByIdAndSalon(id, salon.id);
    if (!hairstyle) return res.status(404).json({ error: 'Hairstyle not found' });
    const { name, gender, length, color, tags, description } = req.body;
    if (name) hairstyle.name = name;
    if (gender) hairstyle.gender = gender;
    if (length) hairstyle.length = length;
    if (color) hairstyle.color = color;
    if (tags) hairstyle.tags = hairstyleService.parseTags(tags);
    if (description) hairstyle.description = description;
    if (req.file) {
      const imageInfo = getFileInfo(req.file, '/uploads/hairstyles/original');
      hairstyle.image_url = imageInfo.storedName;
      hairstyleService.triggerAIJobIfNeeded(imageInfo.storedName, hairstyle.id);
    }
    await hairstyle.save();
    return res.json({ success: true, hairstyle: hairstyleService.mapHairstyleResponse(req, hairstyle) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update hairstyle', details: err.message });
  }
};

// Delete a hairstyle
exports.deleteHairstyle = async (req, res) => {
  try {
    const { id } = req.params;
    const salon = await Salon.findOne({ where: { owner_id: req.user.id } });
    if (!salon) return res.status(404).json({ error: 'Salon not found' });
    const deleted = await hairstyleService.deleteByIdAndSalon(id, salon.id);
    if (!deleted) return res.status(404).json({ error: 'Hairstyle not found' });
    return res.json({ success: true, message: 'Hairstyle deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete hairstyle', details: err.message });
  }
}; 