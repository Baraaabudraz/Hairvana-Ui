const staffService = require('../../../services/staffService');
const salonRepository = require('../../../repositories/salonRepository');
const { validationResult } = require('express-validator');

/**
 * Get all staff members for salon owner's salons
 */
exports.getAllStaff = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const ownerId = req.user.id;

    // Get all salons for this owner
    const salons = await salonRepository.findAllByOwnerId(ownerId);
    if (!salons || salons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No salons found for this owner'
      });
    }

    const salonIds = salons.map(salon => salon.id);

    // Get staff for all owner's salons
    const staff = await staffService.getStaffBySalonIds(salonIds, req.query);

    const message = staff.length > 0 
      ? 'Staff members retrieved successfully'
      : 'No staff members found';

    res.json({
      success: true,
      message,
      data: {
        staff,
        count: staff.length,
        salons: salons.length
      }
    });

  } catch (error) {
    console.error('Error fetching staff:', error);
    next(error);
  }
};

/**
 * Get staff members for a specific salon (only if owner owns the salon)
 */
exports.getStaffBySalon = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const ownerId = req.user.id;
    const salonId = req.params.salonId;

    // Verify salon ownership
    const salon = await salonRepository.findByOwnerId(ownerId, salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found or not accessible'
      });
    }

    // Get staff for the specific salon
    const staff = await staffService.getStaffBySalonId(salonId, req.query);

    const message = staff.length > 0 
      ? 'Staff members retrieved successfully'
      : 'No staff members found for this salon';

    res.json({
      success: true,
      message,
      data: {
        staff,
        count: staff.length,
        salon: {
          id: salon.id,
          name: salon.name
        }
      }
    });

  } catch (error) {
    console.error('Error fetching staff by salon:', error);
    next(error);
  }
};

/**
 * Get staff member by ID (only if belongs to owner's salon)
 */
exports.getStaffById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const ownerId = req.user.id;
    const staffId = req.params.staffId;

    // Get all salons for this owner
    const salons = await salonRepository.findAllByOwnerId(ownerId);
    if (!salons || salons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No salons found for this owner'
      });
    }

    const salonIds = salons.map(salon => salon.id);

    // Get staff member if belongs to owner's salon
    const staff = await staffService.getStaffByIdForSalons(staffId, salonIds);
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found or not accessible'
      });
    }

    res.json({
      success: true,
      message: 'Staff member details retrieved successfully',
      data: staff
    });

  } catch (error) {
    console.error('Error fetching staff details:', error);
    next(error);
  }
};

/**
 * Create new staff member for specific salon
 */
exports.createStaff = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const ownerId = req.user.id;
    const { salon_id, name, email, phone, role, hourly_rate, commission_rate, specializations, bio, experience_years } = req.body;

    // Verify salon ownership
    const salon = await salonRepository.findByOwnerId(ownerId, salon_id);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found or not accessible'
      });
    }

    // Check if email is already used by another staff member
    const existingStaff = await staffService.getStaffByEmail(email);
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'A staff member with this email already exists'
      });
    }

    // Prepare staff data
    const staffData = {
      salon_id,
      name,
      email,
      phone,
      role: role || 'stylist',
      status: 'active',
      hourly_rate: hourly_rate || null,
      commission_rate: commission_rate || 0,
      specializations: specializations || [],
      bio: bio || null,
      experience_years: experience_years || 0,
      hire_date: new Date()
    };

    // Handle avatar upload if provided
    if (req.file) {
      staffData.avatar = `/images/staff/${req.file.filename}`;
    }

    // Create staff member
    const newStaff = await staffService.createStaff(staffData);

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: newStaff
    });

  } catch (error) {
    console.error('Error creating staff:', error);
    next(error);
  }
};

/**
 * Update staff member (only if belongs to owner's salon)
 */
exports.updateStaff = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const ownerId = req.user.id;
    const staffId = req.params.staffId;

    // Get all salons for this owner
    const salons = await salonRepository.findAllByOwnerId(ownerId);
    if (!salons || salons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No salons found for this owner'
      });
    }

    const salonIds = salons.map(salon => salon.id);

    // Verify staff belongs to owner's salon
    const existingStaff = await staffService.getStaffByIdForSalons(staffId, salonIds);
    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found or not accessible'
      });
    }

    // Check email uniqueness if email is being updated
    if (req.body.email && req.body.email !== existingStaff.email) {
      const emailExists = await staffService.getStaffByEmail(req.body.email);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'A staff member with this email already exists'
        });
      }
    }

    // Prepare update data (only allow certain fields)
    const allowedFields = ['name', 'email', 'phone', 'role', 'status', 'hourly_rate', 'commission_rate', 'specializations', 'bio', 'experience_years', 'schedule'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Handle avatar upload if provided
    if (req.file) {
      updateData.avatar = `/images/staff/${req.file.filename}`;
    }

    // Update staff member
    const updatedStaff = await staffService.updateStaff(staffId, updateData);

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: updatedStaff
    });

  } catch (error) {
    console.error('Error updating staff:', error);
    next(error);
  }
};

/**
 * Delete/Deactivate staff member (only if belongs to owner's salon)
 */
exports.deleteStaff = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const ownerId = req.user.id;
    const staffId = req.params.staffId;
    const { permanent = false } = req.query;

    // Get all salons for this owner
    const salons = await salonRepository.findAllByOwnerId(ownerId);
    if (!salons || salons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No salons found for this owner'
      });
    }

    const salonIds = salons.map(salon => salon.id);

    // Verify staff belongs to owner's salon
    const existingStaff = await staffService.getStaffByIdForSalons(staffId, salonIds);
    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found or not accessible'
      });
    }

    let result;
    let message;

    if (permanent === 'true') {
      // Permanent deletion (check for existing appointments first)
      const hasAppointments = await staffService.checkStaffHasAppointments(staffId);
      if (hasAppointments) {
        return res.status(400).json({
          success: false,
          message: 'Cannot permanently delete staff member with existing appointments. Consider deactivating instead.'
        });
      }
      
      result = await staffService.deleteStaff(staffId);
      message = 'Staff member deleted permanently';
    } else {
      // Soft delete (deactivate)
      result = await staffService.updateStaff(staffId, { status: 'terminated' });
      message = 'Staff member deactivated successfully';
    }

    res.json({
      success: true,
      message,
      data: result
    });

  } catch (error) {
    console.error('Error deleting staff:', error);
    next(error);
  }
};

/**
 * Get staff statistics for salon owner
 */
exports.getStaffStats = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Get all salons for this owner
    const salons = await salonRepository.findAllByOwnerId(ownerId);
    if (!salons || salons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No salons found for this owner'
      });
    }

    const salonIds = salons.map(salon => salon.id);

    // Get staff statistics
    const stats = await staffService.getStaffStatsBySalonIds(salonIds, req.query);

    res.json({
      success: true,
      message: 'Staff statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Error fetching staff statistics:', error);
    next(error);
  }
}; 