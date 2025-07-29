const express = require('express');
const router = express.Router();
const MobileReviewController = require('../../../../controllers/Api/customer/mobileReviewController');
const { authenticateCustomer } = require('../../../../middleware/passportMiddleware');
const { body, param, query } = require('express-validator');
const { validate } = require('../../../../middleware/validationMiddleware');

// Instantiate controller
const reviewController = new MobileReviewController();

// Mobile-specific validation rules
const createReviewValidation = [
  body('salon_id').isUUID().withMessage('Valid salon ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().isLength({ max: 100 }).withMessage('Title must be less than 100 characters'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters'),
  body('appointment_id').isUUID().withMessage('Valid appointment ID is required'),
  body('staff_id').optional().isUUID().withMessage('Valid staff ID is required'),
  body('is_anonymous').optional().isBoolean().withMessage('is_anonymous must be a boolean')
];

const updateReviewValidation = [
  param('review_id').isUUID().withMessage('Valid review ID is required'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().isLength({ max: 100 }).withMessage('Title must be less than 100 characters'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters')
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  query('sort').optional().isIn(['created_at', 'rating']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['ASC', 'DESC']).withMessage('Order must be ASC or DESC')
];

// Mobile API Routes for Customers

// POST /backend/api/mobile/reviews - Create a new review
router.post('/', 
  authenticateCustomer, 
  createReviewValidation, 
  validate, 
  reviewController.createReview.bind(reviewController)
);

// GET /backend/api/mobile/reviews/salon/:salon_id - Get reviews for a specific salon
router.get('/salon/:salon_id', 
  authenticateCustomer,
  queryValidation, 
  validate, 
  reviewController.getSalonReviews.bind(reviewController)
);

// GET /backend/api/mobile/reviews/salon/:salon_id/stats - Get review statistics for a salon
router.get('/salon/:salon_id/stats', 
  authenticateCustomer,
  reviewController.getSalonReviewStats.bind(reviewController)
);

// GET /backend/api/mobile/reviews/my - Get current user's reviews
router.get('/my', 
  authenticateCustomer, 
  queryValidation, 
  validate, 
  reviewController.getUserReviews.bind(reviewController)
);

// PUT /backend/api/mobile/reviews/:review_id - Update user's own review
router.put('/:review_id', 
  authenticateCustomer, 
  updateReviewValidation, 
  validate, 
  reviewController.updateReview.bind(reviewController)
);

// DELETE /backend/api/mobile/reviews/:review_id - Delete user's own review
router.delete('/:review_id', 
  authenticateCustomer, 
  param('review_id').isUUID().withMessage('Valid review ID is required'),
  validate,
  reviewController.deleteReview.bind(reviewController)
);

// POST /backend/api/mobile/reviews/:review_id/helpful - Mark a review as helpful
router.post('/:review_id/helpful', 
  authenticateCustomer,
  param('review_id').isUUID().withMessage('Valid review ID is required'),
  validate,
  reviewController.markReviewHelpful.bind(reviewController)
);

// GET /backend/api/mobile/reviews/check-eligibility/:salon_id - Check if user can review a salon
router.get('/check-eligibility/:salon_id', 
  authenticateCustomer,
  param('salon_id').isUUID().withMessage('Valid salon ID is required'),
  validate,
  async (req, res) => {
    try {
      const { salon_id } = req.params;
      const user_id = req.user.id;

      // Check if user has completed appointments with this salon
      const { Appointment, Payment } = require('../../../../models');
      
      const hasCompletedAppointment = await Appointment.findOne({
        where: {
          user_id: user_id,
          salon_id: salon_id,
          status: 'completed'
        },
        include: [{
          model: Payment,
          as: 'payment',
          where: { status: 'paid' }
        }]
      });

      // Check if user already reviewed this salon (for general reviews)
      const existingReview = await require('../../../../models').Review.findOne({
        where: {
          user_id: user_id,
          salon_id: salon_id,
          appointment_id: null // General review
        }
      });

      res.json({
        success: true,
        data: {
          can_review: !!hasCompletedAppointment,
          has_reviewed: !!existingReview,
          completed_appointments: hasCompletedAppointment ? 1 : 0
        }
      });

    } catch (error) {
      console.error('Error checking review eligibility:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
);

// GET /backend/api/mobile/reviews/check-appointment/:appointment_id - Check if user can review specific appointment
router.get('/check-appointment/:appointment_id', 
  authenticateCustomer,
  param('appointment_id').isUUID().withMessage('Valid appointment ID is required'),
  validate,
  async (req, res) => {
    try {
      const { appointment_id } = req.params;
      const user_id = req.user.id;

      const { Appointment, Payment, Review } = require('../../../../models');
      
      // Check if appointment exists and belongs to user
      const appointment = await Appointment.findOne({
        where: {
          id: appointment_id,
          user_id: user_id
        },
        include: [{
          model: Payment,
          as: 'payment',
          where: { status: 'paid' }
        }]
      });

      if (!appointment) {
        return res.json({
          success: true,
          data: {
            can_review: false,
            has_reviewed: false,
            reason: 'Appointment not found or payment not completed'
          }
        });
      }

      // Check if appointment is completed
      if (appointment.status !== 'completed') {
        return res.json({
          success: true,
          data: {
            can_review: false,
            has_reviewed: false,
            reason: 'Appointment not completed yet'
          }
        });
      }

      // Check if user already reviewed this appointment
      const existingReview = await Review.findOne({
        where: {
          user_id: user_id,
          appointment_id: appointment_id
        }
      });

      res.json({
        success: true,
        data: {
          can_review: true,
          has_reviewed: !!existingReview,
          appointment: {
            id: appointment.id,
            salon_id: appointment.salon_id,
            staff_id: appointment.staff_id,
            start_at: appointment.start_at,
            end_at: appointment.end_at,
            total_price: appointment.total_price
          }
        }
      });

    } catch (error) {
      console.error('Error checking appointment review eligibility:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
);

module.exports = router; 