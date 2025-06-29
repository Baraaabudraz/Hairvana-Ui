'use client';

import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth-store';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Crown,
  Upload,
  Save,
  Eye,
  EyeOff,
  Activity,
  Settings,
  Bell,
  Lock,
  Key,
  CheckCircle,
  Clock,
  MapPin,
  Globe,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { updateProfileSettings } from '@/api/settings';
import { updatePassword } from '@/api/auth';
import { fetchUserSettings, UserSettings } from '@/api/settings';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  department: z.string().optional(),
  timezone: z.string(),
  language: z.string(),
  bio: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadedAvatar, setUploadedAvatar] = useState<string>('');
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '+1 (555) 123-4567',
      department: 'Administration',
      timezone: 'America/New_York',
      language: 'en',
      bio: 'Platform administrator with expertise in salon management systems.',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        setLoading(true);
        const settings = await fetchUserSettings();
        setUserSettings(settings);
        
        // Update form with user settings - now settings.profile contains both user and settings data
        if (settings.profile) {
          resetProfile({
            name: settings.profile.name || user?.name || '',
            email: settings.profile.email || user?.email || '',
            phone: settings.profile.phone || '+1 (555) 123-4567',
            department: settings.profile.department || 'Administration',
            timezone: settings.profile.timezone || 'America/New_York',
            language: settings.profile.language || 'en',
            bio: settings.profile.bio || 'Platform administrator with expertise in salon management systems.',
          });
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user settings. Using default values.',
          variant: 'destructive',
        });
        
        // Use default values from user store
        if (user) {
          resetProfile({
            name: user.name,
            email: user.email,
            phone: '+1 (555) 123-4567',
            department: 'Administration',
            timezone: 'America/New_York',
            language: 'en',
            bio: 'Platform administrator with expertise in salon management systems.',
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadUserSettings();
  }, [user, resetProfile, toast]);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to a storage service
      setUploadedAvatar('https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2');
    }
  };

  const onSubmitProfile = async (data: ProfileForm) => {
    setIsSubmitting(true);
    try {
      await updateProfileSettings(data);
      
      // Update user in store
      if (user) {
        setUser({
          ...user,
          name: data.name,
          email: data.email,
          avatar: uploadedAvatar || user.avatar,
        });
      }

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPassword = async (data: PasswordForm) => {
    setIsSubmitting(true);
    try {
      if (!user) {
        throw new Error('User not found');
      }
      
      await updatePassword(user.id, data.currentPassword, data.newPassword);
      
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      });
      
      resetPassword();
    } catch (error) {
      toast({
        title: 'Error updating password',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'super_admin': return Crown;
      case 'admin': return Shield;
      default: return User;
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = () => {
    switch (user?.role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      default: return 'User';
    }
  };

  const RoleIcon = getRoleIcon();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your personal account information and preferences</p>
        </div>
      </div>

      {/* Profile Overview */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={uploadedAvatar || user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-xl">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                <RoleIcon className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getRoleColor()}>
                  {getRoleDisplayName()}
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined January 2024
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  Last active 2 hours ago
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  New York, USA
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Login Sessions</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actions Today</p>
                <p className="text-2xl font-bold text-gray-900">47</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className="text-2xl font-bold text-gray-900">98%</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={uploadedAvatar || user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-lg">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
                      <Upload className="h-4 w-4" />
                      Change Photo
                    </div>
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...registerProfile('name')}
                  />
                  {profileErrors.name && (
                    <p className="text-sm text-red-500">{profileErrors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerProfile('email')}
                  />
                  {profileErrors.email && (
                    <p className="text-sm text-red-500">{profileErrors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...registerProfile('phone')}
                  />
                  {profileErrors.phone && (
                    <p className="text-sm text-red-500">{profileErrors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    {...registerProfile('department')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    {...registerProfile('timezone')}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    {...registerProfile('language')}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  rows={3}
                  {...registerProfile('bio')}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <div className="space-y-6">
          {/* Change Password */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      {...registerPassword('currentPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    {...registerPassword('newPassword')}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    {...registerPassword('confirmPassword')}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="submit"
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Status */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Security Status</CardTitle>
              <CardDescription>
                Your account security overview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Two-Factor Authentication</p>
                    <p className="text-sm text-green-700">Enabled</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Login Sessions</p>
                    <p className="text-sm text-blue-700">3 active sessions</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-900">Password Last Changed</p>
                    <p className="text-sm text-yellow-700">30 days ago</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your recent actions and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: 'Updated salon approval status',
                time: '2 hours ago',
                type: 'admin',
                icon: CheckCircle,
                color: 'text-green-600'
              },
              {
                action: 'Generated monthly revenue report',
                time: '4 hours ago',
                type: 'report',
                icon: Activity,
                color: 'text-blue-600'
              },
              {
                action: 'Modified user permissions',
                time: '1 day ago',
                type: 'security',
                icon: Shield,
                color: 'text-purple-600'
              },
              {
                action: 'Logged in from new device',
                time: '2 days ago',
                type: 'security',
                icon: Lock,
                color: 'text-orange-600'
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-lg bg-gray-100 ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}