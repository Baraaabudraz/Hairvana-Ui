"use strict";
const db = require("../models");

// Feature definitions mapped to subscription plans
const FEATURE_MATRIX = {
  // Basic Plan Features
  'basic_booking': ['basic', 'standard', 'premium'],
  'basic_customer_management': ['basic', 'standard', 'premium'],
  'email_support': ['basic', 'standard', 'premium'],
  'basic_reporting': ['basic', 'standard', 'premium'],
  'online_booking_widget': ['basic', 'standard', 'premium'],
  
  // Standard Plan Features (includes all Basic features)
  'advanced_booking': ['standard', 'premium'],
  'advanced_customer_management': ['standard', 'premium'],
  'sms_notifications': ['standard', 'premium'],
  'inventory_management': ['standard', 'premium'],
  'advanced_reporting': ['standard', 'premium'],
  'chat_support': ['standard', 'premium'],
  'online_scheduling': ['standard', 'premium'],
  'staff_management': ['standard', 'premium'],
  
  // Premium Plan Features (includes all features)
  'unlimited_bookings': ['premium'],
  'multi_location': ['premium'],
  'advanced_analytics': ['premium'],
  'custom_branding': ['premium'],
  'marketing_tools': ['premium'],
  'api_access': ['premium'],
  'priority_support': ['premium'],
  'financial_reporting': ['premium'],
  'inventory_tracking': ['premium']
};

// Usage limits by plan
const USAGE_LIMITS = {
  'basic': {
    max_salons: 1,
    max_bookings: 100,
    max_staff: 3
  },
  'standard': {
    max_salons: 3,
    max_bookings: 500,
    max_staff: 10
  },
  'premium': {
    max_salons: 'unlimited',
    max_bookings: 'unlimited',
    max_staff: 'unlimited'
  }
};

/**
 * Check if user's subscription allows access to a specific feature
 * @param {string} feature - Feature name to check
 * @returns {Function} Express middleware
 */
function checkSubscriptionFeature(feature) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          error: "Unauthorized: No user",
          code: 'AUTHENTICATION_REQUIRED'
        });
      }

      // Get user's subscription
      const subscription = await getUserActiveSubscription(user.id);
      
      if (!subscription) {
        return res.status(403).json({
          error: "No active subscription found",
          code: 'NO_ACTIVE_SUBSCRIPTION',
          upgradeRequired: true
        });
      }

      // Check if subscription is active
      if (subscription.status !== 'active') {
        return res.status(403).json({
          error: "Subscription is not active",
          code: 'SUBSCRIPTION_INACTIVE',
          subscriptionStatus: subscription.status,
          upgradeRequired: true
        });
      }

      // Get plan name (normalize to lowercase)
      const planName = subscription.plan?.name?.toLowerCase() || 'basic';
      
      // Check if feature is allowed for this plan
      const allowedPlans = FEATURE_MATRIX[feature];
      if (!allowedPlans || !allowedPlans.includes(planName)) {
        return res.status(403).json({
          error: `Feature '${feature}' not available in your current plan`,
          code: 'FEATURE_NOT_AVAILABLE',
          currentPlan: planName,
          requiredPlans: allowedPlans,
          upgradeRequired: true
        });
      }

      // Attach subscription info to request for use in controllers
      req.subscription = subscription;
      req.planName = planName;
      
      next();
    } catch (err) {
      console.error("Subscription feature check error:", err);
      res.status(500).json({ 
        error: "Internal server error",
        code: 'INTERNAL_ERROR'
      });
    }
  };
}

/**
 * Check if user has reached usage limits for a specific resource
 * @param {string} resourceType - Type of resource (bookings, staff, locations)
 * @returns {Function} Express middleware
 */
function checkUsageLimit(resourceType) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          error: "Unauthorized: No user",
          code: 'AUTHENTICATION_REQUIRED'
        });
      }

      // Get user's subscription
      const subscription = await getUserActiveSubscription(user.id);
      
      if (!subscription) {
        return res.status(403).json({
          error: "No active subscription found",
          code: 'NO_ACTIVE_SUBSCRIPTION'
        });
      }

      const planName = subscription.plan?.name?.toLowerCase() || 'basic';
      const limits = USAGE_LIMITS[planName];

      // Map resource types to max_* field names
      const limitFieldMap = {
        'salons': 'max_salons',
        'bookings': 'max_bookings',
        'staff': 'max_staff'
      };

      const limitField = limitFieldMap[resourceType];
      if (!limits || !limitField || !limits[limitField]) {
        return res.status(500).json({
          error: "Invalid resource type or plan configuration",
          code: 'INVALID_CONFIGURATION'
        });
      }

      const limit = limits[limitField];
      
      // Calculate actual current usage by counting database records
      let currentUsage = 0;
      try {
        switch (resourceType) {
          case 'staff':
            currentUsage = await db.Staff.count({
              include: [{
                model: db.Salon,
                as: 'salon',
                where: { owner_id: user.id }
              }]
            });
            break;
          case 'salons':
            currentUsage = await db.Salon.count({
              where: { owner_id: user.id }
            });
            break;
          case 'bookings':
            currentUsage = await db.Appointment.count({
              include: [{
                model: db.Salon,
                as: 'salon',
                where: { owner_id: user.id }
              }]
            });
            break;
          default:
            currentUsage = 0;
        }
      } catch (countError) {
        console.error(`Error counting ${resourceType}:`, countError);
        currentUsage = 0;
      }

      // Check if limit is reached
      if (limit !== 'unlimited' && currentUsage >= limit) {
        return res.status(403).json({
          error: `${resourceType} limit reached`,
          code: 'USAGE_LIMIT_REACHED',
          resourceType,
          currentUsage,
          limit,
          upgradeRequired: true
        });
      }

      // Attach usage info to request
      req.usage = {
        current: currentUsage,
        limit: limit,
        resourceType: resourceType
      };
      req.subscription = subscription;
      
      next();
    } catch (err) {
      console.error("Usage limit check error:", err);
      res.status(500).json({ 
        error: "Internal server error",
        code: 'INTERNAL_ERROR'
      });
    }
  };
}

/**
 * Get user's active subscription with plan details
 * @param {string} userId - User ID
 * @returns {Object|null} Active subscription or null
 */
async function getUserActiveSubscription(userId) {
  try {
    const subscription = await db.Subscription.findOne({
      where: { 
        ownerId: userId,
        status: 'active'
      },
      include: [
        { 
          model: db.SubscriptionPlan, 
          as: 'plan' 
        }
      ]
    });

    return subscription;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}

/**
 * Get user's subscription features and limits
 * @param {string} userId - User ID
 * @returns {Object} Subscription features and limits
 */
async function getUserSubscriptionInfo(userId) {
  try {
    const subscription = await getUserActiveSubscription(userId);
    
    if (!subscription) {
      return {
        hasActiveSubscription: false,
        features: [],
        limits: {},
        planName: null,
        subscription: null
      };
    }

    const planName = subscription.plan?.name?.toLowerCase() || 'basic';
    const features = [];
    const limits = USAGE_LIMITS[planName] || {};

    // Get all features available for this plan
    Object.keys(FEATURE_MATRIX).forEach(feature => {
      if (FEATURE_MATRIX[feature].includes(planName)) {
        features.push(feature);
      }
    });

    return {
      hasActiveSubscription: true,
      features,
      limits,
      planName,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        usage: subscription.usage || {
          bookings: 0,
          staff: 0,
          locations: 0
        }
      }
    };
  } catch (error) {
    console.error('Error getting subscription info:', error);
    return {
      hasActiveSubscription: false,
      features: [],
      limits: {},
      planName: null,
      subscription: null
    };
  }
}

/**
 * Middleware to attach subscription info to all requests
 * This can be used globally to make subscription info available
 */
function attachSubscriptionInfo() {
  return async (req, res, next) => {
    try {
      if (req.user) {
        req.subscriptionInfo = await getUserSubscriptionInfo(req.user.id);
      }
      next();
    } catch (error) {
      console.error('Error attaching subscription info:', error);
      next(); // Continue even if subscription info fails
    }
  };
}

module.exports = {
  checkSubscriptionFeature,
  checkUsageLimit,
  getUserActiveSubscription,
  getUserSubscriptionInfo,
  attachSubscriptionInfo,
  FEATURE_MATRIX,
  USAGE_LIMITS
};
