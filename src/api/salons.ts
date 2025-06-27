import { supabase } from '@/lib/supabase';

export async function fetchSalons(params = {}) {
  try {
    // For demo purposes, return mock data
    const mockSalons = [
      {
        id: 1,
        name: 'Luxe Hair Studio',
        email: 'contact@luxehair.com',
        phone: '+1 (555) 123-4567',
        location: 'Beverly Hills, CA',
        status: 'active',
        subscription: 'Premium',
        joinDate: '2024-01-15',
        revenue: '$12,450',
        bookings: 156,
        rating: 4.9,
        avatar: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      },
      {
        id: 2,
        name: 'Urban Cuts',
        email: 'info@urbancuts.com',
        phone: '+1 (555) 234-5678',
        location: 'Manhattan, NY',
        status: 'active',
        subscription: 'Standard',
        joinDate: '2024-02-20',
        revenue: '$9,820',
        bookings: 134,
        rating: 4.8,
        avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      },
      {
        id: 3,
        name: 'Style & Grace',
        email: 'hello@styleandgrace.com',
        phone: '+1 (555) 345-6789',
        location: 'Miami, FL',
        status: 'pending',
        subscription: 'Basic',
        joinDate: '2024-03-10',
        revenue: '$0',
        bookings: 0,
        rating: 0,
        avatar: 'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      },
      {
        id: 4,
        name: 'The Hair Lounge',
        email: 'contact@hairlounge.com',
        phone: '+1 (555) 456-7890',
        location: 'Austin, TX',
        status: 'suspended',
        subscription: 'Standard',
        joinDate: '2024-01-05',
        revenue: '$7,230',
        bookings: 87,
        rating: 4.6,
        avatar: 'https://images.pexels.com/photos/3992660/pexels-photo-3992660.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      },
    ];

    return { salons: mockSalons, total: mockSalons.length };

    // In a real app with Supabase, you would use:
    /*
    let query = supabase
      .from('salons')
      .select('*', { count: 'exact' });
      
    // Apply filters from params
    if (params.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }
    
    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,location.ilike.%${params.search}%,owner_name.ilike.%${params.search}%`);
    }
    
    if (params.ownerId) {
      query = query.eq('owner_id', params.ownerId);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return { salons: data || [], total: count || 0 };
    */
  } catch (error) {
    console.error('Error fetching salons:', error);
    throw error;
  }
}

export async function fetchSalonById(id: string) {
  try {
    // For demo purposes, return mock data
    const mockSalon = {
      id,
      name: 'Luxe Hair Studio',
      email: 'contact@luxehair.com',
      phone: '+1 (555) 123-4567',
      address: '123 Rodeo Drive, Beverly Hills, CA 90210',
      location: 'Beverly Hills, CA',
      status: 'active',
      subscription: 'Premium',
      joinDate: '2024-01-15',
      revenue: '$12,450',
      bookings: 156,
      rating: 4.9,
      website: 'https://www.luxehair.com',
      description: 'Luxe Hair Studio is a premier destination for hair care and styling in Beverly Hills. We offer a full range of services from cuts and color to treatments and styling, all delivered by our team of expert stylists in a luxurious, relaxing environment.',
      services: ['Haircut', 'Hair Color', 'Hair Styling', 'Hair Treatment', 'Beard Trim', 'Eyebrow Threading'],
      hours: {
        monday: '9:00 AM - 8:00 PM',
        tuesday: '9:00 AM - 8:00 PM',
        wednesday: '9:00 AM - 8:00 PM',
        thursday: '9:00 AM - 8:00 PM',
        friday: '9:00 AM - 9:00 PM',
        saturday: '8:00 AM - 9:00 PM',
        sunday: '10:00 AM - 6:00 PM',
      },
      ownerName: 'Sarah Johnson',
      ownerEmail: 'sarah@luxehair.com',
      ownerPhone: '+1 (555) 123-4568',
      businessLicense: 'BL123456789',
      taxId: '12-3456789',
      images: [
        'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
        'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
        'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
        'https://images.pexels.com/photos/3992660/pexels-photo-3992660.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
      ],
    };

    return mockSalon;

    // In a real app with Supabase, you would use:
    /*
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    return data;
    */
  } catch (error) {
    console.error(`Error fetching salon with ID ${id}:`, error);
    throw error;
  }
}

export async function createSalon(salonData: any) {
  try {
    // For demo purposes, return mock data
    return {
      id: Date.now().toString(),
      ...salonData,
      status: 'pending',
      subscription: 'Basic',
      joinDate: new Date().toISOString().split('T')[0],
      revenue: 0,
      bookings: 0,
      rating: 0,
    };

    // In a real app with Supabase, you would use:
    /*
    const { data, error } = await supabase
      .from('salons')
      .insert(salonData)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
    */
  } catch (error) {
    console.error('Error creating salon:', error);
    throw error;
  }
}

export async function updateSalon(id: string, salonData: any) {
  try {
    // For demo purposes, return mock data
    return {
      id,
      ...salonData,
    };

    // In a real app with Supabase, you would use:
    /*
    const { data, error } = await supabase
      .from('salons')
      .update(salonData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
    */
  } catch (error) {
    console.error(`Error updating salon with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteSalon(id: string) {
  try {
    // For demo purposes, just return success
    return { success: true };

    // In a real app with Supabase, you would use:
    /*
    const { error } = await supabase
      .from('salons')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return { success: true };
    */
  } catch (error) {
    console.error(`Error deleting salon with ID ${id}:`, error);
    throw error;
  }
}