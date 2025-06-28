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
import { Settings, User, Shield, Bell, Globe, CreditCard, Database, Mail, Smartphone, Lock, Key, Eye, EyeOff, Save, RefreshCw, Upload, Download, Trash2, Plus, Edit, Check, X, AlertTriangle, Info, Zap, Monitor, Palette, Languages, Clock, MapPin, DollarSign, Percent, FileText, BarChart3, Activity, Server, Cloud, HardDrive, Cpu, Wifi, Camera, Mic, Volume2, Printer, Calendar, Users, Building2, CreditCard as CreditCardIcon, Receipt, Wallet, DollarSign as DollarSignIcon, FileText as FileTextIcon, Landmark, Check as BankCheck, Banknote, Coins, Archive, HardDrive as HardDriveIcon, Cloud as CloudIcon, Clock as ClockIcon, Calendar as CalendarIcon, RotateCcw, History, ArchiveRestore } from 'lucide-react';
import { 
  fetchUserSettings, 
  updateProfileSettings, 
  updateSecuritySettings, 
  updateNotificationPreferences,
  updateBillingSettings,
  updateBackupSettings
} from '@/api/settings';

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
  defaultPaymentMethod: {
    type: string;
    cardBrand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
  };
  paymentMethods: Array<{
    id: string;
    type: string;
    cardBrand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
  }>;
  billingAddress: {
    name: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  taxId: string;
  invoiceEmail: string;
  invoiceSettings: {
    autoPayEnabled: boolean;
    invoicePrefix: string;
    dueDays: number;
    notes: string;
    logo: string;
  };
}

interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupTime: string;
  retentionDays: number;
  storageProvider: 'local' | 'cloud' | 's3' | 'google';
  storagePath: string;
  cloudCredentials: {
    accessKey: string;
    secretKey: string;
    region: string;
    bucket: string;
  };
  lastBackup: string | null;
  backupHistory: Array<{
    id: string;
    date: string;
    size: string;
    status: 'success' | 'failed';
    location: string;
  }>;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  notifyOnCompletion: boolean;
  notifyOnFailure: boolean;
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
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    name: 'John Smith',
    email: 'admin@hairvana.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
    role: 'Super Admin',
    department: 'Administration',
    timezone: 'America/New_York',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false,
      desktop: true,
    },
    twoFactorEnabled: true,
    lastLogin: '2024-06-15T10:30:00Z'
  });
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    siteName: 'Hairvana',
    siteDescription: 'Professional Salon Management Platform',
    logo: '/logo.png',
    favicon: '/favicon.ico',
    primaryColor: '#8b5cf6',
    secondaryColor: '#ec4899',
    timezone: 'America/New_York',
    currency: 'USD',
    language: 'en',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxFileUploadSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    sessionTimeout: 30,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    }
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorRequired: false,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    ipWhitelist: [],
    sslEnabled: true,
    encryptionLevel: 'AES-256',
    auditLogging: true,
    dataRetentionPeriod: 365,
    backupFrequency: 'daily',
    backupRetention: 30,
  });
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    emailProvider: 'sendgrid',
    emailApiKey: '',
    smsProvider: 'twilio',
    smsApiKey: '',
    paymentGateway: 'stripe',
    paymentApiKey: '',
    analyticsProvider: 'google',
    analyticsTrackingId: '',
    socialLogins: {
      google: true,
      facebook: false,
      apple: false,
    },
    webhooks: [
      {
        id: '1',
        name: 'Payment Webhook',
        url: 'https://api.hairvana.com/webhooks/payments',
        events: ['payment.succeeded', 'payment.failed'],
        active: true
      }
    ]
  });
  const [billingSettings, setBillingSettings] = useState<BillingSettings>({
    defaultPaymentMethod: {
      type: 'card',
      cardBrand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    paymentMethods: [
      {
        id: 'pm_1',
        type: 'card',
        cardBrand: 'Visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
      },
      {
        id: 'pm_2',
        type: 'card',
        cardBrand: 'Mastercard',
        last4: '5555',
        expiryMonth: 10,
        expiryYear: 2024,
        isDefault: false
      }
    ],
    billingAddress: {
      name: 'John Smith',
      line1: '123 Main St',
      line2: 'Suite 100',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US'
    },
    taxId: 'US123456789',
    invoiceEmail: 'billing@hairvana.com',
    invoiceSettings: {
      autoPayEnabled: true,
      invoicePrefix: 'INV',
      dueDays: 15,
      notes: 'Thank you for your business!',
      logo: '/logo.png'
    }
  });
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionDays: 30,
    storageProvider: 'cloud',
    storagePath: '/backups',
    cloudCredentials: {
      accessKey: 'AKIAIOSFODNN7EXAMPLE',
      secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      region: 'us-east-1',
      bucket: 'hairvana-backups'
    },
    lastBackup: '2024-06-15T02:00:00Z',
    backupHistory: [
      {
        id: 'bk_1',
        date: '2024-06-15T02:00:00Z',
        size: '256 MB',
        status: 'success',
        location: 's3://hairvana-backups/2024-06-15/'
      },
      {
        id: 'bk_2',
        date: '2024-06-14T02:00:00Z',
        size: '255 MB',
        status: 'success',
        location: 's3://hairvana-backups/2024-06-14/'
      },
      {
        id: 'bk_3',
        date: '2024-06-13T02:00:00Z',
        size: '254 MB',
        status: 'success',
        location: 's3://hairvana-backups/2024-06-13/'
      }
    ],
    compressionEnabled: true,
    encryptionEnabled: true,
    notifyOnCompletion: true,
    notifyOnFailure: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await fetchUserSettings();
      
      // Update state with fetched settings
      if (settings.profile) {
        setUserProfile(prev => ({ ...prev, ...settings.profile }));
      }
      
      if (settings.security) {
        setSecuritySettings(prev => ({ ...prev, ...settings.security }));
      }
      
      if (settings.notifications) {
        setUserProfile(prev => ({ 
          ...prev, 
          notifications: settings.notifications 
        }));
      }
      
      if (settings.billing) {
        setBillingSettings(prev => ({ ...prev, ...settings.billing }));
      }
      
      if (settings.backup) {
        setBackupSettings(prev => ({ ...prev, ...settings.backup }));
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
      let result;
      
      switch (section) {
        case 'Profile':
          result = await updateProfileSettings({
            name: userProfile.name,
            email: userProfile.email,
            phone: userProfile.phone,
            department: userProfile.department,
            timezone: userProfile.timezone,
            language: userProfile.language
          });
          break;
        case 'Security':
          result = await updateSecuritySettings({
            twoFactorEnabled: userProfile.twoFactorEnabled,
            passwordExpiry: securitySettings.passwordExpiry,
            maxLoginAttempts: securitySettings.maxLoginAttempts,
            lockoutDuration: securitySettings.lockoutDuration
          });
          break;
        case 'Notifications':
          result = await updateNotificationPreferences(userProfile.notifications);
          break;
        case 'Billing':
          result = await updateBillingSettings(billingSettings);
          break;
        case 'Backup':
          result = await updateBackupSettings(backupSettings);
          break;
        default:
          // No action for other sections
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

  const getRoleIcon = () => {
    switch (userProfile.role) {
      case 'Super Admin': return Crown;
      case 'Admin': return Shield;
      default: return User;
    }
  };

  const getRoleColor = () => {
    switch (userProfile.role) {
      case 'Super Admin': return 'bg-purple-100 text-purple-800';
      case 'Admin': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <CardContent>
          <form className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                <AvatarFallback className="text-lg">
                  {userProfile.name.split(' ').map(n => n[0]).join('') || 'A'}
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
                  value={userProfile.name}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={userProfile.department}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={userProfile.timezone}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, timezone: e.target.value }))}
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
                  value={userProfile.language}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, language: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="button"
                onClick={() => handleSaveSettings('Profile')}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
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
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex justify-end">
              <Button 
                type="button"
                variant="outline"
              >
                <Key className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </div>
          </form>
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
                  {userProfile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <Button 
              variant={userProfile.twoFactorEnabled ? "outline" : "default"}
              onClick={() => setUserProfile(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
            >
              {userProfile.twoFactorEnabled ? 'Disable' : 'Enable'}
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
                value={securitySettings.passwordExpiry}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
              <Input
                id="lockoutDuration"
                type="number"
                value={securitySettings.lockoutDuration}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataRetention">Data Retention (days)</Label>
              <Input
                id="dataRetention"
                type="number"
                value={securitySettings.dataRetentionPeriod}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, dataRetentionPeriod: parseInt(e.target.value) }))}
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
                checked={securitySettings.twoFactorRequired}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorRequired: e.target.checked }))}
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
                checked={securitySettings.sslEnabled}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, sslEnabled: e.target.checked }))}
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
                checked={securitySettings.auditLogging}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, auditLogging: e.target.checked }))}
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
              checked={userProfile.notifications.email}
              onChange={(e) => setUserProfile(prev => ({ 
                ...prev, 
                notifications: { ...prev.notifications, email: e.target.checked }
              }))}
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
              checked={userProfile.notifications.push}
              onChange={(e) => setUserProfile(prev => ({ 
                ...prev, 
                notifications: { ...prev.notifications, push: e.target.checked }
              }))}
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
              checked={userProfile.notifications.sms}
              onChange={(e) => setUserProfile(prev => ({ 
                ...prev, 
                notifications: { ...prev.notifications, sms: e.target.checked }
              }))}
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
              checked={userProfile.notifications.desktop}
              onChange={(e) => setUserProfile(prev => ({ 
                ...prev, 
                notifications: { ...prev.notifications, desktop: e.target.checked }
              }))}
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
                value={platformSettings.siteName}
                onChange={(e) => setPlatformSettings(prev => ({ ...prev, siteName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={platformSettings.currency} onValueChange={(value) => setPlatformSettings(prev => ({ ...prev, currency: value }))}>
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
              value={platformSettings.siteDescription}
              onChange={(e) => setPlatformSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  value={platformSettings.primaryColor}
                  onChange={(e) => setPlatformSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                />
                <input
                  type="color"
                  value={platformSettings.primaryColor}
                  onChange={(e) => setPlatformSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-12 h-10 rounded border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  value={platformSettings.secondaryColor}
                  onChange={(e) => setPlatformSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                />
                <input
                  type="color"
                  value={platformSettings.secondaryColor}
                  onChange={(e) => setPlatformSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
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
                checked={platformSettings.maintenanceMode}
                onChange={(e) => setPlatformSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
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
                checked={platformSettings.registrationEnabled}
                onChange={(e) => setPlatformSettings(prev => ({ ...prev, registrationEnabled: e.target.checked }))}
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
                checked={platformSettings.emailVerificationRequired}
                onChange={(e) => setPlatformSettings(prev => ({ ...prev, emailVerificationRequired: e.target.checked }))}
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

  const renderBillingSettings = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your payment methods and default payment option
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {billingSettings.paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCardIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{method.cardBrand} •••• {method.last4}</p>
                    <p className="text-sm text-gray-600">
                      Expires {method.expiryMonth}/{method.expiryYear}
                      {method.isDefault && <span className="ml-2 text-green-600 font-medium">Default</span>}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!method.isDefault && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setBillingSettings(prev => ({
                          ...prev,
                          paymentMethods: prev.paymentMethods.map(m => ({
                            ...m,
                            isDefault: m.id === method.id
                          })),
                          defaultPaymentMethod: method
                        }));
                      }}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600"
                    onClick={() => {
                      setBillingSettings(prev => ({
                        ...prev,
                        paymentMethods: prev.paymentMethods.filter(m => m.id !== method.id)
                      }));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                // In a real app, you would open a dialog to add a new payment method
                toast({
                  title: 'Add Payment Method',
                  description: 'This would open a dialog to add a new payment method.',
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
          <CardDescription>
            Update your billing address for invoices and receipts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billingName">Full Name</Label>
            <Input
              id="billingName"
              value={billingSettings.billingAddress.name}
              onChange={(e) => setBillingSettings(prev => ({
                ...prev,
                billingAddress: {
                  ...prev.billingAddress,
                  name: e.target.value
                }
              }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              value={billingSettings.billingAddress.line1}
              onChange={(e) => setBillingSettings(prev => ({
                ...prev,
                billingAddress: {
                  ...prev.billingAddress,
                  line1: e.target.value
                }
              }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
            <Input
              id="addressLine2"
              value={billingSettings.billingAddress.line2}
              onChange={(e) => setBillingSettings(prev => ({
                ...prev,
                billingAddress: {
                  ...prev.billingAddress,
                  line2: e.target.value
                }
              }))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={billingSettings.billingAddress.city}
                onChange={(e) => setBillingSettings(prev => ({
                  ...prev,
                  billingAddress: {
                    ...prev.billingAddress,
                    city: e.target.value
                  }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={billingSettings.billingAddress.state}
                onChange={(e) => setBillingSettings(prev => ({
                  ...prev,
                  billingAddress: {
                    ...prev.billingAddress,
                    state: e.target.value
                  }
                }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={billingSettings.billingAddress.postalCode}
                onChange={(e) => setBillingSettings(prev => ({
                  ...prev,
                  billingAddress: {
                    ...prev.billingAddress,
                    postalCode: e.target.value
                  }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select 
                value={billingSettings.billingAddress.country}
                onValueChange={(value) => setBillingSettings(prev => ({
                  ...prev,
                  billingAddress: {
                    ...prev.billingAddress,
                    country: value
                  }
                }))}
              >
                <SelectTrigger id="country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID (Optional)</Label>
            <Input
              id="taxId"
              value={billingSettings.taxId}
              onChange={(e) => setBillingSettings(prev => ({
                ...prev,
                taxId: e.target.value
              }))}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Invoice Settings</CardTitle>
          <CardDescription>
            Configure how invoices are generated and delivered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceEmail">Invoice Email</Label>
            <Input
              id="invoiceEmail"
              type="email"
              value={billingSettings.invoiceEmail}
              onChange={(e) => setBillingSettings(prev => ({
                ...prev,
                invoiceEmail: e.target.value
              }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
            <Input
              id="invoicePrefix"
              value={billingSettings.invoiceSettings.invoicePrefix}
              onChange={(e) => setBillingSettings(prev => ({
                ...prev,
                invoiceSettings: {
                  ...prev.invoiceSettings,
                  invoicePrefix: e.target.value
                }
              }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDays">Payment Due Days</Label>
            <Input
              id="dueDays"
              type="number"
              value={billingSettings.invoiceSettings.dueDays}
              onChange={(e) => setBillingSettings(prev => ({
                ...prev,
                invoiceSettings: {
                  ...prev.invoiceSettings,
                  dueDays: parseInt(e.target.value)
                }
              }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invoiceNotes">Default Invoice Notes</Label>
            <textarea
              id="invoiceNotes"
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={billingSettings.invoiceSettings.notes}
              onChange={(e) => setBillingSettings(prev => ({
                ...prev,
                invoiceSettings: {
                  ...prev.invoiceSettings,
                  notes: e.target.value
                }
              }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-Pay Enabled</p>
              <p className="text-sm text-gray-600">Automatically charge default payment method</p>
            </div>
            <input
              type="checkbox"
              checked={billingSettings.invoiceSettings.autoPayEnabled}
              onChange={(e) => setBillingSettings(prev => ({
                ...prev,
                invoiceSettings: {
                  ...prev.invoiceSettings,
                  autoPayEnabled: e.target.checked
                }
              }))}
              className="rounded"
            />
          </div>
          
          <div className="flex justify-end">
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
            Configure automatic backup settings for your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RotateCcw className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Automatic Backups</p>
                <p className="text-sm text-gray-600">Schedule regular data backups</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={backupSettings.autoBackup}
              onChange={(e) => setBackupSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
              className="rounded"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <Select 
                value={backupSettings.backupFrequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setBackupSettings(prev => ({ ...prev, backupFrequency: value }))}
                disabled={!backupSettings.autoBackup}
              >
                <SelectTrigger id="backupFrequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
                value={backupSettings.backupTime}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, backupTime: e.target.value }))}
                disabled={!backupSettings.autoBackup}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retentionDays">Retention Period (days)</Label>
              <Input
                id="retentionDays"
                type="number"
                value={backupSettings.retentionDays}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                disabled={!backupSettings.autoBackup}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storageProvider">Storage Provider</Label>
              <Select 
                value={backupSettings.storageProvider}
                onValueChange={(value: 'local' | 'cloud' | 's3' | 'google') => setBackupSettings(prev => ({ ...prev, storageProvider: value }))}
              >
                <SelectTrigger id="storageProvider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Storage</SelectItem>
                  <SelectItem value="cloud">Cloud Storage</SelectItem>
                  <SelectItem value="s3">Amazon S3</SelectItem>
                  <SelectItem value="google">Google Cloud</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {backupSettings.storageProvider !== 'local' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold">Cloud Storage Configuration</h3>
              
              <div className="space-y-2">
                <Label htmlFor="storagePath">Storage Path</Label>
                <Input
                  id="storagePath"
                  value={backupSettings.storagePath}
                  onChange={(e) => setBackupSettings(prev => ({ ...prev, storagePath: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accessKey">Access Key</Label>
                  <Input
                    id="accessKey"
                    value={backupSettings.cloudCredentials.accessKey}
                    onChange={(e) => setBackupSettings(prev => ({
                      ...prev,
                      cloudCredentials: {
                        ...prev.cloudCredentials,
                        accessKey: e.target.value
                      }
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <Input
                    id="secretKey"
                    type="password"
                    value={backupSettings.cloudCredentials.secretKey}
                    onChange={(e) => setBackupSettings(prev => ({
                      ...prev,
                      cloudCredentials: {
                        ...prev.cloudCredentials,
                        secretKey: e.target.value
                      }
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={backupSettings.cloudCredentials.region}
                    onChange={(e) => setBackupSettings(prev => ({
                      ...prev,
                      cloudCredentials: {
                        ...prev.cloudCredentials,
                        region: e.target.value
                      }
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bucket">Bucket Name</Label>
                  <Input
                    id="bucket"
                    value={backupSettings.cloudCredentials.bucket}
                    onChange={(e) => setBackupSettings(prev => ({
                      ...prev,
                      cloudCredentials: {
                        ...prev.cloudCredentials,
                        bucket: e.target.value
                      }
                    }))}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Compression</p>
                <p className="text-sm text-gray-600">Compress backup files to save space</p>
              </div>
              <input
                type="checkbox"
                checked={backupSettings.compressionEnabled}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, compressionEnabled: e.target.checked }))}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Encryption</p>
                <p className="text-sm text-gray-600">Encrypt backup files for security</p>
              </div>
              <input
                type="checkbox"
                checked={backupSettings.encryptionEnabled}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, encryptionEnabled: e.target.checked }))}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notify on Completion</p>
                <p className="text-sm text-gray-600">Send notification when backup completes</p>
              </div>
              <input
                type="checkbox"
                checked={backupSettings.notifyOnCompletion}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, notifyOnCompletion: e.target.checked }))}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notify on Failure</p>
                <p className="text-sm text-gray-600">Send notification if backup fails</p>
              </div>
              <input
                type="checkbox"
                checked={backupSettings.notifyOnFailure}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, notifyOnFailure: e.target.checked }))}
                className="rounded"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
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
            View and manage previous backup records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {backupSettings.lastBackup && (
            <div className="p-4 bg-blue-50 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Last Backup</p>
                    <p className="text-sm text-blue-700">
                      {new Date(backupSettings.lastBackup).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: 'Backup Started',
                      description: 'Manual backup has been initiated.',
                    });
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Backup Now
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            {backupSettings.backupHistory.map((backup) => (
              <div 
                key={backup.id} 
                className={`p-4 border rounded-lg flex items-center justify-between ${
                  backup.status === 'success' ? 'border-green-200' : 'border-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    backup.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {backup.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {new Date(backup.date).toLocaleDateString()} at {new Date(backup.date).toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Size: {backup.size} • Location: {backup.location}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => {
                      toast({
                        title: 'Download Started',
                        description: 'Backup download has been initiated.',
                      });
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:bg-green-50 hover:text-green-600"
                    onClick={() => {
                      toast({
                        title: 'Restore Started',
                        description: 'Backup restore has been initiated.',
                      });
                    }}
                  >
                    <ArchiveRestore className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {backupSettings.backupHistory.length === 0 && (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No backup history</h3>
              <p className="text-gray-600 mb-4">
                No backups have been created yet.
              </p>
              <Button>
                <RotateCcw className="h-4 w-4 mr-2" />
                Create First Backup
              </Button>
            </div>
          )}
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
                <Select value={integrationSettings.emailProvider} onValueChange={(value) => setIntegrationSettings(prev => ({ ...prev, emailProvider: value }))}>
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
                  value={integrationSettings.emailApiKey}
                  onChange={(e) => setIntegrationSettings(prev => ({ ...prev, emailApiKey: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">SMS Service</h4>
              <div className="space-y-2">
                <Label htmlFor="smsProvider">Provider</Label>
                <Select value={integrationSettings.smsProvider} onValueChange={(value) => setIntegrationSettings(prev => ({ ...prev, smsProvider: value }))}>
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
                  value={integrationSettings.smsApiKey}
                  onChange={(e) => setIntegrationSettings(prev => ({ ...prev, smsApiKey: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Payment Gateway</h4>
              <div className="space-y-2">
                <Label htmlFor="paymentGateway">Provider</Label>
                <Select value={integrationSettings.paymentGateway} onValueChange={(value) => setIntegrationSettings(prev => ({ ...prev, paymentGateway: value }))}>
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
                  value={integrationSettings.paymentApiKey}
                  onChange={(e) => setIntegrationSettings(prev => ({ ...prev, paymentApiKey: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Analytics</h4>
              <div className="space-y-2">
                <Label htmlFor="analyticsProvider">Provider</Label>
                <Select value={integrationSettings.analyticsProvider} onValueChange={(value) => setIntegrationSettings(prev => ({ ...prev, analyticsProvider: value }))}>
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
                  value={integrationSettings.analyticsTrackingId}
                  onChange={(e) => setIntegrationSettings(prev => ({ ...prev, analyticsTrackingId: e.target.value }))}
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
              checked={integrationSettings.socialLogins.google}
              onChange={(e) => setIntegrationSettings(prev => ({ 
                ...prev, 
                socialLogins: { ...prev.socialLogins, google: e.target.checked }
              }))}
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
              checked={integrationSettings.socialLogins.facebook}
              onChange={(e) => setIntegrationSettings(prev => ({ 
                ...prev, 
                socialLogins: { ...prev.socialLogins, facebook: e.target.checked }
              }))}
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
              checked={integrationSettings.socialLogins.apple}
              onChange={(e) => setIntegrationSettings(prev => ({ 
                ...prev, 
                socialLogins: { ...prev.socialLogins, apple: e.target.checked }
              }))}
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