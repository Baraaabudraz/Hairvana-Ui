// Staff resource serializer

function serializeStaff(staff) {
  if (!staff) return null;
  return {
    id: staff.id,
    name: staff.name,
    email: staff.email,
    phone: staff.phone,
    salon_id: staff.salon_id,
    role: staff.role,
    status: staff.status,
    avatar: staff.avatar,
    schedule: staff.schedule,
    hire_date: staff.hire_date,
    hourly_rate: staff.hourly_rate,
    commission_rate: staff.commission_rate,
    specializations: staff.specializations,
    bio: staff.bio,
    experience_years: staff.experience_years,
  };
}

module.exports = {
  serializeStaff,
}; 