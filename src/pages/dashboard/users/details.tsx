import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Star, 
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Building2,
  User,
  CreditCard,
  FileText,
  Shield,
  Crown,
  Settings,
  Activity,
  TrendingUp,
  Scissors,
  Heart,
  Eye
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fetchUserById, updateUserStatus, deleteUser } from '@/api/users';
import { useToast } from '@/hooks/use-toast';

// Safe date formatting function
const formatDateSafely = (dateString: string | null | undefined, formatString: string, fallback: string = 'N/A') => {
  if (!dateString) return fallback;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return fallback;
    }
    return format(date, formatString);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return fallback;
  }
};

const formatDistanceSafely = (dateString: string | null | undefined, options?: any, fallback: string = 'N/A') => {
  if (!dateString) return fallback;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return fallback;
    }
    return formatDistanceToNow(date, options);
  } catch (error) {
    console.warn('Date distance formatting error:', error);
    return fallback;
  }
};

interface Salon {
  id: string;
  name: string;
  location: string;
  subscription: string;
  bookingsCount: number;
  revenue: number;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'super_admin' | 'salon' | 'user';
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
  lastLogin: string | null;
  avatar: string;
  // Admin specific
  permissions?: string[];
  // Salon specific - Updated for one-to-many relationship
  salons?: Salon[];
  totalSalons?: number;
  totalRevenue?: number;
  totalBookings?: number;
  // Regular user specific
  totalSpent?: number;
  favoriteServices?: string[];
  suspensionReason?: string;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800',
};

const roleColors = {
  super_admin: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  salon: 'bg-green-100 text-green-800',
  user: 'bg-gray-100 text-gray-800',
};

const subscriptionColors = {
  Basic: 'bg-gray-100 text-gray-800',
  Standard: 'bg-blue-100 text-blue-800',
  Premium: 'bg-purple-100 text-purple-800',
};

const permissionLabels: Record<string, string> = {
  manage_salons: 'Manage Salons',
  manage_users: 'Manage Users',
  view_analytics: 'View Analytics',
  manage_subscriptions: 'Manage Subscriptions',
  manage_payments: 'Manage Payments',
  manage_reports: 'Manage Reports',
  manage_notifications: 'Manage Notifications',
  manage_settings: 'Manage Settings',
  full_access: 'Full Access',
};

export default function UserDetailsPage() {
  const params = useParams();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first
        try {
          const data = await fetchUserById(params.id as string);
          setUser(data);
        } catch (apiError) {
          console.warn('API fetch failed, using mock data:', apiError);
          
          // Fallback to mock data if API fails
          const mockUsers: Record<string, User> = {
            '1': {
              id: '1',
              name: 'John Smith',
              email: 'admin@hairvana.com',
              phone: '+1 (555) 123-4567',
              role: 'admin',
              status: 'active',
              joinDate: '2024-01-01',
              lastLogin: '2024-06-15T10:30:00Z',
              avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
              permissions: ['manage_salons', 'manage_users', 'view_analytics', 'manage_subscriptions'],
            },
            '2': {
              id: '2',
              name: 'Sarah Johnson',
              email: 'superadmin@hairvana.com',
              phone: '+1 (555) 234-5678',
              role: 'super_admin',
              status: 'active',
              joinDate: '2024-01-01',
              lastLogin: '2024-06-15T09:15:00Z',
              avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
              permissions: ['full_access'],
            },
            '3': {
              id: '3',
              name: 'Maria Rodriguez',
              email: 'maria@luxehair.com',
              phone: '+1 (555) 345-6789',
              role: 'salon',
              status: 'active',
              joinDate: '2024-01-15',
              lastLogin: '2024-06-15T14:20:00Z',
              avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
              salons: [
                {
                  id: '1',
                  name: 'Luxe Hair Studio',
                  location: 'Beverly Hills, CA',
                  subscription: 'Premium',
                  bookingsCount: 156,
                  revenue: 12450,
                  status: 'active'
                },
                {
                  id: '4',
                  name: 'Luxe Hair Downtown',
                  location: 'Downtown LA, CA',
                  subscription: 'Standard',
                  bookingsCount: 89,
                  revenue: 7800,
                  status: 'active'
                }
              ],
              totalSalons: 2,
              totalRevenue: 20250,
              totalBookings: 245,
            },
            '4': {
              id: '4',
              name: 'David Chen',
              email: 'david@stylecuts.com',
              phone: '+1 (555) 456-7890',
              role: 'salon',
              status: 'active',
              joinDate: '2024-01-20',
              lastLogin: '2024-06-15T11:45:00Z',
              avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
              salons: [
                {
                  id: '2',
                  name: 'Style Cuts',
                  location: 'San Francisco, CA',
                  subscription: 'Standard',
                  bookingsCount: 98,
                  revenue: 8900,
                  status: 'active'
                }
              ],
              totalSalons: 1,
              totalRevenue: 8900,
              totalBookings: 98,
            },
            '5': {
              id: '5',
              name: 'Lisa Thompson',
              email: 'lisa.thompson@email.com',
              phone: '+1 (555) 567-8901',
              role: 'user',
              status: 'active',
              joinDate: '2024-02-01',
              lastLogin: '2024-06-15T15:30:00Z',
              avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
              totalBookings: 8,
              totalSpent: 650,
              favoriteServices: ['Haircut', 'Hair Styling'],
            },
            '6': {
              id: '6',
              name: 'Emily Davis',
              email: 'emily.davis@email.com',
              phone: '+1 (555) 678-9012',
              role: 'user',
              status: 'active',
              joinDate: '2024-02-01',
              lastLogin: '2024-06-15T13:20:00Z',
              avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
              totalBookings: 12,
              totalSpent: 850,
              favoriteServices: ['Haircut', 'Hair Color', 'Hair Styling'],
            },
          };
          
          const userData = mockUsers[params.id as string];
          if (userData) {
            setUser(userData);
          } else {
            throw new Error('User not found');
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchUser();
    }
  }, [params.id, toast]);

  const handleStatusChange = async (newStatus: 'active' | 'pending' | 'suspended') => {
    if (!user) return;
    
    try {
      await updateUserStatus(user.id, newStatus);
      
      setUser(prev => prev ? { ...prev, status: newStatus } : null);
      
      const statusMessages = {
        active: 'User has been reactivated',
        pending: 'User has been set to pending',
        suspended: 'User has been suspended',
      };
      
      toast({
        title: 'Status updated',
        description: statusMessages[newStatus],
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    
    try {
      await deleteUser(user.id);
      
      toast({
        title: 'User deleted',
        description: 'The user has been permanently removed from the platform.',
      });
      
      // Navigate to users list
      window.location.href = '/dashboard/users';
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
          <p className="text-gray-600 mt-2">The user you're looking for doesn't exist.</p>
          <Link to="/dashboard/users">
            <Button className="mt-4">Back to Users</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'salon': return 'Salon Owner';
      case 'user': return 'Customer';
      default: return role;
    }
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case 'super_admin': return Crown;
      case 'admin': return Shield;
      case 'salon': return Building2;
      case 'user': return User;
      default: return User;
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/users">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">User Details & Management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/dashboard/users/${user.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* User Profile Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                  <RoleIcon className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={roleColors[user.role]}>
                    {getRoleDisplayName(user.role)}
                  </Badge>
                  <Badge className={statusColors[user.status]}>
                    {user.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDateSafely(user.joinDate, 'MMM dd, yyyy')}
                  </div>
                  {user.lastLogin && (
                    <div className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      Last seen {formatDistanceSafely(user.lastLogin, { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {user.status === 'active' && (
                <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleStatusChange('suspended')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Suspend
                </Button>
              )}
              {user.status === 'suspended' && (
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('active')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reactivate
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-specific Stats */}
      {user.role === 'salon' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Salons</p>
                  <p className="text-2xl font-bold text-gray-900">{user.totalSalons || 0}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${user.totalRevenue?.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{user.totalBookings}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Revenue/Salon</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${user.totalSalons ? Math.round((user.totalRevenue || 0) / user.totalSalons).toLocaleString() : 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {user.role === 'user' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">${user.totalSpent?.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{user.totalBookings}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Favorite Services</p>
                  <p className="text-2xl font-bold text-gray-900">{user.favoriteServices?.length || 0}</p>
                </div>
                <Heart className="h-8 w-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-gray-600">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-gray-600">
                  {formatDateSafely(user.joinDate, 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
            {user.lastLogin && (
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Last Login</p>
                  <p className="text-sm text-gray-600">
                    {formatDateSafely(user.lastLogin, 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role-specific Information */}
        {(user.role === 'admin' || user.role === 'super_admin') && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.role === 'super_admin' ? (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">Full Administrative Access</span>
                  </div>
                  <p className="text-sm text-purple-700 mt-1">
                    This user has complete control over all platform features and settings.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {user.permissions?.map((permission) => (
                    <div key={permission} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">
                        {permissionLabels[permission] || permission}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {user.role === 'salon' && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Salon Portfolio ({user.totalSalons} {user.totalSalons === 1 ? 'Salon' : 'Salons'})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.salons?.map((salon) => (
                <div key={salon.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{salon.name}</h4>
                      <p className="text-sm text-gray-600">{salon.location}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={subscriptionColors[salon.subscription as keyof typeof subscriptionColors]}>
                          {salon.subscription}
                        </Badge>
                        <Badge className={statusColors[salon.status as keyof typeof statusColors]}>
                          {salon.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">${salon.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{salon.bookingsCount} bookings</p>
                      <Link to={`/dashboard/salons/${salon.id}`}>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              
              {user.salons && user.salons.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Link to={`/dashboard/salons?ownerId=${user.id}`}>
                    <Button variant="outline" className="w-full">
                      <Building2 className="h-4 w-4 mr-2" />
                      View All Salons ({user.totalSalons})
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {user.role === 'user' && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Total Spent</p>
                  <p className="text-sm text-gray-600">${user.totalSpent?.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Total Bookings</p>
                  <p className="text-sm text-gray-600">{user.totalBookings}</p>
                </div>
              </div>
              {user.favoriteServices && user.favoriteServices.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Favorite Services</p>
                  <div className="flex flex-wrap gap-2">
                    {user.favoriteServices.map((service) => (
                      <Badge key={service} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {user.suspensionReason && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-900">Suspension Reason</p>
                  <p className="text-sm text-red-700">{user.suspensionReason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Account Status */}
      {user.status === 'suspended' && (
        <Card className="border-0 shadow-sm border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <XCircle className="h-5 w-5" />
              Account Suspended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              This user account has been suspended and cannot access the platform.
              {user.suspensionReason && ` Reason: ${user.suspensionReason}`}
            </p>
            <div className="mt-4">
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('active')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Reactivate Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {user.status === 'pending' && (
        <Card className="border-0 shadow-sm border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Clock className="h-5 w-5" />
              Account Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              This user account is pending approval and has limited access to the platform.
            </p>
            <div className="mt-4 flex gap-2">
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('active')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Account
              </Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleStatusChange('suspended')}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}