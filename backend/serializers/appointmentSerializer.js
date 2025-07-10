// Appointment resource serializer

function serializeAppointment(appointment) {
  if (!appointment) return null;
  return {
    id: appointment.id,
    date: appointment.date,
    status: appointment.status,
    // Add more appointment fields as needed
    salon: appointment.salon ? {
      id: appointment.salon.id,
      name: appointment.salon.name,
      address: appointment.salon.address,
      phone: appointment.salon.phone,
      email: appointment.salon.email,
    } : undefined,
    staff: appointment.staff ? {
      id: appointment.staff.id,
      name: appointment.staff.name,
      avatar: appointment.staff.avatar,
    } : undefined,
    user: appointment.user ? {
      id: appointment.user.id,
      name: appointment.user.name,
      email: appointment.user.email,
      avatar: appointment.user.avatar,
    } : undefined,
    services: appointment.services ? appointment.services.map(service => ({
      id: service.id,
      name: service.name,
      price: service.price,
      duration: service.duration,
    })) : [],
    payment: appointment.payment ? {
      id: appointment.payment.id,
      amount: appointment.payment.amount,
      method: appointment.payment.method,
      status: appointment.payment.status,
    } : undefined,
  };
}

module.exports = {
  serializeAppointment,
}; 