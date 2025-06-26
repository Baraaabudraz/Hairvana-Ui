import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Demo analytics data
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
          { month: 'Jan', revenue: 65000 },
          { month: 'Feb', revenue: 72000 },
          { month: 'Mar', revenue: 68000 },
          { month: 'Apr', revenue: 85000 },
          { month: 'May', revenue: 92000 },
          { month: 'Jun', revenue: 127450 },
        ],
      },
      bookings: {
        total: 8942,
        completed: 8234,
        cancelled: 456,
        noShow: 252,
        data: [
          { date: '2024-06-01', bookings: 145 },
          { date: '2024-06-02', bookings: 167 },
          { date: '2024-06-03', bookings: 134 },
          { date: '2024-06-04', bookings: 189 },
          { date: '2024-06-05', bookings: 156 },
          { date: '2024-06-06', bookings: 178 },
          { date: '2024-06-07', bookings: 142 },
        ],
      },
      topServices: [
        { name: 'Haircut', bookings: 3245, revenue: 48675 },
        { name: 'Hair Color', bookings: 2156, revenue: 64680 },
        { name: 'Styling', bookings: 1834, revenue: 27510 },
        { name: 'Treatment', bookings: 1245, revenue: 37350 },
        { name: 'Beard Trim', bookings: 462, revenue: 4620 },
      ],
      userGrowth: {
        newUsers: 1234,
        returningUsers: 37708,
        data: [
          { month: 'Jan', newUsers: 856, returningUsers: 5234 },
          { month: 'Feb', newUsers: 923, returningUsers: 6123 },
          { month: 'Mar', newUsers: 1045, returningUsers: 6789 },
          { month: 'Apr', newUsers: 1156, returningUsers: 7234 },
          { month: 'May', newUsers: 1089, returningUsers: 7456 },
          { month: 'Jun', newUsers: 1234, returningUsers: 7890 },
        ],
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