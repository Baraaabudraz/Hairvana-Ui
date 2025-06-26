'use client';

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

const activities: Activity[] = [
  {
    id: 1,
    type: 'salon_registration',
    title: 'New salon registered',
    description: 'Bella Hair Studio submitted registration',
    user: 'Bella Hair Studio',
    avatar: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'pending',
  },
  {
    id: 2,
    type: 'user_report',
    title: 'User reported salon',
    description: 'Sarah Johnson reported inappropriate behavior',
    user: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'urgent',
  },
  {
    id: 3,
    type: 'subscription',
    title: 'Subscription upgraded',
    description: 'Urban Cuts upgraded to Premium plan',
    user: 'Urban Cuts',
    avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    status: 'success',
  },
  {
    id: 4,
    type: 'payment',
    title: 'Payment processed',
    description: 'Monthly subscription payment received',
    user: 'Style & Grace',
    avatar: 'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    status: 'success',
  },
  {
    id: 5,
    type: 'salon_approval',
    title: 'Salon approved',
    description: 'The Hair Lounge has been approved and activated',
    user: 'The Hair Lounge',
    avatar: 'https://images.pexels.com/photos/3992660/pexels-photo-3992660.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    status: 'success',
  },
];

const statusColors: Record<ActivityStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  urgent: 'bg-red-100 text-red-800',
  success: 'bg-green-100 text-green-800',
};

export function RecentActivity() {
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
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}