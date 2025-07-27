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

interface UserRoleObject {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRoleObject | 'admin' | 'super_admin' | 'salon' | 'user'; // Allow both object and string
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

const roleColors: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  salon: 'bg-green-100 text-green-800',
  user: 'bg-gray-100 text-gray-800',
  customer: 'bg-gray-100 text-gray-800', // Add customer role
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800',
};

// Helper function to safely get role information
const getRoleInfo = (role: UserRoleObject | string) => {
  if (typeof role === 'string') {
    return {
      name: role,
      color: undefined
    };
  }
  return {
    name: role?.name || '',
    color: role?.color
  };
};

// Helper function to get role string for form
const getRoleString = (role: UserRoleObject | string): 'admin' | 'super_admin' | 'salon' | 'user' => {
  if (typeof role === 'string') {
    return role as 'admin' | 'super_admin' | 'salon' | 'user';
  }
  
  // Map common role names to form values
  const roleName = role?.name?.toLowerCase() || '';
  if (roleName.includes('super admin') || roleName === 'super_admin') return 'super_admin';
  if (roleName.includes('admin')) return 'admin';
  if (roleName.includes('salon')) return 'salon';
  return 'user';
};

export default function EditUserPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadedAvatar, setUploadedAvatar] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Error boundary to prevent blank page
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Page error:', event.error);
      setError(`Page error: ${event.error?.message || 'Unknown error'}`);
      setLoading(false);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

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

  // Debug role changes
  useEffect(() => {
    console.log('Role changed in form:', watchedRole);
  }, [watchedRole]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        console.log('Loading user with ID:', params.id);
        
        // Try to fetch from API first
        try {
          const data = await fetchUserById(params.id as string);
          console.log('User data received:', data);
          setUser(data);
          
          // Set form values with safe role handling
          console.log('Original role from API:', data.role);
          const roleString = getRoleString(data.role);
          console.log('Converted role string:', roleString);
          
          reset({
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: roleString,
            status: data.status,
          });
          
          console.log('Form reset complete, watchedRole should be:', roleString);
        } catch (apiError) {
          console.error('Failed to fetch user:', apiError);
          toast({
            title: 'Error',
            description: 'Failed to load user data. Please try again.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
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
      
      // Create FormData to include the avatar file
      const formData = new FormData();
      
      // Add form fields
      Object.keys(data).forEach(key => {
        formData.append(key, data[key as keyof UserForm].toString());
      });
      
      // Add avatar file if one was selected
      const avatarInput = document.getElementById('avatar') as HTMLInputElement;
      if (avatarInput && avatarInput.files && avatarInput.files[0]) {
        formData.append('avatar', avatarInput.files[0]);
      }
      
      await updateUser(user.id, formData);
      toast({
        title: 'Success',
        description: 'User updated successfully.',
      });
      navigate(`/dashboard/users/${user.id}`);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: 'Validation Error',
        description: error.message || 'Failed to update user. Please check the fields and try again.',
        variant: 'destructive',
      });
      // Do not navigate or show success
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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600">Page Error</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <p className="text-sm text-gray-500 mt-4">Please check the browser console for more details.</p>
          <div className="flex gap-2 justify-center mt-6">
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
            <Link to="/dashboard/users">
              <Button variant="outline">Back to Users</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                <AvatarImage
                  src={uploadedAvatar || (user.avatar ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/images/avatar/${user.avatar}` : undefined)}
                  alt={user.name}
                />
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
                    <SelectValue placeholder="Select a role" />
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
                <p className="text-xs text-gray-500">
                  Current: {watchedRole ? getRoleDisplayName(watchedRole) : 'None selected'}
                </p>
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
                    <Badge className={roleColors[getRoleInfo(user.role).name.toLowerCase().replace(' ', '_')] || 'bg-gray-100 text-gray-800'}>
                      {getRoleDisplayName(getRoleInfo(user.role).name)}
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