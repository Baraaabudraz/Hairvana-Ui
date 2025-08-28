# Salon Subscription API

This document describes the new salon subscription API endpoints that allow salon owners to manage their subscription plans.

## Overview

The salon subscription API provides endpoints for:
- Getting available subscription plans
- Subscribing to plans
- Managing existing subscriptions
- Viewing usage and billing history

## Base URL

```
/backend/api/v0/salon/subscription
```

## Authentication

All endpoints require salon owner authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get Subscription Plans

**GET** `/plans`

Get all available subscription plans.

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

### 2. Get Subscription Plan by ID

**GET** `/plans/:id`

Get a specific subscription plan by ID.

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

### 3. Get Current Subscription

**GET** `/current/:salonId`

Get the current subscription for a salon.

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

### 4. Subscribe to a Plan

**POST** `/subscribe`

Subscribe a salon to a subscription plan.

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
  "message": "Successfully subscribed to plan",
  "data": {
    "id": "subscription-uuid",
    "salonId": "salon-uuid",
    "planId": "00000000-0000-0000-0000-000000000001",
    "status": "active",
    "startDate": "2024-01-15T00:00:00.000Z",
    "billingCycle": "monthly",
    "amount": 19.99
  }
}
```

### 5. Upgrade Subscription

**POST** `/upgrade`

Upgrade subscription with immediate activation. New features are available immediately with prorated billing.

**Request Body:**
```json
{
  "salonId": "salon-uuid",
  "planId": "00000000-0000-0000-0000-000000000002",
  "billingCycle": "yearly"
}
```

**Note:** The `amount` field is not accepted in the request body as it is automatically calculated from the selected plan's pricing.

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

### 6. Downgrade Subscription

**POST** `/downgrade`

Downgrade subscription with end-of-cycle activation. Changes take effect at the end of the current billing cycle.

**Request Body:**
```json
{
  "salonId": "salon-uuid",
  "planId": "00000000-0000-0000-0000-000000000001",
  "billingCycle": "monthly"
}
```

**Note:** The `amount` field is not accepted in the request body as it is automatically calculated from the selected plan's pricing.

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

### 7. Cancel Subscription

**POST** `/cancel`

Cancel an active subscription.

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

### 8. Get Subscription Usage

**GET** `/usage/:salonId`

Get current usage statistics for a subscription.

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

### 9. Get Billing History

**GET** `/billing-history/:salonId`

Get billing history for a subscription.

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

## Testing

Use the provided test file `test-salon-subscription-endpoints.js` to test the endpoints:

1. Update the `AUTH_TOKEN` variable with a valid JWT token
2. Update the `testSalonId` variable with a valid salon ID
3. Run the test:

```bash
node test-salon-subscription-endpoints.js
```

## Files Created/Modified

### New Files:
- `routes/Api/v0/salon/subscription.js` - Subscription routes
- `controllers/Api/salon/salonSubscriptionController.js` - Subscription controller
- `docs/api/salon/subscription.md` - API documentation
- `test-salon-subscription-endpoints.js` - Test file
- `SALON_SUBSCRIPTION_API_README.md` - This README

### Modified Files:
- `services/subscriptionService.js` - Added new methods
- `repositories/subscriptionRepository.js` - Added new methods
- `server.js` - Added subscription routes

## Security Features

- All endpoints require salon owner authentication
- Salon ownership verification for all operations
- Input validation using express-validator
- Proper error handling and status codes

## Usage Examples

### Frontend Integration

```javascript
// Get subscription plans
const plans = await fetch('/backend/api/v0/salon/subscription/plans', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Subscribe to a plan
const subscription = await fetch('/backend/api/v0/salon/subscription/subscribe', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    salonId: 'salon-uuid',
    planId: 'plan-uuid',
    billingCycle: 'monthly'
  })
});
```

## Next Steps

1. Test the endpoints with real data
2. Integrate with payment processing (Stripe, etc.)
3. Add webhook handling for subscription events
4. Implement usage tracking and limits enforcement
5. Add subscription analytics and reporting
