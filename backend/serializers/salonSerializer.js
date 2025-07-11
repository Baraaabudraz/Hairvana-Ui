// Salon resource serializer

function serializeSalon(salon) {
  if (!salon) return null;
  return {
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
    gallery: salon.gallery,
    owner: salon.owner ? {
      id: salon.owner.id,
      name: salon.owner.name,
      email: salon.owner.email,
      avatar: salon.owner.avatar,
    } : undefined,
  };
}

module.exports = {
  serializeSalon,
}; 