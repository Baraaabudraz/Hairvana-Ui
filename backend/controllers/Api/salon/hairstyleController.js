const { Salon } = require('../../../models');
const { getFileInfo } = require('../../../helpers/uploadHelper');
const hairstyleService = require('../../../services/hairstyleService');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Helper function to delete image files
const deleteImageFile = (filename) => {
  if (!filename) return;

  const imagePath = path.join(__dirname, '../../../public/uploads/hairstyles', filename);

  try {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log(`Deleted image file: ${filename}`);
    }
  } catch (error) {
    console.error(`Failed to delete image file ${filename}:`, error);
  }
};

// Upload a new hairstyle
exports.uploadHairstyle = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const salonId = req.body.salon_id || req.params.salonId;

    if (!salonId) {
      return res.status(400).json({ error: 'Salon ID is required' });
    }

    // Verify that the authenticated user owns this salon
    const salon = await Salon.findOne({
      where: {
        id: salonId,
        owner_id: req.user.id
      }
    });

    if (!salon) {
      return res.status(404).json({ error: 'Salon not found or access denied' });
    }

    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const { name, gender, length, color, tags, description } = req.body;
    const imageInfo = getFileInfo(req.file, '/uploads/hairstyles');

    const hairstyle = await hairstyleService.create({
      name,
      gender,
      length,
      color,
      tags: hairstyleService.parseTags(tags),
      description,
      image_url: imageInfo.storedName,
      salon_id: salonId
    });

    return res.status(201).json({
      success: true,
      message: 'Hairstyle created successfully.',
      hairstyle: hairstyleService.mapHairstyleResponse(req, hairstyle)
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to upload hairstyle', details: err.message });
  }
};

// List all hairstyles for a specific salon
exports.getHairstyles = async (req, res) => {
  try {
    const salonId = req.params.salonId;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated or missing user ID' });
    }

    // Get the requested salon
    const requestedSalon = await Salon.findByPk(salonId);
    if (!requestedSalon) {
      return res.status(404).json({ error: 'Salon not found' });
    }

    // Verify that the authenticated user owns this salon
    if (requestedSalon.owner_id !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied. You can only view hairstyles for your own salon.',
        debug: {
          requestedSalonId: salonId,
          requestedSalonOwnerId: requestedSalon.owner_id,
          userId: req.user.id
        }
      });
    }

    const hairstyles = await hairstyleService.findAllBySalon(salonId);
    return res.json({
      success: true,
      message: `Found ${hairstyles.length} hairstyle(s) for this salon`,
      hairstyles: hairstyleService.mapHairstylesResponse(req, hairstyles)
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch hairstyles', details: err.message });
  }
};

// Update a hairstyle for a specific salon
exports.updateHairstyle = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const { id, salonId } = req.params;

    // Verify that the authenticated user owns this salon
    const salon = await Salon.findOne({
      where: {
        id: salonId,
        owner_id: req.user.id
      }
    });

    if (!salon) {
      return res.status(404).json({ error: 'Salon not found or access denied' });
    }

    // Find the hairstyle within this specific salon
    const hairstyle = await hairstyleService.findByIdAndSalon(id, salonId);
    if (!hairstyle) {
      return res.status(404).json({ error: 'Hairstyle not found in this salon' });
    }

    const { name, gender, length, color, tags, description } = req.body;
    if (name) hairstyle.name = name;
    if (gender) hairstyle.gender = gender;
    if (length) hairstyle.length = length;
    if (color) hairstyle.color = color;
    if (tags) hairstyle.tags = hairstyleService.parseTags(tags);
    if (description) hairstyle.description = description;

    if (req.file) {
      // Store old image filename for cleanup
      const oldImageFile = hairstyle.image_url;

      const imageInfo = getFileInfo(req.file, '/uploads/hairstyles/original');
      hairstyle.image_url = imageInfo.storedName;

      // Clean up old image file
      if (oldImageFile && oldImageFile !== imageInfo.storedName) {
        deleteImageFile(oldImageFile);
      }

      // Trigger AI processing for the new image
      hairstyleService.triggerAIJobIfNeeded(imageInfo.storedName, hairstyle.id);
    }

    await hairstyle.save();
    return res.json({
      success: true,
      message: 'Hairstyle updated successfully. AI processing has been initiated for the new image.',
      hairstyle: hairstyleService.mapHairstyleResponse(req, hairstyle)
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update hairstyle', details: err.message });
  }
};

// Delete a hairstyle for a specific salon
exports.deleteHairstyle = async (req, res) => {
  try {
    const { id, salonId } = req.params;

    // Verify that the authenticated user owns this salon
    const salon = await Salon.findOne({
      where: {
        id: salonId,
        owner_id: req.user.id
      }
    });

    if (!salon) {
      return res.status(404).json({ error: 'Salon not found or access denied' });
    }

    // Find the hairstyle first to get image filenames
    const hairstyle = await hairstyleService.findByIdAndSalon(id, salonId);
    if (!hairstyle) {
      return res.status(404).json({ error: 'Hairstyle not found in this salon' });
    }

    // Store image filenames before deletion
    const imageFiles = [
      hairstyle.image_url,
      hairstyle.segmented_image_url,
      hairstyle.ar_model_url
    ].filter(Boolean); // Remove null/undefined values

    // Delete the hairstyle from this specific salon
    const deleted = await hairstyleService.deleteByIdAndSalon(id, salonId);
    if (!deleted) {
      return res.status(404).json({ error: 'Hairstyle not found in this salon' });
    }

    // Clean up image files
    imageFiles.forEach(filename => {
      deleteImageFile(filename);
    });

    return res.json({
      success: true,
      message: 'Hairstyle deleted successfully',
      deletedFiles: imageFiles
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete hairstyle', details: err.message });
  }
};

