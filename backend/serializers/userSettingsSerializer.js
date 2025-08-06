const { buildAvatarUrl } = require('../helpers/urlHelper');

const serializeUserSettings = (settings, options = {}) => {
  return {
    profile: {
      ...settings.profile,
      // Use urlHelper to build proper avatar URL
      avatar: buildAvatarUrl(settings.profile.avatar, options)
    },
    security: settings.security || {},
    notifications: settings.notifications || {},
    billing: settings.billing || {},
    backup: settings.backup || {}
  };
};

module.exports = {
  serializeUserSettings
}; 