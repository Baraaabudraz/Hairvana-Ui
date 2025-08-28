# Salon Subscription API Documentation

## Overview

This API provides endpoints for salon owners to manage their subscription plans. All endpoints require salon owner authentication via JWT token.

**Base URL:** `/backend/api/v0/salon/subscription`

**Authentication:** Bearer token required in Authorization header

---

## Table of Contents

1. [Authentication](#authentication)
2. [Subscription Plans](#subscription-plans)
3. [Subscription Management](#subscription-management)
4. [Usage & Billing](#usage--billing)
5. [Error Handling](#error-handling)
6. [Response Formats](#response-formats)

---

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## Subscription Plans

### Get All Subscription Plans

**Endpoint:** `GET /backend/api/v0/salon/subscription/plans`

**Description:** Get all available subscription plans

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "name": "Basic",
      "description": "Perfect for small salons getting started",
      "price": 19.99,
      "yearly_price": 199.99,
      "billing_period": "monthly",
      "features": [
        "Up to 100 bookings/month",
        "Up to 3 staff members",
        "Basic customer management"
      ],
      "limits": {
        "bookings": 100,
        "staff": 3,
        "locations": 1
      },
      "status": "active"
    }
  ],
  "total": 3
}
```

### Get Subscription Plan by ID

**Endpoint:** `GET /backend/api/v0/salon/subscription/plans/:id`

**Description:** Get a specific subscription plan by ID

**Parameters:**
- `id` (path): Plan UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "00000000-0000-0000-0000-000000000001",
    "name": "Basic",
    "description": "Perfect for small salons getting started",
    "price": 19.99,
    "yearly_price": 199.99,
    "billing_period": "monthly",
    "features": [
      "Up to 100 bookings/month",
      "Up to 3 staff members",
      "Basic customer management"
    ],
    "limits": {
      "bookings": 100,
      "staff": 3,
      "locations": 1
    },
    "status": "active"
  }
}
```

---

## Subscription Management

### Get Current Subscription

**Endpoint:** `GET /backend/api/v0/salon/subscription/current/:salonId`

**Description:** Get the current subscription for a salon

**Parameters:**
- `salonId` (path): Salon UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "subscription-uuid",
    "salonId": "salon-uuid",
    "plan": {
      "id": "00000000-0000-0000-0000-000000000001",
      "name": "Basic",
      "price": 19.99
    },
    "status": "active",
    "startDate": "2024-01-15T00:00:00.000Z",
    "billingCycle": "monthly",
    "amount": 19.99,
    "usage": {
      "bookings": 45,
      "bookingsLimit": 100,
      "staff": 2,
      "staffLimit": 3,
      "locations": 1,
      "locationsLimit": 1
    }
  }
}
```

### Subscribe to a Plan (Payment-First Flow)

**Endpoint:** `POST /backend/api/v0/salon/subscription/subscribe`

**Description:** Validates subscription request and returns plan details. **This endpoint does NOT create a subscription directly.** You must complete payment to activate the subscription.

**Request Body:**
```json
{
  "salonId": "salon-uuid",
  "planId": "00000000-0000-0000-0000-000000000001",
  "billingCycle": "monthly"
}
```

**Note:** Only `salonId` and `planId` are required. `billingCycle` is optional and defaults to the plan's default billing period.

**Response:**
```json
{
  "success": true,
  "message": "Please complete payment to activate your subscription. Use the payment endpoint to create a payment intent.",
  "data": {
    "salonId": "salon-uuid",
    "planId": "00000000-0000-0000-0000-000000000001",
    "billingCycle": "monthly",
    "plan": {
      "id": "00000000-0000-0000-0000-000000000001",
      "name": "Basic",
      "description": "Perfect for small salons getting started",
      "price": 19.99
    },
            "nextStep": "Create payment intent using POST /backend/api/v0/salon/subscription/payment/create-intent",
        "paymentRequestData": {
          "salonId": "salon-uuid",
          "planId": "00000000-0000-0000-0000-000000000001",
          "billingCycle": "monthly"
        }
  }
}
```

**Next Steps:**
1. Create payment intent using `POST /backend/api/v0/salon/subscription/payment/create-intent` with the data from `paymentRequestData`
2. Complete payment using Stripe.js
3. Check payment status using `GET /backend/api/v0/salon/subscription/payment/:paymentId/status`
4. Subscription is automatically created upon successful payment

**Important:** Use the `paymentRequestData` from the response to ensure the correct billing cycle and pricing are applied.

### Upgrade Subscription

**Endpoint:** `POST /backend/api/v0/salon/subscription/upgrade`

**Description:** Upgrade subscription with immediate activation. New features are available immediately with prorated billing.

**Request Body:**
```json
{
  "salonId": "salon-uuid",
  "planId": "00000000-0000-0000-0000-000000000002",
  "billingCycle": "yearly"
}
```

**Note:** Only `salonId` and `planId` are required. `billingCycle` is optional and keeps the current billing cycle if not provided. All pricing and billing details are calculated automatically from the selected plan.

**Response:**
```json
{
  "success": true,
  "message": "Subscription upgraded successfully. New features are now available. Amount automatically calculated from the selected plan.",
  "data": {
    "id": "subscription-uuid",
    "salonId": "salon-uuid",
    "planId": "00000000-0000-0000-0000-000000000002",
    "status": "active",
    "billingCycle": "yearly",
    "amount": 499.99,
    "upgradeType": "immediate"
  }
}
```

### Downgrade Subscription

**Endpoint:** `POST /backend/api/v0/salon/subscription/downgrade`

**Description:** Downgrade subscription with end-of-cycle activation. Changes take effect at the end of the current billing cycle.

**Request Body:**
```json
{
  "salonId": "salon-uuid",
  "planId": "00000000-0000-0000-0000-000000000001",
  "billingCycle": "monthly"
}
```

**Note:** Only `salonId` and `planId` are required. `billingCycle` is optional and keeps the current billing cycle if not provided. All pricing and billing details are calculated automatically from the selected plan.

**Response:**
```json
{
  "success": true,
  "message": "Subscription downgrade scheduled successfully. Changes will take effect at the end of your current billing cycle. Amount automatically calculated from the selected plan.",
  "data": {
    "id": "subscription-uuid",
    "salonId": "salon-uuid",
    "planId": "00000000-0000-0000-0000-000000000001",
    "status": "active",
    "billingCycle": "monthly",
    "amount": 19.99,
    "downgradeType": "end_of_cycle",
    "scheduledDowngradeDate": "2024-02-15T00:00:00.000Z"
  }
}
```

### Cancel Subscription

**Endpoint:** `POST /backend/api/v0/salon/subscription/cancel`

**Description:** Cancel an active subscription

**Request Body:**
```json
{
  "salonId": "salon-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "id": "subscription-uuid",
    "status": "cancelled"
  }
}
```

---

## Payment Management

### Create Payment Intent

**Endpoint:** `POST /backend/api/v0/salon/subscription/payment/create-intent`

**Description:** Creates a Stripe payment intent for subscription payment.

**Request Body:**
```json
{
  "salonId": "salon-uuid",
  "planId": "00000000-0000-0000-0000-000000000001",
  "billingCycle": "monthly"
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
    "amount": 19.99,
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
    "billingCycle": "monthly",
    "expiresAt": "2024-01-15T12:30:00.000Z"
  }
}
```

### Check Payment Status

**Endpoint:** `GET /backend/api/v0/salon/subscription/payment/:paymentId/status`

**Description:** Check payment status and get subscription details if payment was successful.

**Response (Pending):**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "payment-uuid",
      "status": "pending",
      "amount": 19.99,
      "billingCycle": "monthly",
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
      "amount": 19.99,
      "billingCycle": "monthly",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "expiresAt": "2024-01-15T12:30:00.000Z"
    },
    "subscription": {
      "id": "subscription-uuid",
      "status": "active",
      "startDate": "2024-01-15T12:05:00.000Z",
      "nextBillingDate": "2024-02-15T12:05:00.000Z",
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

### Get Payment Details

**Endpoint:** `GET /backend/api/v0/salon/subscription/payment/:paymentId`

**Description:** Get detailed payment information.

### Get Payment History

**Endpoint:** `GET /backend/api/v0/salon/subscription/payment/salon/:salonId`

**Description:** Get all payment history for a salon.

### Cancel Payment

**Endpoint:** `POST /backend/api/v0/salon/subscription/payment/:paymentId/cancel`

**Description:** Cancel a pending payment.

---

## Usage & Billing

### Get Subscription Usage

**Endpoint:** `GET /backend/api/v0/salon/subscription/usage/:salonId`

**Description:** Get current usage statistics for a subscription

**Parameters:**
- `salonId` (path): Salon UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "subscription-uuid",
      "status": "active"
    },
    "usage": {
      "bookings": 45,
      "staff": 2,
      "locations": 1
    },
    "limits": {
      "bookings": 100,
      "staff": 3,
      "locations": 1
    }
  }
}
```

### Get Billing History

**Endpoint:** `GET /backend/api/v0/salon/subscription/billing-history/:salonId`

**Description:** Get billing history for a subscription

**Parameters:**
- `salonId` (path): Salon UUID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "billing-uuid",
      "subscription_id": "subscription-uuid",
      "date": "2024-01-15T00:00:00.000Z",
      "amount": 19.99,
      "status": "paid",
      "description": "Monthly subscription payment",
      "invoice_number": "INV-001",
      "total": 19.99
    }
  ]
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Salon ID is required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. You can only view subscriptions for your own salons."
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "No active subscription found for this salon"
}
```

**422 Validation Error:**
```json
{
  "errors": [
    {
      "field": "salonId",
      "message": "Salon ID is required"
    }
  ]
}
```

---

## Response Formats

All successful responses follow this format:
```json
{
  "success": true,
  "message": "Optional success message",
  "data": {},
  "total": 0
}
```

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```
