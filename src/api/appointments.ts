import { supabase } from '@/lib/supabase';

export async function fetchAppointments(params: { 
  userId?: string; 
  salonId?: string; 
  status?: string;
  from?: string;
  to?: string;
} = {}) {
  try {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        salon:salons(id, name, location, address, phone, email, images),
        service:services(id, name, price, duration, description),
        staff:staff(id, name, avatar, bio),
        user:users(id, name, email, phone, avatar)
      `);
    
    if (params.userId) {
      query = query.eq('user_id', params.userId);
    }
    
    if (params.salonId) {
      query = query.eq('salon_id', params.salonId);
    }
    
    if (params.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }
    
    if (params.from) {
      query = query.gte('date', params.from);
    }
    
    if (params.to) {
      query = query.lte('date', params.to);
    }
    
    // Order by date
    query = query.order('date', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}

export async function fetchAppointmentById(id: string) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        salon:salons(id, name, location, address, phone, email, images),
        service:services(id, name, price, duration, description),
        staff:staff(id, name, avatar, bio),
        user:users(id, name, email, phone, avatar)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error fetching appointment with ID ${id}:`, error);
    throw error;
  }
}

export async function createAppointment(appointmentData: any) {
  try {
    // Get service details for duration
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration, price')
      .eq('id', appointmentData.service_id)
      .single();
    
    if (serviceError) throw serviceError;
    
    // Check if the time slot is available
    const appointmentDate = new Date(appointmentData.date);
    const endTime = new Date(appointmentDate.getTime() + service.duration * 60000);
    
    const { data: existingAppointments, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('staff_id', appointmentData.staff_id)
      .eq('status', 'confirmed')
      .lt('date', endTime.toISOString())
      .gt('date', appointmentDate.toISOString());
    
    if (appointmentError) throw appointmentError;
    
    if (existingAppointments && existingAppointments.length > 0) {
      throw new Error('This time slot is not available');
    }
    
    // Create appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        ...appointmentData,
        duration: service.duration
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

export async function updateAppointment(id: string, appointmentData: any) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update(appointmentData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error updating appointment with ID ${id}:`, error);
    throw error;
  }
}

export async function cancelAppointment(id: string) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error cancelling appointment with ID ${id}:`, error);
    throw error;
  }
}

export async function checkAvailability(params: {
  salonId: string;
  staffId: string;
  serviceId: string;
  date: string;
}) {
  try {
    // Get salon hours for the day of the week
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('hours')
      .eq('id', params.salonId)
      .single();
    
    if (salonError) throw salonError;
    
    // Get service duration
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration')
      .eq('id', params.serviceId)
      .single();
    
    if (serviceError) throw serviceError;
    
    // Get existing appointments for the staff on the given date
    const selectedDate = new Date(params.date);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('date, duration')
      .eq('staff_id', params.staffId)
      .gte('date', selectedDate.toISOString())
      .lt('date', nextDay.toISOString())
      .in('status', ['pending', 'confirmed']);
    
    if (appointmentsError) throw appointmentsError;
    
    // Get day of week
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()];
    
    // Get salon hours for the day
    const dayHours = salon.hours[dayOfWeek];
    
    if (!dayHours || dayHours.closed) {
      return {
        available: false,
        message: 'Salon is closed on this day',
        timeSlots: []
      };
    }
    
    // Parse opening and closing hours
    const [openHour, openMinute] = dayHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = dayHours.close.split(':').map(Number);
    
    const openTime = new Date(selectedDate);
    openTime.setHours(openHour, openMinute, 0, 0);
    
    const closeTime = new Date(selectedDate);
    closeTime.setHours(closeHour, closeMinute, 0, 0);
    
    // Generate time slots (30-minute intervals)
    const timeSlots = [];
    const slotDuration = 30; // minutes
    const serviceDuration = service.duration;
    
    // Ensure we don't schedule appointments that would end after closing time
    const lastSlotTime = new Date(closeTime);
    lastSlotTime.setMinutes(lastSlotTime.getMinutes() - serviceDuration);
    
    // Create a map of busy times
    const busyTimes = new Map();
    appointments?.forEach(appointment => {
      const startTime = new Date(appointment.date);
      const endTime = new Date(startTime.getTime() + appointment.duration * 60000);
      
      // Mark all 30-minute slots that overlap with this appointment as busy
      let currentSlot = new Date(startTime);
      currentSlot.setMinutes(Math.floor(currentSlot.getMinutes() / slotDuration) * slotDuration, 0, 0);
      
      while (currentSlot < endTime) {
        busyTimes.set(currentSlot.getTime(), true);
        currentSlot = new Date(currentSlot.getTime() + slotDuration * 60000);
      }
    });
    
    // Generate available time slots
    let currentTime = new Date(openTime);
    while (currentTime <= lastSlotTime) {
      const slotEndTime = new Date(currentTime.getTime() + serviceDuration * 60000);
      
      // Check if any 30-minute slot within the service duration is busy
      let isAvailable = true;
      let checkTime = new Date(currentTime);
      while (checkTime < slotEndTime) {
        if (busyTimes.has(checkTime.getTime())) {
          isAvailable = false;
          break;
        }
        checkTime = new Date(checkTime.getTime() + slotDuration * 60000);
      }
      
      if (isAvailable) {
        timeSlots.push({
          time: currentTime.toISOString(),
          formattedTime: currentTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })
        });
      }
      
      // Move to next slot
      currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }
    
    return {
      available: timeSlots.length > 0,
      timeSlots,
      serviceDuration
    };
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}