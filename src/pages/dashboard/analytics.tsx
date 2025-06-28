'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Clock,
  Star,
  MapPin,
  Zap,
  Download,
  Filter,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { fetchAnalytics } from '@/api/analytics';

interface AnalyticsData {
  overview: {
    totalSalons: number;
    activeSalons: number;
    totalUsers: number;
    activeUsers: number;
    totalBookings: number;
    completedBookings: number;
    totalRevenue: number;
    monthlyGrowth: number;
  };
  revenue: {
    current: number;
    previous: number;
    growth: number;
    data: Array<{
      month: string;
      revenue: number;
      subscriptions: number;
      commissions: number;
    }>;
  };
  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    data: Array<{
      date: string;
      bookings: number;
      completed: number;
      cancelled: number;
    }>;
  };
  userGrowth: {
    newUsers: number;
    returningUsers: number;
    data: Array<{
      month: string;
      newUsers: number;
      returningUsers: number;
      totalUsers: number;
    }>;
  };
  topServices: Array<{
    name: string;
    bookings: number;
    revenue: number;
    growth: number;
  }>;
  geographicData: Array<{
    location: string;
    salons: number;
    users: number;
    revenue: number;
  }>;
  performanceMetrics: {
    averageBookingValue: number;
    customerRetentionRate: number;
    salonUtilizationRate: number;
    averageRating: number;
  };
}

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await fetchAnalytics(timeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth > 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">No data available</h2>
          <p className="text-gray-600 mt-2">Unable to load analytics data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into platform performance and trends</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analyticsData.overview.totalRevenue)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(analyticsData.overview.monthlyGrowth)}
                  <span className={`text-sm font-medium ${getGrowthColor(analyticsData.overview.monthlyGrowth)}`}>
                    {formatPercentage(analyticsData.overview.monthlyGrowth)}
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Salons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.overview.activeSalons.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-500">
                    {analyticsData.overview.totalSalons} total registered
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.overview.activeUsers.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-500">
                    {analyticsData.overview.totalUsers} total users
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.overview.totalBookings.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-500">
                    {analyticsData.overview.completedBookings} completed
                  </span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Monthly revenue breakdown including subscriptions and commissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={analyticsData.revenue.data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="month" className="text-gray-600" fontSize={12} />
                <YAxis className="text-gray-600" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `$${value.toLocaleString()}`, 
                    name === 'revenue' ? 'Total Revenue' : 
                    name === 'subscriptions' ? 'Subscriptions' : 'Commissions'
                  ]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="subscriptions" fill="#8b5cf6" name="Subscriptions" />
                <Bar dataKey="commissions" fill="#ec4899" name="Commissions" />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  name="Total Revenue"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>
              New vs returning users over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.userGrowth.data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="month" className="text-gray-600" fontSize={12} />
                <YAxis className="text-gray-600" fontSize={12} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    value.toLocaleString(), 
                    name === 'newUsers' ? 'New Users' : 
                    name === 'returningUsers' ? 'Returning Users' : 'Total Users'
                  ]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="newUsers" 
                  stackId="1" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                  name="New Users"
                />
                <Area 
                  type="monotone" 
                  dataKey="returningUsers" 
                  stackId="1" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.6}
                  name="Returning Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Analysis */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Booking Analytics</CardTitle>
          <CardDescription>
            Daily booking trends and completion rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={analyticsData.bookings.data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey="date" className="text-gray-600" fontSize={12} />
              <YAxis className="text-gray-600" fontSize={12} />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  value.toLocaleString(), 
                  name === 'bookings' ? 'Total Bookings' : 
                  name === 'completed' ? 'Completed' : 'Cancelled'
                ]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
              <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
              <Line 
                type="monotone" 
                dataKey="bookings" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                name="Total Bookings"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Metrics and Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Key performance indicators for the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Booking Value</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(analyticsData.performanceMetrics.averageBookingValue)}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">+12%</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Retention</p>
                  <p className="text-lg font-bold text-gray-900">
                    {analyticsData.performanceMetrics.customerRetentionRate}%
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">+5%</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Salon Utilization</p>
                  <p className="text-lg font-bold text-gray-900">
                    {analyticsData.performanceMetrics.salonUtilizationRate}%
                  </p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-800">+8%</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-lg font-bold text-gray-900">
                    {analyticsData.performanceMetrics.averageRating}/5.0
                  </p>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">+0.2</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
            <CardDescription>
              Most popular services by bookings and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topServices.map((service, index) => (
                <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-600">
                        {service.bookings.toLocaleString()} bookings
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(service.revenue)}
                    </p>
                    <div className="flex items-center gap-1">
                      {getGrowthIcon(service.growth)}
                      <span className={`text-sm ${getGrowthColor(service.growth)}`}>
                        {formatPercentage(service.growth)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>
            Platform usage and revenue by location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.geographicData.map((location) => (
              <div key={location.location} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{location.location}</h4>
                    <p className="text-sm text-gray-600">{location.salons} salons</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Users:</span>
                    <span className="text-sm font-medium">{location.users.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="text-sm font-medium">{formatCurrency(location.revenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common analytics tasks and reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <span className="font-medium">Custom Report</span>
              <span className="text-xs text-gray-500">Create detailed reports</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Download className="h-6 w-6 text-blue-600" />
              <span className="font-medium">Export Data</span>
              <span className="text-xs text-gray-500">Download analytics data</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Eye className="h-6 w-6 text-green-600" />
              <span className="font-medium">Live Dashboard</span>
              <span className="text-xs text-gray-500">Real-time monitoring</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}