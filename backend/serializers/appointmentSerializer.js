const { buildUrl } = require('../helpers/urlHelper');
// Appointment resource serializer

function serializeAppointment(appointment) {
  if (!appointment) return null;
  
  // Calculate appointment duration in minutes
  const duration = appointment.start_at && appointment.end_at 
    ? Math.round((new Date(appointment.end_at) - new Date(appointment.start_at)) / (1000 * 60))
    : appointment.duration || 60;

  // Calculate time until appointment
  const now = new Date();
  const appointmentDate = new Date(appointment.start_at);
  const timeUntilAppointment = appointmentDate > now 
    ? Math.round((appointmentDate - now) / (1000 * 60 * 60 * 24)) // days
    : null;

  // Calculate time details
  const timeDetails = {
    days_until: timeUntilAppointment,
    hours_until: appointmentDate > now 
      ? Math.round((appointmentDate - now) / (1000 * 60 * 60))
      : null,
    minutes_until: appointmentDate > now 
      ? Math.round((appointmentDate - now) / (1000 * 60))
      : null,
    formatted_date: appointmentDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    formatted_time: appointmentDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    formatted_end_time: appointment.end_at 
      ? new Date(appointment.end_at).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      : null
  };

  return {
    id: appointment.id,
    user_id: appointment.user_id,
    salon_id: appointment.salon_id,
    staff_id: appointment.staff_id,
    start_at: appointment.start_at,
    end_at: appointment.end_at,
    status: appointment.status,
    notes: appointment.notes,
    total_price: appointment.total_price,
    duration: duration,
    special_requests: appointment.special_requests,
    cancellation_reason: appointment.cancellation_reason,
    cancelled_at: appointment.cancelled_at,
    cancelled_by: appointment.cancelled_by,
    created_at: appointment.created_at,
    updated_at: appointment.updated_at,
    
    // Calculated fields
    time_until_appointment: timeUntilAppointment,
    is_upcoming: appointmentDate > now && appointment.status === 'booked',
    is_past: appointmentDate < now,
    is_today: appointmentDate.toDateString() === now.toDateString(),
    time_details: timeDetails,
    
    // Salon details
    salon: appointment.salon ? {
      id: appointment.salon.id,
      name: appointment.salon.name,
      phone: appointment.salon.phone,
      email: appointment.salon.email,
      avatar: appointment.salon.avatar,
      description: appointment.salon.description,
      hours: appointment.salon.hours,
      website: appointment.salon.website,
             address: appointment.salon.address ? {
         id: appointment.salon.address.id,
         street_address: appointment.salon.address.street_address,
         city: appointment.salon.address.city,
         state: appointment.salon.address.state,
         zip_code: appointment.salon.address.zip_code,
         country: appointment.salon.address.country,
         full_address: `${appointment.salon.address.street_address}, ${appointment.salon.address.city}, ${appointment.salon.address.state} ${appointment.salon.address.zip_code}, ${appointment.salon.address.country}`
       } : undefined,
    } : undefined,
    
    // Staff details
    staff: appointment.staff ? {
      id: appointment.staff.id,
      name: appointment.staff.name,
      avatar: appointment.staff.avatar,
      specializations: appointment.staff.specializations,
      experience_years: appointment.staff.experience_years,
      bio: appointment.staff.bio,
      role: appointment.staff.role,
      status: appointment.staff.status,
      hourly_rate: appointment.staff.hourly_rate,
    } : undefined,
    
    // User details (if included)
    user: appointment.user ? {
      id: appointment.user.id,
      name: appointment.user.name,
      email: appointment.user.email,
      avatar: appointment.user.avatar,
    } : undefined,
    
    // Services details
    services: appointment.services ? appointment.services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      image_url: service.image_url ? buildUrl(service.image_url, 'service') : service.image_url,
    })) : [],
    
    // Payment details
    payment: appointment.payment ? {
      id: appointment.payment.id,
      amount: appointment.payment.amount,
      method: appointment.payment.method,
      status: appointment.payment.status,
      transaction_id: appointment.payment.transaction_id,
      created_at: appointment.payment.created_at,
      updated_at: appointment.payment.updated_at,
    } : undefined,
  };
}

module.exports = {
  serializeAppointment,
}; 