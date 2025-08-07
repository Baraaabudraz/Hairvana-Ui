# Improved Customer Appointment API Documentation

## Overview

The Customer Appointment API has been refactored to follow REST API best practices with consistent response formats, proper error handling, and meaningful messages for all scenarios including empty data states.

## Key Improvements

### 1. **Consistent Response Format**
All endpoints now return a standardized response structure:

```json
{
  "success": true,
  "message": "Descriptive message about the operation",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    // Response data here
  }
}
```

### 2. **Enhanced Error Handling**
- Proper HTTP status codes
- Descriptive error messages
- Optional error details for development
- Consistent error response format

### 3. **Empty Data Handling**
- Meaningful messages when no data is found
- Clear indication of empty states
- Helpful guidance for users

## API Endpoints

### 1. Get Salon Availability
**GET** `/api/mobile/salons/:id/availability`

**Response Examples:**

**Success with available slots:**
```json
{
  "success": true,
  "message": "Salon availability retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "salon": {
      "id": "uuid",
      "name": "Hairvana Salon",
      "hours": { "monday": "9:00 AM - 6:00 PM" }
    },
    "availability": [
      {
        "date": "2024-01-15",
        "times": ["09:00", "10:00", "11:00"],
        "status": "available",
        "message": "3 time slots available"
      },
      {
        "date": "2024-01-16",
        "times": [],
        "status": "closed",
        "message": "Salon is closed on this day"
      }
    ],
    "total_days": 7,
    "available_days": 5
  }
}
```

**Salon not found:**
```json
{
  "success": false,
  "message": "Salon not found",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Book Appointment
**POST** `/api/mobile/appointments`

**Request Body:**
```json
{
  "salonId": "uuid",
  "staffId": "uuid",
  "start_at": "2024-01-20T14:00:00.000Z",
  "service_ids": ["uuid1", "uuid2"],
  "notes": "Optional notes",
  "special_requests": "Optional special requests"
}
```

**Response Examples:**

**Success:**
```json
{
  "success": true,
  "message": "Appointment booked successfully. Please complete payment to confirm your booking.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "appointment": {
      "id": "uuid",
      "status": "pending",
      "start_at": "2024-01-20T14:00:00.000Z",
      "total_price": 150.00,
      "services": [...]
    },
    "next_step": "Complete payment to confirm booking"
  }
}
```

**Validation Error:**
```json
{
  "success": false,
  "message": "Missing required fields. Please provide salonId, staffId, start_at, and at least one service.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Conflict Error:**
```json
{
  "success": false,
  "message": "This staff member is not available during the selected time. Please choose a different time or staff member.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Get Appointments
**GET** `/api/mobile/appointments`

**Query Parameters:**
- `status`: Filter by status (pending, booked, cancelled, completed)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (start_at, created_at, total_price)
- `order`: Sort order (ASC, DESC)
- `salon_id`: Filter by salon ID
- `staff_id`: Filter by staff ID
- `date_from`: Filter from date (ISO 8601)
- `date_to`: Filter to date (ISO 8601)

**Response Examples:**

**Success with appointments:**
```json
{
  "success": true,
  "message": "Successfully retrieved 5 appointments",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "appointments": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_count": 25,
      "limit": 20,
      "has_next_page": true,
      "has_prev_page": false
    },
    "filters": {
      "status": "booked",
      "salon_id": null,
      "staff_id": null,
      "date_from": null,
      "date_to": null,
      "sort": "start_at",
      "order": "DESC"
    }
  }
}
```

**No appointments found:**
```json
{
  "success": true,
  "message": "No appointments found. You haven't booked any appointments yet.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "appointments": [],
    "pagination": {
      "current_page": 1,
      "total_pages": 0,
      "total_count": 0,
      "limit": 20,
      "has_next_page": false,
      "has_prev_page": false
    },
    "filters": {...}
  }
}
```

### 4. Get Appointment by ID
**GET** `/api/mobile/appointments/:id`

**Response Examples:**

**Success:**
```json
{
  "success": true,
  "message": "Appointment details retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "appointment": {
      "id": "uuid",
      "status": "booked",
      "start_at": "2024-01-20T14:00:00.000Z",
      "salon": {...},
      "staff": {...},
      "services": [...],
      "payment": {...}
    }
  }
}
```

**Appointment not found:**
```json
{
  "success": false,
  "message": "Appointment not found. The appointment you're looking for doesn't exist or you don't have permission to view it.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Cancel Appointment
**PUT** `/api/mobile/appointments/:id/cancel`

**Request Body:**
```json
{
  "cancellation_reason": "Optional reason for cancellation"
}
```

**Response Examples:**

**Success:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "appointment": {
      "id": "uuid",
      "status": "cancelled",
      "cancelled_at": "2024-01-15T10:30:00.000Z"
    },
    "cancellation_details": {
      "cancelled_at": "2024-01-15T10:30:00.000Z",
      "cancelled_by": "user-uuid",
      "cancellation_reason": "Changed my mind"
    }
  }
}
```

**Already cancelled:**
```json
{
  "success": false,
  "message": "Appointment is already cancelled",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "details": {
    "current_status": "cancelled",
    "cancelled_at": "2024-01-15T09:00:00.000Z",
    "cancellation_reason": "Previous cancellation"
  }
}
```

### 6. Get Appointment Statistics
**GET** `/api/mobile/appointments/stats`

**Response Examples:**

**Success with data:**
```json
{
  "success": true,
  "message": "Appointment statistics retrieved successfully. You have 15 total appointments.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "stats": {
      "total": 15,
      "upcoming": 3,
      "by_status": {
        "booked": 8,
        "completed": 5,
        "cancelled": 2
      }
    },
    "summary": {
      "total_appointments": 15,
      "upcoming_appointments": 3,
      "completed_appointments": 5,
      "cancelled_appointments": 2,
      "pending_appointments": 0
    }
  }
}
```

**No appointments:**
```json
{
  "success": true,
  "message": "No appointment statistics available. You haven't booked any appointments yet.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "stats": {
      "total": 0,
      "upcoming": 0,
      "by_status": {}
    },
    "summary": {
      "total_appointments": 0,
      "upcoming_appointments": 0,
      "completed_appointments": 0,
      "cancelled_appointments": 0,
      "pending_appointments": 0
    }
  }
}
```

### 7. Get Salon Services
**GET** `/api/mobile/salons/:salon_id/services`

**Response Examples:**

**Success with services:**
```json
{
  "success": true,
  "message": "Successfully retrieved 8 services for this salon.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "salon": {
      "id": "uuid",
      "name": "Hairvana Salon"
    },
    "services": [
      {
        "id": "uuid",
        "name": "Haircut",
        "description": "Professional haircut service",
        "price": 50.00,
        "duration": 60,
        "image_url": "https://example.com/haircut.jpg"
      }
    ],
    "total_services": 8
  }
}
```

**No services available:**
```json
{
  "success": true,
  "message": "No services available at this salon yet.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "salon": {
      "id": "uuid",
      "name": "Hairvana Salon"
    },
    "services": [],
    "total_services": 0
  }
}
```

## Error Response Format

All error responses follow this consistent format:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "details": {
    // Optional additional error details (development only)
  }
}
```

## HTTP Status Codes

- **200**: Success
- **201**: Created (appointment booked)
- **400**: Bad Request (validation errors)
- **404**: Not Found (resource not found)
- **409**: Conflict (appointment time conflict)
- **500**: Internal Server Error

## Best Practices Implemented

### 1. **Consistent Response Structure**
- All responses include `success`, `message`, and `timestamp`
- Data is wrapped in a `data` object
- Error responses include optional `details`

### 2. **Meaningful Messages**
- Success messages describe what was accomplished
- Error messages explain what went wrong and how to fix it
- Empty data messages guide users on next steps

### 3. **Proper Error Handling**
- Validation errors with specific field information
- Business logic errors with clear explanations
- System errors with appropriate status codes

### 4. **Empty State Handling**
- Clear messages when no data is found
- Helpful guidance for users
- Consistent empty data structure

### 5. **Pagination Support**
- Standard pagination parameters
- Clear pagination metadata
- Consistent pagination structure

### 6. **Filtering and Sorting**
- Flexible query parameters
- Clear parameter validation
- Consistent filter structure

### 7. **Security**
- User authentication required
- Resource ownership validation
- Proper authorization checks

## Development vs Production

In development mode, error responses include additional details:

```json
{
  "success": false,
  "message": "Failed to fetch appointments. Please try again.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "details": "SequelizeConnectionError: Connection timeout"
}
```

In production, error details are omitted for security:

```json
{
  "success": false,
  "message": "Failed to fetch appointments. Please try again.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Testing Examples

### Test Empty Appointments
```bash
curl -X GET "http://localhost:3000/api/mobile/appointments" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Appointment Booking
```bash
curl -X POST "http://localhost:3000/api/mobile/appointments" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salonId": "salon-uuid",
    "staffId": "staff-uuid",
    "start_at": "2024-01-20T14:00:00.000Z",
    "service_ids": ["service-uuid1", "service-uuid2"],
    "notes": "First time visit"
  }'
```

### Test Cancellation
```bash
curl -X PUT "http://localhost:3000/api/mobile/appointments/appointment-uuid/cancel" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cancellation_reason": "Schedule conflict"
  }'
```

This improved API provides a much better user experience with clear messaging, proper error handling, and consistent response formats that follow REST API best practices. 