// Get dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get total salons count
    const { data: salonsData, error: salonsError, count: totalSalons } = await req.supabase
      .from('salons')
      .select('*', { count: 'exact' });
    
    if (salonsError) {
      return res.status(500).json({ error: 'Failed to fetch salons data' });
    }
    
    // Get active salons count
    const { data: activeSalonsData, error: activeSalonsError, count: activeSalons } = await req.supabase
      .from('salons')
      .select('*', { count: 'exact' })
      .eq('status', 'active');
    
    if (activeSalonsError) {
      return res.status(500).json({ error: 'Failed to fetch active salons data' });
    }
    
    // Get total users count
    const { data: usersData, error: usersError, count: totalUsers } = await req.supabase
      .from('users')
      .select('*', { count: 'exact' });
    
    if (usersError) {
      return res.status(500).json({ error: 'Failed to fetch users data' });
    }
    
    // Get active users count
    const { data: activeUsersData, error: activeUsersError, count: activeUsers } = await req.supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('status', 'active');
    
    if (activeUsersError) {
      return res.status(500).json({ error: 'Failed to fetch active users data' });
    }
    
    // Get total bookings count
    const { data: bookingsData, error: bookingsError, count: totalBookings } = await req.supabase
      .from('appointments')
      .select('*', { count: 'exact' });
    
    if (bookingsError) {
      return res.status(500).json({ error: 'Failed to fetch bookings data' });
    }
    
    // Get completed bookings count
    const { data: completedBookingsData, error: completedBookingsError, count: completedBookings } = await req.supabase
      .from('appointments')
      .select('*', { count: 'exact' })
      .eq('status', 'completed');
    
    if (completedBookingsError) {
      return res.status(500).json({ error: 'Failed to fetch completed bookings data' });
    }
    
    // Calculate total revenue
    const { data: subscriptionsData, error: subscriptionsError } = await req.supabase
      .from('subscriptions')
      .select('amount')
      .eq('status', 'active');
    
    if (subscriptionsError) {
      return res.status(500).json({ error: 'Failed to fetch subscriptions data' });
    }
    
    const totalRevenue = subscriptionsData.reduce((sum, sub) => sum + sub.amount, 0);
    
    // Return dashboard stats
    res.json({
      totalSalons: totalSalons || 0,
      activeSalons: activeSalons || 0,
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalBookings: totalBookings || 0,
      completedBookings: completedBookings || 0,
      totalRevenue: totalRevenue || 0,
      monthlyGrowth: 0 // Placeholder for now
    });
  } catch (error) {
    next(error);
  }
};