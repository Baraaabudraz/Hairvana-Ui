import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  User,
  Shield,
  Bell,
  Globe,
  CreditCard,
  Database,
  Mail,
  Smartphone,
  Lock,
  Key,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Upload,
  Download,
  Trash2,
  Plus,
  Edit,
  Check,
  X,
  AlertTriangle,
  Info,
  Zap,
  Monitor,
  Palette,
  Languages,
  Clock,
  MapPin,
  DollarSign,
  Percent,
  FileText,
  BarChart3,
  Activity,
  Server,
  Cloud,
  HardDrive,
  Cpu,
  Wifi,
  Camera,
  Mic,
  Volume2,
  Printer,
  Calendar,
  Users,
  Building2
} from 'lucide-react';
import { 
  fetchUserSettings, 
  updateProfileSettings, 
  updateSecuritySettings, 
  updateNotificationPreferences, 
  updateBillingSettings, 
  updateBackupSettings, 
  fetchPlatformSettings, 
  updatePlatformSettings, 
  fetchIntegrationSettings, 
  updateIntegrationSettings 
} from '@/api/settings';
import { useAuthStore } from '@/stores/auth-store';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'account' | 'platform' | 'security' | 'integrations' | 'system';
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  department: string;
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    desktop: boolean;
  };
  twoFactorEnabled: boolean;
  lastLogin: string;
}

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  timezone: string;
  currency: string;
  language: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  maxFileUploadSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

interface SecuritySettings {
  twoFactorRequired: boolean;
  passwordExpiry: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  ipWhitelist: string[];
  sslEnabled: boolean;
  encryptionLevel: string;
  auditLogging: boolean;
  dataRetentionPeriod: number;
  backupFrequency: string;
  backupRetention: number;
}

interface IntegrationSettings {
  emailProvider: string;
  emailApiKey: string;
  smsProvider: string;
  smsApiKey: string;
  paymentGateway: string;
  paymentApiKey: string;
  analyticsProvider: string;
  analyticsTrackingId: string;
  socialLogins: {
    google: boolean;
    facebook: boolean;
    apple: boolean;
  };
  webhooks: Array<{
    id: string;
    name: string;
    url: string;
    events: string[];
    active: boolean;
  }>;
}

interface BillingSettings {
  defaultPaymentMethod: any;
  billingAddress: any;
  taxId: string;
  invoiceEmail: string;
  autoPay: boolean;
  paymentMethods: any[];
}

interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: string;
  backupTime: string;
  retentionDays: number;
  storageProvider: string;
  storagePath: string;
  cloudCredentials: any;
  lastBackup: string | null;
  backupHistory: any[];
}

const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Profile Settings',
    description: 'Manage your personal account information',
    icon: User,
    category: 'account'
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'Configure security settings and privacy options',
    icon: Shield,
    category: 'security'
  },
  {
    id: 'notifications',
    title: 'Notification Preferences',
    description: 'Control how and when you receive notifications',
    icon: Bell,
    category: 'account'
  },
  {
    id: 'platform',
    title: 'Platform Configuration',
    description: 'General platform settings and branding',
    icon: Globe,
    category: 'platform'
  },
  {
    id: 'billing',
    title: 'Billing & Payments',
    description: 'Payment methods and billing configuration',
    icon: CreditCard,
    category: 'platform'
  },
  {
    id: 'integrations',
    title: 'Integrations & APIs',
    description: 'Third-party integrations and API settings',
    icon: Zap,
    category: 'integrations'
  },
  {
    id: 'system',
    title: 'System Settings',
    description: 'Advanced system configuration and maintenance',
    icon: Server,
    category: 'system'
  },
  {
    id: 'backup',
    title: 'Backup & Recovery',
    description: 'Data backup and disaster recovery settings',
    icon: Database,
    category: 'system'
  }
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userSettings, setUserSettings] = useState<UserProfile | null>(null);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings | null>(null);
  const [billingSettings, setBillingSettings] = useState<BillingSettings | null>(null);
  const [backupSettings, setBackupSettings] = useState<BackupSettings | null>(null);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    desktop: true,
    marketing_emails: true,
    system_notifications: true
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [uploadedAvatar, setUploadedAvatar] = useState<string>('');
  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [activeSection]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load user settings
      if (['profile', 'security', 'notifications', 'backup', 'billing'].includes(activeSection)) {
        try {
          const data = await fetchUserSettings();
          
          // Set user profile - now data.profile contains both user and settings data
          if (data.profile) {
            setUserSettings({
              id: data.profile.id || user?.id || '',
              name: data.profile.name || user?.name || '',
              email: data.profile.email || user?.email || '',
              phone: data.profile.phone || '',
              avatar: data.profile.avatar || user?.avatar || '',
              role: data.profile.role || user?.role || '',
              department: data.profile.department || 'Administration',
              timezone: data.profile.timezone || 'America/New_York',
              language: data.profile.language || 'en',
              notifications: {
                email: true,
                push: true,
                sms: false,
                desktop: true
              },
              twoFactorEnabled: data.security?.two_factor_enabled || false,
              lastLogin: data.profile.last_login || new Date().toISOString()
            });
          } else {
            // Use user data from auth store if profile not found
            setUserSettings({
              id: user?.id || '',
              name: user?.name || '',
              email: user?.email || '',
              phone: '',
              avatar: user?.avatar || '',
              role: user?.role || '',
              department: 'Administration',
              timezone: 'America/New_York',
              language: 'en',
              notifications: {
                email: true,
                push: true,
                sms: false,
                desktop: true
              },
              twoFactorEnabled: false,
              lastLogin: new Date().toISOString()
            });
          }
          
          // Set other settings
          if (data.security) {
            setSecuritySettings(data.security);
          }
          if (data.notifications) {
            setNotificationPreferences(data.notifications);
          }
          if (data.billing) {
            setBillingSettings(data.billing);
          }
          if (data.backup) {
            setBackupSettings(data.backup);
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
            setUserSettings({
              id: user.id,
              name: user.name,
              email: user.email,
              phone: '',
              avatar: user.avatar || '',
              role: user.role,
              department: 'Administration',
              timezone: 'America/New_York',
              language: 'en',
              notifications: {
                email: true,
                push: true,
                sms: false,
                desktop: true
              },
              twoFactorEnabled: false,
              lastLogin: new Date().toISOString()
            });
          }
        }
      }
      
      // Load platform settings
      if (activeSection === 'platform') {
        try {
          const data = await fetchPlatformSettings();
          setPlatformSettings(data);
        } catch (error) {
          console.error('Error loading platform settings:', error);
        }
      }
      
      // Load integration settings
      if (activeSection === 'integrations') {
        try {
          const data = await fetchIntegrationSettings();
          setIntegrationSettings(data);
        } catch (error) {
          console.error('Error loading integration settings:', error);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (section: string) => {
    setLoading(true);
    try {
      switch (section) {
        case 'Profile':
          if (userSettings) {
            await updateProfileSettings({
              name: userSettings.name,
              email: userSettings.email,
              phone: userSettings.phone,
              department: userSettings.department,
              timezone: userSettings.timezone,
              language: userSettings.language,
              avatar: uploadedAvatar || userSettings.avatar
            });
          }
          break;
        case 'Security':
          if (securitySettings) {
            await updateSecuritySettings({
              two_factor_enabled: userSettings?.twoFactorEnabled,
              password_last_changed: new Date().toISOString(),
              login_attempts: 0,
              session_timeout: securitySettings.lockoutDuration
            });
          }
          break;
        case 'Notifications':
          await updateNotificationPreferences(notificationPreferences);
          break;
        case 'Billing':
          if (billingSettings) {
            await updateBillingSettings(billingSettings);
          }
          break;
        case 'Backup':
          if (backupSettings) {
            await updateBackupSettings(backupSettings);
          }
          break;
        case 'Platform':
          if (platformSettings) {
            await updatePlatformSettings(platformSettings);
          }
          break;
        case 'Integrations':
          if (integrationSettings) {
            await updateIntegrationSettings(integrationSettings);
          }
          break;
      }
      
      toast({
        title: 'Settings saved',
        description: `${section} settings have been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error saving settings',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'New password and confirmation must match.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      // In a real app, you would make an API call here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast({
        title: 'Error updating password',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to a storage service
      setUploadedAvatar('https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2');
    }
  };

  const getRoleIcon = () => {
    switch (userSettings?.role) {
      case 'super_admin': return Crown;
      case 'admin': return Shield;
      default: return User;
    }
  };

  const getRoleColor = () => {
    switch (userSettings?.role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = () => {
    switch (userSettings?.role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      default: return 'User';
    }
  };

  const RoleIcon = getRoleIcon();

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={uploadedAvatar || userSettings?.avatar} alt={userSettings?.name} />
              <AvatarFallback className="text-lg">
                {userSettings?.name?.split(' ').map(n => n[0]).join('') || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={userSettings?.name || ''}
                onChange={(e) => setUserSettings(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={userSettings?.email || ''}
                onChange={(e) => setUserSettings(prev => prev ? { ...prev, email: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={userSettings?.phone || ''}
                onChange={(e) => setUserSettings(prev => prev ? { ...prev, phone: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={userSettings?.department || ''}
                onChange={(e) => setUserSettings(prev => prev ? { ...prev, department: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={userSettings?.timezone || 'America/New_York'} 
                onValueChange={(value) => setUserSettings(prev => prev ? { ...prev, timezone: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select 
                value={userSettings?.language || 'en'} 
                onValueChange={(value) => setUserSettings(prev => prev ? { ...prev, language: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => handleSaveSettings('Profile')}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </div>
          <div className="flex justify-end">
            <Button 
              variant="outline"
              onClick={handlePasswordChange}
              disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            >
              <Key className="h-4 w-4 mr-2" />
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">
                  {userSettings?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <Button 
              variant={userSettings?.twoFactorEnabled ? "outline" : "default"}
              onClick={() => setUserSettings(prev => prev ? { ...prev, twoFactorEnabled: !prev.twoFactorEnabled } : null)}
            >
              {userSettings?.twoFactorEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Security Policies</CardTitle>
          <CardDescription>
            Configure platform-wide security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
              <Input
                id="passwordExpiry"
                type="number"
                value={securitySettings?.passwordExpiry || 90}
                onChange={(e) => setSecuritySettings(prev => prev ? { ...prev, passwordExpiry: parseInt(e.target.value) } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={securitySettings?.maxLoginAttempts || 5}
                onChange={(e) => setSecuritySettings(prev => prev ? { ...prev, maxLoginAttempts: parseInt(e.target.value) } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
              <Input
                id="lockoutDuration"
                type="number"
                value={securitySettings?.lockoutDuration || 15}
                onChange={(e) => setSecuritySettings(prev => prev ? { ...prev, lockoutDuration: parseInt(e.target.value) } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataRetention">Data Retention (days)</Label>
              <Input
                id="dataRetention"
                type="number"
                value={securitySettings?.dataRetentionPeriod || 365}
                onChange={(e) => setSecuritySettings(prev => prev ? { ...prev, dataRetentionPeriod: parseInt(e.target.value) } : null)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Force all users to enable 2FA</p>
              </div>
              <input
                type="checkbox"
                checked={securitySettings?.twoFactorRequired || false}
                onChange={(e) => setSecuritySettings(prev => prev ? { ...prev, twoFactorRequired: e.target.checked } : null)}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SSL/TLS Encryption</p>
                <p className="text-sm text-gray-600">Enforce HTTPS connections</p>
              </div>
              <input
                type="checkbox"
                checked={securitySettings?.sslEnabled || true}
                onChange={(e) => setSecuritySettings(prev => prev ? { ...prev, sslEnabled: e.target.checked } : null)}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Audit Logging</p>
                <p className="text-sm text-gray-600">Log all user actions and system events</p>
              </div>
              <input
                type="checkbox"
                checked={securitySettings?.auditLogging || true}
                onChange={(e) => setSecuritySettings(prev => prev ? { ...prev, auditLogging: e.target.checked } : null)}
                className="rounded"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => handleSaveSettings('Security')}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Security Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationPreferences.email}
              onChange={(e) => setNotificationPreferences(prev => ({ ...prev, email: e.target.checked }))}
              className="rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive push notifications in browser</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationPreferences.push}
              onChange={(e) => setNotificationPreferences(prev => ({ ...prev, push: e.target.checked }))}
              className="rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via SMS</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationPreferences.sms}
              onChange={(e) => setNotificationPreferences(prev => ({ ...prev, sms: e.target.checked }))}
              className="rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">Desktop Notifications</p>
                <p className="text-sm text-gray-600">Show desktop notifications</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationPreferences.desktop}
              onChange={(e) => setNotificationPreferences(prev => ({ ...prev, desktop: e.target.checked }))}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Marketing Emails</p>
                <p className="text-sm text-gray-600">Receive marketing and promotional emails</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationPreferences.marketing_emails}
              onChange={(e) => setNotificationPreferences(prev => ({ ...prev, marketing_emails: e.target.checked }))}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">System Notifications</p>
                <p className="text-sm text-gray-600">Receive system updates and alerts</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationPreferences.system_notifications}
              onChange={(e) => setNotificationPreferences(prev => ({ ...prev, system_notifications: e.target.checked }))}
              className="rounded"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={() => handleSaveSettings('Notifications')}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderBillingSettings = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your payment methods and billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-sm text-gray-600">Expires 12/2025</p>
                </div>
              </div>
              <Badge>Default</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Billing Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-pay Invoices</p>
                  <p className="text-sm text-gray-600">Automatically pay invoices when due</p>
                </div>
                <input
                  type="checkbox"
                  checked={billingSettings?.autoPay || true}
                  onChange={(e) => setBillingSettings(prev => prev ? { ...prev, autoPay: e.target.checked } : null)}
                  className="rounded"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invoiceEmail">Invoice Email</Label>
                <Input
                  id="invoiceEmail"
                  type="email"
                  placeholder="finance@company.com"
                  value={billingSettings?.invoiceEmail || ''}
                  onChange={(e) => setBillingSettings(prev => prev ? { ...prev, invoiceEmail: e.target.value } : null)}
                />
                <p className="text-xs text-gray-500">Where to send invoice receipts and payment notifications</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                <Input
                  id="taxId"
                  placeholder="Enter tax ID"
                  value={billingSettings?.taxId || ''}
                  onChange={(e) => setBillingSettings(prev => prev ? { ...prev, taxId: e.target.value } : null)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => handleSaveSettings('Billing')}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Billing Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Backup Configuration</CardTitle>
          <CardDescription>
            Configure automatic backups and data recovery options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Automatic Backups</p>
                <p className="text-sm text-gray-600">Schedule regular data backups</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={backupSettings?.autoBackup || true}
              onChange={(e) => setBackupSettings(prev => prev ? { ...prev, autoBackup: e.target.checked } : null)}
              className="rounded"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <Select 
                value={backupSettings?.backupFrequency || 'daily'} 
                onValueChange={(value) => setBackupSettings(prev => prev ? { ...prev, backupFrequency: value } : null)}
                disabled={!backupSettings?.autoBackup}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backupTime">Backup Time</Label>
              <Input
                id="backupTime"
                type="time"
                value={backupSettings?.backupTime || '00:00'}
                onChange={(e) => setBackupSettings(prev => prev ? { ...prev, backupTime: e.target.value } : null)}
                disabled={!backupSettings?.autoBackup}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retentionDays">Retention Period (days)</Label>
              <Input
                id="retentionDays"
                type="number"
                value={backupSettings?.retentionDays || 30}
                onChange={(e) => setBackupSettings(prev => prev ? { ...prev, retentionDays: parseInt(e.target.value) } : null)}
                disabled={!backupSettings?.autoBackup}
              />
              <p className="text-xs text-gray-500">How long to keep backup files</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storageProvider">Storage Provider</Label>
              <Select 
                value={backupSettings?.storageProvider || 'local'} 
                onValueChange={(value) => setBackupSettings(prev => prev ? { ...prev, storageProvider: value } : null)}
                disabled={!backupSettings?.autoBackup}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Storage</SelectItem>
                  <SelectItem value="s3">Amazon S3</SelectItem>
                  <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                  <SelectItem value="azure">Azure Blob Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {backupSettings?.storageProvider !== 'local' && (
            <div className="p-4 border rounded-lg bg-blue-50">
              <h3 className="font-medium text-blue-800 mb-2">Cloud Storage Configuration</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="storagePath">Storage Path</Label>
                  <Input
                    id="storagePath"
                    placeholder="backups/hairvana"
                    value={backupSettings?.storagePath || ''}
                    onChange={(e) => setBackupSettings(prev => prev ? { ...prev, storagePath: e.target.value } : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cloudCredentials">API Key / Credentials</Label>
                  <Input
                    id="cloudCredentials"
                    type="password"
                    placeholder="Enter API key or credentials"
                  />
                  <p className="text-xs text-gray-500">Credentials are encrypted before storage</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Manual Backup
            </Button>
            
            <Button 
              onClick={() => handleSaveSettings('Backup')}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Backup Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>
            View and restore previous backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Database className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Daily Backup</p>
                  <p className="text-sm text-gray-600">June 15, 2024 - 00:00</p>
                  <p className="text-xs text-gray-500">Size: 24.5 MB</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restore
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Database className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Daily Backup</p>
                  <p className="text-sm text-gray-600">June 14, 2024 - 00:00</p>
                  <p className="text-xs text-gray-500">Size: 24.2 MB</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restore
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPlatformSettings = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure basic platform settings and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={platformSettings?.siteName || 'Hairvana'}
                onChange={(e) => setPlatformSettings(prev => prev ? { ...prev, siteName: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={platformSettings?.currency || 'USD'} 
                onValueChange={(value) => setPlatformSettings(prev => prev ? { ...prev, currency: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <textarea
              id="siteDescription"
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={platformSettings?.siteDescription || 'Professional Salon Management Platform'}
              onChange={(e) => setPlatformSettings(prev => prev ? { ...prev, siteDescription: e.target.value } : null)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  value={platformSettings?.primaryColor || '#8b5cf6'}
                  onChange={(e) => setPlatformSettings(prev => prev ? { ...prev, primaryColor: e.target.value } : null)}
                />
                <input
                  type="color"
                  value={platformSettings?.primaryColor || '#8b5cf6'}
                  onChange={(e) => setPlatformSettings(prev => prev ? { ...prev, primaryColor: e.target.value } : null)}
                  className="w-12 h-10 rounded border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  value={platformSettings?.secondaryColor || '#ec4899'}
                  onChange={(e) => setPlatformSettings(prev => prev ? { ...prev, secondaryColor: e.target.value } : null)}
                />
                <input
                  type="color"
                  value={platformSettings?.secondaryColor || '#ec4899'}
                  onChange={(e) => setPlatformSettings(prev => prev ? { ...prev, secondaryColor: e.target.value } : null)}
                  className="w-12 h-10 rounded border"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-gray-600">Temporarily disable public access</p>
              </div>
              <input
                type="checkbox"
                checked={platformSettings?.maintenanceMode || false}
                onChange={(e) => setPlatformSettings(prev => prev ? { ...prev, maintenanceMode: e.target.checked } : null)}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">User Registration</p>
                <p className="text-sm text-gray-600">Allow new users to register</p>
              </div>
              <input
                type="checkbox"
                checked={platformSettings?.registrationEnabled || true}
                onChange={(e) => setPlatformSettings(prev => prev ? { ...prev, registrationEnabled: e.target.checked } : null)}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Verification</p>
                <p className="text-sm text-gray-600">Require email verification for new accounts</p>
              </div>
              <input
                type="checkbox"
                checked={platformSettings?.emailVerificationRequired || true}
                onChange={(e) => setPlatformSettings(prev => prev ? { ...prev, emailVerificationRequired: e.target.checked } : null)}
                className="rounded"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => handleSaveSettings('Platform')}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Platform Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>API Integrations</CardTitle>
          <CardDescription>
            Configure third-party service integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Email Service</h4>
              <div className="space-y-2">
                <Label htmlFor="emailProvider">Provider</Label>
                <Select 
                  value={integrationSettings?.emailProvider || 'sendgrid'} 
                  onValueChange={(value) => setIntegrationSettings(prev => prev ? { ...prev, emailProvider: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                    <SelectItem value="ses">Amazon SES</SelectItem>
                    <SelectItem value="postmark">Postmark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailApiKey">API Key</Label>
                <Input
                  id="emailApiKey"
                  type="password"
                  placeholder="Enter API key"
                  value={integrationSettings?.emailApiKey || ''}
                  onChange={(e) => setIntegrationSettings(prev => prev ? { ...prev, emailApiKey: e.target.value } : null)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">SMS Service</h4>
              <div className="space-y-2">
                <Label htmlFor="smsProvider">Provider</Label>
                <Select 
                  value={integrationSettings?.smsProvider || 'twilio'} 
                  onValueChange={(value) => setIntegrationSettings(prev => prev ? { ...prev, smsProvider: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="nexmo">Nexmo</SelectItem>
                    <SelectItem value="messagebird">MessageBird</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="smsApiKey">API Key</Label>
                <Input
                  id="smsApiKey"
                  type="password"
                  placeholder="Enter API key"
                  value={integrationSettings?.smsApiKey || ''}
                  onChange={(e) => setIntegrationSettings(prev => prev ? { ...prev, smsApiKey: e.target.value } : null)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Payment Gateway</h4>
              <div className="space-y-2">
                <Label htmlFor="paymentGateway">Provider</Label>
                <Select 
                  value={integrationSettings?.paymentGateway || 'stripe'} 
                  onValueChange={(value) => setIntegrationSettings(prev => prev ? { ...prev, paymentGateway: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentApiKey">API Key</Label>
                <Input
                  id="paymentApiKey"
                  type="password"
                  placeholder="Enter API key"
                  value={integrationSettings?.paymentApiKey || ''}
                  onChange={(e) => setIntegrationSettings(prev => prev ? { ...prev, paymentApiKey: e.target.value } : null)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Analytics</h4>
              <div className="space-y-2">
                <Label htmlFor="analyticsProvider">Provider</Label>
                <Select 
                  value={integrationSettings?.analyticsProvider || 'google'} 
                  onValueChange={(value) => setIntegrationSettings(prev => prev ? { ...prev, analyticsProvider: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Analytics</SelectItem>
                    <SelectItem value="mixpanel">Mixpanel</SelectItem>
                    <SelectItem value="amplitude">Amplitude</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="analyticsTrackingId">Tracking ID</Label>
                <Input
                  id="analyticsTrackingId"
                  placeholder="Enter tracking ID"
                  value={integrationSettings?.analyticsTrackingId || ''}
                  onChange={(e) => setIntegrationSettings(prev => prev ? { ...prev, analyticsTrackingId: e.target.value } : null)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => handleSaveSettings('Integrations')}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Integration Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Social Login</CardTitle>
          <CardDescription>
            Enable social media login options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Google Login</p>
              <p className="text-sm text-gray-600">Allow users to sign in with Google</p>
            </div>
            <input
              type="checkbox"
              checked={integrationSettings?.socialLogins?.google || true}
              onChange={(e) => setIntegrationSettings(prev => prev ? { 
                ...prev, 
                socialLogins: { ...prev.socialLogins, google: e.target.checked }
              } : null)}
              className="rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Facebook Login</p>
              <p className="text-sm text-gray-600">Allow users to sign in with Facebook</p>
            </div>
            <input
              type="checkbox"
              checked={integrationSettings?.socialLogins?.facebook || false}
              onChange={(e) => setIntegrationSettings(prev => prev ? { 
                ...prev, 
                socialLogins: { ...prev.socialLogins, facebook: e.target.checked }
              } : null)}
              className="rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Apple Login</p>
              <p className="text-sm text-gray-600">Allow users to sign in with Apple ID</p>
            </div>
            <input
              type="checkbox"
              checked={integrationSettings?.socialLogins?.apple || false}
              onChange={(e) => setIntegrationSettings(prev => prev ? { 
                ...prev, 
                socialLogins: { ...prev.socialLogins, apple: e.target.checked }
              } : null)}
              className="rounded"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Current system status and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="font-medium">System Status</span>
              </div>
              <p className="text-2xl font-bold text-green-600">Online</p>
              <p className="text-sm text-gray-600">99.9% uptime</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-5 w-5 text-blue-600" />
                <span className="font-medium">CPU Usage</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">45%</p>
              <p className="text-sm text-gray-600">4 cores active</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Storage</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">67%</p>
              <p className="text-sm text-gray-600">2.1TB used</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Network</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">Good</p>
              <p className="text-sm text-gray-600">125ms latency</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>System Maintenance</CardTitle>
          <CardDescription>
            Perform system maintenance tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 text-blue-600" />
              <span className="font-medium">Clear Cache</span>
              <span className="text-xs text-gray-500">Clear system cache</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Database className="h-6 w-6 text-green-600" />
              <span className="font-medium">Optimize Database</span>
              <span className="text-xs text-gray-500">Optimize database performance</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Download className="h-6 w-6 text-purple-600" />
              <span className="font-medium">Export Data</span>
              <span className="text-xs text-gray-500">Export system data</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <BarChart3 className="h-6 w-6 text-orange-600" />
              <span className="font-medium">Generate Report</span>
              <span className="text-xs text-gray-500">System health report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'platform':
        return renderPlatformSettings();
      case 'integrations':
        return renderIntegrationSettings();
      case 'system':
        return renderSystemSettings();
      case 'billing':
        return renderBillingSettings();
      case 'backup':
        return renderBackupSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and platform settings</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 space-y-1">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{section.title}</p>
                    <p className="text-xs text-gray-500">{section.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}