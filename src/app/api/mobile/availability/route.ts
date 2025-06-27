import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');
    const staffId = searchParams.get('staffId');
    const serviceId = searchParams.get('serviceId');
    const date = searchParams.get('date');

    if (!salonId || !staffId || !serviceId || !date) {
      return NextResponse.json(
        { error: 'Salon ID, staff ID, service ID, and date are required' },
        { status: 400 }
      );
    }

    // Get salon hours for the day of the week
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('hours')
      .eq('id', salonId)
      .single();

    if (salonError) {
      console.error('Error fetching salon hours:', salonError);
      return NextResponse.json(
        { error: 'Failed to fetch salon hours' },
        { status: 500 }
      );
    }

    // Get service duration
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration')
      .eq('id', serviceId)
      .single();

    if (serviceError) {
      console.error('Error fetching service:', serviceError);
      return NextResponse.json(
        { error: 'Failed to fetch service details' },
        { status: 500 }
      );
    }

    // Get existing appointments for the staff on the given date
    const selectedDate = new Date(date);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('date, duration')
      .eq('staff_id', staffId)
      .gte('date', selectedDate.toISOString())
      .lt('date', nextDay.toISOString())
      .in('status', ['pending', 'confirmed']);

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    // Get day of week
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()];
    
    // Get salon hours for the day
    const dayHours = salon.hours[dayOfWeek];
    
    if (!dayHours || dayHours.closed) {
      return NextResponse.json({
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

    return NextResponse.json({
      available: timeSlots.length > 0,
      timeSlots,
      serviceDuration
    });
  } catch (error) {
    console.error('Error in availability API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}