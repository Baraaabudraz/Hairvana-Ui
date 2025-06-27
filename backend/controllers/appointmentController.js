// Get all appointments
exports.getAllAppointments = async (req, res, next) => {
  try {
    const { userId, salonId, status, from, to } = req.query;
    
    let query = req.supabase
      .from('appointments')
      .select(`
        *,
        salon:salons(id, name, location, address, phone, email, images),
        service:services(id, name, price, duration, description),
        staff:staff(id, name, avatar, bio),
        user:users(id, name, email, phone, avatar)
      `);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (salonId) {
      query = query.eq('salon_id', salonId);
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (from) {
      query = query.gte('date', from);
    }
    
    if (to) {
      query = query.lte('date', to);
    }
    
    // Order by date
    query = query.order('date', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    next(error);
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await req.supabase
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
    
    if (error) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Create a new appointment
exports.createAppointment = async (req, res, next) => {
  try {
    const appointmentData = req.body;
    
    // Get service details for duration
    const { data: service, error: serviceError } = await req.supabase
      .from('services')
      .select('duration, price')
      .eq('id', appointmentData.service_id)
      .single();
    
    if (serviceError) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if the time slot is available
    const appointmentDate = new Date(appointmentData.date);
    const endTime = new Date(appointmentDate.getTime() + service.duration * 60000);
    
    const { data: existingAppointments, error: appointmentError } = await req.supabase
      .from('appointments')
      .select('*')
      .eq('staff_id', appointmentData.staff_id)
      .eq('status', 'confirmed')
      .lt('date', endTime.toISOString())
      .gt('date', appointmentDate.toISOString());
    
    if (appointmentError) {
      return res.status(400).json({ message: appointmentError.message });
    }
    
    if (existingAppointments && existingAppointments.length > 0) {
      return res.status(409).json({ message: 'This time slot is not available' });
    }
    
    // Create appointment
    const { data, error } = await req.supabase
      .from('appointments')
      .insert({
        ...appointmentData,
        duration: service.duration
      })
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

// Update an appointment
exports.updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointmentData = req.body;
    
    const { data, error } = await req.supabase
      .from('appointments')
      .update(appointmentData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Cancel an appointment
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await req.supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Check availability
exports.checkAvailability = async (req, res, next) => {
  try {
    const { salonId, staffId, serviceId, date } = req.query;
    
    if (!salonId || !staffId || !serviceId || !date) {
      return res.status(400).json({ message: 'Salon ID, staff ID, service ID, and date are required' });
    }
    
    // Get salon hours for the day of the week
    const { data: salon, error: salonError } = await req.supabase
      .from('salons')
      .select('hours')
      .eq('id', salonId)
      .single();
    
    if (salonError) {
      return res.status(404).json({ message: 'Salon not found' });
    }
    
    // Get service duration
    const { data: service, error: serviceError } = await req.supabase
      .from('services')
      .select('duration')
      .eq('id', serviceId)
      .single();
    
    if (serviceError) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Get existing appointments for the staff on the given date
    const selectedDate = new Date(date);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const { data: appointments, error: appointmentsError } = await req.supabase
      .from('appointments')
      .select('date, duration')
      .eq('staff_id', staffId)
      .gte('date', selectedDate.toISOString())
      .lt('date', nextDay.toISOString())
      .in('status', ['pending', 'confirmed']);
    
    if (appointmentsError) {
      return res.status(400).json({ message: appointmentsError.message });
    }
    
    // Get day of week
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()];
    
    // Get salon hours for the day
    const dayHours = salon.hours[dayOfWeek];
    
    if (!dayHours || dayHours.closed) {
      return res.json({
        available: false,
        message: 'Salon is closed on this day',
        timeSlots: []
      });
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
    
    res.json({
      available: timeSlots.length > 0,
      timeSlots,
      serviceDuration
    });
  } catch (error) {
    next(error);
  }
};