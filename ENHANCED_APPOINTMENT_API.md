# Enhanced Appointment API Documentation

## GET /api/mobile/appointments

The appointment endpoint has been enhanced to return comprehensive appointment details with additional calculated fields and related data.

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | string | Filter by appointment status | `booked`, `pending`, `cancelled`, `completed` |
| `page` | integer | Page number for pagination | `1`, `2`, `3` |
| `limit` | integer | Number of appointments per page (1-100) | `20`, `50` |
| `sort` | string | Sort field | `start_at`, `created_at`, `total_price` |
| `order` | string | Sort order | `ASC`, `DESC` |
| `salon_id` | UUID | Filter by salon ID | `uuid-string` |
| `staff_id` | UUID | Filter by staff ID | `uuid-string` |
| `date_from` | ISO8601 | Filter appointments from date | `2024-01-01T00:00:00Z` |
| `date_to` | ISO8601 | Filter appointments to date | `2024-12-31T23:59:59Z` |

### Example Request

```bash
GET /api/mobile/appointments?status=booked&page=1&limit=10&sort=start_at&order=ASC
```

### Enhanced Response Structure

```json
{
  "success": true,
  "appointments": [
    {
      "id": "uuid-string",
      "user_id": "user-uuid",
      "salon_id": "salon-uuid",
      "staff_id": "staff-uuid",
      "start_at": "2024-01-15T10:00:00.000Z",
      "end_at": "2024-01-15T11:00:00.000Z",
      "status": "booked",
      "notes": "Customer prefers organic products",
      "total_price": 85.00,
      "duration": 60,
      "special_requests": "Please use hypoallergenic products",
      "cancellation_reason": null,
      "cancelled_at": null,
      "cancelled_by": null,
      "created_at": "2024-01-10T15:30:00.000Z",
      "updated_at": "2024-01-10T15:30:00.000Z",
      
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
      
      // Salon details
      "salon": {
        "id": "salon-uuid",
        "name": "Elegant Hair Salon",
        "address": "123 Main Street, City, State 12345",
        "phone": "+1-555-123-4567",
        "email": "info@eleganthair.com",
        "image_url": "https://example.com/salon-image.jpg",
        "description": "Premium hair styling and beauty services",
        "hours": {
          "monday": "9:00 AM - 7:00 PM",
          "tuesday": "9:00 AM - 7:00 PM",
          "wednesday": "9:00 AM - 7:00 PM",
          "thursday": "9:00 AM - 7:00 PM",
          "friday": "9:00 AM - 8:00 PM",
          "saturday": "10:00 AM - 6:00 PM",
          "sunday": "Closed"
        },
        "rating": 4.8,
        "total_reviews": 156
      },
      
      // Staff details
      "staff": {
        "id": "staff-uuid",
        "name": "Sarah Johnson",
        "avatar": "https://example.com/staff-avatar.jpg",
        "specialization": "Hair Coloring & Styling",
        "experience_years": 8,
        "bio": "Expert colorist with 8 years of experience in modern hair techniques",
        "rating": 4.9,
        "total_reviews": 89
      },
      
      // Services details
      "services": [
        {
          "id": "service-uuid-1",
          "name": "Hair Cut & Style",
          "description": "Professional haircut with styling",
          "price": 45.00,
          "duration": 45,
          "image_url": "https://example.com/service-image.jpg"
        },
        {
          "id": "service-uuid-2",
          "name": "Hair Coloring",
          "description": "Full hair coloring service",
          "price": 40.00,
          "duration": 120,
          "image_url": "https://example.com/coloring-image.jpg"
        }
      ],
      
      // Payment details
      "payment": {
        "id": "payment-uuid",
        "amount": 85.00,
        "method": "credit_card",
        "status": "paid",
        "transaction_id": "txn_123456789",
        "created_at": "2024-01-10T15:30:00.000Z",
        "updated_at": "2024-01-10T15:35:00.000Z"
      }
    }
  ],
  
  // Pagination information
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 47,
    "limit": 10,
    "has_next_page": true,
    "has_prev_page": false
  }
}
```

### Additional Endpoints

#### GET /api/mobile/appointments/stats

Returns appointment statistics for the current user.

```json
{
  "success": true,
  "stats": {
    "total": 47,
    "upcoming": 3,
    "by_status": {
      "booked": 3,
      "completed": 40,
      "cancelled": 4
    }
  }
}
```

#### GET /api/mobile/appointments/:id

Returns detailed information for a specific appointment with the same enhanced structure.

### Key Enhancements

1. **Comprehensive Data**: Includes salon, staff, services, and payment details
2. **Calculated Fields**: 
   - Time until appointment
   - Formatted dates and times
   - Status indicators (upcoming, past, today)
3. **Pagination**: Full pagination support with metadata
4. **Filtering**: Multiple filter options by status, salon, staff, date range
5. **Sorting**: Flexible sorting by various fields
6. **Statistics**: Separate endpoint for appointment statistics
7. **Enhanced Serialization**: More detailed information in all related objects

### Error Responses

```json
{
  "error": "Failed to fetch appointments",
  "details": "Database connection error"
}
```

### Validation Errors

```json
{
  "errors": [
    {
      "field": "status",
      "message": "Invalid status"
    },
    {
      "field": "page",
      "message": "Page must be a positive integer"
    }
  ]
}
``` 