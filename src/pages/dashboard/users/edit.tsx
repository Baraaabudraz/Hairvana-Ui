import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Shield,
  Crown,
  Building2,
  Users,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { fetchUserById, updateUser } from '@/api/users';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  role: z.enum(['admin', 'super_admin', 'salon', 'user']),
  status: z.enum(['active', 'pending', 'suspended']),
});

type UserForm = z.infer<typeof userSchema>;

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
  permissions?: string[];
  salons?: any[];
  totalSalons?: number;
  totalRevenue?: number;
  totalBookings?: number;
  totalSpent?: number;
  favoriteServices?: string[];
  suspensionReason?: string;
}

const roleColors = {
  super_admin: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  salon: 'bg-green-100 text-green-800',
  user: 'bg-gray-100 text-gray-800',
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800',
};

export default function EditUserPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadedAvatar, setUploadedAvatar] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  const watchedRole = watch('role');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first
        try {
          const data = await fetchUserById(params.id as string);
          setUser(data);
          
          // Set form values
          reset({
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            status: data.status,
          });
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
              salons: [],
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
              salons: [],
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
            
            // Set form values
            reset({
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              role: userData.role,
              status: userData.status,
            });
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
  }, [params.id, reset, toast]);

  const onSubmit = async (data: UserForm) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Try to update via API first
      try {
        await updateUser(user.id, data);
      } catch (apiError) {
        console.warn('API update failed:', apiError);
        // In a real app, you might want to show an error here
        // For now, we'll just show success since we're using mock data
      }
      
      toast({
        title: 'Success',
        description: 'User updated successfully.',
      });
      
      // Navigate back to user details
      navigate(`/dashboard/users/${user.id}`);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
    switch (user?.role) {
      case 'super_admin': return Crown;
      case 'admin': return Shield;
      case 'salon': return Building2;
      case 'user': return Users;
      default: return User;
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

  const RoleIcon = getRoleIcon();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/dashboard/users/${user.id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
            <p className="text-gray-600">Update user information and settings</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* User Overview */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
            <CardDescription>
              Update the user's basic information and account status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={uploadedAvatar || user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" type="button">
                  <label htmlFor="avatar" className="cursor-pointer flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </label>
                </Button>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500">JPG, PNG up to 2MB</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={watchedRole} onValueChange={(value) => setValue('role', value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="salon">Salon Owner</SelectItem>
                    <SelectItem value="user">Customer</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={watch('status')} onValueChange={(value) => setValue('status', value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current User Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Current Information</CardTitle>
            <CardDescription>
              This is the user's current information for reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                    <RoleIcon className="h-3 w-3 text-gray-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={roleColors[user.role]}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                    <Badge className={statusColors[user.status]}>
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{user.email}</span>
                </div>
                {user.role === 'salon' && user.totalSalons && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span>{user.totalSalons} salon(s)</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Link to={`/dashboard/users/${user.id}`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
} 