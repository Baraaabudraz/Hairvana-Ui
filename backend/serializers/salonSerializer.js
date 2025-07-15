// Salon resource serializer

function serializeSalon(salon, options = {}) {
  if (!salon) return null;
  // Helper to build full URL
  const buildUrl = (img) =>
    img && !img.startsWith('http')
      ? `${options.req?.protocol || 'http'}://${options.req?.get ? options.req.get('host') : 'localhost:5000'}${img}`
      : img;

  const salonData = {
    id: salon.id,
    name: salon.name,
    email: salon.email,
    phone: salon.phone,
    address: salon.address,
    location: salon.location,
    status: salon.status,
    join_date: salon.join_date,
    revenue: salon.revenue,
    bookings: salon.bookings,
    rating: salon.rating,
    hours: salon.hours,
    owner_id: salon.owner_id,
    // Include owner information
    owner_name: salon.owner?.name || salon.owner_name,
    owner_email: salon.owner?.email || salon.owner_email,
    owner_phone: salon.owner?.phone || salon.owner_phone,
    owner_avatar: salon.owner?.avatar || salon.owner_avatar,
    owner_role: salon.owner?.role || salon.owner_role,
    // Include services if available
    services: salon.services || [],
    // Include additional fields that might be present
    website: salon.website,
    description: salon.description,
    business_license: salon.business_license,
    tax_id: salon.tax_id,
    images: Array.isArray(salon.images)
      ? salon.images.map(buildUrl)
      : (salon.images ? [buildUrl(salon.images)] : []),
    created_at: salon.created_at,
    updated_at: salon.updated_at
  };
  
  return salonData;
}

module.exports = {
  serializeSalon,
}; 