# Improved Hairstyle API Documentation

## Overview

The Hairstyle API has been refactored to follow REST API best practices with consistent response formats, proper error handling, meaningful messages, and urlHelper integration for image URLs.

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
- Category-based filtering
- Related hairstyles
- Category statistics

## API Endpoints

### 1. Get All Hairstyles
**GET** `/api/mobile/hairstyles`

**Query Parameters:**
- `gender`: Filter by gender (male, female, unisex)
- `length`: Filter by length (short, medium, long)
- `color`: Filter by color
- `name`: Filter by hairstyle name
- `style_type`: Filter by style type
- `difficulty_level`: Filter by difficulty level
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (name, created_at)
- `order`: Sort order (ASC, DESC)

**Response Examples:**

**Success with hairstyles:**
```json
{
  "success": true,
  "message": "Successfully retrieved 15 hairstyles",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "hairstyles": [
      {
        "id": "uuid",
        "name": "Classic Bob",
        "description": "A timeless short hairstyle that suits most face shapes",
        "gender": "female",
        "length": "short",
        "color": "brown",
        "style_type": "classic",
        "difficulty_level": "easy",
        "estimated_duration": 45,
        "image_url": "http://localhost:5000/images/hairstyles/original/550e8400-e29b-41d4-a716-446655440000.jpg",
        "segmented_image_url": "http://localhost:5000/images/hairstyles/original/segmented-550e8400-e29b-41d4-a716-446655440000.jpg",
        "tags": ["classic", "short", "professional"],
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_count": 45,
      "limit": 20,
      "has_next_page": true,
      "has_prev_page": false
    },
    "filters": {
      "gender": "female",
      "length": null,
      "color": null,
      "name": null,
      "style_type": null,
      "difficulty_level": null,
      "sort": "name",
      "order": "ASC"
    },
    "summary": {
      "total_hairstyles": 45,
      "filtered_count": 15,
      "by_gender": {
        "male": 12,
        "female": 20,
        "unisex": 13
      },
      "by_length": {
        "short": 15,
        "medium": 18,
        "long": 12
      }
    }
  }
}
```

**No hairstyles found:**
```json
{
  "success": true,
  "message": "No hairstyles found. There are no hairstyles available at the moment.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "hairstyles": [],
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
      "total_hairstyles": 0,
      "filtered_count": 0,
      "by_gender": {...},
      "by_length": {...}
    }
  }
}
```

### 2. Get Hairstyle by ID
**GET** `/api/mobile/hairstyles/:id`

**Response Examples:**

**Success:**
```json
{
  "success": true,
  "message": "Hairstyle details retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "hairstyle": {
      "id": "uuid",
      "name": "Classic Bob",
      "description": "A timeless short hairstyle that suits most face shapes",
      "gender": "female",
      "length": "short",
      "color": "brown",
      "style_type": "classic",
      "difficulty_level": "easy",
      "estimated_duration": 45,
      "image_url": "http://localhost:5000/images/hairstyles/original/550e8400-e29b-41d4-a716-446655440000.jpg",
      "segmented_image_url": "http://localhost:5000/images/hairstyles/original/segmented-550e8400-e29b-41d4-a716-446655440000.jpg",
      "tags": ["classic", "short", "professional"],
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    "related_hairstyles": [
      {
        "id": "uuid",
        "name": "Layered Bob",
        "description": "A modern variation of the classic bob",
        "gender": "female",
        "length": "short",
        "color": "blonde",
        "style_type": "modern",
        "difficulty_level": "medium",
        "estimated_duration": 60,
        "image_url": "http://localhost:5000/images/hairstyles/original/related-hairstyle.jpg",
        "segmented_image_url": "http://localhost:5000/images/hairstyles/original/segmented-related-hairstyle.jpg",
        "tags": ["modern", "layered", "trendy"],
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "related_count": 6
  }
}
```

**Hairstyle not found:**
```json
{
  "success": false,
  "message": "Hairstyle not found. The hairstyle you're looking for doesn't exist or may have been removed.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Invalid ID format:**
```json
{
  "success": false,
  "message": "Invalid hairstyle ID format",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Search Hairstyles
**GET** `/api/mobile/hairstyles/search`

**Query Parameters:**
- `q`: Search query (required)
- `gender`: Filter by gender
- `length`: Filter by length
- `color`: Filter by color
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response Examples:**

**Success with results:**
```json
{
  "success": true,
  "message": "Found 8 hairstyles matching your search",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "hairstyles": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_count": 8,
      "limit": 20,
      "has_next_page": false,
      "has_prev_page": false
    },
    "search": {
      "query": "bob",
      "gender": "female",
      "length": null,
      "color": null,
      "results_count": 8
    }
  }
}
```

**No results:**
```json
{
  "success": true,
  "message": "No hairstyles found matching your search criteria.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "hairstyles": [],
    "pagination": {...},
    "search": {
      "query": "nonexistent",
      "gender": null,
      "length": null,
      "color": null,
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

### 4. Get Hairstyles by Category
**GET** `/api/mobile/hairstyles/category/:category`

**Path Parameters:**
- `category`: Category type (gender, length, color, style_type, difficulty_level)

**Query Parameters:**
- `value`: Category value (required)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response Examples:**

**Success:**
```json
{
  "success": true,
  "message": "Found 12 hairstyles for gender: female",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "hairstyles": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_count": 12,
      "limit": 20,
      "has_next_page": false,
      "has_prev_page": false
    },
    "category": {
      "name": "gender",
      "value": "female",
      "total_count": 12
    }
  }
}
```

**Invalid category:**
```json
{
  "success": false,
  "message": "Invalid category. Valid categories are: gender, length, color, style_type, difficulty_level",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Missing category value:**
```json
{
  "success": false,
  "message": "Category value is required",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Get Hairstyle Categories
**GET** `/api/mobile/hairstyles/categories`

**Response Example:**

```json
{
  "success": true,
  "message": "Hairstyle categories retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "categories": {
      "gender": [
        { "value": "male", "count": 12 },
        { "value": "female", "count": 20 },
        { "value": "unisex", "count": 13 }
      ],
      "length": [
        { "value": "short", "count": 15 },
        { "value": "medium", "count": 18 },
        { "value": "long", "count": 12 }
      ],
      "color": [
        { "value": "brown", "count": 10 },
        { "value": "blonde", "count": 8 },
        { "value": "black", "count": 12 },
        { "value": "red", "count": 5 }
      ],
      "style_type": [
        { "value": "classic", "count": 15 },
        { "value": "modern", "count": 12 },
        { "value": "trendy", "count": 8 },
        { "value": "vintage", "count": 10 }
      ],
      "difficulty_level": [
        { "value": "easy", "count": 20 },
        { "value": "medium", "count": 15 },
        { "value": "hard", "count": 10 }
      ]
    },
    "summary": {
      "total_hairstyles": 45,
      "total_categories": 5
    }
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
- **400**: Bad Request (validation errors)
- **404**: Not Found (hairstyle not found)
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
- Category-based filtering
- Related hairstyles suggestions
- Category statistics and counts

## URL Helper Integration

The API uses urlHelper for consistent image URL generation:

```javascript
// Hairstyle images
image_url: buildUrl(hairstyle.image_url, 'hairstyle')

// Segmented images for AR
segmented_image_url: buildUrl(hairstyle.segmented_image_url, 'hairstyle')
```

## Hairstyle Data Structure

Each hairstyle includes comprehensive information:

```javascript
{
  "id": "uuid",
  "name": "Hairstyle name",
  "description": "Detailed description",
  "gender": "male|female|unisex",
  "length": "short|medium|long",
  "color": "hair color",
  "style_type": "classic|modern|trendy|vintage",
  "difficulty_level": "easy|medium|hard",
  "estimated_duration": 45, // minutes
  "image_url": "full URL to hairstyle image",
  "segmented_image_url": "full URL to segmented image for AR",
  "tags": ["tag1", "tag2", "tag3"],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## Development vs Production

In development mode, error responses include additional details:

```json
{
  "success": false,
  "message": "Failed to fetch hairstyles. Please try again.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "details": "SequelizeConnectionError: Connection timeout"
}
```

In production, error details are omitted for security:

```json
{
  "success": false,
  "message": "Failed to fetch hairstyles. Please try again.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Testing Examples

### Test Get All Hairstyles
```bash
curl -X GET "http://localhost:5000/backend/api/mobile/hairstyles?page=1&limit=10&gender=female" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Get Hairstyle by ID
```bash
curl -X GET "http://localhost:5000/backend/api/mobile/hairstyles/hairstyle-uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Search Hairstyles
```bash
curl -X GET "http://localhost:5000/backend/api/mobile/hairstyles/search?q=bob&gender=female" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Get Hairstyles by Category
```bash
curl -X GET "http://localhost:5000/backend/api/mobile/hairstyles/category/gender?value=female" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Get Categories
```bash
curl -X GET "http://localhost:5000/backend/api/mobile/hairstyles/categories" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## AR Integration Features

The API includes support for AR (Augmented Reality) features:

1. **Segmented Images**: Each hairstyle includes a `segmented_image_url` for AR overlay
2. **Difficulty Levels**: Helps users understand complexity
3. **Estimated Duration**: Provides time expectations
4. **Tags**: Enables better search and categorization

This improved Hairstyle API provides a comprehensive solution for hairstyle discovery, search, and AR integration with clear messaging, proper error handling, consistent response formats, and advanced features that follow REST API best practices. 