# Improved Staff API Documentation

## Overview

The Staff API has been refactored to follow REST API best practices with consistent response formats, proper error handling, meaningful messages, and urlHelper integration for image URLs.

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

### 3. **URL Helper Integration**
- All image URLs generated through urlHelper
- Consistent base URL handling
- Environment-based configuration

### 4. **Advanced Features**
- Pagination support
- Filtering and sorting
- Search functionality
- Role-based filtering
- Service associations
- Salon information

## API Endpoints

### 1. Get Staff for Salon
**GET** `/api/mobile/salons/:salon_id/staff`

**Path Parameters:**
- `salon_id`: Salon ID (UUID format)

**Query Parameters:**
- `status`: Filter by status (default: 'active')
- `role`: Filter by role (stylist, assistant, manager, receptionist, apprentice)
- `specialization`: Filter by specialization
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (name, experience_years, hourly_rate)
- `order`: Sort order (ASC, DESC)

**Response Examples:**

**Success with staff:**
```json
{
  "success": true,
  "message": "Successfully retrieved 8 staff members",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "staff": [
      {
        "id": "uuid",
        "name": "Sarah Johnson",
        "email": "sarah@hairvana.com",
        "phone": "+1234567890",
        "avatar": "http://localhost:5000/images/staff/staff-avatar.jpg",
        "bio": "Experienced hairstylist with 8 years in the industry",
        "role": "stylist",
        "specializations": ["Haircut", "Styling", "Color"],
        "experience_years": 8,
        "hourly_rate": 75.00,
        "status": "active",
        "working_hours": {
          "monday": "9:00 AM - 6:00 PM",
          "tuesday": "9:00 AM - 6:00 PM"
        },
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z",
        "salon": {
          "id": "uuid",
          "name": "Hairvana Salon",
          "avatar": "http://localhost:5000/images/salon/salon-avatar.jpg"
        },
        "services": [
          {
            "id": "uuid",
            "name": "Haircut",
            "description": "Professional haircut service",
            "price": 50.00,
            "duration": 60
          }
        ],
        "total_services": 5
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_count": 12,
      "limit": 20,
      "has_next_page": true,
      "has_prev_page": false
    },
    "filters": {
      "salon_id": "uuid",
      "status": "active",
      "role": null,
      "specialization": null,
      "sort": "name",
      "order": "ASC"
    },
    "summary": {
      "total_staff": 12,
      "filtered_count": 8,
      "by_role": {
        "stylist": 5,
        "assistant": 2,
        "manager": 1,
        "receptionist": 2,
        "apprentice": 2
      },
      "by_status": {
        "active": 10,
        "inactive": 1,
        "on_leave": 1,
        "terminated": 0
      }
    }
  }
}
```

**No staff found:**
```json
{
  "success": true,
  "message": "No staff found for this salon. There are no staff members available at the moment.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "staff": [],
    "pagination": {
      "current_page": 1,
      "total_pages": 0,
      "total_count": 0,
      "limit": 20,
      "has_next_page": false,
      "has_prev_page": false
    },
    "filters": {...},
    "summary": {
      "total_staff": 0,
      "filtered_count": 0,
      "by_role": {...},
      "by_status": {...}
    }
  }
}
```

**Invalid salon ID:**
```json
{
  "success": false,
  "message": "Invalid salon ID format",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get Staff by ID
**GET** `/api/mobile/staff/:id`

**Response Examples:**

**Success:**
```json
{
  "success": true,
  "message": "Staff details retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "staff": {
      "id": "uuid",
      "name": "Sarah Johnson",
      "email": "sarah@hairvana.com",
      "phone": "+1234567890",
      "avatar": "http://localhost:5000/images/staff/staff-avatar.jpg",
      "bio": "Experienced hairstylist with 8 years in the industry",
      "role": "stylist",
      "specializations": ["Haircut", "Styling", "Color"],
      "experience_years": 8,
      "hourly_rate": 75.00,
      "status": "active",
      "working_hours": {
        "monday": "9:00 AM - 6:00 PM",
        "tuesday": "9:00 AM - 6:00 PM"
      },
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "salon": {
        "id": "uuid",
        "name": "Hairvana Salon",
        "description": "Professional hair styling services",
        "phone": "+1234567890",
        "email": "info@hairvana.com",
        "avatar": "http://localhost:5000/images/salon/salon-avatar.jpg"
      },
      "services": [
        {
          "id": "uuid",
          "name": "Haircut",
          "description": "Professional haircut service",
          "price": 50.00,
          "duration": 60,
          "image_url": "http://localhost:5000/images/services/service-image.jpg"
        }
      ],
      "total_services": 5,
      "availability": {
        "is_available": true,
        "working_hours": {
          "monday": "9:00 AM - 6:00 PM",
          "tuesday": "9:00 AM - 6:00 PM"
        },
        "experience_summary": "8 years of experience",
        "specializations_summary": "Haircut, Styling, Color"
      }
    }
  }
}
```

**Staff not found:**
```json
{
  "success": false,
  "message": "Staff not found. The staff member you're looking for doesn't exist or may have been removed.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Invalid ID format:**
```json
{
  "success": false,
  "message": "Invalid staff ID format",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Search Staff
**GET** `/api/mobile/staff/search`

**Query Parameters:**
- `q`: Search query (required)
- `salon_id`: Filter by salon ID
- `role`: Filter by role
- `status`: Filter by status (default: 'active')
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response Examples:**

**Success with results:**
```json
{
  "success": true,
  "message": "Found 5 staff members matching your search",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "staff": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_count": 5,
      "limit": 20,
      "has_next_page": false,
      "has_prev_page": false
    },
    "search": {
      "query": "haircut",
      "salon_id": "uuid",
      "role": "stylist",
      "status": "active",
      "results_count": 5
    }
  }
}
```

**No results:**
```json
{
  "success": true,
  "message": "No staff found matching your search criteria.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "staff": [],
    "pagination": {...},
    "search": {
      "query": "nonexistent",
      "salon_id": null,
      "role": null,
      "status": "active",
      "results_count": 0
    }
  }
}
```

**Missing search query:**
```json
{
  "success": false,
  "message": "Search query is required",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Get Staff by Role
**GET** `/api/mobile/staff/role/:role`

**Path Parameters:**
- `role`: Staff role (stylist, assistant, manager, receptionist, apprentice)

**Query Parameters:**
- `salon_id`: Filter by salon ID
- `status`: Filter by status (default: 'active')
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response Examples:**

**Success:**
```json
{
  "success": true,
  "message": "Found 8 stylists",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "staff": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_count": 8,
      "limit": 20,
      "has_next_page": false,
      "has_prev_page": false
    },
    "role": {
      "name": "stylist",
      "total_count": 8
    }
  }
}
```

**Invalid role:**
```json
{
  "success": false,
  "message": "Invalid role. Valid roles are: stylist, assistant, manager, receptionist, apprentice",
  "timestamp": "2024-01-15T10:30:00.000Z"
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
- **400**: Bad Request (validation errors)
- **404**: Not Found (staff not found)
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

### 4. **URL Helper Integration**
- All image URLs generated through urlHelper
- Consistent base URL handling
- Environment-based configuration

### 5. **Pagination Support**
- Standard pagination parameters
- Clear pagination metadata
- Consistent pagination structure

### 6. **Filtering and Sorting**
- Flexible query parameters
- Clear parameter validation
- Consistent filter structure

### 7. **Advanced Features**
- Search functionality with multiple field matching
- Role-based filtering
- Service associations
- Salon information integration
- Availability information

## URL Helper Integration

The API uses urlHelper for consistent image URL generation:

```javascript
// Staff avatar
avatar: buildUrl(staff.avatar, 'staff')

// Salon avatar
avatar: buildUrl(staff.salon.avatar, 'salon')

// Service images
image_url: buildUrl(service.image_url, 'service')
```

## Staff Data Structure

Each staff member includes comprehensive information:

```javascript
{
  "id": "uuid",
  "name": "Staff name",
  "email": "staff@email.com",
  "phone": "+1234567890",
  "avatar": "full URL to staff avatar",
  "bio": "Staff biography",
  "role": "stylist|assistant|manager|receptionist|apprentice",
  "specializations": ["Haircut", "Styling", "Color"],
  "experience_years": 8,
  "hourly_rate": 75.00,
  "status": "active|inactive|on_leave|terminated",
  "working_hours": {
    "monday": "9:00 AM - 6:00 PM",
    "tuesday": "9:00 AM - 6:00 PM"
  },
  "salon": {
    "id": "uuid",
    "name": "Salon name",
    "avatar": "full URL to salon avatar"
  },
  "services": [...],
  "total_services": 5,
  "availability": {
    "is_available": true,
    "working_hours": {...},
    "experience_summary": "8 years of experience",
    "specializations_summary": "Haircut, Styling, Color"
  }
}
```

## Valid Role Values

The Staff model supports the following role values:

- **stylist**: Professional hairstylist
- **assistant**: Salon assistant
- **manager**: Salon manager
- **receptionist**: Front desk receptionist
- **apprentice**: Trainee/apprentice

## Valid Status Values

The Staff model supports the following status values:

- **active**: Currently working
- **inactive**: Not currently working
- **on_leave**: On leave/vacation
- **terminated**: No longer employed

## Development vs Production

In development mode, error responses include additional details:

```json
{
  "success": false,
  "message": "Failed to fetch staff. Please try again.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "details": "SequelizeConnectionError: Connection timeout"
}
```

In production, error details are omitted for security:

```json
{
  "success": false,
  "message": "Failed to fetch staff. Please try again.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Testing Examples

### Test Get Staff for Salon
```bash
curl -X GET "http://localhost:5000/backend/api/mobile/salons/salon-uuid/staff?page=1&limit=10&role=stylist" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Get Staff by ID
```bash
curl -X GET "http://localhost:5000/backend/api/mobile/staff/staff-uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Search Staff
```bash
curl -X GET "http://localhost:5000/backend/api/mobile/staff/search?q=haircut&role=stylist" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Get Staff by Role
```bash
curl -X GET "http://localhost:5000/backend/api/mobile/staff/role/stylist?salon_id=salon-uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Service Integration Features

The API includes comprehensive service integration:

1. **Service Associations**: Each staff member includes their associated services
2. **Service Details**: Complete service information with pricing and duration
3. **Service Images**: Service images with proper URL generation
4. **Service Count**: Total number of services per staff member

## Salon Integration Features

The API includes comprehensive salon integration:

1. **Salon Information**: Each staff member includes their salon details
2. **Salon Avatar**: Salon images with proper URL generation
3. **Salon Contact**: Salon contact information for booking purposes

This improved Staff API provides a comprehensive solution for staff discovery, search, and service integration with clear messaging, proper error handling, consistent response formats, and advanced features that follow REST API best practices. 