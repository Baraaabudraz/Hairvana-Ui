# Mobile Review API Documentation

## Overview
The Mobile Review API provides endpoints for customers to create, view, and manage reviews for salons and appointments in the Hairvana mobile app.

## Base URL
```
/backend/api/mobile/reviews
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Create Review
**POST** `/backend/api/mobile/reviews`

Create a new review for a salon or specific appointment.

#### Request Body
```json
{
  "salon_id": "uuid",
  "appointment_id": "uuid", // optional
  "staff_id": "uuid", // optional
  "rating": 5, // 1-5 stars
  "title": "Great service!", // optional, max 100 chars
  "comment": "Amazing experience...", // optional, max 1000 chars
  "is_anonymous": false // optional
}
```

#### Response
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": "uuid",
    "rating": 5,
    "title": "Great service!",
    "comment": "Amazing experience...",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Business Rules
- User must have completed appointments with the salon
- Can only review completed appointments
- One review per appointment
- Reviews can be edited within 24 hours

---

### 2. Get Salon Reviews
**GET** `/backend/api/mobile/reviews/salon/:salon_id`

Get all approved reviews for a specific salon.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Reviews per page (default: 10, max: 50)
- `rating` (optional): Filter by rating (1-5)
- `sort` (optional): Sort field (`created_at`, `rating`)
- `order` (optional): Sort order (`ASC`, `DESC`)

#### Response
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "title": "Great service!",
        "comment": "Amazing experience...",
        "helpful_votes": 3,
        "created_at": "2024-01-15T10:30:00Z",
        "user": {
          "name": "John Doe",
          "avatar": "url"
        },
        "staff": {
          "name": "Jane Smith"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_reviews": 50,
      "has_next_page": true,
      "has_prev_page": false
    }
  }
}
```

---

### 3. Get Salon Review Statistics
**GET** `/backend/api/mobile/reviews/salon/:salon_id/stats`

Get review statistics and rating breakdown for a salon.

#### Response
```json
{
  "success": true,
  "data": {
    "total_reviews": 50,
    "average_rating": 4.2,
    "rating_distribution": {
      "5": {
        "count": 25,
        "percentage": 50
      },
      "4": {
        "count": 15,
        "percentage": 30
      },
      "3": {
        "count": 5,
        "percentage": 10
      },
      "2": {
        "count": 3,
        "percentage": 6
      },
      "1": {
        "count": 2,
        "percentage": 4
      }
    }
  }
}
```

---

### 4. Get User's Reviews
**GET** `/backend/api/mobile/reviews/my`

Get all reviews created by the authenticated user.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Reviews per page (default: 10, max: 50)

#### Response
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "title": "Great service!",
        "comment": "Amazing experience...",
        "status": "approved",
        "created_at": "2024-01-15T10:30:00Z",
        "salon": {
          "id": "uuid",
          "name": "Beauty Salon",
          "logo": "url"
        },
        "staff": {
          "id": "uuid",
          "name": "Jane Smith"
        },
        "appointment": {
          "id": "uuid",
          "date": "2024-01-10T14:00:00Z"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_reviews": 15,
      "has_next_page": true,
      "has_prev_page": false
    }
  }
}
```

---

### 5. Update Review
**PUT** `/backend/api/mobile/reviews/:review_id`

Update a review (only within 24 hours of creation).

#### Request Body
```json
{
  "rating": 4,
  "title": "Updated title",
  "comment": "Updated comment"
}
```

#### Response
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "id": "uuid",
    "rating": 4,
    "title": "Updated title",
    "comment": "Updated comment",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

---

### 6. Delete Review
**DELETE** `/backend/api/mobile/reviews/:review_id`

Delete a review created by the authenticated user.

#### Response
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

### 7. Mark Review as Helpful
**POST** `/backend/api/mobile/reviews/:review_id/helpful`

Mark a review as helpful (increments helpful votes).

#### Response
```json
{
  "success": true,
  "message": "Review marked as helpful",
  "data": {
    "helpful_votes": 4
  }
}
```

---

### 8. Check Review Eligibility
**GET** `/backend/api/mobile/reviews/check-eligibility/:salon_id`

Check if the user can review a specific salon.

#### Response
```json
{
  "success": true,
  "data": {
    "can_review": true,
    "has_reviewed": false,
    "completed_appointments": 2
  }
}
```

---

### 9. Check Appointment Review Eligibility
**GET** `/backend/api/mobile/reviews/check-appointment/:appointment_id`

Check if the user can review a specific appointment.

#### Response
```json
{
  "success": true,
  "data": {
    "can_review": true,
    "has_reviewed": false,
    "appointment": {
      "id": "uuid",
      "salon_id": "uuid",
      "staff_id": "uuid",
      "start_at": "2024-01-10T14:00:00Z",
      "end_at": "2024-01-10T15:00:00Z",
      "total_price": 50.00
    }
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Review not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to submit review",
  "error": "Error details"
}
```

---

## Business Rules

### Review Creation
1. **Eligibility**: User must have completed appointments with the salon
2. **Appointment Reviews**: Can only review completed appointments with paid status
3. **One Review Per Appointment**: Users can only review each appointment once
4. **General Reviews**: Users can review salons they've visited (completed appointments)

### Review Management
1. **Edit Window**: Reviews can only be edited within 24 hours of creation
2. **Ownership**: Users can only edit/delete their own reviews
3. **Auto-Approval**: Mobile reviews are auto-approved (no moderation required)

### Data Privacy
1. **Anonymous Reviews**: Users can choose to post anonymous reviews
2. **User Data**: Only first name, last name, and avatar are shown in reviews
3. **Staff Reviews**: Staff names are shown when reviewing specific staff members

---

## Usage Examples

### Creating a Review After Appointment
```javascript
// 1. Check eligibility
const eligibility = await fetch('/backend/api/mobile/reviews/check-appointment/appointment-id');
const canReview = eligibility.data.can_review;

// 2. Create review
if (canReview) {
  const review = await fetch('/backend/api/mobile/reviews', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer token',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      salon_id: 'salon-uuid',
      appointment_id: 'appointment-uuid',
      rating: 5,
      title: 'Amazing service!',
      comment: 'The stylist did an incredible job...'
    })
  });
}
```

### Displaying Salon Reviews
```javascript
// Get salon reviews with pagination
const reviews = await fetch('/backend/api/mobile/reviews/salon/salon-id?page=1&limit=10');

// Get review statistics
const stats = await fetch('/backend/api/mobile/reviews/salon/salon-id/stats');
```

### Managing User Reviews
```javascript
// Get user's reviews
const myReviews = await fetch('/backend/api/mobile/reviews/my');

// Update a review
const updateReview = await fetch('/backend/api/mobile/reviews/review-id', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rating: 4,
    comment: 'Updated comment'
  })
});
``` 