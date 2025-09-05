'use strict';

const customerHairstyleTryOnService = require('../../../services/customerHairstyleTryOnService');
const { buildUrl } = require('../../../helpers/urlHelper');

/**
 * Get available hairstyles from YouCam for customer try-on
 * @route GET /api/v0/customer/hairstyle-tryon/available
 */
exports.getAvailableHairstyles = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      gender: req.query.gender,
      length: req.query.length,
      style: req.query.style,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = await customerHairstyleTryOnService.getAvailableHairstyles(filters);

    // Handle both direct data and structured response
    if (result.success !== undefined) {
      // Service returned structured response
      return res.json({
        success: result.success,
        message: result.message || 'Hairstyles retrieved successfully',
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit
      });
    } else {
      // Service returned direct data (YouCam API response)
      return res.json({
        success: true,
        message: 'Hairstyles retrieved successfully from YouCam',
        data: result
      });
    }
  } catch (error) {
    console.error('Error getting available hairstyles:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get available hairstyles from YouCam API'
    });
  }
};

/**
 * Get hairstyle categories from YouCam
 * @route GET /api/v0/customer/hairstyle-tryon/categories
 */
exports.getHairstyleCategories = async (req, res) => {
  try {
    const result = await customerHairstyleTryOnService.getHairstyleCategories();

    // Handle both direct data and structured response
    if (result.success !== undefined) {
      // Service returned structured response
      return res.json({
        success: result.success,
        message: result.message || 'Hairstyle categories retrieved successfully',
        data: result.data
      });
    } else {
      // Service returned direct data (YouCam API response)
      return res.json({
        success: true,
        message: 'Hairstyle categories retrieved successfully from YouCam',
        data: result
      });
    }
  } catch (error) {
    console.error('Error getting hairstyle categories:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get hairstyle categories from YouCam API'
    });
  }
};

/**
 * Try on a hairstyle with customer's photo
 * @route POST /api/v0/customer/hairstyle-tryon/try-on
 */
exports.tryOnHairstyle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Customer photo is required'
      });
    }

    const { hairstyleId, groupId } = req.body;
    const options = req.body.options ? JSON.parse(req.body.options) : {};

    if (!hairstyleId) {
      return res.status(400).json({
        success: false,
        message: 'Hairstyle ID is required'
      });
    }

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'Group ID is required'
      });
    }

    const customerImagePath = req.file.path;
    const result = await customerHairstyleTryOnService.tryOnHairstyle(
      customerImagePath,
      hairstyleId,
      groupId,
      options
    );

    return res.json({
      success: true,
      message: 'Hairstyle try-on completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error trying on hairstyle:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to try on hairstyle'
    });
  }
};

/**
 * Get hairstyle groups from YouCam
 * @route GET /api/v0/customer/hairstyle-tryon/groups
 */
exports.getHairstyleGroups = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.page_size) || 20;
    const startingToken = req.query.starting_token || null;

    const result = await customerHairstyleTryOnService.getHairstyleGroups(pageSize, startingToken);

    // Handle both direct data and structured response
    if (result.success !== undefined) {
      // Service returned structured response
      return res.json({
        success: result.success,
        message: result.message || 'Hairstyle groups retrieved successfully',
        data: result.data
      });
    } else {
      // Service returned direct data (YouCam API response)
      return res.json({
        success: true,
        message: 'Hairstyle groups retrieved successfully from YouCam',
        data: result
      });
    }
  } catch (error) {
    console.error('Error getting hairstyle groups:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get hairstyle groups from YouCam API'
    });
  }
};

/**
 * Get hairstyles inside a specific YouCam group
 * @route GET /api/v0/customer/hairstyle-tryon/groups/:groupId/hairstyles
 */
exports.getHairstylesByGroupId = async (req, res) => {
  try {
    const { groupId } = req.params;
    const page_size = req.query.page_size;
    const starting_token = req.query.starting_token;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'Group ID is required'
      });
    }

    const result = await customerHairstyleTryOnService.getHairstylesByGroupId(groupId, {
      page_size,
      starting_token
    });

    if (result.success !== undefined) {
      return res.json({
        success: result.success,
        message: result.message || 'Hairstyles retrieved successfully',
        data: result.data
      });
    }

    return res.json({
      success: true,
      message: 'Hairstyles retrieved successfully from YouCam',
      data: result
    });
  } catch (error) {
    console.error('Error getting hairstyles by group:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get hairstyles by group from YouCam API'
    });
  }
};

/**
 * Generate multiple hairstyle variations for customer
 * @route POST /api/v0/customer/hairstyle-tryon/generate-variations
 */
exports.generateHairstyleVariations = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Customer photo is required'
      });
    }

    const options = req.body.options ? JSON.parse(req.body.options) : {};
    const customerImagePath = req.file.path;

    const result = await customerHairstyleTryOnService.generateHairstyleVariations(
      customerImagePath,
      options
    );

    return res.json({
      success: true,
      message: 'Hairstyle variations generated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error generating hairstyle variations:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate hairstyle variations'
    });
  }
};