const subscriptionService = require('../../../services/subscriptionService');
const salonService = require('../../../services/salonService');

/**
 * Get all available subscription plans
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getSubscriptionPlans = async (req, res, next) => {
  try {
    const plans = await subscriptionService.getPlans();
    
    return res.status(200).json({
      success: true,
      data: plans,
      total: plans.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subscription plan by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getSubscriptionPlanById = async (req, res, next) => {
  try {
    const plan = await subscriptionService.getPlanById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current salon subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getCurrentSubscription = async (req, res, next) => {
  try {
    const { salonId } = req.params;
    
    if (!salonId) {
      return res.status(400).json({
        success: false,
        message: 'Salon ID is required'
      });
    }

    // Verify salon ownership
    const salon = await salonService.getSalonById(salonId, req);
    if (!salon || salon.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view subscriptions for your own salons.'
      });
    }

    const subscription = await subscriptionService.getSubscriptionBySalonId(salonId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found for this salon'
      });
    }

    return res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Subscribe to a plan
 * Simplified: Only salonId and planId required - everything else is calculated automatically
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.subscribeToPlan = async (req, res, next) => {
  try {
    const { planId, billingCycle } = req.body;
    const userId = req.user.id;

    // Check if owner already has an active subscription
    const existingSubscription = await subscriptionService.getSubscriptionByOwnerId(userId);
    if (existingSubscription && existingSubscription.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription. Please upgrade or cancel existing subscription first.',
        data: {
          currentSubscription: {
            id: existingSubscription.id,
            plan: existingSubscription.plan?.name || 'Unknown Plan',
            status: existingSubscription.status,
            startDate: existingSubscription.startDate,
            nextBillingDate: existingSubscription.nextBillingDate,
            amount: existingSubscription.amount
          },
          actions: [
            {
              type: 'upgrade',
              description: 'Upgrade to a higher tier plan',
              endpoint: 'POST /backend/api/v0/salon/subscription/upgrade'
            },
            {
              type: 'downgrade',
              description: 'Downgrade to a lower tier plan',
              endpoint: 'POST /backend/api/v0/salon/subscription/downgrade'
            },
            {
              type: 'cancel',
              description: 'Cancel current subscription',
              endpoint: 'POST /backend/api/v0/salon/subscription/cancel'
            }
          ]
        }
      });
    }

    // Get plan details to validate and set defaults
    const plan = await subscriptionService.getPlanById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Redirect to payment flow instead of creating subscription directly
    return res.status(200).json({
      success: true,
      message: 'Please complete payment to activate your subscription. Use the payment endpoint to create a payment intent.',
      data: {
        planId,
        billingCycle: billingCycle || plan.billing_period || 'monthly',
        plan: {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price: billingCycle === 'yearly' ? plan.yearly_price : plan.price
        },
        nextStep: 'Create payment intent using POST /backend/api/v0/salon/subscription/payment/create-intent',
        paymentRequestData: {
          planId: planId,
          billingCycle: billingCycle || plan.billing_period || 'monthly'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upgrade subscription (immediate activation)
 * Simplified: Only salonId and planId required - everything else is calculated automatically
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.upgradeSubscription = async (req, res, next) => {
  try {
    const { planId, billingCycle } = req.body;
    const ownerId = req.user.id; // Get owner ID from authenticated user
    
    // Validate required parameters
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }

    // Get current subscription by owner ID
    const currentSubscription = await subscriptionService.getSubscriptionByOwnerId(ownerId);
    if (!currentSubscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found for this owner'
      });
    }

    // Debug logging
    console.log('Upgrade subscription - Debug info:', {
      ownerId,
      planId,
      billingCycle,
      currentSubscriptionId: currentSubscription.id,
      currentPlanId: currentSubscription.plan?.id,
      currentPlan: currentSubscription.plan
    });

    // Get plan details to validate upgrade
    const currentPlan = await subscriptionService.getPlanById(currentSubscription.plan?.id);
    const newPlan = await subscriptionService.getPlanById(planId);
    
    if (!newPlan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    if (!currentPlan) {
      return res.status(400).json({
        success: false,
        message: 'Current subscription plan not found'
      });
    }

    // Validate that this is actually an upgrade (higher tier plan)
    if (newPlan.price <= currentPlan.price) {
      return res.status(400).json({
        success: false,
        message: 'This appears to be a downgrade. Please use the downgrade endpoint instead.'
      });
    }

    const upgradeData = {
      planId,
      billingCycle: billingCycle || currentSubscription.billingCycle
    };

    const upgradedSubscription = await subscriptionService.upgradeSubscription(
      currentSubscription.id, 
      upgradeData
    );
    
    return res.status(200).json({
      success: true,
      message: 'Subscription upgraded successfully. New features are now available. All pricing and billing details calculated automatically.',
      data: upgradedSubscription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Downgrade subscription (end of cycle activation)
 * Simplified: Only salonId and planId required - everything else is calculated automatically
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.downgradeSubscription = async (req, res, next) => {
  try {
    const { planId, billingCycle } = req.body;
    const ownerId = req.user.id; // Get owner ID from authenticated user
    
    // Validate required parameters
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }

    // Get current subscription by owner ID
    const currentSubscription = await subscriptionService.getSubscriptionByOwnerId(ownerId);
    if (!currentSubscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found for this owner'
      });
    }

    // Get plan details to validate downgrade
    const currentPlan = await subscriptionService.getPlanById(currentSubscription.plan?.id);
    const newPlan = await subscriptionService.getPlanById(planId);
    
    if (!newPlan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    if (!currentPlan) {
      return res.status(400).json({
        success: false,
        message: 'Current subscription plan not found'
      });
    }

    // Validate that this is actually a downgrade (lower tier plan)
    if (newPlan.price >= currentPlan.price) {
      return res.status(400).json({
        success: false,
        message: 'This appears to be an upgrade. Please use the upgrade endpoint instead.'
      });
    }

    const downgradeData = {
      planId,
      billingCycle: billingCycle || currentSubscription.billingCycle
    };

    const downgradedSubscription = await subscriptionService.downgradeSubscription(
      currentSubscription.id, 
      downgradeData
    );
    
    return res.status(200).json({
      success: true,
      message: 'Subscription downgrade scheduled successfully. Changes will take effect at the end of your current billing cycle. All pricing and billing details calculated automatically.',
      data: downgradedSubscription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.cancelSubscription = async (req, res, next) => {
  try {
    const { salonId } = req.body;
    
    // Verify salon ownership
    const salon = await salonService.getSalonById(salonId, req);
    if (!salon || salon.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel subscriptions for your own salons.'
      });
    }

    // Get current subscription
    const currentSubscription = await subscriptionService.getSubscriptionBySalonId(salonId);
    if (!currentSubscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found for this salon'
      });
    }

    const cancelledSubscription = await subscriptionService.cancelSubscription(currentSubscription.id);
    
    return res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: cancelledSubscription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subscription usage
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getSubscriptionUsage = async (req, res, next) => {
  try {
    const { salonId } = req.params;
    
    if (!salonId) {
      return res.status(400).json({
        success: false,
        message: 'Salon ID is required'
      });
    }

    // Verify salon ownership
    const salon = await salonService.getSalonById(salonId, req);
    if (!salon || salon.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view usage for your own salons.'
      });
    }

    const subscription = await subscriptionService.getSubscriptionBySalonId(salonId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found for this salon'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        subscription: subscription,
        usage: subscription.usage || {
          bookings: 0,
          staff: 0,
          locations: 1
        },
        limits: subscription.plan?.limits || {
          bookings: 0,
          staff: 0,
          locations: 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get billing history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getBillingHistory = async (req, res, next) => {
  try {
    const { salonId } = req.params;
    
    if (!salonId) {
      return res.status(400).json({
        success: false,
        message: 'Salon ID is required'
      });
    }

    // Verify salon ownership
    const salon = await salonService.getSalonById(salonId, req);
    if (!salon || salon.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view billing history for your own salons.'
      });
    }

    const subscription = await subscriptionService.getSubscriptionBySalonId(salonId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found for this salon'
      });
    }

    const billingHistory = await subscriptionService.getBillingHistoryBySubscriptionId(subscription.id);
    
    return res.status(200).json({
      success: true,
      data: billingHistory
    });
  } catch (error) {
    next(error);
  }
};
