'use strict';

const { Staff, Salon, Service } = require('../../../models');
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
 * Serialize staff data with proper URL generation
 */
const serializeStaff = (staff) => {
  return {
    id: staff.id,
    name: staff.name,
    email: staff.email,
    phone: staff.phone,
    avatar: buildUrl(staff.avatar, 'staff'),
    bio: staff.bio,
    role: staff.role,
    specializations: staff.specializations,
    experience_years: staff.experience_years,
    hourly_rate: staff.hourly_rate,
    status: staff.status,
    working_hours: staff.schedule || {},
    created_at: staff.createdAt,
    updated_at: staff.updatedAt
  };
};

/**
 * Get services for staff member
 */
const getStaffServices = async (staffServices) => {
  if (!staffServices || !Array.isArray(staffServices) || staffServices.length === 0) {
    return [];
  }

  try {
    const services = await Service.findAll({
      where: {
        id: { [Op.in]: staffServices }
      },
      attributes: ['id', 'name', 'description', 'price', 'duration', 'image_url']
    });

    return services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      image_url: buildUrl(service.image_url, 'service')
    }));
  } catch (error) {
    console.error('Error fetching staff services:', error);
    return [];
  }
};

/**
 * Get staff for a specific salon
 * @route GET /api/mobile/salons/:salon_id/staff
 */
exports.getStaffForSalon = async (req, res) => {
  try {
    const { salon_id } = req.params;
    const { 
      status = 'active',
      role,
      specialization,
      page = 1, 
      limit = 20,
      sort = 'name',
      order = 'ASC'
    } = req.query;

    // Validate salon_id format
    if (!salon_id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(salon_id)) {
      const { response, statusCode } = createErrorResponse(
        'Invalid salon ID format',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Build where clause
    const whereClause = { salon_id };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (role) {
      whereClause.role = role;
    }
    
    if (specialization) {
      whereClause.specializations = { [Op.iLike]: `%${specialization}%` };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Get staff with salon include
    const staff = await Staff.findAll({
      where: whereClause,
      include: [
        {
          model: Salon,
          as: 'salon',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: offset
    });

    // Get total count for pagination
    const totalCount = await Staff.count({ where: whereClause });

    // Serialize staff and get services
    const serializedStaff = await Promise.all(
      staff.map(async (staffMember) => {
        const staffData = serializeStaff(staffMember);
        
        // Add salon information
        if (staffMember.salon) {
          staffData.salon = {
            id: staffMember.salon.id,
            name: staffMember.salon.name,
            avatar: buildUrl(staffMember.salon.avatar, 'salon')
          };
        }

        // Get services for this staff member
        const services = await getStaffServices(staffMember.services);
        staffData.services = services;
        staffData.total_services = services.length;

        return staffData;
      })
    );

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Determine response message
    let message;
    if (totalCount === 0) {
      message = 'No staff found for this salon. There are no staff members available at the moment.';
    } else if (serializedStaff.length === 0) {
      message = 'No staff found matching your search criteria.';
    } else {
      message = `Successfully retrieved ${serializedStaff.length} staff member${serializedStaff.length === 1 ? '' : 's'}`;
    }

    const { response, statusCode } = createApiResponse(
      message,
      200,
      {
        staff: serializedStaff,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_count: totalCount,
          limit: parseInt(limit),
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage
        },
        filters: {
          salon_id,
          status,
          role,
          specialization,
          sort,
          order
        },
        summary: {
          total_staff: totalCount,
          filtered_count: serializedStaff.length,
          by_role: {
            stylist: await Staff.count({ where: { ...whereClause, role: 'stylist' } }),
            assistant: await Staff.count({ where: { ...whereClause, role: 'assistant' } }),
            manager: await Staff.count({ where: { ...whereClause, role: 'manager' } }),
            receptionist: await Staff.count({ where: { ...whereClause, role: 'receptionist' } }),
            apprentice: await Staff.count({ where: { ...whereClause, role: 'apprentice' } })
          },
          by_status: {
            active: await Staff.count({ where: { ...whereClause, status: 'active' } }),
            inactive: await Staff.count({ where: { ...whereClause, status: 'inactive' } }),
            on_leave: await Staff.count({ where: { ...whereClause, status: 'on_leave' } }),
            terminated: await Staff.count({ where: { ...whereClause, status: 'terminated' } })
          }
        }
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('getStaffForSalon error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to fetch staff for salon. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

/**
 * Get staff details by ID
 * @route GET /api/mobile/staff/:id
 */
exports.getStaffById = async (req, res) => {
  try {
    const staffId = req.params.id;

    // Validate staff ID format
    if (!staffId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(staffId)) {
      const { response, statusCode } = createErrorResponse(
        'Invalid staff ID format',
        400
      );
      return res.status(statusCode).json(response);
    }

    const staff = await Staff.findByPk(staffId, {
      include: [
        {
          model: Salon,
          as: 'salon',
          attributes: ['id', 'name', 'description', 'phone', 'email', 'avatar', 'address_id']
        }
      ]
    });

    if (!staff) {
      const { response, statusCode } = createErrorResponse(
        'Staff not found. The staff member you\'re looking for doesn\'t exist or may have been removed.',
        404
      );
      return res.status(statusCode).json(response);
    }

    const staffData = serializeStaff(staff);

    // Add salon information
    if (staff.salon) {
      staffData.salon = {
        id: staff.salon.id,
        name: staff.salon.name,
        description: staff.salon.description,
        phone: staff.salon.phone,
        email: staff.salon.email,
        avatar: buildUrl(staff.salon.avatar, 'salon')
      };
    }

    // Get services for this staff member
    const services = await getStaffServices(staff.services);
    staffData.services = services;
    staffData.total_services = services.length;

    // Add availability information
    staffData.availability = {
      is_available: staff.status === 'active',
      working_hours: staff.schedule || {},
      experience_summary: `${staff.experience_years} years of experience`,
      specializations_summary: staff.specializations ? staff.specializations.join(', ') : 'Not specified'
    };

    const { response, statusCode } = createApiResponse(
      'Staff details retrieved successfully',
      200,
      {
        staff: staffData
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('getStaffById error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to fetch staff details. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

/**
 * Search staff by name or specializations
 * @route GET /api/mobile/staff/search
 */
exports.searchStaff = async (req, res) => {
  try {
    const { 
      q, // search query
      salon_id,
      role,
      status = 'active',
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
      status: status,
      [Op.or]: [
        { name: { [Op.iLike]: `%${q}%` } },
        { specializations: { [Op.iLike]: `%${q}%` } },
        { bio: { [Op.iLike]: `%${q}%` } }
      ]
    };
    
    if (salon_id) {
      whereClause.salon_id = salon_id;
    }
    
    if (role) {
      whereClause.role = role;
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    const staff = await Staff.findAll({
      where: whereClause,
      include: [
        {
          model: Salon,
          as: 'salon',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Get total count
    const totalCount = await Staff.count({ where: whereClause });

    // Serialize staff and get services
    const serializedStaff = await Promise.all(
      staff.map(async (staffMember) => {
        const staffData = serializeStaff(staffMember);
        
        // Add salon information
        if (staffMember.salon) {
          staffData.salon = {
            id: staffMember.salon.id,
            name: staffMember.salon.name,
            avatar: buildUrl(staffMember.salon.avatar, 'salon')
          };
        }

        // Get services for this staff member
        const services = await getStaffServices(staffMember.services);
        staffData.services = services;
        staffData.total_services = services.length;

        return staffData;
      })
    );

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Determine message
    let message;
    if (totalCount === 0) {
      message = 'No staff found matching your search criteria.';
    } else {
      message = `Found ${serializedStaff.length} staff member${serializedStaff.length === 1 ? '' : 's'} matching your search`;
    }

    const { response, statusCode } = createApiResponse(
      message,
      200,
      {
        staff: serializedStaff,
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
          salon_id,
          role,
          status,
          results_count: serializedStaff.length
        }
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('searchStaff error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to search staff. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
};

/**
 * Get staff by role
 * @route GET /api/mobile/staff/role/:role
 */
exports.getStaffByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { salon_id, status = 'active', page = 1, limit = 20 } = req.query;

    // Validate role
    const validRoles = ['stylist', 'assistant', 'manager', 'receptionist', 'apprentice'];
    if (!validRoles.includes(role)) {
      const { response, statusCode } = createErrorResponse(
        'Invalid role. Valid roles are: stylist, assistant, manager, receptionist, apprentice',
        400
      );
      return res.status(statusCode).json(response);
    }

    // Build where clause
    const whereClause = { role, status };
    
    if (salon_id) {
      whereClause.salon_id = salon_id;
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    const staff = await Staff.findAll({
      where: whereClause,
      include: [
        {
          model: Salon,
          as: 'salon',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Get total count
    const totalCount = await Staff.count({ where: whereClause });

    // Serialize staff and get services
    const serializedStaff = await Promise.all(
      staff.map(async (staffMember) => {
        const staffData = serializeStaff(staffMember);
        
        // Add salon information
        if (staffMember.salon) {
          staffData.salon = {
            id: staffMember.salon.id,
            name: staffMember.salon.name,
            avatar: buildUrl(staffMember.salon.avatar, 'salon')
          };
        }

        // Get services for this staff member
        const services = await getStaffServices(staffMember.services);
        staffData.services = services;
        staffData.total_services = services.length;

        return staffData;
      })
    );

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Determine message
    let message;
    if (totalCount === 0) {
      message = `No ${role}s found.`;
    } else {
      message = `Found ${serializedStaff.length} ${role}${serializedStaff.length === 1 ? '' : 's'}`;
    }

    const { response, statusCode } = createApiResponse(
      message,
      200,
      {
        staff: serializedStaff,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_count: totalCount,
          limit: parseInt(limit),
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage
        },
        role: {
          name: role,
          total_count: totalCount
        }
      }
    );

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('getStaffByRole error:', error);
    const { response, statusCode } = createErrorResponse(
      'Failed to fetch staff by role. Please try again.',
      500,
      process.env.NODE_ENV === 'development' ? error.message : null
    );
    return res.status(statusCode).json(response);
  }
}; 