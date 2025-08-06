const rateLimit = require('express-rate-limit');

// Rate limiting for login attempts
const loginRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 05 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again after 5 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for registration attempts
const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registration attempts per hour
  message: 'Too many registration attempts, please try again after 1 hour',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for password change attempts
const passwordChangeRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 password change attempts per 5 minutes
  message: 'Too many password change attempts, please try again after 5 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginRateLimit,
  registerRateLimit,
  passwordChangeRateLimit
}; 