// Salon resource serializer

function serializeSalon(salon, options = {}) {
  if (!salon) return null;
  
  // Debug: Log what data is available
  console.log('Salon serializer - Available data:', {
    hasAddress: !!salon.address,
    hasServices: !!salon.services,
    addressData: salon.address,
    servicesData: salon.services
  });
  
  // Helper to build full URL with domain
  const buildUrl = (img) => {
    if (!img) return img;
    // If already absolute URL, return as is
    if (img.startsWith('http')) return img;
    // Build full URL with domain
    const base = `${options.req?.protocol || 'http'}://${options.req?.get ? options.req.get('host') : 'localhost:5000'}`;
    return img.startsWith('/') ? `${base}${img}` : `${base}/images/salon/${img}`;
  };

  const salonData = {
    id: salon.id,
    name: salon.name,
    email: salon.email,
    phone: salon.phone,
    // Format address data from Address model
    address: salon.address ? {
      id: salon.address.id,
      street_address: salon.address.street_address,
      city: salon.address.city,
      state: salon.address.state,
      zip_code: salon.address.zip_code,
      country: salon.address.country,
      full_address: salon.address.getFullAddress ? salon.address.getFullAddress() : 
        `${salon.address.street_address}, ${salon.address.city}, ${salon.address.state} ${salon.address.zip_code}`,
      short_address: salon.address.getShortAddress ? salon.address.getShortAddress() : 
        `${salon.address.city}, ${salon.address.state}`
    } : null,
    address_id: salon.address_id,
    // Legacy location field for backward compatibility
    location: salon.address ? `${salon.address.city}, ${salon.address.state}` : null,
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
    owner_avatar: buildUrl(salon.owner?.avatar || salon.owner_avatar),
    owner_role: salon.owner?.role || salon.owner_role,
    // Include services if available
    services: salon.services || [],
    // Include additional fields that might be present
    website: salon.website,
    description: salon.description,
    business_license: salon.business_license,
    tax_id: salon.tax_id,
    avatar: buildUrl(salon.avatar),
    gallery: Array.isArray(salon.gallery) ? salon.gallery.map(img => buildUrl(img)) : [],
    created_at: salon.created_at,
    updated_at: salon.updated_at
  };
  
  return salonData;
}

module.exports = {
  serializeSalon,
}; 