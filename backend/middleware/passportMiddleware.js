const passport = require('../config/passport');
const TokenService = require('../services/tokenService');
const jwt = require('jsonwebtoken');

/**
 * Passport Middleware for Hairvana API
 * Provides authentication and authorization middleware using Passport strategies
 */

/**
 * Generic authentication middleware factory
 * @param {string} strategy - Passport strategy name
 * @param {Object} options - Options for authentication
 * @returns {Function} Express middleware function
 */
const authenticate = (strategy, options = {}) => {
  return (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (err, user, info) => {
      // Handle authentication errors
      if (err) {
        console.error(`Authentication error with strategy ${strategy}:`, err);
        return res.status(500).json({ 
          error: 'Authentication error',
          code: 'AUTH_ERROR'
        });
      }
      
      // Handle authentication failure
      if (!user) {
        const errorCode = info?.code || 'AUTHENTICATION_FAILED';
        const errorMessage = info?.message || 'Authentication required';
        
        // Log failed authentication attempts for security monitoring
        console.warn(`Authentication failed - Strategy: ${strategy}, IP: ${req.ip}, UserAgent: ${req.get('User-Agent')}, Error: ${errorCode}`);
        
        return res.status(401).json({ 
          error: errorMessage,
          code: errorCode
        });
      }
      
      // Successful authentication
      req.user = user;
      
      // Add request metadata for logging
      req.authInfo = {
        strategy,
        authenticatedAt: new Date(),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      };
      
      // Log successful authentication (without sensitive data)
      console.log(`Authentication successful - Strategy: ${strategy}, User: ${user.id}, Role: ${user.role}`);
      
      next();
    })(req, res, next);
  };
};

/**
 * JWT Authentication - General purpose
 * Validates JWT token and extracts user information
 */
const authenticateJWT = authenticate('jwt');

/**
 * Customer JWT Authentication
 * Only allows customers to access protected routes
 */
const authenticateCustomer = authenticate('customer-jwt');

/**
 * Salon Owner JWT Authentication
 * Only allows salon owners to access protected routes
 */
const authenticateOwner = authenticate('owner-jwt');

/**
 * Admin JWT Authentication
 * Only allows admin users to access protected routes
 */
const authenticateAdmin = authenticate('admin-jwt');

/**
 * Customer Local Authentication
 * Validates email/password for customer login
 */
const authenticateCustomerLocal = (req, res, next) => {
  passport.authenticate('customer-local', { session: false }, async (err, user, info) => {
    if (err) {
      console.error('Customer local authentication error:', err);
      return res.status(500).json({ 
        error: 'Authentication error',
        code: 'AUTH_ERROR'
      });
    }
    
    if (!user) {
      // Log failed login attempt
      console.warn(`Customer login failed - Email: ${req.body.email}, IP: ${req.ip}, Error: ${info?.code || 'INVALID_CREDENTIALS'}`);
      
      return res.status(401).json({ 
        error: info?.message || 'Invalid credentials',
        code: info?.code || 'INVALID_CREDENTIALS'
      });
    }
    
    // Successful login - generate tokens
    try {
      const tokenData = TokenService.generateTokenPair({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      // Log successful login
      console.log(`Customer login successful - User: ${user.id}, Email: ${user.email}, IP: ${req.ip}`);
      
      // Attach user and tokens to request
      req.user = user;
      req.tokens = tokenData;
      
      next();
    } catch (tokenError) {
      console.error('Token generation error during login:', tokenError);
      return res.status(500).json({ 
        error: 'Login failed - token generation error',
        code: 'TOKEN_GENERATION_ERROR'
      });
    }
  })(req, res, next);
};

/**
 * Owner Local Authentication
 * Validates email/password for salon owner login
 */
const authenticateOwnerLocal = (req, res, next) => {
  passport.authenticate('owner-local', { session: false }, async (err, user, info) => {
    if (err) {
      console.error('Owner local authentication error:', err);
      return res.status(500).json({ 
        error: 'Authentication error',
        code: 'AUTH_ERROR'
      });
    }
    
    if (!user) {
      console.warn(`Owner login failed - Email: ${req.body.email}, IP: ${req.ip}, Error: ${info?.code || 'INVALID_CREDENTIALS'}`);
      
      return res.status(401).json({ 
        error: info?.message || 'Invalid credentials',
        code: info?.code || 'INVALID_CREDENTIALS'
      });
    }
    
    try {
      const tokenData = TokenService.generateTokenPair({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      console.log(`Owner login successful - User: ${user.id}, Email: ${user.email}, IP: ${req.ip}`);
      
      req.user = user;
      req.tokens = tokenData;
      
      next();
    } catch (tokenError) {
      console.error('Token generation error during owner login:', tokenError);
      return res.status(500).json({ 
        error: 'Login failed - token generation error',
        code: 'TOKEN_GENERATION_ERROR'
      });
    }
  })(req, res, next);
};

/**
 * Refresh Token Authentication
 * Validates refresh token and allows token refresh
 */
const authenticateRefreshToken = authenticate('refresh-jwt');

/**
 * Logout Authentication - Accepts expired tokens
 * Special middleware for logout that allows expired tokens
 */
const authenticateForLogout = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Authorization token required for logout',
      code: 'TOKEN_REQUIRED'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Try to verify token normally first
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is blacklisted (even for valid tokens)
    if (payload.jti) {
      const isBlacklisted = await TokenService.isTokenBlacklisted(payload.jti);
      if (isBlacklisted) {
        console.log(`Logout attempt with already blacklisted token - User: ${payload.id}, JTI: ${payload.jti}`);
        return res.status(401).json({ 
          error: 'Token has already been revoked',
          code: 'TOKEN_ALREADY_REVOKED'
        });
      }
    }
    
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    req.tokenInfo = { jti: payload.jti, token };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // For expired tokens, decode without verification for logout
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.id && decoded.jti) {
          // Check if expired token is blacklisted
          const isBlacklisted = await TokenService.isTokenBlacklisted(decoded.jti);
          if (isBlacklisted) {
            console.log(`Logout attempt with blacklisted expired token - User: ${decoded.id}, JTI: ${decoded.jti}`);
            return res.status(401).json({ 
              error: 'Token has already been revoked',
              code: 'TOKEN_ALREADY_REVOKED'
            });
          }
          
          console.log(`Logout with expired token - User: ${decoded.id}`);
          req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
          req.tokenInfo = { jti: decoded.jti, token, expired: true };
          return next();
        }
      } catch (decodeError) {
        console.error('Token decode error during logout:', decodeError);
      }
    }
    
    // For other token errors, reject
    console.warn(`Logout failed - Invalid token, IP: ${req.ip}, Error: ${error.message}`);
    return res.status(401).json({ 
      error: 'Invalid token for logout',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {...string} allowedRoles - Roles allowed to access the route
 * @returns {Function} Express middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      console.warn(`Authorization failed - User: ${req.user.id}, Role: ${req.user.role}, Required: ${allowedRoles.join(', ')}, IP: ${req.ip}`);
      
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.role
      });
    }
    
    next();
  };
};

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if no token provided
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without authentication
    return next();
  }
  
  // Token provided, attempt authentication
  authenticateJWT(req, res, (err) => {
    if (err) {
      // Authentication failed, but continue anyway
      console.warn('Optional authentication failed:', err);
    }
    next();
  });
};

/**
 * Token extraction middleware
 * Extracts and validates token info without full authentication
 */
const extractTokenInfo = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    const jti = TokenService.extractJTI(token);
    
    if (jti) {
      const isBlacklisted = await TokenService.isTokenBlacklisted(jti);
      req.tokenInfo = {
        jti,
        isBlacklisted,
        token
      };
    }
    
    next();
  } catch (error) {
    console.error('Token extraction error:', error);
    next(); // Continue even if extraction fails
  }
};

/**
 * Security headers middleware
 * Adds security-related headers to responses
 */
const securityHeaders = (req, res, next) => {
  // Prevent token caching
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  
  // Add security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  });
  
  next();
};

/**
 * Rate limiting information middleware
 * Adds rate limiting info to requests for monitoring
 */
const rateLimitInfo = (req, res, next) => {
  if (req.user) {
    req.rateLimitKey = `user:${req.user.id}`;
  } else {
    req.rateLimitKey = `ip:${req.ip}`;
  }
  
  next();
};

/**
 * Audit logging middleware
 * Logs important authentication events
 */
const auditLog = (action) => {
  return (req, res, next) => {
    const logData = {
      action,
      timestamp: new Date().toISOString(),
      userId: req.user?.id,
      userRole: req.user?.role,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: `${req.method} ${req.originalUrl}`
    };
    
    // In production, send this to a logging service
    console.log('AUDIT:', JSON.stringify(logData));
    
    next();
  };
};

module.exports = {
  // Authentication middleware
  authenticateJWT,
  authenticateCustomer,
  authenticateOwner,
  authenticateAdmin,
  authenticateCustomerLocal,
  authenticateOwnerLocal,
  authenticateRefreshToken,
  authenticateForLogout,
  
  // Authorization middleware
  authorize,
  
  // Utility middleware
  optionalAuth,
  extractTokenInfo,
  securityHeaders,
  rateLimitInfo,
  auditLog,
  
  // Generic authenticate function for custom strategies
  authenticate
}; 