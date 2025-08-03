# Salon Revenue and Transaction History API

This document describes the new endpoints for retrieving salon monthly revenue and transaction history.

## Endpoints

### 1. Get Monthly Revenue

**Endpoint:** `GET /backend/api/v0/salon/:salonId/monthly-revenue`

**Description:** Retrieves monthly revenue data for a specific salon.

**Authentication:** Required (Salon Owner)

**Parameters:**
- `salonId` (path parameter): UUID of the salon
- `year` (query parameter, optional): Year (defaults to current year)
- `month` (query parameter, optional): Month 1-12 (defaults to current month)

**Example Request:**
```bash
GET /backend/api/v0/salon/123e4567-e89b-12d3-a456-426614174000/monthly-revenue?year=2024&month=12
```

**Response:**
```json
{
  "success": true,
  "data": {
    "salonId": "123e4567-e89b-12d3-a456-426614174000",
    "year": 2024,
    "month": 12,
    "totalRevenue": 15000.00,
    "totalTransactions": 45,
    "averageTransactionValue": 333.33,
    "revenueBreakdown": [
      {
        "serviceId": "456e7890-e89b-12d3-a456-426614174001",
        "serviceName": "Haircut",
        "servicePrice": 50.00,
        "totalAmount": 7500.00,
        "transactionCount": 15
      }
    ]
  }
}
```

### 2. Get Transaction History

**Endpoint:** `GET /backend/api/v0/salon/:salonId/transaction-history`

**Description:** Retrieves paginated transaction history for a specific salon.

**Authentication:** Required (Salon Owner)

**Parameters:**
- `salonId` (path parameter): UUID of the salon
- `page` (query parameter, optional): Page number (default: 1)
- `limit` (query parameter, optional): Items per page 1-100 (default: 10)
- `status` (query parameter, optional): Payment status filter (pending, paid, failed, cancelled, all)
- `from` (query parameter, optional): Start date (ISO 8601 format)
- `to` (query parameter, optional): End date (ISO 8601 format)

**Example Request:**
```bash
GET /backend/api/v0/salon/123e4567-e89b-12d3-a456-426614174000/transaction-history?page=1&limit=20&status=paid&from=2024-01-01&to=2024-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "salonId": "123e4567-e89b-12d3-a456-426614174000",
    "transactions": [
      {
        "id": "789e0123-e89b-12d3-a456-426614174002",
        "amount": 150.00,
        "method": "visa",
        "status": "paid",
        "transaction_id": "txn_123456789",
        "payment_date": "2024-12-15T10:30:00Z",
        "refund_amount": 0,
        "refund_reason": null,
        "created_at": "2024-12-15T10:30:00Z",
        "appointment": {
          "id": "app_123456789",
          "start_at": "2024-12-15T10:00:00Z",
          "end_at": "2024-12-15T11:00:00Z",
          "status": "completed",
          "user": {
            "id": "user_123456789",
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+1234567890",
            "avatar": "avatar.jpg"
          },
          "services": [
            {
              "id": "service_123456789",
              "name": "Haircut",
              "price": 50.00,
              "duration": 60
            }
          ],
          "staff": {
            "id": "staff_123456789",
            "name": "Jane Smith",
            "avatar": "staff_avatar.jpg"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    },
    "summary": {
      "totalAmount": 15000.00,
      "totalTransactions": 45,
      "averageAmount": 333.33
    }
  }
}
```

## Error Responses

### 404 - Salon Not Found
```json
{
  "success": false,
  "message": "Salon not found"
}
```

### 403 - Access Denied
```json
{
  "success": false,
  "message": "Access denied. You can only view revenue for your own salons."
}
```

### 422 - Validation Error
```json
{
  "success": false,
  "errors": [
    {
      "field": "salonId",
      "message": "Salon ID must be a valid UUID"
    }
  ]
}
```

## Notes

- Both endpoints require salon owner authentication
- Salon owners can only access data for their own salons
- Date filters use ISO 8601 format (YYYY-MM-DD)
- Revenue calculations only include payments with status 'paid'
- Transaction history includes detailed information about clients, services, and staff
- Pagination is supported for transaction history with configurable page size 