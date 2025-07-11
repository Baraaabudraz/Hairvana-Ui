// User resource serializer

function serializeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    avatar: user.avatar,
    join_date: user.join_date,
    last_login: user.last_login,
    userSettings: user.userSettings ? {
      // Add specific user settings fields as needed
      ...user.userSettings
    } : undefined,
  };
}

module.exports = {
  serializeUser,
}; 