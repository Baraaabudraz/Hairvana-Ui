// Get all services
exports.getAllServices = async (req, res, next) => {
  try {
    const { salonId, category } = req.query;
    
    let query = req.supabase
      .from('services')
      .select('*');
    
    if (salonId) {
      query = query.eq('salon_id', salonId);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    next(error);
  }
};

// Get service by ID
exports.getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await req.supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Create a new service
exports.createService = async (req, res, next) => {
  try {
    const serviceData = req.body;
    
    const { data, error } = await req.supabase
      .from('services')
      .insert(serviceData)
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

// Update a service
exports.updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const serviceData = req.body;
    
    const { data, error } = await req.supabase
      .from('services')
      .update(serviceData)
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

// Delete a service
exports.deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { error } = await req.supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get service categories
exports.getServiceCategories = async (req, res, next) => {
  try {
    // In a real app, you might have a categories table
    // For this demo, we'll return a predefined list
    const categories = [
      'Haircut',
      'Hair Color',
      'Hair Styling',
      'Hair Treatment',
      'Beard Trim',
      'Eyebrow Threading',
      'Facial',
      'Manicure',
      'Pedicure',
      'Massage'
    ];
    
    res.json(categories);
  } catch (error) {
    next(error);
  }
};