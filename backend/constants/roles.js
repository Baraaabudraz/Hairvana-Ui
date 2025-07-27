// Role constants for consistent naming across the application
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin', 
  SALON_OWNER: 'salon',
  CUSTOMER: 'Customer', // Match the actual database value
  USER: 'user', // Legacy support
};

// Role display names for frontend
const ROLE_DISPLAY_NAMES = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.SALON_OWNER]: 'Salon Owner',
  [ROLES.CUSTOMER]: 'Customer',
  [ROLES.USER]: 'Customer', // Legacy mapping
};

// Default role colors
const ROLE_COLORS = {
  [ROLES.SUPER_ADMIN]: '#dc2626', // Red
  [ROLES.ADMIN]: '#2563eb',       // Blue  
  [ROLES.SALON_OWNER]: '#16a34a', // Green
  [ROLES.CUSTOMER]: '#6B7280',    // Gray
  [ROLES.USER]: '#6B7280',        // Gray
};

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 4,
  [ROLES.ADMIN]: 3,
  [ROLES.SALON_OWNER]: 2,
  [ROLES.CUSTOMER]: 1,
  [ROLES.USER]: 1,
};

module.exports = {
  ROLES,
  ROLE_DISPLAY_NAMES,
  ROLE_COLORS,
  ROLE_HIERARCHY,
}; 