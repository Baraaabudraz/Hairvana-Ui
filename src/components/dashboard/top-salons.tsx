'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const topSalons = [
  {
    id: 1,
    name: 'Luxe Hair Studio',
    location: 'Beverly Hills, CA',
    revenue: '$12,450',
    bookings: 156,
    rating: 4.9,
    avatar: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
  },
  {
    id: 2,
    name: 'Urban Cuts',
    location: 'Manhattan, NY',
    revenue: '$9,820',
    bookings: 134,
    rating: 4.8,
    avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
  },
  {
    id: 3,
    name: 'Style & Grace',
    location: 'Miami, FL',
    revenue: '$8,650',
    bookings: 98,
    rating: 4.7,
    avatar: 'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
  },
  {
    id: 4,
    name: 'The Hair Lounge',
    location: 'Austin, TX',
    revenue: '$7,230',
    bookings: 87,
    rating: 4.6,
    avatar: 'https://images.pexels.com/photos/3992660/pexels-photo-3992660.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
  },
];

export function TopSalons() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Top Performing Salons</CardTitle>
        <CardDescription>
          Highest revenue salons this month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topSalons.map((salon, index) => (
            <div key={salon.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold">
                  {index + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={salon.avatar} alt={salon.name} />
                  <AvatarFallback>{salon.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">{salon.name}</p>
                  <p className="text-xs text-gray-500">{salon.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{salon.revenue}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {salon.bookings} bookings
                  </Badge>
                  <span className="text-xs text-yellow-600">★ {salon.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}