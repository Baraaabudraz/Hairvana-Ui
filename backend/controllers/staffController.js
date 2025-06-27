// Get all staff
exports.getAllStaff = async (req, res, next) => {
  try {
    const { salonId, serviceId } = req.query;
    
    let query = req.supabase
      .from('staff')
      .select('*');
    
    if (salonId) {
      query = query.eq('salon_id', salonId);
    }
    
    if (serviceId) {
      query = query.contains('services', [serviceId]);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    next(error);
  }
};

// Get staff by ID
exports.getStaffById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await req.supabase
      .from('staff')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Create a new staff member
exports.createStaff = async (req, res, next) => {
  try {
    const staffData = req.body;
    
    const { data, error } = await req.supabase
      .from('staff')
      .insert(staffData)
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

// Update a staff member
exports.updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staffData = req.body;
    
    const { data, error } = await req.supabase
      .from('staff')
      .update(staffData)
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

// Delete a staff member
exports.deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { error } = await req.supabase
      .from('staff')
      .delete()
      .eq('id', id);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Assign service to staff
exports.assignService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { serviceId } = req.body;
    
    // First get current services
    const { data: staffData, error: fetchError } = await req.supabase
      .from('staff')
      .select('services')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    // Add the new service if it's not already assigned
    const currentServices = staffData.services || [];
    if (!currentServices.includes(serviceId)) {
      const { error: updateError } = await req.supabase
        .from('staff')
        .update({ services: [...currentServices, serviceId] })
        .eq('id', id);
      
      if (updateError) {
        return res.status(400).json({ message: updateError.message });
      }
    }
    
    res.json({ message: 'Service assigned successfully' });
  } catch (error) {
    next(error);
  }
};

// Remove service from staff
exports.removeService = async (req, res, next) => {
  try {
    const { id, serviceId } = req.params;
    
    // First get current services
    const { data: staffData, error: fetchError } = await req.supabase
      .from('staff')
      .select('services')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    // Remove the service
    const currentServices = staffData.services || [];
    const updatedServices = currentServices.filter(id => id !== serviceId);
    
    const { error: updateError } = await req.supabase
      .from('staff')
      .update({ services: updatedServices })
      .eq('id', id);
    
    if (updateError) {
      return res.status(400).json({ message: updateError.message });
    }
    
    res.json({ message: 'Service removed successfully' });
  } catch (error) {
    next(error);
  }
};