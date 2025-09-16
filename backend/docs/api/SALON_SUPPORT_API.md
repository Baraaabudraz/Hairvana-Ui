# Salon Owner Support API Documentation

This document describes the API endpoints available for salon owners to manage their technical support tickets.

## Base URL
```
/backend/api/v0/salon/support
```

## Authentication
All endpoints require salon owner authentication using the `authenticateOwner` middleware.

## Endpoints

### 1. Get Support Statistics
**GET** `/stats`

Returns support ticket statistics for the authenticated salon owner.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "by_status": {
      "open": 2,
      "in_progress": 1,
      "resolved": 2,
      "closed": 0
    },
    "by_category": [
      { "category": "technical_support", "count": 3 },
      { "category": "billing_issue", "count": 2 }
    ],
    "by_priority": [
      { "priority": "medium", "count": 4 },
      { "priority": "high", "count": 1 }
    ]
  }
}
```

### 2. Get Support Categories
**GET** `/categories`

Returns available support categories with descriptions.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "value": "subscription_cancellation",
      "label": "Subscription Cancellation",
      "description": "Request to cancel or modify subscription"
    },
    {
      "value": "refund_request",
      "label": "Refund Request",
      "description": "Request a refund for payments"
    },
    {
      "value": "billing_issue",
      "label": "Billing Issue",
      "description": "Problems with billing or payments"
    },
    {
      "value": "technical_support",
      "label": "Technical Support",
      "description": "Technical issues with the platform"
    },
    {
      "value": "account_issue",
      "label": "Account Issue",
      "description": "Problems with account access or settings"
    },
    {
      "value": "feature_request",
      "label": "Feature Request",
      "description": "Suggest new features or improvements"
    },
    {
      "value": "general_inquiry",
      "label": "General Inquiry",
      "description": "General questions or information requests"
    },
    {
      "value": "bug_report",
      "label": "Bug Report",
      "description": "Report a bug or unexpected behavior"
    }
  ]
}
```

### 3. Get My Subscriptions
**GET** `/subscriptions`

Returns active subscriptions for the salon owner to provide context when creating support tickets.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "plan_id": "uuid",
      "status": "active",
      "start_date": "2024-01-01T00:00:00.000Z",
      "next_billing_date": "2024-02-01T00:00:00.000Z",
      "plan": {
        "id": "uuid",
        "name": "Professional Plan",
        "price": 99.99,
        "billing_cycle": "monthly"
      }
    }
  ]
}
```

### 4. Get My Support Tickets
**GET** `/tickets`

Returns paginated list of support tickets created by the salon owner.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `status` (optional): Filter by status (open, in_progress, pending_user, resolved, closed)
- `category` (optional): Filter by category
- `priority` (optional): Filter by priority (low, medium, high, urgent)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "ticket_number": "ST-123456-789",
      "category": "technical_support",
      "priority": "medium",
      "status": "open",
      "subject": "Login issues",
      "description": "Unable to login to dashboard",
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z",
      "assignedAdmin": {
        "id": "uuid",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "subscription": {
        "id": "uuid",
        "plan_id": "uuid",
        "status": "active"
      },
      "messages": [
        {
          "id": "uuid",
          "message": "Unable to login to dashboard",
          "created_at": "2024-01-15T10:00:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### 5. Get Support Ticket by ID
**GET** `/tickets/:id`

Returns detailed information about a specific support ticket (only if created by the salon owner).

**Parameters:**
- `id`: Support ticket UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "ticket_number": "ST-123456-789",
    "category": "technical_support",
    "priority": "medium",
    "status": "open",
    "subject": "Login issues",
    "description": "Unable to login to dashboard",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "user": {
      "id": "uuid",
      "name": "Salon Owner",
      "email": "owner@salon.com",
      "avatar": "avatar_url"
    },
    "assignedAdmin": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@example.com",
      "avatar": "avatar_url"
    },
    "subscription": {
      "id": "uuid",
      "plan_id": "uuid",
      "status": "active"
    },
    "messages": [
      {
        "id": "uuid",
        "message": "Unable to login to dashboard",
        "created_at": "2024-01-15T10:00:00.000Z",
        "sender": {
          "id": "uuid",
          "name": "Salon Owner",
          "email": "owner@salon.com",
          "avatar": "avatar_url"
        }
      }
    ]
  }
}
```

### 6. Create Support Ticket
**POST** `/tickets`

Creates a new support ticket for the salon owner.

**Request Body:**
```json
{
  "category": "technical_support",
  "subject": "Login issues",
  "description": "Unable to login to dashboard after password reset",
  "priority": "medium",
  "subscription_id": "uuid",
  "metadata": {
    "browser": "Chrome",
    "version": "120.0"
  }
}
```

**Validation Rules:**
- `category`: Required, must be one of the valid categories
- `subject`: Required, 5-200 characters
- `description`: Required, minimum 10 characters
- `priority`: Optional, must be low/medium/high/urgent (default: medium)
- `subscription_id`: Optional, must be valid UUID
- `metadata`: Optional, must be object

**Response:**
```json
{
  "success": true,
  "message": "Support ticket created successfully",
  "data": {
    "id": "uuid",
    "ticket_number": "ST-123456-789",
    "category": "technical_support",
    "priority": "medium",
    "status": "open",
    "subject": "Login issues",
    "description": "Unable to login to dashboard after password reset",
    "created_at": "2024-01-15T10:00:00.000Z",
    "user": {
      "id": "uuid",
      "name": "Salon Owner",
      "email": "owner@salon.com"
    },
    "subscription": {
      "id": "uuid",
      "plan_id": "uuid",
      "status": "active"
    }
  }
}
```

### 7. Add Message to Support Ticket
**POST** `/tickets/:id/messages`

Adds a message to an existing support ticket (only if created by the salon owner).

**Parameters:**
- `id`: Support ticket UUID

**Request Body:**
```json
{
  "message": "I've tried clearing my browser cache but the issue persists."
}
```

**Validation Rules:**
- `message`: Required, cannot be empty

**Response:**
```json
{
  "success": true,
  "message": "Message added successfully",
  "data": {
    "id": "uuid",
    "message": "I've tried clearing my browser cache but the issue persists.",
    "created_at": "2024-01-15T11:00:00.000Z",
    "sender": {
      "id": "uuid",
      "name": "Salon Owner",
      "email": "owner@salon.com",
      "avatar": "avatar_url"
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "type": "field",
      "msg": "Subject must be between 5 and 200 characters",
      "path": "subject",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Only salon owners can access this endpoint."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Support ticket not found or access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Support ticket not found or access denied"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create support ticket",
  "error": "Database connection error"
}
```

## Security Features

1. **Authentication**: All endpoints require salon owner authentication
2. **Authorization**: Salon owners can only access their own tickets
3. **Input Validation**: Comprehensive validation on all inputs
4. **Rate Limiting**: Built-in rate limiting middleware
5. **Data Sanitization**: All inputs are sanitized and validated
6. **Audit Trail**: All actions are logged with timestamps

## Best Practices

1. **Use HTTPS**: Always use HTTPS in production
2. **Handle Errors**: Implement proper error handling in client applications
3. **Pagination**: Use pagination for large datasets
4. **Caching**: Cache static data like categories and subscriptions
5. **Monitoring**: Monitor API usage and performance
6. **Documentation**: Keep API documentation updated

## Example Usage

### JavaScript/TypeScript
```javascript
// Get support categories
const categories = await fetch('/backend/api/v0/salon/support/categories', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Create support ticket
const ticket = await fetch('/backend/api/v0/salon/support/tickets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    category: 'technical_support',
    subject: 'Login issues',
    description: 'Unable to login to dashboard after password reset',
    priority: 'medium'
  })
});
```

### cURL
```bash
# Get support statistics
curl -X GET "http://localhost:5000/backend/api/v0/salon/support/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create support ticket
curl -X POST "http://localhost:5000/backend/api/v0/salon/support/tickets" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "technical_support",
    "subject": "Login issues",
    "description": "Unable to login to dashboard after password reset",
    "priority": "medium"
  }'
```
