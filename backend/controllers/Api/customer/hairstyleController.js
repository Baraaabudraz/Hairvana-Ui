'use strict';

const { Hairstyle } = require('../../../models');
const { Op } = require('sequelize');
const { buildUrl } = require('../../../helpers/urlHelper');

/**
 * Standard API Response Helper
 */
const createApiResponse = (success, message, data = null, statusCode = 200) => {
  const response = {
    success,
    message,
    ...(data && { data })
  };
  return { response, statusCode };
};

/**
 * Error Response Helper
 */
const createErrorResponse = (message, statusCode = 500, details = null) => {
  const response = {
    success: false,
    message,
    ...(details && { details })
  };
  return { response, statusCode };
};

/**
 * Serialize hairstyle data with proper URL generation
 */
const serializeHairstyle = (hairstyle) => {
  return {
    id: hairstyle.id,
    name: hairstyle.name,
    description: hairstyle.description,
    gender: hairstyle.gender,
    length: hairstyle.length,
    color: hairstyle.color,
    style_type: hairstyle.style_type,
    difficulty_level: hairstyle.difficulty_level,
    estimated_duration: hairstyle.estimated_duration,
    image_url: buildUrl(hairstyle.image_url, 'hairstyle'),
    segmented_image_url: buildUrl(hairstyle.segmented_image_url, 'hairstyle'),
    tags: hairstyle.tags,
    created_at: hairstyle.createdAt,
    updated_at: hairstyle.updatedAt
  };
};

/**
 * Get all hairstyles with filtering and pagination
 * @route GET /api/mobile/hairstyles
 */
exports.getHairstyles = async (req, res) => {
  try {
    const { 
      gender, 
      length, 
      color, 
      name,
      style_type,
      difficulty_level,
      page = 1, 
      limit = 20,
      sort = 'name',
      order = 'ASC'
    } = req.query;

    // Build where clause
    const whereClause = {};
    
    if (gender) {
      whereClause.gender = gender;
    }
    
    if (length) {
      whereClause.length = length;
    }
    
    if (color) {
      whereClause.color = color;
    }
    
    if (style_type) {
      whereClause.style_type = style_type;
    }
    
    if (difficulty_level) {
      whereClause.difficulty_level = difficulty_level;
    }
    
    if (name) {
      whereClause.name = { [Op.iLike]: `%${name}%` };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Get hairstyles with pagination
    const hairstyles = await Hairstyle.findAll({
      where: whereClause,
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: offset
    });

    // Get total count for pagination
    const totalCount = await Hairstyle.count({ where: whereClause });

    // Serialize hairstyles
    const serializedHairstyles = hairstyles.map(serializeHairstyle);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Determine response message
    let message;
    if (totalCount === 0) {
      message = 'No hairstyles found. There are no hairstyles available at the moment.';
    } else if (serializedHairstyles.length === 0) {
      message = 'No hairstyles found matching your search criteria.';
    } else {
      message = `Successfully retrieved ${serializedHairstyles.length} hairstyle${serializedHairstyles.length === 1 ? '' : 's'}`;
    }

    const { response, statusCode } = createApiResponse(
      true,
      message,
      {
        hairstyles: serializedHairstyles,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_count: totalCount,
          limit: parseInt(limit),
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage
        },
        filters: {
          gender,
          length,
          color,
          name,
          style_type,
          difficulty_level,
          sort,
          order
        },
        summary: {
          total_hairstyles: totalCount,
          filtered_count: serializedHairstyles.length,
          by_gender: {
            male: await Hairstyle.count({ where: { gender: 'male' } }),
            female: await Hairstyle.count({ where: { gender: 'female' } }),
            unisex: await Hairstyle.count({ where: { gender: 'unisex' } })
          },
          by_length: {
            short: await Hairstyle.count({ where: { length: 'short' } }),
            medium: await Hairstyle.count({ where: { length: 'medium' } }),
            long: await Hairstyle.count({ where: { length: 'long' } })
          }
        }
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('getHairstyles error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to fetch hairstyles. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

/**
 * Get hairstyle by ID with detailed information
 * @route GET /api/mobile/hairstyles/:id
 */
exports.getHairstyleById = async (req, res) => {
  try {
    const hairstyleId = req.params.id;

    // Validate hairstyle ID format
    if (!hairstyleId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hairstyleId)) {
      const { response, statusCode } = createErrorResponse(
        'Invalid hairstyle ID format',
        400
      );
      return res.status(statusCode).json(response);
    }

    const hairstyle = await Hairstyle.findByPk(hairstyleId);

    if (!hairstyle) {
      const { response, statusCode } = createErrorResponse(
        'Hairstyle not found. The hairstyle you\'re looking for doesn\'t exist or may have been removed.',
        404
      );
      return res.status(statusCode).json(response);
    }

    const hairstyleData = serializeHairstyle(hairstyle);

    // Add related hairstyles (same gender or length)
    const relatedHairstyles = await Hairstyle.findAll({
      where: {
        id: { [Op.ne]: hairstyleId },
        [Op.or]: [
          { gender: hairstyle.gender },
          { length: hairstyle.length },
          { color: hairstyle.color }
        ]
      },
      limit: 6,
      order: [['name', 'ASC']]
    });

    const relatedData = relatedHairstyles.map(serializeHairstyle);

    const { response, statusCode } = createApiResponse(
      true,
      'Hairstyle details retrieved successfully',
      {
        hairstyle: hairstyleData,
        related_hairstyles: relatedData,
        related_count: relatedData.length
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('getHairstyleById error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to fetch hairstyle details. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

/**
 * Search hairstyles by name or description
 * @route GET /api/mobile/hairstyles/search
 */
exports.searchHairstyles = async (req, res) => {
  try {
    const { 
      q, // search query
      gender,
      length,
      color,
      page = 1, 
      limit = 20 
    } = req.query;

    if (!q) {
      const { response, statusCode } = createErrorResponse(
        'Search query is required',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Build where clause
    const whereClause = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { tags: { [Op.iLike]: `%${q}%` } }
      ]
    };
    
    if (gender) {
      whereClause.gender = gender;
    }
    
    if (length) {
      whereClause.length = length;
    }
    
    if (color) {
      whereClause.color = color;
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    const hairstyles = await Hairstyle.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Get total count
    const totalCount = await Hairstyle.count({ where: whereClause });

    // Serialize hairstyles
    const serializedHairstyles = hairstyles.map(serializeHairstyle);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Determine message
    let message;
    if (totalCount === 0) {
      message = 'No hairstyles found matching your search criteria.';
    } else {
      message = `Found ${serializedHairstyles.length} hairstyle${serializedHairstyles.length === 1 ? '' : 's'} matching your search`;
    }

    const { response, statusCode } = createApiResponse(
      true,
      message,
      {
        hairstyles: serializedHairstyles,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_count: totalCount,
          limit: parseInt(limit),
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage
        },
        search: {
          query: q,
          gender,
          length,
          color,
          results_count: serializedHairstyles.length
        }
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('searchHairstyles error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to search hairstyles. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

/**
 * Get hairstyles by category (gender, length, color, etc.)
 * @route GET /api/mobile/hairstyles/category/:category
 */
exports.getHairstylesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { value, page = 1, limit = 20 } = req.query;

    if (!value) {
      const { response, statusCode } = createErrorResponse(
        'Category value is required',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Validate category
    const validCategories = ['gender', 'length', 'color', 'style_type', 'difficulty_level'];
    if (!validCategories.includes(category)) {
      const { response, statusCode } = createErrorResponse(
        'Invalid category. Valid categories are: gender, length, color, style_type, difficulty_level',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Build where clause
    const whereClause = { [category]: value };

    // Calculate pagination
    const offset = (page - 1) * limit;

    const hairstyles = await Hairstyle.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Get total count
    const totalCount = await Hairstyle.count({ where: whereClause });

    // Serialize hairstyles
    const serializedHairstyles = hairstyles.map(serializeHairstyle);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Determine message
    let message;
    if (totalCount === 0) {
      message = `No hairstyles found for ${category}: ${value}`;
    } else {
      message = `Found ${serializedHairstyles.length} hairstyle${serializedHairstyles.length === 1 ? '' : 's'} for ${category}: ${value}`;
    }

    const { response, statusCode } = createApiResponse(
      true,
      message,
      {
        hairstyles: serializedHairstyles,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_count: totalCount,
          limit: parseInt(limit),
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage
        },
        category: {
          name: category,
          value: value,
          total_count: totalCount
        }
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('getHairstylesByCategory error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to fetch hairstyles by category. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

/**
 * Get hairstyle categories and their counts
 * @route GET /api/mobile/hairstyles/categories
 */
exports.getHairstyleCategories = async (req, res) => {
  try {
    // Get counts for each category
    const genderCounts = await Hairstyle.findAll({
      attributes: [
        'gender',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['gender']
    });

    const lengthCounts = await Hairstyle.findAll({
      attributes: [
        'length',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['length']
    });

    const colorCounts = await Hairstyle.findAll({
      attributes: [
        'color',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['color']
    });

    const styleTypeCounts = await Hairstyle.findAll({
      attributes: [
        'style_type',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['style_type']
    });

    const difficultyCounts = await Hairstyle.findAll({
      attributes: [
        'difficulty_level',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['difficulty_level']
    });

    // Format the data
    const categories = {
      gender: genderCounts.map(item => ({
        value: item.gender,
        count: parseInt(item.dataValues.count)
      })),
      length: lengthCounts.map(item => ({
        value: item.length,
        count: parseInt(item.dataValues.count)
      })),
      color: colorCounts.map(item => ({
        value: item.color,
        count: parseInt(item.dataValues.count)
      })),
      style_type: styleTypeCounts.map(item => ({
        value: item.style_type,
        count: parseInt(item.dataValues.count)
      })),
      difficulty_level: difficultyCounts.map(item => ({
        value: item.difficulty_level,
        count: parseInt(item.dataValues.count)
      }))
    };

    const totalHairstyles = await Hairstyle.count();

    const { response, statusCode } = createApiResponse(
      true,
      'Hairstyle categories retrieved successfully',
      {
        categories,
        summary: {
          total_hairstyles: totalHairstyles,
          total_categories: Object.keys(categories).length
        }
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('getHairstyleCategories error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to fetch hairstyle categories. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
}; 