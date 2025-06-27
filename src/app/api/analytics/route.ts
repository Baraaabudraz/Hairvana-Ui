import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Enhanced demo analytics data with more comprehensive metrics
    const analytics = {
      overview: {
        totalSalons: 1247,
        activeSalons: 1156,
        totalUsers: 45231,
        activeUsers: 38942,
        totalBookings: 8942,
        completedBookings: 8234,
        totalRevenue: 127450,
        monthlyGrowth: 23,
      },
      revenue: {
        current: 127450,
        previous: 103620,
        growth: 23,
        data: [
          { month: 'Jan', revenue: 65000, subscriptions: 45000, commissions: 20000 },
          { month: 'Feb', revenue: 72000, subscriptions: 52000, commissions: 20000 },
          { month: 'Mar', revenue: 68000, subscriptions: 48000, commissions: 20000 },
          { month: 'Apr', revenue: 85000, subscriptions: 62000, commissions: 23000 },
          { month: 'May', revenue: 92000, subscriptions: 67000, commissions: 25000 },
          { month: 'Jun', revenue: 127450, subscriptions: 89450, commissions: 38000 },
        ],
      },
      bookings: {
        total: 8942,
        completed: 8234,
        cancelled: 456,
        noShow: 252,
        data: [
          { date: '2024-06-01', bookings: 145, completed: 132, cancelled: 8 },
          { date: '2024-06-02', bookings: 167, completed: 154, cancelled: 9 },
          { date: '2024-06-03', bookings: 134, completed: 125, cancelled: 6 },
          { date: '2024-06-04', bookings: 189, completed: 175, cancelled: 10 },
          { date: '2024-06-05', bookings: 156, completed: 143, cancelled: 8 },
          { date: '2024-06-06', bookings: 178, completed: 164, cancelled: 9 },
          { date: '2024-06-07', bookings: 142, completed: 131, cancelled: 7 },
        ],
      },
      topServices: [
        { name: 'Haircut', bookings: 3245, revenue: 48675, growth: 12.5 },
        { name: 'Hair Color', bookings: 2156, revenue: 64680, growth: 18.3 },
        { name: 'Styling', bookings: 1834, revenue: 27510, growth: 8.7 },
        { name: 'Treatment', bookings: 1245, revenue: 37350, growth: 15.2 },
        { name: 'Beard Trim', bookings: 462, revenue: 4620, growth: -2.1 },
      ],
      userGrowth: {
        newUsers: 1234,
        returningUsers: 37708,
        data: [
          { month: 'Jan', newUsers: 856, returningUsers: 5234, totalUsers: 6090 },
          { month: 'Feb', newUsers: 923, returningUsers: 6123, totalUsers: 7046 },
          { month: 'Mar', newUsers: 1045, returningUsers: 6789, totalUsers: 7834 },
          { month: 'Apr', newUsers: 1156, returningUsers: 7234, totalUsers: 8390 },
          { month: 'May', newUsers: 1089, returningUsers: 7456, totalUsers: 8545 },
          { month: 'Jun', newUsers: 1234, returningUsers: 7890, totalUsers: 9124 },
        ],
      },
      geographicData: [
        { location: 'California', salons: 234, users: 12456, revenue: 45230 },
        { location: 'New York', salons: 189, users: 9876, revenue: 38450 },
        { location: 'Texas', salons: 156, users: 8234, revenue: 29870 },
        { location: 'Florida', salons: 134, users: 7123, revenue: 25690 },
        { location: 'Illinois', salons: 98, users: 5432, revenue: 19340 },
        { location: 'Other States', salons: 436, users: 11110, revenue: 38920 },
      ],
      performanceMetrics: {
        averageBookingValue: 67.50,
        customerRetentionRate: 78.5,
        salonUtilizationRate: 82.3,
        averageRating: 4.7,
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}