# Improved Salon API Documentation

## Overview

The Salon API has been refactored to follow REST API best practices with consistent response formats, proper error handling, meaningful messages, and urlHelper integration for image URLs.

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
- Rating calculations
- Search functionality
- Staff information
- Recent reviews

## API Endpoints

### 1. Get All Salons
**GET** `/api/mobile/salons`

**Query Parameters:**
- `location`: Filter by location (city/state)
- `name`: Filter by salon name
- `rating`: Filter by minimum rating
- `status`: Filter by status (default: 'active')
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (name, created_at, rating)
- `order`: Sort order (ASC, DESC)

**Response Examples:**

**Success with salons:**
```json
{
  "success": true,
  "message": "Successfully retrieved 5 salons",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "salons": [
      {
        "id": "uuid",
        "name": "Hairvana Salon",
        "description": "Professional hair styling services",
        "phone": "+1234567890",
        "email": "info@hairvana.com",
        "website": "https://hairvana.com",
        "hours": {
          "monday": "9:00 AM - 6:00 PM",
          "tuesday": "9:00 AM - 6:00 PM"
        },
        "avatar": "http://localhost:5000/backend/uploads/salons/550e8400-e29b-41d4-a716-446655440000.jpg",
        "status": "active",
        "address": {
          "id": "uuid",
          "street_address": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zip_code": "10001",
          "country": "USA",
          "full_address": "123 Main St, New York, NY 10001"
        },
        "services": [
          {
            "id": "uuid",
            "name": "Haircut",
            "description": "Professional haircut service",
            "price": 50.00,
            "duration": 60,
            "image_url": "http://localhost:5000/backend/uploads/services/service-image.jpg"
          }
        ],
        "total_services": 8,
        "rating": {
          "rating": 4.5,
          "total_reviews": 25,
          "rating_display": "4.5/5.0"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_count": 25,
      "limit": 20,
      "has_next_page": true,
      "has_prev_page": false
    },
    "filters": {
      "location": "New York",
      "name": null,
      "rating": null,
      "status": "active",
      "sort": "name",
      "order": "ASC"
    },
    "summary": {
      "total_salons": 25,
      "filtered_count": 5,
      "average_rating": 4.2
    }
  }
}
```

**No salons found:**
```json
{
  "success": true,
  "message": "No salons found. There are no salons available at the moment.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "salons": [],
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
      "total_salons": 0,
      "filtered_count": 0,
      "average_rating": 0
    }
  }
}
```

### 2. Get Salon by ID
**GET** `/api/mobile/salons/:id`

**Response Examples:**

**Success:**
```json
{
  "success": true,
  "message": "Salon details retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "salon": {
      "id": "uuid",
      "name": "Hairvana Salon",
      "description": "Professional hair styling services",
      "phone": "+1234567890",
      "email": "info@hairvana.com",
      "website": "https://hairvana.com",
      "hours": {...},
      "avatar": "http://localhost:5000/backend/uploads/salons/550e8400-e29b-41d4-a716-446655440000.jpg",
      "status": "active",
      "address": {
        "id": "uuid",
        "street_address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zip_code": "10001",
        "country": "USA",
        "full_address": "123 Main St, New York, NY 10001"
      },
      "services": [...],
      "total_services": 8,
      "rating": {
        "rating": 4.5,
        "total_reviews": 25,
        "rating_display": "4.5/5.0"
      },
      "staff": [
        {
          "id": "uuid",
          "name": "John Doe",
          "avatar": "http://localhost:5000/backend/uploads/staff/staff-image.jpg",
          "specializations": ["Haircut", "Styling"],
          "experience_years": 5,
          "bio": "Experienced hairstylist",
          "role": "Senior Stylist",
          "hourly_rate": 75.00
        }
      ],
      "total_staff": 3,
      "recent_reviews": [
        {
          "id": "uuid",
          "rating": 5,
          "comment": "Excellent service!",
          "created_at": "2024-01-15T10:30:00.000Z"
        }
      ]
    }
  }
}
```

**Salon not found:**
```json
{
  "success": false,
  "message": "Salon not found. The salon you're looking for doesn't exist or may have been removed.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Invalid ID format:**
```json
{
  "success": false,
  "message": "Invalid salon ID format",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Search Salons
**GET** `/api/mobile/salons/search`

**Query Parameters:**
- `q`: Search query (salon name or description)
- `location`: Filter by location
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response Examples:**

**Success with results:**
```json
{
  "success": true,
  "message": "Found 3 salons matching your search",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "salons": [...],
    "pagination": {...},
    "search": {
      "query": "haircut",
      "location": "New York",
      "results_count": 3
    }
  }
}
```

**No results:**
```json
{
  "success": true,
  "message": "No salons found matching your search criteria.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "salons": [],
    "pagination": {...},
    "search": {
      "query": "nonexistent",
      "location": null,
      "results_count": 0
    }
  }
}
```

**Missing search parameters:**
```json
{
  "success": false,
  "message": "Search query or location is required",
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
- **404**: Not Found (salon not found)
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
- Rating calculations with proper aggregation
- Staff information with active status filtering
- Recent reviews for detailed salon views
- Search functionality with location filtering

## URL Helper Integration

The API uses urlHelper for consistent image URL generation:

```javascript
// Salon avatar
avatar: buildSalonImageUrl(salon.avatar)

// Service images
image_url: buildSalonImageUrl(service.image_url, 'service')

// Staff images
avatar: buildSalonImageUrl(staff.avatar, 'staff')
```

## Rating System

The API includes a comprehensive rating system:

```javascript
{
  "rating": {
    "rating": 4.5,           // Average rating (0.0 - 5.0)
    "total_reviews": 25,     // Total number of reviews
    "rating_display": "4.5/5.0"  // Formatted display string
  }
}
```

## Development vs Production

In development mode, error responses include additional details:

```json
{
  "success": false,
  "message": "Failed to fetch salons. Please try again.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "details": "SequelizeConnectionError: Connection timeout"
}
```

In production, error details are omitted for security:

```json
{
  "success": false,
  "message": "Failed to fetch salons. Please try again.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Testing Examples

### Test Get All Salons
```bash
curl -X GET "http://localhost:5000/backend/api/mobile/salons?page=1&limit=10&location=New%20York" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Get Salon by ID
```bash
curl -X GET "http://localhost:5000/backend/api/mobile/salons/salon-uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Search Salons
```bash
curl -X GET "http://localhost:5000/backend/api/mobile/salons/search?q=haircut&location=NY" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

This improved Salon API provides a much better user experience with clear messaging, proper error handling, consistent response formats, and advanced features like pagination, filtering, and search functionality that follow REST API best practices. 