# Passport JWT Implementation with Token Blacklisting

This document describes the complete implementation of Passport.js with JWT authentication and token revocation capabilities for the Hairvana mobile API.

## 🎯 Overview

We've implemented a robust authentication system that combines:
- **Passport.js** for flexible authentication strategies
- **JWT tokens** for stateless authentication
- **Token blacklisting** for immediate token revocation
- **Role-based access control** for different user types
- **Comprehensive security features** following best practices

## 📁 File Structure

```
backend/
├── config/
│   └── passport.js              # Passport strategies configuration
├── middleware/
│   └── passportMiddleware.js    # Authentication middleware
├── services/
│   └── tokenService.js          # JWT token management
├── models/
│   └── token_blacklist.js       # Token blacklist model
├── migrations/
│   └── 20250101000000-create-token-blacklist.js
├── controllers/Api/customer/auth/
│   └── mobileAuthController.js  # Updated auth controller
└── routes/Api/v0/customer/
    └── mobileAuth.js            # Updated auth routes
```

## 🔐 Authentication Flow

### 1. Registration/Login Flow
```
1. User submits credentials
2. Passport Local Strategy validates credentials
3. TokenService generates access + refresh tokens (with JTI)
4. Tokens returned to client
5. Client stores tokens securely
```

### 2. Protected Route Access
```
1. Client sends request with Bearer token
2. Passport JWT Strategy extracts and verifies token
3. TokenService checks if token is blacklisted
4. If valid and not blacklisted → access granted
5. If invalid or blacklisted → access denied
```

### 3. Logout Flow
```
1. Client sends logout request with current token
2. System extracts JTI from token
3. TokenService adds JTI to blacklist
4. Token becomes immediately invalid
5. Optional: Remove device tokens
```

## 🛠 Key Components

### TokenService (services/tokenService.js)

**Main methods:**
- `generateToken()` - Creates JWT with unique JTI
- `generateTokenPair()` - Creates access + refresh token pair
- `validateToken()` - Verifies token and checks blacklist
- `blacklistToken()` - Revokes single token
- `blacklistAllUserTokens()` - Revokes all user tokens
- `isTokenBlacklisted()` - Checks if token is revoked
- `cleanupExpiredTokens()` - Removes expired blacklisted tokens

### Passport Configuration (config/passport.js)

**Strategies implemented:**
- `jwt` - General JWT validation
- `customer-jwt` - Customer-specific JWT validation
- `owner-jwt` - Salon owner JWT validation
- `admin-jwt` - Admin JWT validation
- `customer-local` - Customer login with email/password
- `owner-local` - Owner login with email/password
- `refresh-jwt` - Refresh token validation

### Middleware (middleware/passportMiddleware.js)

**Available middleware:**
- `authenticateCustomer` - Customer JWT authentication
- `authenticateOwner` - Owner JWT authentication
- `authenticateAdmin` - Admin JWT authentication
- `authenticateCustomerLocal` - Customer login authentication
- `authorize(...roles)` - Role-based authorization
- `optionalAuth` - Optional authentication
- `securityHeaders` - Security headers
- `auditLog(action)` - Audit logging

### Token Blacklist Model (models/token_blacklist.js)

**Database fields:**
- `token_jti` - Unique JWT ID
- `user_id` - User who owns the token
- `token_type` - 'access' or 'refresh'
- `revoked_at` - When token was revoked
- `expires_at` - Original token expiration
- `reason` - Why token was revoked
- `device_info` - Device metadata (JSONB)
- `ip_address` - IP address during revocation
- `user_agent` - User agent string

## 🔗 API Endpoints

### Authentication Endpoints

#### POST `/backend/api/mobile/auth/register`
Register new customer account
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890"
}
```

#### POST `/backend/api/mobile/auth/login`
Customer login
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### POST `/backend/api/mobile/auth/logout`
Logout current session (requires auth)
```json
{
  "device_token": "optional_device_token"
}
```

#### POST `/backend/api/mobile/auth/logout-all`
Logout from all devices (requires auth)
```json
{}
```

#### POST `/backend/api/mobile/auth/refresh`
Refresh access token (requires refresh token)
```json
{}
```

#### GET `/backend/api/mobile/auth/profile`
Get user profile (requires auth)

#### PUT `/backend/api/mobile/auth/change-password`
Change password (requires auth)
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

#### GET `/backend/api/mobile/auth/token-audit`
Get token revocation audit log (requires auth)

## 🔒 Security Features

### 1. Token Security
- **Unique JTI (JWT ID)** for each token
- **Algorithm specification** (HS256)
- **Issuer and audience validation**
- **Short-lived access tokens** (15 minutes recommended)
- **Longer refresh tokens** (7 days)

### 2. Token Revocation
- **Immediate blacklisting** on logout
- **Mass revocation** for security incidents
- **Automatic cleanup** of expired blacklisted tokens
- **Audit trail** of all revocations

### 3. Password Security
- **Bcrypt hashing** with 12 rounds
- **Password complexity requirements**
- **All tokens revoked** on password change

### 4. Request Security
- **Security headers** on all responses
- **Rate limiting support**
- **Audit logging** for security events
- **IP and User-Agent tracking**

## 📊 Database Performance

### Indexes Created
```sql
-- Primary index on JTI for fast lookups
CREATE UNIQUE INDEX token_blacklist_jti_idx ON token_blacklist (token_jti);

-- Index on user_id for user-specific queries
CREATE INDEX token_blacklist_user_id_idx ON token_blacklist (user_id);

-- Index on expires_at for cleanup operations
CREATE INDEX token_blacklist_expires_at_idx ON token_blacklist (expires_at);

-- Composite index for user and token type
CREATE INDEX token_blacklist_user_type_idx ON token_blacklist (user_id, token_type);
```

### Performance Considerations
- **Efficient blacklist lookup** - O(1) with JTI index
- **Automatic cleanup** - Scheduled job removes expired entries
- **Minimal database load** - Only blacklisted tokens stored
- **Query optimization** - Indexes on most common lookup patterns

## 🚀 Usage Examples

### Basic Authentication Usage
```javascript
// Protect a route with customer authentication
router.get('/customer-only', 
  authenticateCustomer,
  (req, res) => {
    // req.user contains authenticated customer
    res.json({ user: req.user });
  }
);

// Role-based authorization
router.get('/admin-only',
  authenticateJWT,
  authorize('admin', 'super_admin'),
  (req, res) => {
    res.json({ message: 'Admin access granted' });
  }
);
```

### Token Management
```javascript
// Generate token pair
const tokens = TokenService.generateTokenPair({
  id: user.id,
  email: user.email,
  role: user.role
});

// Blacklist token on logout
await TokenService.blacklistToken(
  jti,
  userId,
  'logout',
  { ipAddress: req.ip, userAgent: req.get('User-Agent') }
);

// Check if token is blacklisted
const isBlacklisted = await TokenService.isTokenBlacklisted(jti);
```

## 🔧 Configuration

### Environment Variables
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_ISSUER=hairvana-api
JWT_AUDIENCE=hairvana-mobile
```

### Recommended Token Expiration
```javascript
// Production settings
ACCESS_TOKEN_EXPIRY=15m   // 15 minutes
REFRESH_TOKEN_EXPIRY=7d   // 7 days

// Development settings (longer for easier testing)
ACCESS_TOKEN_EXPIRY=24h   // 24 hours
REFRESH_TOKEN_EXPIRY=30d  // 30 days
```

## 🧪 Testing

Run the test file to verify implementation:
```bash
cd backend
node test-passport-jwt.js
```

Test endpoints with curl:
```bash
# Register
curl -X POST http://localhost:5000/backend/api/mobile/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:5000/backend/api/mobile/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Access protected route
curl -X GET http://localhost:5000/backend/api/mobile/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Logout
curl -X POST http://localhost:5000/backend/api/mobile/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🏗 Best Practices Implemented

### 1. Security Best Practices
- ✅ No sensitive data in JWT payload
- ✅ Strong password hashing (bcrypt with 12 rounds)
- ✅ Token revocation capability
- ✅ Short-lived access tokens
- ✅ Comprehensive audit logging
- ✅ Rate limiting support
- ✅ Security headers

### 2. Performance Best Practices
- ✅ Database indexes for fast lookups
- ✅ Minimal database queries
- ✅ Efficient token validation
- ✅ Cleanup of expired data
- ✅ Stateless authentication

### 3. Development Best Practices
- ✅ Comprehensive error handling
- ✅ Detailed logging
- ✅ Type checking and validation
- ✅ Clean separation of concerns
- ✅ Extensive documentation
- ✅ Test coverage

## 🔄 Maintenance Tasks

### Daily/Weekly
- Monitor authentication logs for suspicious activity
- Check token blacklist size and cleanup efficiency

### Monthly
- Run token cleanup: `TokenService.cleanupExpiredTokens()`
- Review and rotate JWT secrets
- Audit user authentication patterns

### As Needed
- Update password complexity requirements
- Adjust token expiration times
- Review and update security headers

## 🚨 Troubleshooting

### Common Issues

**"Token has been revoked" errors:**
- Check if token was manually blacklisted
- Verify token hasn't expired
- Confirm user hasn't changed password

**"Invalid token" errors:**
- Verify JWT_SECRET matches between environments
- Check token format and structure
- Ensure client is sending Bearer token correctly

**Authentication failures:**
- Check database connectivity
- Verify Passport strategies are configured
- Review middleware order in routes

### Debug Mode
Enable detailed logging by setting environment variable:
```env
DEBUG_AUTH=true
```

## 📚 Additional Resources

- [Passport.js Documentation](http://www.passportjs.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Sequelize Documentation](https://sequelize.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

🎉 **Congratulations!** You now have a production-ready authentication system with Passport.js, JWT tokens, and complete token revocation capabilities! 