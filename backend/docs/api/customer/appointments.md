# Customer Appointments API Documentation

## Overview

This API provides endpoints for managing customer appointments in the Hairvana mobile application. All endpoints require customer authentication via JWT token.

**Base URL:** `/api/mobile`

**Authentication:** Bearer token required in Authorization header

---

## Table of Contents

1. [Authentication](#authentication)
2. [Availability & Services](#availability--services)
3. [Appointment Management](#appointment-management)
4. [Error Handling](#error-handling)
5. [Response Formats](#response-formats)

---

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## Availability & Services

### Get Salon Availability

**Endpoint:** `GET /api/mobile/salons/:id/availability`

**Description:** Get available time slots for a specific salon

**Parameters:**
- `id` (path): Salon UUID

**Response:**
```json
{
  "success": true,
  "availability": [
    {
      "date": "2024-01-15",
      "times": ["09:00", "10:00", "11:00", "14:00", "15:00"]
    },
    {
      "date": "2024-01-16",
      "times": ["09:00", "10:00", "11:00"]
    }
  ]
}
```

### Get Salon Services

**Endpoint:** `GET /api/mobile/salons/:salon_id/services`

**Description:** Get all services available at a specific salon

**Parameters:**
- `salon_id` (path): Salon UUID

**Response:**
```json
{
  "success": true,
  "services": [
    {
      "id": "service-uuid",
      "name": "Hair Cut",
      "description": "Professional hair cutting service",
      "price": 45.00,
      "duration": 60,
      "image_url": "https://example.com/haircut.jpg"
    }
  ]
}
```

### Get All Services

**Endpoint:** `GET /api/mobile/services`

**Description:** Get all available services (for debugging/development)

**Response:**
```json
{
  "success": true,
  "services": [
    {
      "id": "service-uuid",
      "name": "Hair Cut",
      "description": "Professional hair cutting service",
      "price": 45.00,
      "duration": 60
    }
  ]
}
```

---

## Appointment Management

### Book Appointment

**Endpoint:** `POST /api/mobile/appointments`

**Description:** Book a new appointment

**Request Body:**
```json
{
  "salonId": "salon-uuid",
  "staffId": "staff-uuid",
  "start_at": "2024-01-15T10:00:00.000Z",
  "service_ids": ["service-uuid-1", "service-uuid-2"],
  "notes": "Special requests or notes"
}
```

**Response:**
```json
{
  "success": true,
  "appointment": {
    "id": "appointment-uuid",
    "status": "pending",
    "start_at": "2024-01-15T10:00:00.000Z",
    "end_at": "2024-01-15T11:00:00.000Z",
    "total_price": 90.00,
    "duration": 60,
    "notes": "Special requests or notes",
    "salon": { /* salon details */ },
    "staff": { /* staff details */ },
    "services": [ /* service details */ ]
  }
}
```

### Get Appointments

**Endpoint:** `GET /api/mobile/appointments`

**Description:** Get all appointments for the current user with filtering and pagination

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `booked`, `cancelled`, `completed`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `sort` (optional): Sort field (`start_at`, `created_at`, `total_price`)
- `order` (optional): Sort order (`ASC`, `DESC`)
- `salon_id` (optional): Filter by salon ID
- `staff_id` (optional): Filter by staff ID
- `date_from` (optional): Filter from date (ISO 8601)
- `date_to` (optional): Filter to date (ISO 8601)

**Example Request:**
```
GET /api/mobile/appointments?status=booked&page=1&limit=10&sort=start_at&order=ASC
```

**Response:**
```json
{
  "success": true,
  "appointments": [
    {
      "id": "appointment-uuid",
      "user_id": "user-uuid",
      "salon_id": "salon-uuid",
      "staff_id": "staff-uuid",
      "start_at": "2024-01-15T10:00:00.000Z",
      "end_at": "2024-01-15T11:00:00.000Z",
      "status": "booked",
      "notes": "Special requests",
      "total_price": 90.00,
      "duration": 60,
      "special_requests": "Please use organic products",
      "cancellation_reason": null,
      "cancelled_at": null,
      "cancelled_by": null,
      "created_at": "2024-01-10T09:00:00.000Z",
      "updated_at": "2024-01-10T09:00:00.000Z",
      
      // Calculated fields
      "time_until_appointment": 5,
      "is_upcoming": true,
      "is_past": false,
      "is_today": false,
      "time_details": {
        "days_until": 5,
        "hours_until": 120,
        "minutes_until": 7200,
        "formatted_date": "Monday, January 15, 2024",
        "formatted_time": "10:00 AM",
        "formatted_end_time": "11:00 AM"
      },
      
      // Related data
      "salon": {
        "id": "salon-uuid",
        "name": "Hairvana Salon",
        "phone": "+1234567890",
        "email": "salon@hairvana.com",
        "avatar": "https://example.com/salon.jpg",
        "description": "Professional hair salon",
        "hours": { /* business hours */ },
        "website": "https://hairvana.com",
        "address": {
          "id": "address-uuid",
          "street_address": "123 Main Street",
          "city": "New York",
          "state": "NY",
          "zip_code": "10001",
          "country": "US",
          "full_address": "123 Main Street, New York, NY 10001, US"
        }
      },
      "staff": {
        "id": "staff-uuid",
        "name": "John Doe",
        "avatar": "https://example.com/staff.jpg",
        "specializations": ["Hair Cutting", "Coloring"],
        "experience_years": 5,
        "bio": "Professional stylist with 5 years experience",
        "role": "stylist",
        "status": "active",
        "hourly_rate": 25.00
      },
      "services": [
        {
          "id": "service-uuid",
          "name": "Hair Cut",
          "description": "Professional hair cutting service",
          "price": 45.00,
          "duration": 30,
          "image_url": "https://example.com/haircut.jpg"
        }
      ],
      "payment": {
        "id": "payment-uuid",
        "amount": 90.00,
        "method": "credit_card",
        "status": "completed",
        "transaction_id": "txn_123456789",
        "created_at": "2024-01-10T09:00:00.000Z",
        "updated_at": "2024-01-10T09:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 100,
    "limit": 20,
    "has_next_page": true,
    "has_prev_page": false
  }
}
```

### Get Appointment Statistics

**Endpoint:** `GET /api/mobile/appointments/stats`

**Description:** Get appointment statistics for the current user

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 25,
    "upcoming": 3,
    "by_status": {
      "booked": 15,
      "completed": 8,
      "cancelled": 2,
      "pending": 0
    }
  }
}
```

### Get Appointment by ID

**Endpoint:** `GET /api/mobile/appointments/:id`

**Description:** Get a specific appointment by ID

**Parameters:**
- `id` (path): Appointment UUID

**Response:** Same as individual appointment object in the list response

### Cancel Appointment

**Endpoint:** `PUT /api/mobile/appointments/:id/cancel`

**Description:** Cancel an existing appointment

**Parameters:**
- `id` (path): Appointment UUID

**Request Body:**
```json
{
  "cancellation_reason": "Changed my mind"
}
```

**Response:**
```json
{
  "success": true,
  "appointment": {
    "id": "appointment-uuid",
    "status": "cancelled",
    "cancelled_at": "2024-01-12T10:30:00.000Z",
    "cancelled_by": "user-uuid",
    "cancellation_reason": "Changed my mind",
    // ... other appointment fields
  }
}
```

**Notes:**
- The `cancellation_reason` field is optional
- If not provided, it defaults to "Cancelled by user"
- Cannot cancel already cancelled appointments
- Cannot cancel completed appointments
- A notification is sent to the user about the cancellation

### Complete Appointment

**Endpoint:** `PUT /api/mobile/appointments/:id/complete`

**Description:** Mark an appointment as completed

**Parameters:**
- `id` (path): Appointment UUID

**Response:**
```json
{
  "success": true,
  "appointment": {
    "id": "appointment-uuid",
    "status": "completed",
    // ... other appointment fields
  }
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request parameters or validation errors |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Appointment time conflict or business rule violation |
| 422 | Unprocessable Entity | Validation errors |
| 500 | Internal Server Error | Server error |

### Validation Error Example

```json
{
  "error": "Validation failed",
  "message": "Request validation failed",
  "details": {
    "salonId": "Salon ID is required",
    "start_at": "Start time must be in the future"
  }
}
```

### Business Rule Error Examples

**Already Cancelled:**
```json
{
  "error": "Appointment is already cancelled",
  "message": "This appointment has already been cancelled and cannot be cancelled again."
}
```

**Completed Appointment:**
```json
{
  "error": "Cannot cancel completed appointment",
  "message": "This appointment has already been completed and cannot be cancelled."
}
```

**Time Conflict:**
```json
{
  "error": "Time slot not available",
  "message": "This staff member already has an appointment during the selected time."
}
```

---

## Response Formats

### Success Response

All successful responses follow this format:

```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Pagination Response

For endpoints with pagination:

```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 100,
    "limit": 20,
    "has_next_page": true,
    "has_prev_page": false
  }
}
```

---

## Rate Limiting

All endpoints are subject to rate limiting:
- 100 requests per minute per user
- 1000 requests per hour per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642000000
```

---

## Versioning

This API is versioned through the URL path:
- Current version: `/api/mobile` (v1)
- Future versions: `/api/mobile/v2`, etc.

---

## Support

For API support or questions, please contact:
- Email: api-support@hairvana.com
- Documentation: https://docs.hairvana.com/api
- Status: https://status.hairvana.com 