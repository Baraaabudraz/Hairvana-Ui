'use client';

import { Building2, Users, CreditCard, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  {
    name: 'Total Salons',
    value: '1,247',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Building2,
  },
  {
    name: 'Active Users',
    value: '45,231',
    change: '+8%',
    changeType: 'positive' as const,
    icon: Users,
  },
  {
    name: 'Monthly Revenue',
    value: '$127,450',
    change: '+23%',
    changeType: 'positive' as const,
    icon: CreditCard,
  },
  {
    name: 'Total Bookings',
    value: '8,942',
    change: '+15%',
    changeType: 'positive' as const,
    icon: TrendingUp,
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.name}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {stat.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}