'use strict';

const { Salon, Service, Review, Address, Staff } = require('../../../models');
const { Sequelize, Op } = require('sequelize');
const { buildSalonImageUrl } = require('../../../helpers/urlHelper');

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
 * Calculate average rating for a salon
 */
const calculateSalonRating = async (salonId) => {
  try {
    const ratingResult = await Review.findOne({
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalReviews']
      ],
      where: { salon_id: salonId }
    });

    const avgRating = ratingResult && ratingResult.dataValues.avgRating 
      ? parseFloat(ratingResult.dataValues.avgRating).toFixed(1) 
      : '0.0';
    
    const totalReviews = ratingResult && ratingResult.dataValues.totalReviews 
      ? parseInt(ratingResult.dataValues.totalReviews) 
      : 0;

    return {
      rating: parseFloat(avgRating),
      total_reviews: totalReviews,
      rating_display: `${avgRating}/5.0`
    };
  } catch (error) {
    console.error('Error calculating salon rating:', error);
    return {
      rating: 0.0,
      total_reviews: 0,
      rating_display: '0.0/5.0'
    };
  }
};

/**
 * Serialize salon data with proper URL generation
 */
const serializeSalon = (salon, ratingData = null) => {
  const salonData = {
    id: salon.id,
    name: salon.name,
    description: salon.description,
    phone: salon.phone,
    email: salon.email,
    website: salon.website,
    hours: salon.hours,
    avatar: buildSalonImageUrl(salon.avatar),
    status: salon.status,
    created_at: salon.createdAt,
    updated_at: salon.updatedAt
  };

  // Add address if available
  if (salon.address) {
    salonData.address = {
      id: salon.address.id,
      street_address: salon.address.street_address,
      city: salon.address.city,
      state: salon.address.state,
      zip_code: salon.address.zip_code,
      country: salon.address.country,
      full_address: `${salon.address.street_address}, ${salon.address.city}, ${salon.address.state} ${salon.address.zip_code}`
    };
  }

  // Add services if available
  if (salon.services && salon.services.length > 0) {
    salonData.services = salon.services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      image_url: buildSalonImageUrl(service.image_url, 'service')
    }));
    salonData.total_services = salon.services.length;
  }

  // Add rating data if provided
  if (ratingData) {
    salonData.rating = ratingData;
  }

  return salonData;
};

/**
 * Get all salons with filtering and pagination
 * @route GET /api/mobile/salons
 */
exports.getSalons = async (req, res) => {
  try {
    const { 
      location, 
      name, 
      rating, 
      status = 'active',
      page = 1, 
      limit = 20,
      sort = 'name',
      order = 'ASC'
    } = req.query;

    // Build where clause
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (name) {
      whereClause.name = { [Op.iLike]: `%${name}%` };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Get salons with includes
    const salons = await Salon.findAll({
      where: whereClause,
      include: [
        { 
          model: Service, 
          as: 'services',
          attributes: ['id', 'name', 'description', 'price', 'duration', 'image_url']
        },
        { 
          model: Address, 
          as: 'address',
          attributes: ['id', 'street_address', 'city', 'state', 'zip_code', 'country']
        }
      ],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: offset
    });

    // Get total count for pagination
    const totalCount = await Salon.count({ where: whereClause });

    // Calculate ratings for each salon
    const salonsWithRating = await Promise.all(
      salons.map(async (salon) => {
        const ratingData = await calculateSalonRating(salon.id);
        return serializeSalon(salon, ratingData);
      })
    );

    // Filter by rating if specified
    let filteredSalons = salonsWithRating;
    if (rating) {
      const minRating = parseFloat(rating);
      filteredSalons = salonsWithRating.filter(salon => salon.rating.rating >= minRating);
    }

    // Filter by location if specified
    if (location) {
      filteredSalons = filteredSalons.filter(salon => 
        salon.address && 
        (salon.address.city.toLowerCase().includes(location.toLowerCase()) ||
         salon.address.state.toLowerCase().includes(location.toLowerCase()))
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Determine response message
    let message;
    if (totalCount === 0) {
      message = 'No salons found. There are no salons available at the moment.';
    } else if (filteredSalons.length === 0) {
      message = 'No salons found matching your search criteria.';
    } else {
      message = `Successfully retrieved ${filteredSalons.length} salon${filteredSalons.length === 1 ? '' : 's'}`;
    }

    const { response, statusCode } = createApiResponse(
      true,
      message,
      {
        salons: filteredSalons,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_count: totalCount,
          limit: parseInt(limit),
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage
        },
        filters: {
          location,
          name,
          rating,
          status,
          sort,
          order
        },
        summary: {
          total_salons: totalCount,
          filtered_count: filteredSalons.length,
          average_rating: filteredSalons.length > 0 
            ? (filteredSalons.reduce((sum, salon) => sum + salon.rating.rating, 0) / filteredSalons.length).toFixed(1)
            : 0
        }
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('getSalons error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to fetch salons. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

/**
 * Get salon by ID with detailed information
 * @route GET /api/mobile/salons/:id
 */
exports.getSalonById = async (req, res) => {
  try {
    const salonId = req.params.id;

    // Validate salon ID format
    if (!salonId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(salonId)) {
      const { response, statusCode } = createErrorResponse(
        'Invalid salon ID format',
        400
      );
      return res.status(statusCode).json(response);
    }

    const salon = await Salon.findByPk(salonId, {
      include: [
        { 
          model: Service, 
          as: 'services',
          attributes: ['id', 'name', 'description', 'price', 'duration', 'image_url']
        },
        { 
          model: Address, 
          as: 'address',
          attributes: ['id', 'street_address', 'city', 'state', 'zip_code', 'country']
        },
        {
          model: Staff,
          as: 'staff',
          attributes: ['id', 'name', 'avatar', 'specializations', 'experience_years', 'bio', 'role', 'status', 'hourly_rate'],
          where: { status: 'active' }
        }
      ]
    });

    if (!salon) {
      const { response, statusCode } = createErrorResponse(
        'Salon not found. The salon you\'re looking for doesn\'t exist or may have been removed.',
        404
      );
      return res.status(statusCode).json(response);
    }

    // Calculate rating
    const ratingData = await calculateSalonRating(salon.id);

    // Get recent reviews
    const recentReviews = await Review.findAll({
      where: { salon_id: salon.id },
      attributes: ['id', 'rating', 'comment', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    const salonData = serializeSalon(salon, ratingData);

    // Add staff information
    if (salon.staff && salon.staff.length > 0) {
      salonData.staff = salon.staff.map(staff => ({
        id: staff.id,
        name: staff.name,
        avatar: buildSalonImageUrl(staff.avatar, 'staff'),
        specializations: staff.specializations,
        experience_years: staff.experience_years,
        bio: staff.bio,
        role: staff.role,
        hourly_rate: staff.hourly_rate
      }));
      salonData.total_staff = salon.staff.length;
    }

    // Add recent reviews
    if (recentReviews.length > 0) {
      salonData.recent_reviews = recentReviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at
      }));
    }

    const { response, statusCode } = createApiResponse(
      true,
      'Salon details retrieved successfully',
      {
        salon: salonData
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('getSalonById error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to fetch salon details. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

/**
 * Search salons by location
 * @route GET /api/mobile/salons/search
 */
exports.searchSalons = async (req, res) => {
  try {
    const { 
      q, // search query
      location,
      page = 1, 
      limit = 20 
    } = req.query;

    if (!q && !location) {
      const { response, statusCode } = createErrorResponse(
        'Search query or location is required',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Build where clause
    const whereClause = { status: 'active' };
    
    if (q) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } }
      ];
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    const salons = await Salon.findAll({
      where: whereClause,
      include: [
        { 
          model: Service, 
          as: 'services',
          attributes: ['id', 'name', 'description', 'price', 'duration']
        },
        { 
          model: Address, 
          as: 'address',
          attributes: ['id', 'street_address', 'city', 'state', 'zip_code', 'country']
        }
      ],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Get total count
    const totalCount = await Salon.count({ where: whereClause });

    // Calculate ratings and filter by location
    const salonsWithRating = await Promise.all(
      salons.map(async (salon) => {
        const ratingData = await calculateSalonRating(salon.id);
        const salonData = serializeSalon(salon, ratingData);
        
        // Filter by location if specified
        if (location && salonData.address) {
          const locationMatch = 
            salonData.address.city.toLowerCase().includes(location.toLowerCase()) ||
            salonData.address.state.toLowerCase().includes(location.toLowerCase());
          
          return locationMatch ? salonData : null;
        }
        
        return salonData;
      })
    );

    // Remove null values (filtered out by location)
    const filteredSalons = salonsWithRating.filter(salon => salon !== null);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Determine message
    let message;
    if (totalCount === 0) {
      message = 'No salons found matching your search criteria.';
    } else if (filteredSalons.length === 0) {
      message = 'No salons found in the specified location.';
    } else {
      message = `Found ${filteredSalons.length} salon${filteredSalons.length === 1 ? '' : 's'} matching your search`;
    }

    const { response, statusCode } = createApiResponse(
      true,
      message,
      {
        salons: filteredSalons,
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
          location,
          results_count: filteredSalons.length
        }
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('searchSalons error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to search salons. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
}; 