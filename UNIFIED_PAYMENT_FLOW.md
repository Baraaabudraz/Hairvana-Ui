# Unified Payment Flow for Subscription Upgrades/Downgrades

## 🎯 **Overview**

This document outlines the **best practice implementation** for handling subscription upgrades and downgrades with a unified payment flow. Both operations now require payment and use the same payment endpoint, ensuring consistency and security.

## ✅ **Best Practices Implemented**

### **1. Payment-First Approach**
- **Upgrades/Downgrades require payment** before subscription changes
- **No immediate changes** - changes happen only after successful payment
- **Unified payment endpoint** for both operations

### **2. Security & Validation**
- **Owner verification** through JWT authentication
- **Plan validation** to ensure upgrade/downgrade logic
- **Current subscription verification** before allowing changes

### **3. Immediate Activation**
- **Changes take effect immediately** after successful payment
- **No waiting periods** or billing cycle delays
- **Seamless user experience**

## 🔄 **Flow Diagram**

```
1. User requests upgrade/downgrade
   ↓
2. System validates request & calculates costs
   ↓
3. Redirect to payment flow
   ↓
4. User completes payment
   ↓
5. Webhook processes payment
   ↓
6. Subscription updated immediately
   ↓
7. Invoice sent to user
```

## 📋 **API Endpoints**

### **1. Upgrade Subscription (Redirects to Payment)**
```bash
POST /backend/api/v0/salon/subscription/upgrade
Authorization: Bearer <jwt-token>

{
  "planId": "new-plan-uuid",
  "billingCycle": "monthly"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Please complete payment to upgrade your subscription. New features will be available immediately after payment.",
  "data": {
    "upgradeType": "upgrade",
    "currentPlan": {
      "id": "current-plan-uuid",
      "name": "Basic Plan",
      "price": 29.99
    },
    "nextPlan": {
      "id": "new-plan-uuid",
      "name": "Professional Plan",
      "price": 59.99
    },
    "upgradeCost": 30.00,
    "billingCycle": "monthly",
    "nextStep": "Create payment intent using POST /backend/api/v0/salon/subscription/payment/create-upgrade-intent",
    "paymentRequestData": {
      "planId": "new-plan-uuid",
      "billingCycle": "monthly",
      "upgradeType": "upgrade",
      "currentSubscriptionId": "current-sub-uuid",
      "upgradeCost": 30.00,
      "currentAmount": 29.99,
      "newAmount": 59.99
    }
  }
}
```

### **2. Downgrade Subscription (Redirects to Payment)**
```bash
POST /backend/api/v0/salon/subscription/downgrade
Authorization: Bearer <jwt-token>

{
  "planId": "new-plan-uuid",
  "billingCycle": "monthly"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Please complete payment to downgrade your subscription. Changes will take effect immediately after payment.",
  "data": {
    "upgradeType": "downgrade",
    "currentPlan": {
      "id": "current-plan-uuid",
      "name": "Professional Plan",
      "price": 59.99
    },
    "nextPlan": {
      "id": "new-plan-uuid",
      "name": "Basic Plan",
      "price": 29.99
    },
    "downgradeAdjustment": 30.00,
    "billingCycle": "monthly",
    "nextStep": "Create payment intent using POST /backend/api/v0/salon/subscription/payment/create-upgrade-intent",
    "paymentRequestData": {
      "planId": "new-plan-uuid",
      "billingCycle": "monthly",
      "upgradeType": "downgrade",
      "currentSubscriptionId": "current-sub-uuid",
      "downgradeAdjustment": 30.00,
      "currentAmount": 59.99,
      "newAmount": 29.99
    }
  }
}
```

### **3. Create Upgrade/Downgrade Payment Intent**
```bash
POST /backend/api/v0/salon/subscription/payment/create-upgrade-intent
Authorization: Bearer <jwt-token>

{
  "planId": "new-plan-uuid",
  "billingCycle": "monthly",
  "upgradeType": "upgrade",  // or "downgrade"
  "currentSubscriptionId": "current-sub-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment intent created for upgrade. Complete payment to upgrade subscription.",
  "data": {
    "paymentId": "payment-uuid",
    "clientSecret": "pi_xxx_secret_xxx",
    "amount": 59.99,
    "currency": "usd",
    "plan": {
      "id": "plan-uuid",
      "name": "Professional Plan",
      "description": "Professional features"
    },
    "owner": {
      "id": "user-uuid",
      "name": "John Doe"
    },
    "billingCycle": "monthly",
    "upgradeType": "upgrade",
    "currentSubscriptionId": "current-sub-uuid",
    "expiresAt": "2024-02-15T10:00:00.000Z"
  }
}
```

## 💳 **Payment Processing**

### **1. Stripe Integration**
- **Payment Intent Creation** for upgrade/downgrade operations
- **Metadata Tracking** to identify upgrade vs. new subscription
- **Webhook Processing** for payment confirmation

### **2. Payment Metadata**
```json
{
  "upgrade_type": "upgrade",
  "current_subscription_id": "current-sub-uuid",
  "is_upgrade": true,
  "plan_name": "Professional Plan",
  "billing_cycle": "monthly"
}
```

### **3. Webhook Handling**
- **Automatic detection** of upgrade/downgrade payments
- **Immediate subscription updates** after successful payment
- **Invoice generation** and email sending

## 🔧 **Technical Implementation**

### **1. Service Functions**
- `createUpgradePaymentIntent()` - Creates payment intent for upgrades/downgrades
- `handleUpgradePayment()` - Processes successful upgrade payments
- `handleSuccessfulSubscriptionPayment()` - Main payment handler with upgrade detection

### **2. Database Updates**
- **Subscription table** updated with new plan details
- **Payment table** tracks upgrade/downgrade metadata
- **Transaction safety** ensures data consistency

### **3. Error Handling**
- **Validation errors** for invalid upgrade/downgrade requests
- **Payment failures** handled gracefully
- **Rollback mechanisms** for failed transactions

## 🎉 **Benefits**

### **1. User Experience**
- **Clear cost information** before payment
- **Immediate activation** after payment
- **Consistent flow** for all subscription changes

### **2. Business Logic**
- **Payment required** for all plan changes
- **Revenue tracking** for upgrades/downgrades
- **Audit trail** for all subscription modifications

### **3. Technical Benefits**
- **Unified codebase** for payment handling
- **Consistent validation** across operations
- **Easy maintenance** and future enhancements

## 🚀 **Usage Example**

### **Complete Upgrade Flow:**
1. **User requests upgrade** → `POST /upgrade`
2. **System calculates costs** and returns payment data
3. **Frontend creates payment intent** → `POST /create-upgrade-intent`
4. **User completes payment** via Stripe
5. **Webhook processes payment** and updates subscription
6. **User receives confirmation** and new features are active

### **Frontend Integration:**
```javascript
// 1. Request upgrade
const upgradeResponse = await fetch('/api/v0/salon/subscription/upgrade', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ planId: 'new-plan-uuid' })
});

// 2. Create payment intent
const paymentData = upgradeResponse.data.paymentRequestData;
const paymentIntent = await fetch('/api/v0/salon/subscription/payment/create-upgrade-intent', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify(paymentData)
});

// 3. Complete payment with Stripe
const stripe = Stripe('pk_test_...');
await stripe.confirmPayment({
  clientSecret: paymentIntent.data.clientSecret,
  confirmParams: { return_url: '/success' }
});
```

## 🔒 **Security Features**

- **JWT Authentication** required for all endpoints
- **Owner verification** ensures users can only modify their own subscriptions
- **Plan validation** prevents invalid upgrade/downgrade operations
- **Payment verification** through Stripe webhooks
- **Transaction safety** with database rollbacks

## 📊 **Monitoring & Logging**

- **Payment status tracking** for all upgrade/downgrade operations
- **Invoice generation** and email delivery confirmation
- **Error logging** for failed payments or database operations
- **Audit trail** for compliance and debugging

This unified payment flow ensures that all subscription changes are properly validated, paid for, and processed securely while maintaining a consistent user experience.
