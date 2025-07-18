// Salon resource serializer

function serializeSalon(salon, options = {}) {
  if (!salon) return null;
  // Helper to build full URL from relative path
  const buildUrl = (img) => {
    if (!img) return img;
    // If already absolute URL, return as is
    if (img.startsWith('http')) return img;
    // If starts with '/', treat as relative to server root
    const base = `${options.req?.protocol || 'http'}://${options.req?.get ? options.req.get('host') : 'localhost:5000'}`;
    return img.startsWith('/') ? `${base}${img}` : `${base}/uploads/salons/${img}`;
  };

  const salonData = {
    id: salon.id,
    name: salon.name,
    email: salon.email,
    phone: salon.phone,
    address: salon.address,
    location: salon.location,
    status: salon.status,
    join_date: salon.join_date,
    revenue: typeof salon.revenue !== 'undefined' ? salon.revenue : undefined,
    bookings: typeof salon.bookings !== 'undefined' ? salon.bookings : undefined,
    rating: typeof salon.rating !== 'undefined' ? salon.rating : undefined,
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