'use client';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  Plus,
  Send,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  Building2,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Target,
  Calendar,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  RefreshCw,
  Archive,
  Star,
  TrendingUp,
  UserCheck,
  CreditCard,
  Activity,
  Megaphone,
  FileText,
  Gift,
  AlertCircle,
  Info,
  XCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  targetAudience: 'all' | 'salons' | 'users' | 'admins' | 'custom';
  channels: ('email' | 'push' | 'in-app' | 'sms')[];
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  createdBy: string;
  recipients: {
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
  customFilters?: {
    userType?: string[];
    location?: string[];
    subscriptionPlan?: string[];
    registrationDate?: string;
  };
}

interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'promotion';
  category: 'system' | 'marketing' | 'transactional' | 'operational';
  subject: string;
  content: string;
  channels: ('email' | 'push' | 'in-app' | 'sms')[];
  variables: string[];
  popular: boolean;
}

const notificationTypes = {
  info: { color: 'bg-blue-100 text-blue-800', icon: Info },
  success: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  warning: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  error: { color: 'bg-red-100 text-red-800', icon: XCircle },
  announcement: { color: 'bg-purple-100 text-purple-800', icon: Megaphone },
  promotion: { color: 'bg-pink-100 text-pink-800', icon: Gift },
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const channelIcons = {
  email: Mail,
  push: Bell,
  'in-app': Monitor,
  sms: Smartphone,
};

const templates: NotificationTemplate[] = [
  {
    id: 'welcome-salon',
    name: 'Welcome New Salon',
    description: 'Welcome message for newly registered salons',
    type: 'success',
    category: 'transactional',
    subject: 'Welcome to Hairvana! 🎉',
    content: 'Welcome {{salonName}} to the Hairvana platform! We\'re excited to help you grow your business.',
    channels: ['email', 'in-app'],
    variables: ['salonName', 'ownerName', 'setupLink'],
    popular: true
  },
  {
    id: 'subscription-reminder',
    name: 'Subscription Renewal Reminder',
    description: 'Remind salons about upcoming subscription renewal',
    type: 'warning',
    category: 'transactional',
    subject: 'Your subscription expires in 3 days',
    content: 'Hi {{ownerName}}, your {{planName}} subscription for {{salonName}} expires on {{expiryDate}}.',
    channels: ['email', 'push', 'in-app'],
    variables: ['ownerName', 'salonName', 'planName', 'expiryDate', 'renewLink'],
    popular: true
  },
  {
    id: 'platform-update',
    name: 'Platform Update Announcement',
    description: 'Notify users about new features and updates',
    type: 'announcement',
    category: 'operational',
    subject: 'New Features Available! 🚀',
    content: 'We\'ve added exciting new features to improve your experience. Check out what\'s new!',
    channels: ['email', 'push', 'in-app'],
    variables: ['featureList', 'updateDate', 'learnMoreLink'],
    popular: false
  },
  {
    id: 'promotional-offer',
    name: 'Promotional Offer',
    description: 'Send promotional offers and discounts',
    type: 'promotion',
    category: 'marketing',
    subject: 'Special Offer: {{discountPercent}}% Off!',
    content: 'Limited time offer! Get {{discountPercent}}% off your next subscription upgrade.',
    channels: ['email', 'push'],
    variables: ['discountPercent', 'offerCode', 'expiryDate', 'upgradeLink'],
    popular: true
  },
  {
    id: 'system-maintenance',
    name: 'System Maintenance Notice',
    description: 'Notify about scheduled maintenance',
    type: 'warning',
    category: 'system',
    subject: 'Scheduled Maintenance: {{maintenanceDate}}',
    content: 'We\'ll be performing system maintenance on {{maintenanceDate}} from {{startTime}} to {{endTime}}.',
    channels: ['email', 'in-app'],
    variables: ['maintenanceDate', 'startTime', 'endTime', 'duration'],
    popular: false
  },
  {
    id: 'payment-failed',
    name: 'Payment Failed Alert',
    description: 'Alert when payment processing fails',
    type: 'error',
    category: 'transactional',
    subject: 'Payment Failed - Action Required',
    content: 'We couldn\'t process your payment for {{salonName}}. Please update your payment method.',
    channels: ['email', 'push', 'in-app'],
    variables: ['salonName', 'amount', 'failureReason', 'updateLink'],
    popular: false
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | Notification['type']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Notification['status']>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type'],
    priority: 'medium' as Notification['priority'],
    targetAudience: 'all' as Notification['targetAudience'],
    channels: ['email'] as Notification['channels'],
    scheduleType: 'now' as 'now' | 'later',
    scheduledAt: '',
    customFilters: {
      userType: [] as string[],
      location: [] as string[],
      subscriptionPlan: [] as string[],
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Mock data for demonstration
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Welcome to Hairvana Platform',
          message: 'Welcome to the Hairvana platform! We\'re excited to help you grow your salon business.',
          type: 'success',
          priority: 'medium',
          status: 'sent',
          targetAudience: 'salons',
          channels: ['email', 'in-app'],
          sentAt: '2024-06-15T10:30:00Z',
          createdAt: '2024-06-15T09:00:00Z',
          createdBy: 'Sarah Johnson',
          recipients: {
            total: 1247,
            sent: 1247,
            delivered: 1198,
            opened: 856,
            clicked: 234
          }
        },
        {
          id: '2',
          title: 'Subscription Renewal Reminder',
          message: 'Your Premium subscription expires in 3 days. Renew now to continue enjoying all features.',
          type: 'warning',
          priority: 'high',
          status: 'sent',
          targetAudience: 'salons',
          channels: ['email', 'push', 'in-app'],
          sentAt: '2024-06-14T16:45:00Z',
          createdAt: '2024-06-14T16:00:00Z',
          createdBy: 'John Smith',
          recipients: {
            total: 89,
            sent: 89,
            delivered: 87,
            opened: 72,
            clicked: 45
          }
        },
        {
          id: '3',
          title: 'New Features Available',
          message: 'We\'ve added exciting new analytics features to help you track your salon\'s performance better.',
          type: 'announcement',
          priority: 'medium',
          status: 'scheduled',
          targetAudience: 'all',
          channels: ['email', 'push'],
          scheduledAt: '2024-06-16T09:00:00Z',
          createdAt: '2024-06-15T14:20:00Z',
          createdBy: 'Mike Davis',
          recipients: {
            total: 45231,
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0
          }
        },
        {
          id: '4',
          title: 'Special Promotion: 30% Off Premium',
          message: 'Limited time offer! Upgrade to Premium and save 30% on your first year.',
          type: 'promotion',
          priority: 'high',
          status: 'draft',
          targetAudience: 'salons',
          channels: ['email', 'push'],
          createdAt: '2024-06-15T11:30:00Z',
          createdBy: 'Lisa Thompson',
          recipients: {
            total: 0,
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0
          },
          customFilters: {
            subscriptionPlan: ['Basic', 'Standard']
          }
        },
        {
          id: '5',
          title: 'System Maintenance Notice',
          message: 'Scheduled maintenance on Sunday, June 16th from 2:00 AM to 4:00 AM EST.',
          type: 'warning',
          priority: 'urgent',
          status: 'failed',
          targetAudience: 'all',
          channels: ['email', 'in-app'],
          createdAt: '2024-06-15T08:15:00Z',
          createdBy: 'System Admin',
          recipients: {
            total: 45231,
            sent: 12456,
            delivered: 0,
            opened: 0,
            clicked: 0
          }
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateNotification = async () => {
    try {
      const notificationData = {
        ...notificationForm,
        template: selectedTemplate,
      };

      // In a real app, you would make an API call here
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        priority: notificationData.priority,
        status: notificationData.scheduleType === 'now' ? 'sent' : 'scheduled',
        targetAudience: notificationData.targetAudience,
        channels: notificationData.channels,
        scheduledAt: notificationData.scheduleType === 'later' ? notificationData.scheduledAt : undefined,
        sentAt: notificationData.scheduleType === 'now' ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
        createdBy: 'Current User',
        recipients: {
          total: notificationData.targetAudience === 'all' ? 45231 : 
                 notificationData.targetAudience === 'salons' ? 1247 : 
                 notificationData.targetAudience === 'users' ? 43984 : 0,
          sent: notificationData.scheduleType === 'now' ? (notificationData.targetAudience === 'all' ? 45231 : 
                notificationData.targetAudience === 'salons' ? 1247 : 43984) : 0,
          delivered: 0,
          opened: 0,
          clicked: 0
        },
        customFilters: notificationData.targetAudience === 'custom' ? notificationData.customFilters : undefined
      };

      setNotifications(prev => [newNotification, ...prev]);

      toast({
        title: 'Notification created successfully',
        description: notificationData.scheduleType === 'now' ? 
          'Your notification has been sent.' : 
          'Your notification has been scheduled.',
      });

      setCreateDialogOpen(false);
      setSelectedTemplate(null);
      setNotificationForm({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium',
        targetAudience: 'all',
        channels: ['email'],
        scheduleType: 'now',
        scheduledAt: '',
        customFilters: {
          userType: [],
          location: [],
          subscriptionPlan: [],
        }
      });
    } catch (error) {
      toast({
        title: 'Error creating notification',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast({
        title: 'Notification deleted',
        description: 'The notification has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error deleting notification',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleResendNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.map(n => 
        n.id === notificationId 
          ? { ...n, status: 'sent', sentAt: new Date().toISOString() }
          : n
      ));
      toast({
        title: 'Notification resent',
        description: 'The notification has been sent successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error resending notification',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const getEngagementRate = (notification: Notification) => {
    if (notification.recipients.sent === 0) return 0;
    return ((notification.recipients.opened / notification.recipients.sent) * 100).toFixed(1);
  };

  const getClickRate = (notification: Notification) => {
    if (notification.recipients.opened === 0) return 0;
    return ((notification.recipients.clicked / notification.recipients.opened) * 100).toFixed(1);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Manage and send notifications to users and salons</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchNotifications}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
                <DialogDescription>
                  Send notifications to users, salons, or specific groups
                </DialogDescription>
              </DialogHeader>
              
              {!selectedTemplate ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Choose a Template</h3>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTemplate({ id: 'custom', name: 'Custom', description: '', type: 'info', category: 'custom', subject: '', content: '', channels: [], variables: [], popular: false })}
                    >
                      Create Custom
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => {
                      const TypeIcon = notificationTypes[template.type].icon;
                      return (
                        <div
                          key={template.id}
                          onClick={() => setSelectedTemplate(template)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-purple-200 hover:bg-purple-50 ${
                            template.popular ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          {template.popular && (
                            <Badge className="mb-2 bg-blue-600 text-white">Popular</Badge>
                          )}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                              <TypeIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{template.name}</h4>
                              <Badge className={notificationTypes[template.type].color}>
                                {template.type}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {template.channels.map(channel => {
                              const ChannelIcon = channelIcons[channel];
                              return (
                                <div key={channel} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                                  <ChannelIcon className="h-3 w-3" />
                                  {channel}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedTemplate.id !== 'custom' && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                          <Bell className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{selectedTemplate.name}</h3>
                          <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          placeholder={selectedTemplate.subject || "Enter notification title"}
                          value={notificationForm.title}
                          onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <textarea
                          id="message"
                          rows={4}
                          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder={selectedTemplate.content || "Enter notification message"}
                          value={notificationForm.message}
                          onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="type">Type</Label>
                          <Select value={notificationForm.type} onValueChange={(value: Notification['type']) => setNotificationForm(prev => ({ ...prev, type: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="success">Success</SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                              <SelectItem value="error">Error</SelectItem>
                              <SelectItem value="announcement">Announcement</SelectItem>
                              <SelectItem value="promotion">Promotion</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="priority">Priority</Label>
                          <Select value={notificationForm.priority} onValueChange={(value: Notification['priority']) => setNotificationForm(prev => ({ ...prev, priority: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="audience">Target Audience</Label>
                        <Select value={notificationForm.targetAudience} onValueChange={(value: Notification['targetAudience']) => setNotificationForm(prev => ({ ...prev, targetAudience: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="salons">Salon Owners</SelectItem>
                            <SelectItem value="users">Customers</SelectItem>
                            <SelectItem value="admins">Admins</SelectItem>
                            <SelectItem value="custom">Custom Filter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Delivery Channels</Label>
                        <div className="space-y-2">
                          {(['email', 'push', 'in-app', 'sms'] as const).map(channel => {
                            const ChannelIcon = channelIcons[channel];
                            return (
                              <div key={channel} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={channel}
                                  checked={notificationForm.channels.includes(channel)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNotificationForm(prev => ({ 
                                        ...prev, 
                                        channels: [...prev.channels, channel] 
                                      }));
                                    } else {
                                      setNotificationForm(prev => ({ 
                                        ...prev, 
                                        channels: prev.channels.filter(c => c !== channel) 
                                      }));
                                    }
                                  }}
                                  className="rounded"
                                />
                                <Label htmlFor={channel} className="flex items-center gap-2 text-sm">
                                  <ChannelIcon className="h-4 w-4" />
                                  {channel.charAt(0).toUpperCase() + channel.slice(1)}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Schedule</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id="now"
                              name="schedule"
                              checked={notificationForm.scheduleType === 'now'}
                              onChange={() => setNotificationForm(prev => ({ ...prev, scheduleType: 'now' }))}
                            />
                            <Label htmlFor="now" className="text-sm">Send now</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id="later"
                              name="schedule"
                              checked={notificationForm.scheduleType === 'later'}
                              onChange={() => setNotificationForm(prev => ({ ...prev, scheduleType: 'later' }))}
                            />
                            <Label htmlFor="later" className="text-sm">Schedule for later</Label>
                          </div>
                          {notificationForm.scheduleType === 'later' && (
                            <Input
                              type="datetime-local"
                              value={notificationForm.scheduledAt}
                              onChange={(e) => setNotificationForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                              className="mt-2"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {notificationForm.targetAudience === 'custom' && (
                    <div className="space-y-4 p-4 border rounded-lg">
                      <h4 className="font-semibold">Custom Filters</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Subscription Plan</Label>
                          <div className="space-y-1">
                            {['Basic', 'Standard', 'Premium'].map(plan => (
                              <div key={plan} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={plan}
                                  checked={notificationForm.customFilters.subscriptionPlan.includes(plan)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNotificationForm(prev => ({
                                        ...prev,
                                        customFilters: {
                                          ...prev.customFilters,
                                          subscriptionPlan: [...prev.customFilters.subscriptionPlan, plan]
                                        }
                                      }));
                                    } else {
                                      setNotificationForm(prev => ({
                                        ...prev,
                                        customFilters: {
                                          ...prev.customFilters,
                                          subscriptionPlan: prev.customFilters.subscriptionPlan.filter(p => p !== plan)
                                        }
                                      }));
                                    }
                                  }}
                                  className="rounded"
                                />
                                <Label htmlFor={plan} className="text-sm">{plan}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setSelectedTemplate(null);
                  setCreateDialogOpen(false);
                }}>
                  Cancel
                </Button>
                {selectedTemplate && (
                  <Button 
                    onClick={handleCreateNotification}
                    disabled={!notificationForm.title || !notificationForm.message}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {notificationForm.scheduleType === 'now' ? 'Send Now' : 'Schedule'}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter(n => n.status === 'sent').length}
                </p>
              </div>
              <Send className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {notifications.filter(n => n.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-blue-600">
                  {notifications.filter(n => n.status === 'draft').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Open Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {notifications.filter(n => n.status === 'sent').length > 0 ? 
                    (notifications
                      .filter(n => n.status === 'sent')
                      .reduce((acc, n) => acc + (n.recipients.sent > 0 ? (n.recipients.opened / n.recipients.sent) * 100 : 0), 0) / 
                     notifications.filter(n => n.status === 'sent').length
                    ).toFixed(1) : '0'}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="promotion">Promotion</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>
            Manage and track all your notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const TypeIcon = notificationTypes[notification.type].icon;
              return (
                <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                      <TypeIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <Badge className={notificationTypes[notification.type].color}>
                          {notification.type}
                        </Badge>
                        <Badge className={priorityColors[notification.priority]}>
                          {notification.priority}
                        </Badge>
                        <Badge className={statusColors[notification.status]}>
                          {notification.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>To: {notification.targetAudience}</span>
                        <span>•</span>
                        <span>By: {notification.createdBy}</span>
                        <span>•</span>
                        <span>{format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                        {notification.sentAt && (
                          <>
                            <span>•</span>
                            <span>Sent: {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}</span>
                          </>
                        )}
                        <span>•</span>
                        <div className="flex gap-1">
                          {notification.channels.map(channel => {
                            const ChannelIcon = channelIcons[channel];
                            return (
                              <ChannelIcon key={channel} className="h-3 w-3" title={channel} />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {notification.status === 'sent' && (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-900">
                          {notification.recipients.sent.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Sent</p>
                      </div>
                    )}
                    {notification.status === 'sent' && notification.recipients.opened > 0 && (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-green-600">
                          {getEngagementRate(notification)}%
                        </p>
                        <p className="text-xs text-gray-500">Open Rate</p>
                      </div>
                    )}
                    {notification.status === 'sent' && notification.recipients.clicked > 0 && (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-blue-600">
                          {getClickRate(notification)}%
                        </p>
                        <p className="text-xs text-gray-500">Click Rate</p>
                      </div>
                    )}
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {notification.status === 'draft' && (
                        <Button variant="ghost" size="sm" className="hover:bg-green-50 hover:text-green-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {notification.status === 'failed' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleResendNotification(notification.id)}
                          className="hover:bg-orange-50 hover:text-orange-600"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more notifications.'
                  : 'Create your first notification to get started.'}
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Notification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}