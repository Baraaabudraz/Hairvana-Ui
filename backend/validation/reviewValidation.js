const { body, param, query } = require('express-validator');

const createReviewValidation = [
  body('salon_id')
    .isUUID()
    .withMessage('Valid salon ID is required'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters'),
  
  body('service_quality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Service quality must be between 1 and 5'),
  
  body('cleanliness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Cleanliness must be between 1 and 5'),
  
  body('staff_friendliness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Staff friendliness must be between 1 and 5'),
  
  body('value_for_money')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Value for money must be between 1 and 5'),
  
  body('overall_experience')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Overall experience must be between 1 and 5'),
  
  body('review_type')
    .optional()
    .isIn(['general', 'appointment', 'staff'])
    .withMessage('Invalid review type'),
  
  body('is_anonymous')
    .optional()
    .isBoolean()
    .withMessage('is_anonymous must be a boolean'),
  
  body('appointment_id')
    .optional()
    .isUUID()
    .withMessage('Valid appointment ID is required'),
  
  body('staff_id')
    .optional()
    .isUUID()
    .withMessage('Valid staff ID is required')
];

const updateReviewValidation = [
  param('review_id')
    .isUUID()
    .withMessage('Valid review ID is required'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters'),
  
  body('service_quality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Service quality must be between 1 and 5'),
  
  body('cleanliness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Cleanliness must be between 1 and 5'),
  
  body('staff_friendliness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Staff friendliness must be between 1 and 5'),
  
  body('value_for_money')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Value for money must be between 1 and 5'),
  
  body('overall_experience')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Overall experience must be between 1 and 5')
];

const moderateReviewValidation = [
  param('review_id')
    .isUUID()
    .withMessage('Valid review ID is required'),
  
  body('status')
    .isIn(['pending', 'approved', 'rejected', 'hidden'])
    .withMessage('Invalid status'),
  
  body('moderation_notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Moderation notes must be less than 500 characters')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  query('sort')
    .optional()
    .isIn(['created_at', 'rating', 'helpful_votes'])
    .withMessage('Invalid sort field'),
  
  query('order')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Order must be ASC or DESC'),
  
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'hidden'])
    .withMessage('Invalid status')
];

module.exports = {
  createReviewValidation,
  updateReviewValidation,
  moderateReviewValidation,
  queryValidation
}; 