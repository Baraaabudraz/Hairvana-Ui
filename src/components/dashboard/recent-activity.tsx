'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

type ActivityStatus = 'pending' | 'urgent' | 'success';

interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  user: string;
  avatar: string;
  timestamp: Date;
  status: ActivityStatus;
}

const statusColors: Record<ActivityStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  urgent: 'bg-red-100 text-red-800',
  success: 'bg-green-100 text-green-800',
};

// Helper function to safely format relative time
const formatRelativeTime = (date: Date): string => {
  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'recently';
  }
};

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentActivity = async () => {
      try {
        setLoading(true);
        
        // Use fixed dates to avoid any potential issues with date formatting
        const now = new Date();
        const activities: Activity[] = [
          {
            id: 1,
            type: 'salon_registration',
            title: 'New salon registered',
            description: 'Bella Hair Studio submitted registration',
            user: 'Bella Hair Studio',
            avatar: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
            timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
            status: 'pending',
          },
          {
            id: 2,
            type: 'user_report',
            title: 'User reported salon',
            description: 'Sarah Johnson reported inappropriate behavior',
            user: 'Sarah Johnson',
            avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
            status: 'urgent',
          },
          {
            id: 3,
            type: 'subscription',
            title: 'Subscription upgraded',
            description: 'Urban Cuts upgraded to Premium plan',
            user: 'Urban Cuts',
            avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
            timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
            status: 'success',
          },
          {
            id: 4,
            type: 'payment',
            title: 'Payment processed',
            description: 'Monthly subscription payment received',
            user: 'Style & Grace',
            avatar: 'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
            timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
            status: 'success',
          },
          {
            id: 5,
            type: 'salon_approval',
            title: 'Salon approved',
            description: 'The Hair Lounge has been approved and activated',
            user: 'The Hair Lounge',
            avatar: 'https://images.pexels.com/photos/3992660/pexels-photo-3992660.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
            timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000), // 8 hours ago
            status: 'success',
          },
        ];
        
        setActivities(activities);
      } catch (error) {
        console.error('Error loading recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentActivity();
  }, []);

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest platform activities and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 w-48 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-16 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest platform activities and notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.avatar} alt={activity.user} />
                <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <Badge className={statusColors[activity.status]}>
                    {activity.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}