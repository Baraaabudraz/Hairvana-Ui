import { apiFetch } from '@/lib/api';

export interface DashboardStats {
  totalSalons: number;
  activeSalons: number;
  totalUsers: number;
  activeUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  monthlyGrowth: number;
}

export interface RecentActivity {
  id: string;
  type: 'subscription' | 'cancellation' | 'salon_registration' | 'user_registration' | 'login';
  title: string;
  description: string;
  user: string;
  avatar: string | null;
  timestamp: string;
  status: 'pending' | 'urgent' | 'success';
  amount?: number;
  planName?: string;
  salonName?: string;
  userRole?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalActivities: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface RecentActivityResponse {
  activities: RecentActivity[];
  pagination: PaginationInfo;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    return await apiFetch('/dashboard/stats');
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default stats to prevent component crashes
    return {
      totalSalons: 0,
      activeSalons: 0,
      totalUsers: 0,
      activeUsers: 0,
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      cancelledSubscriptions: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      yearlyRevenue: 0,
      monthlyGrowth: 0
    };
  }
}

export async function fetchRecentActivity(page: number = 1, limit: number = 10): Promise<RecentActivityResponse> {
  try {
    const response = await apiFetch(`/dashboard/recent-activity?page=${page}&limit=${limit}`);
    
    // Handle both old format (array) and new format (object with pagination)
    if (Array.isArray(response)) {
      return {
        activities: response,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalActivities: response.length,
          limit: response.length,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }
    
    return response || {
      activities: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalActivities: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return {
      activities: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalActivities: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }
}