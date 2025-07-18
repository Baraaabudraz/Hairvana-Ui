const salonRepository = require('../repositories/salonRepository');
const { formatAddress, formatLocation } = require('../helpers/formatHelper');
const { serializeSalon } = require('../serializers/salonSerializer');

exports.getAllSalons = async (query, req) => {
  const { rows, count } = await salonRepository.findAll(query);
  const salons = await Promise.all(rows.map(async salon => {
    const revenue = await salonRepository.getRevenue(salon.id);
    const bookings = await salonRepository.getBookings(salon.id);
    const rating = await salonRepository.getRating(salon.id);
    return serializeSalon({ ...salon.toJSON(), revenue, bookings, rating }, { req });
  }));
  return { salons, total: count };
};

exports.getSalonById = async (id, req) => {
  const salon = await salonRepository.findById(id);
  if (!salon) return null;
  const revenue = await salonRepository.getRevenue(id);
  const bookings = await salonRepository.getBookings(id);
  const rating = await salonRepository.getRating(id);
  return serializeSalon({ ...salon.toJSON(), revenue, bookings, rating }, { req });
};

exports.createSalon = async (data, user, req) => {
  const address = formatAddress(data);
  const location = formatLocation(data);
  const salonData = { ...data, address, location, ownerId: user.userId };
  delete salonData.city; delete salonData.state; delete salonData.zipCode;
  const newSalon = await salonRepository.create(salonData);
  return serializeSalon(newSalon, { req });
};

exports.updateSalon = async (id, data, req) => {
  const updatedSalon = await salonRepository.update(id, data);
  return updatedSalon ? serializeSalon(updatedSalon, { req }) : null;
};

exports.deleteSalon = async (id) => {
  return salonRepository.delete(id);
};

exports.updateSalonStatus = async (id, status, req) => {
  const updatedSalon = await salonRepository.updateStatus(id, status);
  return updatedSalon ? serializeSalon(updatedSalon, { req }) : null;
};

exports.getSalonServices = async (id) => {
  return salonRepository.getServices(id);
};

exports.getSalonStaff = async (id) => {
  return salonRepository.getStaff(id);
};

exports.getSalonAppointments = async (id, query) => {
  return salonRepository.getAppointments(id, query);
}; 