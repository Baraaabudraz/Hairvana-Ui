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
 * Get current owner subscription (not tied to specific salon)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getCurrentSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const subscription = await subscriptionService.getSubscriptionByOwnerId(userId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found for your account'
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

    // Calculate upgrade cost
    const currentAmount = currentSubscription.amount;
    const newAmount = billingCycle === 'yearly' ? newPlan.yearly_price : newPlan.price;
    const upgradeCost = newAmount - currentAmount;

    // Create upgrade payment intent instead of immediate upgrade
    const upgradePaymentData = {
      planId,
      billingCycle: billingCycle || currentSubscription.billingCycle,
      upgradeType: 'upgrade',
      currentSubscriptionId: currentSubscription.id,
      upgradeCost: upgradeCost,
      currentAmount: currentAmount,
      newAmount: newAmount
    };

    // Redirect to payment flow for upgrade
    return res.status(200).json({
      success: true,
      message: 'Please complete payment to upgrade your subscription. New features will be available immediately after payment.',
      data: {
        upgradeType: 'upgrade',
        currentPlan: {
          id: currentPlan.id,
          name: currentPlan.name,
          price: currentAmount
        },
        nextPlan: {
          id: newPlan.id,
          name: newPlan.name,
          price: newAmount
        },
        upgradeCost: upgradeCost,
        billingCycle: billingCycle || currentSubscription.billingCycle,
        nextStep: 'Create payment intent using POST /backend/api/v0/salon/subscription/payment/create-upgrade-intent',
        paymentRequestData: upgradePaymentData
      }
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

    // Calculate downgrade adjustment
    const currentAmount = currentSubscription.amount;
    const newAmount = billingCycle === 'yearly' ? newPlan.yearly_price : newPlan.price;
    const downgradeAdjustment = currentAmount - newAmount;

    // Create downgrade payment intent instead of immediate downgrade
    const downgradePaymentData = {
      planId,
      billingCycle: billingCycle || currentSubscription.billingCycle,
      upgradeType: 'downgrade',
      currentSubscriptionId: currentSubscription.id,
      downgradeAdjustment: downgradeAdjustment,
      currentAmount: currentAmount,
      newAmount: newAmount
    };

    // Redirect to payment flow for downgrade
    return res.status(200).json({
      success: true,
      message: 'Please complete payment to downgrade your subscription. Changes will take effect immediately after payment.',
      data: {
        upgradeType: 'downgrade',
        currentPlan: {
          id: currentPlan.id,
          name: currentPlan.name,
          price: currentAmount
        },
        nextPlan: {
          id: newPlan.id,
          name: newPlan.name,
          price: newAmount
        },
        downgradeAdjustment: downgradeAdjustment,
        billingCycle: billingCycle || currentSubscription.billingCycle,
        nextStep: 'Create payment intent using POST /backend/api/v0/salon/subscription/payment/create-downgrade-intent',
        paymentRequestData: downgradePaymentData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel subscription with Stripe integration and refund logic
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.cancelSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get current subscription by owner ID
    const currentSubscription = await subscriptionService.getSubscriptionByOwnerId(userId);
    if (!currentSubscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found for your account'
      });
    }

    // Prevent cancelling if subscription is already being cancelled or cancelled
    if (currentSubscription.status === 'cancelling' || currentSubscription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel subscription. Your subscription is already ${currentSubscription.status === 'cancelling' ? 'being cancelled' : 'cancelled'}.`,
        data: {
          subscription: {
            id: currentSubscription.id,
            status: currentSubscription.status,
            cancelAtPeriodEnd: currentSubscription.cancelAtPeriodEnd || false,
            currentPeriodEnd: currentSubscription.nextBillingDate
          },
          actions: currentSubscription.status === 'cancelling' ? [
            {
              type: 'reactivate',
              description: 'Reactivate your subscription before it expires',
              endpoint: 'POST /backend/api/v0/salon/subscription/reactivate'
            }
          ] : [
            {
              type: 'subscribe',
              description: 'Subscribe to a new plan',
              endpoint: 'POST /backend/api/v0/salon/subscription/subscribe'
            }
          ]
        }
      });
    }

    // Calculate days since subscription start for refund eligibility
    const subscriptionStartDate = new Date(currentSubscription.startDate);
    const currentDate = new Date();
    const daysSinceStart = Math.floor((currentDate - subscriptionStartDate) / (1000 * 60 * 60 * 24));
    const refundWindowDays = 10;
    const isEligibleForRefund = daysSinceStart <= refundWindowDays;

    // Get Stripe configuration
    const { IntegrationSettings } = require('../../../models');
    const settings = await IntegrationSettings.findOne({ order: [['updated_at', 'DESC']] });
    
    if (!settings || settings.stripe_enabled === false) {
      return res.status(400).json({
        success: false,
        message: 'Payments are currently disabled by the admin.'
      });
    }
    
    if (!settings.payment_api_key) {
      return res.status(400).json({
        success: false,
        message: 'Stripe API key is not configured.'
      });
    }

    const Stripe = require('stripe');
    const stripe = Stripe(settings.payment_api_key);

    // Check if subscription has payment ID (which links to Stripe)
    if (currentSubscription.paymentId) {
      try {
        // Get the payment record to find Stripe payment intent ID
        const { SubscriptionPayment, BillingHistory } = require('../../../models');
        const payment = await SubscriptionPayment.findByPk(currentSubscription.paymentId);
        
        if (payment && payment.payment_intent_id) {
          let refundResult = null;
          let finalSubscriptionStatus = 'cancelled';
          let finalPaymentStatus = 'cancelled';

          // Process refund if eligible (within 10 days)
          if (isEligibleForRefund) {
            try {
              refundResult = await stripe.refunds.create({
                payment_intent: payment.payment_intent_id,
                amount: Math.round(Number(currentSubscription.amount) * 100), // Convert to cents
                reason: 'requested_by_customer',
                metadata: {
                  subscription_id: currentSubscription.id,
                  cancellation_reason: 'requested_by_customer',
                  days_used: daysSinceStart.toString(),
                  refund_window_days: refundWindowDays.toString(),
                  refund_type: 'full_refund_within_window'
                }
              });

              console.log('Stripe refund created successfully:', {
                refundId: refundResult.id,
                amount: currentSubscription.amount,
                daysSinceStart
              });

              finalPaymentStatus = 'refunded';
            } catch (refundError) {
              console.error('Error creating Stripe refund:', refundError);
              // Continue with cancellation even if refund fails
            }
          }

          // Try to retrieve PI and cancel only if cancellable (ignore errors)
          let stripePaymentIntentStatus = null;
          try {
            const pi = await stripe.paymentIntents.retrieve(payment.payment_intent_id);
            stripePaymentIntentStatus = pi.status;
            const cancellableStatuses = ['requires_payment_method', 'requires_confirmation', 'requires_capture'];
            if (cancellableStatuses.includes(pi.status)) {
              await stripe.paymentIntents.cancel(payment.payment_intent_id, {
                cancellation_reason: 'requested_by_customer'
              });
            }
          } catch (piError) {
            console.warn('Stripe PI retrieve/cancel warning:', piError?.message || piError);
          }

          // Persist changes atomically
          await SubscriptionPayment.sequelize.transaction(async (t) => {
            await payment.update({
              status: finalPaymentStatus,
              metadata: {
                ...(payment.metadata || {}),
                cancellation_reason: 'requested_by_customer',
                cancelled_at: new Date(),
                days_since_start: daysSinceStart,
                refund_window_days: refundWindowDays,
                is_eligible_for_refund: isEligibleForRefund,
                refund_processed: Boolean(refundResult),
                refund_id: refundResult?.id || null,
                refund_amount: refundResult ? currentSubscription.amount : 0
              }
            }, { transaction: t });

            await currentSubscription.update({
              status: finalSubscriptionStatus,
              endDate: new Date()
            }, { transaction: t });

            if (refundResult) {
              const refundInvoiceNumber = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
              await BillingHistory.create({
                subscription_id: currentSubscription.id,
                date: new Date(),
                amount: -Number(currentSubscription.amount), // Negative amount for refund
                status: 'refunded',
                description: `Full refund for cancelled subscription - ${daysSinceStart} days used (within ${refundWindowDays}-day refund window)`,
                invoice_number: refundInvoiceNumber,
                subtotal: -Number(currentSubscription.amount),
                total: -Number(currentSubscription.amount),
                tax_amount: 0
              }, { transaction: t });
            }
          });

          // Prepare response message based on refund status
          let responseMessage = '';
          if (isEligibleForRefund && refundResult) {
            responseMessage = `Subscription cancelled successfully with full refund of $${Number(currentSubscription.amount).toFixed(2)}. Refund processed within ${refundWindowDays}-day window.`;
          } else if (isEligibleForRefund && !refundResult) {
            responseMessage = `Subscription cancelled successfully. Refund was eligible but failed to process. Please contact support.`;
          } else {
            responseMessage = `Subscription cancelled successfully without refund. ${refundWindowDays}-day refund window has expired.`;
          }

          return res.status(200).json({
            success: true,
            message: responseMessage,
            data: {
              subscription: {
                id: currentSubscription.id,
                status: finalSubscriptionStatus,
                endDate: new Date(),
                stripeStatus: stripePaymentIntentStatus
              },
              refund: isEligibleForRefund ? {
                eligible: true,
                amount: currentSubscription.amount,
                refundId: refundResult?.id || null,
                daysUsed: daysSinceStart,
                refundWindowDays: refundWindowDays,
                processed: Boolean(refundResult)
              } : {
                eligible: false,
                reason: `Refund window expired (${daysSinceStart} days > ${refundWindowDays} days)`,
                daysUsed: daysSinceStart,
                refundWindowDays: refundWindowDays
              },
              billing: {
                message: isEligibleForRefund && refundResult 
                  ? `Full refund of $${Number(currentSubscription.amount).toFixed(2)} has been processed. No more charges will be made.`
                  : 'No more charges will be made. Your subscription has been terminated.',
                cancelledAt: new Date(),
                refundWindow: `${refundWindowDays} days from start date`
              }
            }
          });
        } else {
          // Payment exists but no Stripe payment intent ID
          const cancelledSubscription = await subscriptionService.cancelSubscription(currentSubscription.id);
          
          return res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully (payment found but no Stripe link)',
            data: {
              subscription: cancelledSubscription,
              note: 'Payment record found but no Stripe payment intent ID'
            }
          });
        }

      } catch (stripeError) {
        console.error('Error cancelling Stripe payment intent:', stripeError);
        
        // If Stripe fails, still cancel locally but warn user
        const cancelledSubscription = await subscriptionService.cancelSubscription(currentSubscription.id);
        
        return res.status(200).json({
          success: true,
          message: 'Subscription cancelled locally, but there was an issue with Stripe. Please contact support.',
          data: {
            subscription: cancelledSubscription,
            warning: 'Stripe cancellation failed - contact support to ensure no future charges'
          }
        });
      }
    } else {
      // No payment ID - cancel locally only
      const cancelledSubscription = await subscriptionService.cancelSubscription(currentSubscription.id);
      
      return res.status(200).json({
        success: true,
        message: 'Subscription cancelled successfully (local only)',
        data: {
          subscription: cancelledSubscription,
          note: 'This subscription was not linked to any payment'
        }
      });
    }

  } catch (error) {
    console.error('Error in cancelSubscription:', error);
    next(error);
  }
};

/**
 * Get subscription usage for owner (not tied to specific salon)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getSubscriptionUsage = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const subscription = await subscriptionService.getSubscriptionByOwnerId(userId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found for your account'
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
 * Get billing history for owner (not tied to specific salon)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getBillingHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const subscription = await subscriptionService.getSubscriptionByOwnerId(userId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found for your account'
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
