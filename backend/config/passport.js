const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { User, Customer, SalonOwner, Role } = require('../models');
const TokenService = require('../services/tokenService');
const { ROLES } = require('../constants/roles');

/**
 * Passport Configuration for Hairvana API
 * Implements JWT and Local strategies with token blacklisting support
 */

// JWT Strategy Options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  issuer: process.env.JWT_ISSUER || 'hairvana-api',
  audience: process.env.JWT_AUDIENCE || 'hairvana-mobile'
};

/**
 * General JWT Strategy for token validation with blacklist check
 */
passport.use('jwt', new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    // Check if token is blacklisted
    if (payload.jti) {
      const isBlacklisted = await TokenService.isTokenBlacklisted(payload.jti);
      if (isBlacklisted) {
        return done(null, false, { 
          message: 'Token has been revoked',
          code: 'TOKEN_REVOKED'
        });
      }
    }
    
    // Get user with basic info (optional - for fresh user data)
    const user = await User.findByPk(payload.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Customer,
          as: 'customer',
          required: false
        },
        {
          model: SalonOwner,
          as: 'salonOwner',
          required: false
        }
      ]
    });
    
    if (user && user.status === 'active') {
      // Add token info to user object for middleware access
      user.tokenInfo = {
        jti: payload.jti,
        type: payload.type,
        iat: payload.iat,
        exp: payload.exp
      };
      return done(null, user);
    }
    
    return done(null, false, { 
      message: 'User not found or inactive',
      code: 'USER_INACTIVE'
    });
  } catch (error) {
    console.error('JWT Strategy error:', error);
    return done(error, false);
  }
}));

/**
 * Customer-specific JWT Strategy
 * Only allows users with 'customer' role
 */
passport.use('customer-jwt', new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    // Check if token is blacklisted
    if (payload.jti) {
      const isBlacklisted = await TokenService.isTokenBlacklisted(payload.jti);
      console.log(`Customer JWT Strategy - Token check: JTI: ${payload.jti}, Blacklisted: ${isBlacklisted}, User: ${payload.id}`);
      if (isBlacklisted) {
        console.log(`Customer JWT Strategy - Rejecting blacklisted token: ${payload.jti}`);
        return done(null, false, { 
          message: 'Token has been revoked',
          code: 'TOKEN_REVOKED'
        });
      }
    }
    
    // Verify customer role from token payload first (faster)
    console.log(`Customer JWT Strategy - Token role: ${payload.role}, Expected: [${ROLES.CUSTOMER}, ${ROLES.USER}]`);
    if (![ROLES.CUSTOMER, ROLES.USER].includes(payload.role)) {
      return done(null, false, { 
        message: 'Customer access required',
        code: 'INSUFFICIENT_ROLE'
      });
    }
    
    // Get customer user with relations
    const user = await User.findByPk(payload.id, {
      where: { status: 'active' },
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Customer,
          as: 'customer',
          required: true
        },
        {
          model: Role,
          as: 'role',
          where: {
            name: {
              [User.sequelize.Sequelize.Op.in]: [ROLES.CUSTOMER, ROLES.USER, 'Customer', 'User'] // Accept both cases for compatibility
            }
          },
          required: true
        }
      ]
    });
    
    if (user) {
      user.tokenInfo = {
        jti: payload.jti,
        type: payload.type,
        iat: payload.iat,
        exp: payload.exp
      };
      return done(null, user);
    }
    
    return done(null, false, { 
      message: 'Customer not found or inactive',
      code: 'CUSTOMER_NOT_FOUND'
    });
  } catch (error) {
    console.error('Customer JWT Strategy error:', error);
    return done(error, false);
  }
}));

/**
 * Salon Owner JWT Strategy
 * Only allows users with 'salon_owner' role
 */
passport.use('owner-jwt', new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    // Check if token is blacklisted
    if (payload.jti) {
      const isBlacklisted = await TokenService.isTokenBlacklisted(payload.jti);
      if (isBlacklisted) {
        return done(null, false, { 
          message: 'Token has been revoked',
          code: 'TOKEN_REVOKED'
        });
      }
    }
    
    // Verify salon owner role from token payload first
    console.log(`Owner JWT Strategy - Token role: ${payload.role}, Expected: ${ROLES.SALON_OWNER}`);
    if (payload.role !== ROLES.SALON_OWNER) {
      console.log(`Owner JWT Strategy - Role mismatch: ${payload.role} !== ${ROLES.SALON_OWNER}`);
      return done(null, false, { 
        message: 'Salon owner access required',
        code: 'INSUFFICIENT_ROLE'
      });
    }
    
    // Get salon owner user with relations
    console.log(`Owner JWT Strategy - Looking for user with ID: ${payload.id}`);
    const user = await User.findByPk(payload.id, {
      where: { status: 'active' },
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Role,
          as: 'role',
          where: {
            name: ROLES.SALON_OWNER
          },
          required: true
        }
      ]
    });
    
    console.log(`Owner JWT Strategy - User found:`, user ? `ID: ${user.id}, Role: ${user.role?.name}` : 'No user found');
    
    if (user) {
      user.tokenInfo = {
        jti: payload.jti,
        type: payload.type,
        iat: payload.iat,
        exp: payload.exp
      };
      return done(null, user);
    }
    
    return done(null, false, { 
      message: 'Salon owner not found or inactive',
      code: 'OWNER_NOT_FOUND'
    });
  } catch (error) {
    console.error('Owner JWT Strategy error:', error);
    return done(error, false);
  }
}));

/**
 * Admin JWT Strategy
 * Only allows users with admin roles
 */
passport.use('admin-jwt', new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    // Check if token is blacklisted
    if (payload.jti) {
      const isBlacklisted = await TokenService.isTokenBlacklisted(payload.jti);
      if (isBlacklisted) {
        return done(null, false, { 
          message: 'Token has been revoked',
          code: 'TOKEN_REVOKED'
        });
      }
    }
    
    // Verify admin role from token payload first
    if (![ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(payload.role)) {
      return done(null, false, { 
        message: 'Admin access required',
        code: 'INSUFFICIENT_ROLE'
      });
    }
    
    const user = await User.findByPk(payload.id, {
      where: { 
        status: 'active' 
      },
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Role,
          as: 'role',
          where: {
            name: [ROLES.ADMIN, ROLES.SUPER_ADMIN]
          },
          required: true
        }
      ]
    });
    
    if (user) {
      user.tokenInfo = {
        jti: payload.jti,
        type: payload.type,
        iat: payload.iat,
        exp: payload.exp
      };
      return done(null, user);
    }
    
    return done(null, false, { 
      message: 'Admin not found or inactive',
      code: 'ADMIN_NOT_FOUND'
    });
  } catch (error) {
    console.error('Admin JWT Strategy error:', error);
    return done(error, false);
  }
}));

/**
 * Local Strategy for Customer Login
 * Validates email/password credentials for customer users
 */
passport.use('customer-local', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true // Allow access to req object
}, async (req, email, password, done) => {
  try {
    const user = await User.findOne({ 
      where: { 
        email: email.toLowerCase().trim(),
        status: 'active'
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          required: true
        },
        {
          model: Role,
          as: 'role',
          where: {
            name: {
              [User.sequelize.Sequelize.Op.in]: [ROLES.CUSTOMER, ROLES.USER, 'Customer', 'User'] // Accept both cases for compatibility
            }
          },
          required: true
        }
      ]
    });
    
    if (!user) {
      return done(null, false, { 
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return done(null, false, { 
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Update last login
    await user.update({ last_login: new Date() });
    
    return done(null, user);
  } catch (error) {
    console.error('Customer Local Strategy error:', error);
    return done(error, false);
  }
}));

/**
 * Local Strategy for Salon Owner Login
 */
passport.use('owner-local', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    const user = await User.findOne({ 
      where: { 
        email: email.toLowerCase().trim(),
        status: 'active'
      },
      include: [
        {
          model: SalonOwner,
          as: 'salonOwner',
          required: true
        },
        {
          model: Role,
          as: 'role',
          where: {
            name: ROLES.SALON_OWNER
          },
          required: true
        }
      ]
    });
    
    if (!user) {
      return done(null, false, { 
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return done(null, false, { 
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    await user.update({ last_login: new Date() });
    
    return done(null, user);
  } catch (error) {
    console.error('Owner Local Strategy error:', error);
    return done(error, false);
  }
}));

/**
 * Refresh Token Strategy
 * Validates refresh tokens for generating new access tokens
 */
passport.use('refresh-jwt', new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    // Only allow refresh tokens
    if (payload.type !== 'refresh') {
      return done(null, false, { 
        message: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }
    
    // Check if token is blacklisted
    if (payload.jti) {
      const isBlacklisted = await TokenService.isTokenBlacklisted(payload.jti);
      if (isBlacklisted) {
        return done(null, false, { 
          message: 'Refresh token has been revoked',
          code: 'TOKEN_REVOKED'
        });
      }
    }
    
    // Get user for refresh
    const user = await User.findByPk(payload.id, {
      where: { status: 'active' },
      attributes: { exclude: ['password_hash'] }
    });
    
    if (user) {
      user.tokenInfo = {
        jti: payload.jti,
        type: payload.type,
        iat: payload.iat,
        exp: payload.exp
      };
      return done(null, user);
    }
    
    return done(null, false, { 
      message: 'User not found for refresh',
      code: 'USER_NOT_FOUND'
    });
  } catch (error) {
    console.error('Refresh JWT Strategy error:', error);
    return done(error, false);
  }
}));

// Passport session configuration (not used for JWT but required for passport)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport; 