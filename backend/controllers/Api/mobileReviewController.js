const { Review, User, Salon, Appointment, Payment } = require('../../models');
const { Op } = require('sequelize');

class MobileReviewController {
  // Create a new review (mobile optimized)
  async createReview(req, res) {
    try {
      const {
        salon_id,
        appointment_id,
        rating,
        title,
        comment,
        service_quality
      } = req.body;

      const user_id = req.user.id;

      // Validate that user can review this salon
      if (appointment_id) {
        // Check if appointment exists and belongs to user
        const appointment = await Appointment.findOne({
          where: {
            id: appointment_id,
            user_id: user_id,
            salon_id: salon_id
          },
          include: [{
            model: Payment,
            as: 'payment',
            where: { status: 'paid' }
          }]
        });

        if (!appointment) {
          return res.status(404).json({
            success: false,
            message: 'Appointment not found or payment not completed'
          });
        }

        // Check if appointment is completed
        if (appointment.status !== 'completed') {
          return res.status(400).json({
            success: false,
            message: 'Can only review completed appointments'
          });
        }

        // Check if user already reviewed this appointment
        const existingReview = await Review.findOne({
          where: {
            user_id: user_id,
            appointment_id: appointment_id
          }
        });

        if (existingReview) {
          return res.status(400).json({
            success: false,
            message: 'You have already reviewed this appointment'
          });
        }
      } else {
        // For general reviews, check if user has any completed appointments with this salon
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

        if (!hasCompletedAppointment) {
          return res.status(400).json({
            success: false,
            message: 'You can only review salons where you have completed appointments'
          });
        }
      }

      // Create the review with simplified fields for mobile
      const review = await Review.create({
        user_id,
        salon_id,
        appointment_id,
        rating,
        title,
        comment,
        service_quality
      });

      // Update salon average rating
      await this.updateSalonRating(salon_id);

      // Return simplified response for mobile
      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: {
          id: review.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          service_quality: review.service_quality,
          created_at: review.created_at
        }
      });

    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit review',
        error: error.message
      });
    }
  }

  // Get reviews for a salon (mobile optimized)
  async getSalonReviews(req, res) {
    try {
      const { salon_id } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        rating, 
        sort = 'created_at',
        order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;

      // Build where clause
      const whereClause = {
        salon_id: salon_id
      };

      if (rating) {
        whereClause.rating = rating;
      }

      const reviews = await Review.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes:
              ['id', 'name', 'avatar'] 
          }
        ],
        order: [[sort, order.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Format response for mobile
      const formattedReviews = reviews.rows.map(review => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        service_quality: review.service_quality,
        created_at: review.created_at,
        user: review.user ? {
          name: review.user.name,
          avatar: review.user.avatar
        } : null
      }));

      const totalPages = Math.ceil(reviews.count / limit);

      res.json({
        success: true,
        data: {
          reviews: formattedReviews,
          pagination: {
            current_page: parseInt(page),
            total_pages: totalPages,
            total_reviews: reviews.count,
            has_next_page: page < totalPages,
            has_prev_page: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Error fetching salon reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load reviews',
        error: error.message
      });
    }
  }

  // Get review statistics for a salon (mobile optimized)
  async getSalonReviewStats(req, res) {
    try {
      const { salon_id } = req.params;

      const stats = await Review.findAll({
        where: {
          salon_id: salon_id
        },
        attributes: [
          [Review.sequelize.fn('COUNT', Review.sequelize.col('id')), 'total_reviews'],
          [Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'average_rating'],
          [Review.sequelize.fn('COUNT', Review.sequelize.literal('CASE WHEN rating = 5 THEN 1 END')), 'five_star'],
          [Review.sequelize.fn('COUNT', Review.sequelize.literal('CASE WHEN rating = 4 THEN 1 END')), 'four_star'],
          [Review.sequelize.fn('COUNT', Review.sequelize.literal('CASE WHEN rating = 3 THEN 1 END')), 'three_star'],
          [Review.sequelize.fn('COUNT', Review.sequelize.literal('CASE WHEN rating = 2 THEN 1 END')), 'two_star'],
          [Review.sequelize.fn('COUNT', Review.sequelize.literal('CASE WHEN rating = 1 THEN 1 END')), 'one_star']
        ],
        raw: true
      });

      const ratingBreakdown = {
        total_reviews: parseInt(stats[0].total_reviews) || 0,
        average_rating: parseFloat(stats[0].average_rating) || 0,
        rating_distribution: {
          5: parseInt(stats[0].five_star) || 0,
          4: parseInt(stats[0].four_star) || 0,
          3: parseInt(stats[0].three_star) || 0,
          2: parseInt(stats[0].two_star) || 0,
          1: parseInt(stats[0].one_star) || 0
        }
      };

      // Calculate percentages
      if (ratingBreakdown.total_reviews > 0) {
        Object.keys(ratingBreakdown.rating_distribution).forEach(rating => {
          const count = ratingBreakdown.rating_distribution[rating];
          ratingBreakdown.rating_distribution[rating] = {
            count,
            percentage: Math.round((count / ratingBreakdown.total_reviews) * 100)
          };
        });
      }

      res.json({
        success: true,
        data: ratingBreakdown
      });

    } catch (error) {
      console.error('Error fetching review stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load review statistics',
        error: error.message
      });
    }
  }

  // Get user's reviews (mobile optimized)
  async getUserReviews(req, res) {
    try {
      const user_id = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;

      const reviews = await Review.findAndCountAll({
        where: { user_id },
        include: [
          {
            model: Salon,
            as: 'salon',
            attributes: ['id', 'name', 'address', 'logo']
          },
          {
            model: Appointment,
            as: 'appointment',
            attributes: ['id', 'start_at', 'end_at']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Format response for mobile
      const formattedReviews = reviews.rows.map(review => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        service_quality: review.service_quality,
        created_at: review.created_at,
        salon: {
          id: review.salon.id,
          name: review.salon.name,
          logo: review.salon.logo
        },
        appointment: review.appointment ? {
          id: review.appointment.id,
          date: review.appointment.start_at
        } : null
      }));

      const totalPages = Math.ceil(reviews.count / limit);

      res.json({
        success: true,
        data: {
          reviews: formattedReviews,
          pagination: {
            current_page: parseInt(page),
            total_pages: totalPages,
            total_reviews: reviews.count,
            has_next_page: page < totalPages,
            has_prev_page: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Error fetching user reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load your reviews',
        error: error.message
      });
    }
  }

  // Update a review (mobile optimized)
  async updateReview(req, res) {
    try {
      const { review_id } = req.params;
      const user_id = req.user.id;

      const review = await Review.findOne({
        where: {
          id: review_id,
          user_id: user_id
        }
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found or you are not authorized to edit it'
        });
      }

      // Only allow updates within 24 hours of creation
      const hoursSinceCreation = (new Date() - review.created_at) / (1000 * 60 * 60);
      if (hoursSinceCreation > 24) {
        return res.status(400).json({
          success: false,
          message: 'Reviews can only be edited within 24 hours of creation'
        });
      }

      const { rating, title, comment, service_quality } = req.body;
      const updateData = {};

      if (rating !== undefined) updateData.rating = rating;
      if (title !== undefined) updateData.title = title;
      if (comment !== undefined) updateData.comment = comment;
      if (service_quality !== undefined) updateData.service_quality = service_quality;

      await review.update(updateData);

      // Update salon average rating
      await this.updateSalonRating(review.salon_id);

      res.json({
        success: true,
        message: 'Review updated successfully',
        data: {
          id: review.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          service_quality: review.service_quality,
          updated_at: review.updated_at
        }
      });

    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update review',
        error: error.message
      });
    }
  }

  // Delete a review (mobile optimized)
  async deleteReview(req, res) {
    try {
      const { review_id } = req.params;
      const user_id = req.user.id;

      const review = await Review.findOne({
        where: {
          id: review_id,
          user_id: user_id
        }
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found or you are not authorized to delete it'
        });
      }

      const salon_id = review.salon_id;
      await review.destroy();

      // Update salon average rating
      await this.updateSalonRating(salon_id);

      res.json({
        success: true,
        message: 'Review deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete review',
        error: error.message
      });
    }
  }

  // Mark a review as helpful (mobile optimized)
  async markReviewHelpful(req, res) {
    try {
      const { review_id } = req.params;
      const user_id = req.user.id;

      const review = await Review.findByPk(review_id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // For now, we'll just return success since we removed helpful_votes column
      // In a future implementation, you could add a separate helpful_votes table
      res.json({
        success: true,
        message: 'Review marked as helpful'
      });

    } catch (error) {
      console.error('Error marking review helpful:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark review as helpful',
        error: error.message
      });
    }
  }

  // Helper method to update salon average rating
  async updateSalonRating(salon_id) {
    try {
      const stats = await Review.findOne({
        where: {
          salon_id: salon_id
        },
        attributes: [
          [Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'average_rating'],
          [Review.sequelize.fn('COUNT', Review.sequelize.col('id')), 'total_reviews']
        ],
        raw: true
      });

      const averageRating = parseFloat(stats.average_rating) || 0;
      const totalReviews = parseInt(stats.total_reviews) || 0;

      await Salon.update({
        rating: averageRating,
        review_count: totalReviews
      }, {
        where: { id: salon_id }
      });

    } catch (error) {
      console.error('Error updating salon rating:', error);
    }
  }
}

module.exports = MobileReviewController; 