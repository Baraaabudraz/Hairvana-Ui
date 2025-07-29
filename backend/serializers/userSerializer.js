// User resource serializer with flexible contexts and field selection

/**
 * Serializes user data based on context and field selection
 * @param {Object} user - User model instance
 * @param {Object} options - Serialization options
 * @param {string} options.context - Context: 'dashboard', 'mobile', 'public', 'admin'
 * @param {Array} options.fields - Specific fields to include
 * @param {boolean} options.includeAssociations - Whether to include related data
 * @param {Object} options.currentUser - Current authenticated user (for permission checks)
 * @returns {Object} Serialized user data
 */
function serializeUser(user, options = {}) {
  if (!user) return null;

  const {
    context = 'default',
    fields = null,
    includeAssociations = true,
    currentUser = null,
    avatarFilenameOnly = false
  } = options;

  // Base user data
  const baseData = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: avatarFilenameOnly ? user.avatar : (
      user.avatar && !user.avatar.startsWith('http') && !user.avatar.startsWith('blob:')
        ? `${options.req?.protocol || 'http'}://${options.req?.get ? options.req.get('host') : 'localhost:5000'}/images/avatar/${user.avatar}`
        : user.avatar
    ),
    join_date:user.join_date,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role_id: user.role_id,
    role: user.role
      ? {
          id: user.role.id,
          name: user.role.name,
          color: user.role.color,
          description: user.role.description,
        }
      : undefined,
  };

  // Context-specific data
  const contextData = getContextSpecificData(user, context, currentUser);

  // Association data
  const associationData = includeAssociations 
    ? getAssociationData(user, context) 
    : {};

  // Merge all data
  const fullData = {
    ...baseData,
    ...contextData,
    ...associationData
  };

  // Filter by specific fields if provided
  if (fields && Array.isArray(fields)) {
    return filterFields(fullData, fields);
  }

  return fullData;
}

/**
 * Get context-specific data based on the serialization context
 */
function getContextSpecificData(user, context, currentUser) {
  const contextData = {};

  switch (context) {
    
    case 'dashboard':
    case 'admin':
      contextData.role_id = user.role_id;
      contextData.status = user.status;
      contextData.join_date = user.join_date || user.createdAt || user.created_at;
      contextData.last_login = user.last_login;
      contextData.permissions = user.permissions;
      break;

    case 'mobile':
    case 'profile':
      contextData.preferences = user.preferences;
      // Don't include sensitive admin fields
      break;

    case 'public':
      // Only include public information
      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      };

    case 'minimal':
      // Minimal user info for lists/references
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      };

    default:
      // Default context includes common fields
      contextData.role_id = user.role_id;
      contextData.status = user.status;
      contextData.preferences = user.preferences;
      break;
  }

  return contextData;
}

/**
 * Get association data based on context
 */
function getAssociationData(user, context) {
  const associations = {};

  // Include salon owner data if available
  if (user.salonOwner) {
    associations.salonOwner = {
      id: user.salonOwner.id,
      total_salons: user.salonOwner.total_salons,
      total_revenue: user.salonOwner.total_revenue,
      total_bookings: user.salonOwner.total_bookings
    };

    // Include salons if available
    if (user.salonOwner.salons) {
      associations.salonOwner.salons = user.salonOwner.salons.map(salon => ({
        id: salon.id,
        name: salon.name,
        status: salon.status,
        address: salon.address
      }));
    }
  }

  // Include salons directly associated with user
  if (user.salons && user.salons.length > 0) {
    associations.salons = user.salons.map(salon => ({
      id: salon.id,
      name: salon.name,
      status: salon.status,
      address: salon.address
    }));
  }

  // Include customer data if available
  if (user.customer) {
    associations.customer = {
      id: user.customer.id,
      total_spent: user.customer.total_spent,
      total_bookings: user.customer.total_bookings,
      favorite_services: user.customer.favorite_services
    };
  }

  // Include user settings if available
  if (user.userSettings) {
    associations.userSettings = user.userSettings;
  }

  return associations;
}

/**
 * Filter object to only include specified fields
 */
function filterFields(data, fields) {
  const filtered = {};
  fields.forEach(field => {
    if (data.hasOwnProperty(field)) {
      filtered[field] = data[field];
    }
  });
  return filtered;
}

/**
 * Serialize multiple users
 */
function serializeUsers(users, options = {}) {
  if (!users || !Array.isArray(users)) return [];
  return users.map(user => serializeUser(user, options));
}

/**
 * Predefined serialization contexts for common use cases
 */
const serializationContexts = {
  dashboard: (user, currentUser) => serializeUser(user, { 
    context: 'dashboard', 
    currentUser 
  }),
  
  mobile: (user, currentUser) => serializeUser(user, { 
    context: 'mobile', 
    currentUser 
  }),
  
  profile: (user, currentUser) => serializeUser(user, { 
    context: 'profile', 
    currentUser 
  }),
  
  public: (user) => serializeUser(user, { 
    context: 'public' 
  }),
  
  minimal: (user) => serializeUser(user, { 
    context: 'minimal',
    includeAssociations: false
  }),
  
  // Custom field selection examples
  profileFields: (user) => serializeUser(user, {
    fields: ['id', 'name', 'email', 'phone', 'avatar', 'preferences', 'createdAt', 'updatedAt']
  }),
  
  dashboardList: (user) => serializeUser(user, {
    context: 'dashboard',
    fields: ['id', 'name', 'email', 'role', 'status', 'join_date', 'last_login']
  })
};

module.exports = {
  serializeUser,
  serializeUsers,
  serializationContexts
};