// Service resource serializer

function serializeService(service) {
  if (!service) return null;
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    price: service.price,
    duration: service.duration,
    status: service.status,
    image_url: service.image_url,
    is_popular: service.is_popular,
    special_offers: service.special_offers,
  };
}

module.exports = {
  serializeService,
}; 