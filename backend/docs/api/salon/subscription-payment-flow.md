# Salon Subscription Payment Flow Documentation

## Overview

This document describes the new payment-first subscription flow where salon owners must complete payment before their subscription is activated. This ensures that subscriptions are only created after successful payment processing.

## Payment-First Flow

### 1. Subscribe to Plan (Validation Only)
**Endpoint:** `POST /backend/api/v0/salon/subscription/subscribe`

**Purpose:** Validates the subscription request and returns plan details. Does NOT create a subscription.

**Request Body:**
```json
{
  "salonId": "salon-uuid",
  "planId": "00000000-0000-0000-0000-000000000001",
  "billingCycle": "yearly"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Please complete payment to activate your subscription. Use the payment endpoint to create a payment intent.",
  "data": {
    "salonId": "salon-uuid",
    "planId": "00000000-0000-0000-0000-000000000001",
    "billingCycle": "yearly",
    "plan": {
      "id": "00000000-0000-0000-0000-000000000001",
      "name": "Basic",
      "description": "Perfect for small salons getting started",
      "price": 199.99
    },
    "nextStep": "Create payment intent using POST /payment/create-intent"
  }
}
```

### 2. Create Payment Intent
**Endpoint:** `POST /backend/api/v0/salon/subscription/payment/create-intent`

**Purpose:** Creates a Stripe payment intent and subscription payment record.

**Request Body:**
```json
{
  "salonId": "salon-uuid",
  "planId": "00000000-0000-0000-0000-000000000001",
  "billingCycle": "yearly"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment intent created successfully. Complete payment to activate subscription.",
  "data": {
    "paymentId": "payment-uuid",
    "clientSecret": "pi_xxx_secret_xxx",
    "amount": 199.99,
    "currency": "usd",
    "plan": {
      "id": "00000000-0000-0000-0000-000000000001",
      "name": "Basic",
      "description": "Perfect for small salons getting started"
    },
    "salon": {
      "id": "salon-uuid",
      "name": "My Salon"
    },
    "billingCycle": "yearly",
    "expiresAt": "2024-01-15T12:30:00.000Z"
  }
}
```

### 3. Complete Payment (Frontend)
**Frontend Implementation:**
```javascript
// Using Stripe.js
const stripe = Stripe('pk_test_xxx');
const { clientSecret } = paymentIntentData;

const { error } = await stripe.confirmPayment({
  clientSecret,
  confirmParams: {
    return_url: 'https://yourapp.com/payment-success',
  },
});

if (error) {
  console.error('Payment failed:', error);
}
```

### 4. Check Payment Status
**Endpoint:** `GET /backend/api/v0/salon/subscription/payment/:paymentId/status`

**Purpose:** Check if payment was successful and get subscription details if created.

**Response (Pending):**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "payment-uuid",
      "status": "pending",
      "amount": 199.99,
      "billingCycle": "yearly",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "expiresAt": "2024-01-15T12:30:00.000Z"
    },
    "subscription": null
  }
}
```

**Response (Paid):**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "payment-uuid",
      "status": "paid",
      "amount": 199.99,
      "billingCycle": "yearly",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "expiresAt": "2024-01-15T12:30:00.000Z"
    },
    "subscription": {
      "id": "subscription-uuid",
      "status": "active",
      "startDate": "2024-01-15T12:05:00.000Z",
      "nextBillingDate": "2025-01-15T12:05:00.000Z",
      "usage": {
        "bookings": 0,
        "bookingsLimit": 100,
        "staff": 0,
        "staffLimit": 3,
        "locations": 1,
        "locationsLimit": 1
      }
    }
  }
}
```

## Payment Management Endpoints

### Get Payment Details
**Endpoint:** `GET /backend/api/v0/salon/subscription/payment/:paymentId`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment-uuid",
    "user_id": "user-uuid",
    "salon_id": "salon-uuid",
    "plan_id": "plan-uuid",
    "amount": 199.99,
    "billing_cycle": "yearly",
    "method": "stripe",
    "status": "paid",
    "payment_date": "2024-01-15T12:05:00.000Z",
    "plan": {
      "id": "plan-uuid",
      "name": "Basic",
      "description": "Perfect for small salons getting started"
    },
    "salon": {
      "id": "salon-uuid",
      "name": "My Salon"
    }
  }
}
```

### Get Payment History
**Endpoint:** `GET /backend/api/v0/salon/subscription/payment/salon/:salonId`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "payment-uuid",
      "amount": 199.99,
      "billing_cycle": "yearly",
      "status": "paid",
      "payment_date": "2024-01-15T12:05:00.000Z",
      "plan": {
        "name": "Basic"
      }
    }
  ],
  "total": 1
}
```

### Cancel Payment
**Endpoint:** `POST /backend/api/v0/salon/subscription/payment/:paymentId/cancel`

**Response:**
```json
{
  "success": true,
  "message": "Payment cancelled successfully",
  "data": {
    "id": "payment-uuid",
    "status": "cancelled"
  }
}
```

## Webhook Processing

### Stripe Webhook Events
The system automatically processes the following Stripe webhook events:

1. **`payment_intent.succeeded`** - Creates subscription and sends notification
2. **`payment_intent.payment_failed`** - Updates payment status to failed
3. **`payment_intent.canceled`** - Updates payment status to cancelled

### Webhook Handler Logic
```javascript
// When payment_intent.succeeded is received:
1. Check if payment intent has subscription_payment_id metadata
2. If yes, call handleSuccessfulSubscriptionPayment()
3. Create subscription with payment_id reference
4. Send notification to salon owner
5. If no subscription metadata, process as regular appointment payment
```

## Error Handling

### Common Error Responses

**400 Bad Request - Payment Already Exists:**
```json
{
  "success": false,
  "message": "Payment already exists for this subscription request"
}
```

**400 Bad Request - Payment Expired:**
```json
{
  "success": false,
  "message": "Payment intent has expired. Please create a new payment intent."
}
```

**403 Forbidden - Access Denied:**
```json
{
  "success": false,
  "message": "Access denied. You can only create payments for your own salons."
}
```

**503 Service Unavailable - Payments Disabled:**
```json
{
  "success": false,
  "message": "Payments are currently disabled by the admin."
}
```

## Security Features

1. **Salon Ownership Verification:** All payment operations verify that the user owns the salon
2. **Payment Expiration:** Payment intents expire after 30 minutes
3. **Webhook Signature Verification:** All Stripe webhooks are verified using the webhook secret
4. **Transaction Consistency:** Database operations use transactions to ensure data consistency
5. **Payment Status Tracking:** Comprehensive payment status tracking prevents duplicate subscriptions

## Frontend Integration Example

```javascript
// Complete subscription flow
async function subscribeToPlan(salonId, planId, billingCycle) {
  try {
    // Step 1: Validate subscription request
    const validationResponse = await axios.post('/backend/api/v0/salon/subscription/subscribe', {
      salonId,
      planId,
      billingCycle
    });

    // Step 2: Create payment intent
    const paymentResponse = await axios.post('/backend/api/v0/salon/subscription/payment/create-intent', {
      salonId,
      planId,
      billingCycle
    });

    const { clientSecret, paymentId } = paymentResponse.data.data;

    // Step 3: Complete payment with Stripe
    const stripe = Stripe('pk_test_xxx');
    const { error } = await stripe.confirmPayment({
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?paymentId=${paymentId}`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Step 4: Check payment status (on return from Stripe)
    const statusResponse = await axios.get(`/backend/api/v0/salon/subscription/payment/${paymentId}/status`);
    
    if (statusResponse.data.data.payment.status === 'paid') {
      console.log('Subscription activated:', statusResponse.data.data.subscription);
    }

  } catch (error) {
    console.error('Subscription failed:', error);
  }
}
```

## Benefits of Payment-First Flow

1. **Guaranteed Revenue:** Subscriptions are only created after successful payment
2. **Better User Experience:** Clear payment flow with immediate feedback
3. **Reduced Fraud:** Payment verification before service activation
4. **Audit Trail:** Complete payment history linked to subscriptions
5. **Flexible Payment Methods:** Easy to add new payment gateways
6. **Webhook Reliability:** Automatic subscription creation via webhooks
7. **Error Recovery:** Ability to retry failed payments or cancel pending ones
