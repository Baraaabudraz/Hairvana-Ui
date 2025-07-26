const express = require('express');
const router = express.Router();
const staffController = require('../../../../controllers/Api/salon/staffController');
const { authenticateOwner } = require('../../../../middleware/authMiddleware');
const { createUploadMiddleware } = require('../../../../helpers/uploadHelper');
const { 
  createStaffValidation,
  updateStaffValidation,
  staffQueryValidation,
  staffIdValidation,
  salonIdValidation,
  deleteStaffValidation
} = require('../../../../validation/staffValidation');
const validate = require('../../../../middleware/validate');

// Configure upload middleware for staff avatars
const uploadStaffFiles = createUploadMiddleware({
  uploadDir: 'backend/public/uploads/staff',
  allowedTypes: ['image/jpeg', 'image/png'],
  maxSize: 5 * 1024 * 1024 // 5MB per image
});

// Protect all routes with salon owner authentication
router.use(authenticateOwner);

// GET /backend/api/v0/salon/staff - Get all staff for owner's salons
router.get('/', 
  staffQueryValidation, 
  validate, 
  staffController.getAllStaff
);

// GET /backend/api/v0/salon/staff/stats - Get staff statistics (must come before /:staffId)
router.get('/stats', 
  staffController.getStaffStats
);

// GET /backend/api/v0/salon/staff/salon/:salonId - Get staff for specific salon (must come before /:staffId)
router.get('/salon/:salonId', 
  salonIdValidation,
  staffQueryValidation, 
  validate, 
  staffController.getStaffBySalon
);

// GET /backend/api/v0/salon/staff/:staffId - Get staff member details by ID (must come last among GET routes)
router.get('/:staffId', 
  staffIdValidation, 
  validate, 
  staffController.getStaffById
);

// POST /backend/api/v0/salon/staff - Create new staff member
router.post('/', 
  uploadStaffFiles.single('avatar'),
  createStaffValidation, 
  validate, 
  staffController.createStaff
);

// PUT /backend/api/v0/salon/staff/:staffId - Update staff member
router.put('/:staffId', 
  uploadStaffFiles.single('avatar'),
  updateStaffValidation, 
  validate, 
  staffController.updateStaff
);

// DELETE /backend/api/v0/salon/staff/:staffId - Delete/Deactivate staff member
router.delete('/:staffId', 
  deleteStaffValidation, 
  validate, 
  staffController.deleteStaff
);

module.exports = router; 