# Password Reset API Documentation

This document describes the password reset functionality implemented for both customer and salon owner accounts.

## Overview

The password reset system allows users to:
1. Request a password reset via email
2. Receive a secure reset link via email
3. Reset their password using the provided token

## Security Features

- Reset tokens are hashed before storage
- Tokens expire after 1 hour
- Tokens can only be used once
- Email addresses are validated before processing
- Password strength requirements are enforced

## API Endpoints

### 1. Forget Password - Customer

**Endpoint:** `POST /api/auth/forget-password-customer`

**Request Body:**
```json
{
  "email": "customer@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email address."
}
```

### 2. Forget Password - Salon Owner

**Endpoint:** `POST /api/auth/forget-password-salon`

**Request Body:**
```json
{
  "email": "owner@salon.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email address."
}
```

### 3. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

## Mobile API Endpoints

### Customer Mobile API

**Forget Password:** `POST /api/v0/customer/auth/forget-password`
**Reset Password:** `POST /api/v0/customer/auth/reset-password`

### Salon Owner Mobile API

**Forget Password:** `POST /api/v0/salon/auth/forget-password`
**Reset Password:** `POST /api/v0/salon/auth/reset-password`

## Password Requirements

Passwords must meet the following criteria:
- At least 8 characters long
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

## Email Configuration

The system uses nodemailer for sending emails. Configure the following environment variables:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@hairvana.com
FRONTEND_URL=http://localhost:3000
```

## Database Changes

The following fields have been added to the `users` table:

- `reset_token` (TEXT): Hashed password reset token
- `reset_token_expires` (DATE): Token expiration timestamp

## Error Responses

### Invalid Email
```json
{
  "success": false,
  "message": "This email is not associated with a customer account."
}
```

### Invalid Token
```json
{
  "success": false,
  "message": "Invalid or expired reset token. Please request a new password reset."
}
```

### Weak Password
```json
{
  "success": false,
  "message": "Password does not meet requirements",
  "errors": [
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter"
  ]
}
```

### Passwords Don't Match
```json
{
  "success": false,
  "message": "Passwords do not match"
}
```

## Implementation Details

### Services

1. **EmailService** (`backend/services/emailService.js`)
   - Handles email sending using nodemailer
   - Generates HTML and text email templates
   - Configurable email provider settings

2. **PasswordResetService** (`backend/services/passwordResetService.js`)
   - Generates secure reset tokens
   - Validates tokens and passwords
   - Handles user role verification
   - Manages token expiration

### Controllers

1. **AuthController** (`backend/controllers/authController.js`)
   - `forgetPasswordCustomer()`: Handle customer password reset requests
   - `forgetPasswordSalon()`: Handle salon owner password reset requests
   - `resetPassword()`: Handle password reset with token

2. **Mobile Auth Controllers**
   - Customer: `backend/controllers/Api/customer/auth/mobileAuthController.js`
   - Salon Owner: `backend/controllers/Api/salon/auth/ownerAuthController.js`

### Routes

- Main API: `backend/routes/auth.js`
- Customer Mobile API: `backend/routes/Api/v0/customer/auth.js`
- Salon Mobile API: `backend/routes/Api/v0/salon/ownerAuth.js`

## Security Considerations

1. **Token Security**: Reset tokens are hashed using bcrypt before storage
2. **Expiration**: Tokens expire after 1 hour
3. **Single Use**: Tokens are invalidated after use
4. **Email Validation**: Emails are validated before processing
5. **Role Verification**: System verifies user role before sending reset emails
6. **Rate Limiting**: Endpoints are protected by rate limiting middleware
7. **Input Validation**: All inputs are validated using express-validator

## Testing

To test the implementation:

1. Run the migration: `npm run migrate`
2. Install nodemailer: `npm install nodemailer`
3. Configure email settings in environment variables
4. Test the endpoints using a tool like Postman or curl

## Example Usage

### Request Password Reset
```bash
curl -X POST http://localhost:5000/api/auth/forget-password-customer \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@example.com"}'
```

### Reset Password
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token_from_email",
    "password": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }'
``` 