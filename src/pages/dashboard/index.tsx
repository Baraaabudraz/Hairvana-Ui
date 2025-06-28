import { useEffect, useState } from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { TopSalons } from '@/components/dashboard/top-salons';
import { useAuthStore } from '@/stores/auth-store';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">{greeting}, {user?.name || 'Welcome back'}! Here's what's happening with your platform.</p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <TopSalons />
      </div>

      <RecentActivity />
    </div>
  );
}