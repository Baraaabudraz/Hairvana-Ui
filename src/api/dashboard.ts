import { apiFetch } from '@/lib/api';

export interface DashboardStats {
  totalSalons: number;
  activeSalons: number;
  totalUsers: number;
  activeUsers: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export async function fetchDashboardStats() {
  try {
    return await apiFetch('/api/dashboard/stats');
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}