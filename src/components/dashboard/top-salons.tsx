'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { fetchSalons } from '@/api/salons';

interface Salon {
  id: string;
  name: string;
  location: string;
  revenue: string;
  bookings: number;
  rating: number;
  avatar?: string;
}

export function TopSalons() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopSalons = async () => {
      try {
        setLoading(true);
        const response = await fetchSalons({ status: 'active' });
        
        // Sort by revenue (descending) and take top 4
        const sortedSalons = [...response.salons]
          .sort((a, b) => parseFloat(String(b.revenue).replace(/[^0-9.-]+/g, '')) - 
                          parseFloat(String(a.revenue).replace(/[^0-9.-]+/g, '')))
          .slice(0, 4);
        
        setSalons(sortedSalons);
      } catch (error) {
        console.error('Error loading top salons:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopSalons();
  }, []);

  if (loading) {
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
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                  <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                  <div>
                    <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 w-16 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!salons || salons.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Top Performing Salons</CardTitle>
          <CardDescription>
            Highest revenue salons this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No salon data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          {salons.map((salon, index) => (
            <div key={salon.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold">
                  {index + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={salon.avatar || `https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2`} alt={salon.name} />
                  <AvatarFallback>{salon.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">{salon.name}</p>
                  <p className="text-xs text-gray-500">{salon.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">${typeof salon.revenue === 'number' ? salon.revenue.toLocaleString() : salon.revenue}</p>
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