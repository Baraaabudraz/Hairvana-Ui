// Get all salons
exports.getAllSalons = async (req, res, next) => {
  try {
    const { status, search, ownerId } = req.query;
    
    let query = req.supabase
      .from('salons')
      .select('*', { count: 'exact' });
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%,owner_name.ilike.%${search}%`);
    }
    
    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    res.json({
      salons: data || [],
      total: count || 0
    });
  } catch (error) {
    next(error);
  }
};

// Get salon by ID
exports.getSalonById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await req.supabase
      .from('salons')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return res.status(404).json({ message: 'Salon not found' });
    }
    
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Create a new salon
exports.createSalon = async (req, res, next) => {
  try {
    const salonData = req.body;
    
    const { data, error } = await req.supabase
      .from('salons')
      .insert(salonData)
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

// Update a salon
exports.updateSalon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const salonData = req.body;
    
    const { data, error } = await req.supabase
      .from('salons')
      .update(salonData)
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

// Delete a salon
exports.deleteSalon = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { error } = await req.supabase
      .from('salons')
      .delete()
      .eq('id', id);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.json({ message: 'Salon deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Update salon status
exports.updateSalonStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const { data, error } = await req.supabase
      .from('salons')
      .update({ status })
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

// Get salon services
exports.getSalonServices = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await req.supabase
      .from('services')
      .select('*')
      .eq('salon_id', id);
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    next(error);
  }
};

// Get salon staff
exports.getSalonStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await req.supabase
      .from('staff')
      .select('*')
      .eq('salon_id', id);
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    next(error);
  }
};

// Get salon appointments
exports.getSalonAppointments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, from, to } = req.query;
    
    let query = req.supabase
      .from('appointments')
      .select(`
        *,
        user:users(id, name, email, phone, avatar),
        service:services(id, name, price, duration),
        staff:staff(id, name, avatar)
      `)
      .eq('salon_id', id);
    
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