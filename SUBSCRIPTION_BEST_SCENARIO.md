# Subscription Management - Best Scenario Implementation

## 🎯 Overview

This document outlines the implementation of the **best subscription scenario** that ensures users can only have **one active subscription at a time**, preventing confusion and billing conflicts.

## ✅ Best Scenario: Single Active Subscription

### **What Happens:**
1. **User subscribes to Basic Plan** → ✅ Success (Subscription activated)
2. **User tries to subscribe to Professional Plan** → ❌ Blocked (Already has active subscription)
3. **User upgrades Basic to Professional** → ✅ Success (Plan changed, subscription continues)
4. **User tries to create new subscription** → ❌ Blocked (Still has active subscription)

### **What Does NOT Happen:**
- ❌ Multiple active subscriptions
- ❌ Confusion about which plan is active
- ❌ Billing conflicts
- ❌ Unclear feature access

## 🛡️ Validation Layers

### **Layer 1: Payment Intent Creation**
```javascript
// In subscriptionPaymentService.js
exports.createSubscriptionPaymentIntent = async (data) => {
  // Check if user already has an active subscription
  const existingSubscription = await Subscription.findOne({
    where: { 
      owner_id: userId,
      status: 'active'
    }
  });

  if (existingSubscription) {
    throw new Error('You already have an active subscription. Please upgrade or cancel your existing subscription first.');
  }
  // ... continue with payment creation
};
```

### **Layer 2: Payment Processing**
```javascript
// In subscriptionPaymentService.js
exports.handleSuccessfulSubscriptionPayment = async (paymentIntentId) => {
  // Double-check: Ensure user doesn't already have an active subscription
  const existingSubscription = await Subscription.findOne({
    where: { 
      owner_id: payment.owner_id,
      status: 'active'
    }
  });

  if (existingSubscription) {
    // Cancel payment and prevent duplicate subscription
    await payment.update({ 
      status: 'cancelled',
      metadata: {
        ...payment.metadata,
        cancellation_reason: 'User already has active subscription'
      }
    });
    throw new Error('Cannot create subscription: User already has an active subscription');
  }
  // ... continue with subscription creation
};
```

### **Layer 3: API Endpoint Validation**
```javascript
// In salonSubscriptionController.js
exports.subscribeToPlan = async (req, res, next) => {
  // Check if owner already has an active subscription
  const existingSubscription = await subscriptionService.getSubscriptionByOwnerId(userId);
  if (existingSubscription && existingSubscription.status === 'active') {
    return res.status(400).json({
      success: false,
      message: 'You already have an active subscription. Please upgrade or cancel existing subscription first.',
      data: {
        currentSubscription: { /* subscription details */ },
        actions: [ /* upgrade, downgrade, cancel options */ ]
      }
    });
  }
  // ... continue with subscription process
};
```

## 🔄 Upgrade/Downgrade Flow

### **Upgrade Subscription**
```javascript
// In subscriptionService.js
exports.upgradeSubscription = async (subscriptionId, newPlanId, billingCycle) => {
  // Validate that this is actually an upgrade (higher tier plan)
  if (newPlan.price <= currentSubscription.amount) {
    throw new Error('This appears to be a downgrade. Please use the downgrade endpoint instead.');
  }

  // Update subscription with new plan
  const updatedSubscription = await subscriptionRepository.updateSubscription(subscriptionId, {
    planId: newPlanId,
    amount: newAmount,
    billingCycle: billingCycle || currentSubscription.billingCycle,
    nextBillingDate: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
  });

  return updatedSubscription;
};
```

### **Downgrade Subscription**
```javascript
// In subscriptionService.js
exports.downgradeSubscription = async (subscriptionId, newPlanId, billingCycle) => {
  // Validate that this is actually a downgrade (lower tier plan)
  if (newPlan.price >= currentSubscription.amount) {
    throw new Error('This appears to be an upgrade. Please use the upgrade endpoint instead.');
  }

  // Update subscription with new plan
  const updatedSubscription = await subscriptionRepository.updateSubscription(subscriptionId, {
    planId: newPlanId,
    amount: newAmount,
    billingCycle: billingCycle || currentSubscription.billingCycle,
    nextBillingDate: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
  });

  return updatedSubscription;
};
```

## 📋 API Endpoints

### **Create Payment Intent (New Subscription)**
```http
POST {{ServerUrl}}/api/v0/salon/subscription/payment/create-payment
{
  "planId": "plan-uuid",
  "billingCycle": "monthly",
  "userId": "user-uuid"
}
```

**Response if user has active subscription:**
```json
{
  "success": false,
  "message": "You already have an active subscription. Please upgrade or cancel your existing subscription first.",
  "data": {
    "currentSubscription": {
      "id": "sub-uuid",
      "plan": "Basic",
      "status": "active",
      "startDate": "2024-01-01T00:00:00.000Z",
      "nextBillingDate": "2024-02-01T00:00:00.000Z",
      "amount": 29.99
    },
    "actions": [
      {
        "type": "upgrade",
        "description": "Upgrade to a higher tier plan",
        "endpoint": "POST /backend/api/v0/salon/subscription/upgrade"
      },
      {
        "type": "downgrade",
        "description": "Downgrade to a lower tier plan",
        "endpoint": "POST /backend/api/v0/salon/subscription/downgrade"
      },
      {
        "type": "cancel",
        "description": "Cancel current subscription",
        "endpoint": "POST /backend/api/v0/salon/subscription/cancel"
      }
    ]
  }
}
```

### **Upgrade Subscription**
```http
POST {{ServerUrl}}/api/v0/salon/subscription/upgrade
{
  "salonId": "salon-uuid",
  "planId": "new-plan-uuid",
  "billingCycle": "monthly"
}
```

### **Downgrade Subscription**
```http
POST {{ServerUrl}}/api/v0/salon/subscription/downgrade
{
  "salonId": "salon-uuid",
  "planId": "new-plan-uuid",
  "billingCycle": "monthly"
}
```

## 🧪 Testing

### **Run the Test Suite**
```bash
cd backend
node test-subscription-best-scenario.js
```

### **Test Scenarios Covered**
1. ✅ **First subscription** - Should succeed
2. ✅ **Duplicate subscription attempt** - Should be blocked
3. ✅ **Upgrade subscription** - Should succeed
4. ✅ **Post-upgrade duplicate attempt** - Should still be blocked
5. ✅ **Final state verification** - Should show one active subscription

## 🎯 Benefits of This Approach

### **For Users:**
- ✅ Clear understanding of current plan
- ✅ No confusion about billing
- ✅ Simple upgrade/downgrade process
- ✅ Clear error messages with actionable guidance

### **For System:**
- ✅ Data consistency
- ✅ Simplified billing logic
- ✅ Easier subscription management
- ✅ Reduced support queries

### **For Business:**
- ✅ Clear revenue tracking
- ✅ Predictable billing cycles
- ✅ Easier customer management
- ✅ Reduced billing disputes

## 🚫 What This Prevents

1. **Multiple Active Subscriptions**
   - User can't accidentally pay for multiple plans
   - No confusion about which features are available

2. **Billing Conflicts**
   - Clear single billing cycle
   - Predictable payment amounts

3. **Feature Confusion**
   - Users know exactly what they're paying for
   - Clear upgrade/downgrade paths

4. **Data Inconsistency**
   - Single source of truth for subscription status
   - Easier to track and manage

## 🔧 Implementation Details

### **Database Constraints**
- `Subscription.owner_id` ensures one subscription per owner
- `Subscription.status` tracks active/cancelled/expired states
- Foreign key relationships maintain data integrity

### **Business Logic**
- Validation at multiple layers prevents edge cases
- Clear upgrade/downgrade validation
- Comprehensive error messages with actionable guidance

### **Error Handling**
- Graceful degradation when validation fails
- Clear user feedback with next steps
- Proper cleanup of failed payment attempts

## 📚 Related Documentation

- [Invoice System Documentation](./INVOICE_SYSTEM.md)
- [Subscription API Documentation](./backend/docs/api/subscriptions.md)
- [Payment Flow Documentation](./backend/docs/api/payments.md)

---

**This implementation ensures the best user experience while maintaining system integrity and preventing subscription conflicts.**
