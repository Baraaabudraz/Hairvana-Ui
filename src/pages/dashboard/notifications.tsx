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
import { 
  fetchNotifications, 
  createNotification, 
  deleteNotification, 
  sendNotification, 
  fetchNotificationTemplates,
  Notification,
  NotificationTemplate
} from '@/api/notifications';

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
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
    loadNotifications();
    loadTemplates();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const data = await fetchNotifications(params);
      setNotifications(data);
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

  const loadTemplates = async () => {
    try {
      const data = await fetchNotificationTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching notification templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notification templates. Please try again.',
        variant: 'destructive',
      });
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

      // Remove scheduleType as it's not part of the API model
      const { scheduleType, ...apiData } = notificationData;
      
      // Set status and dates based on schedule type
      if (scheduleType === 'now') {
        apiData.status = 'sent';
        apiData.sentAt = new Date().toISOString();
      } else if (scheduleType === 'later') {
        apiData.status = 'scheduled';
        apiData.scheduledAt = notificationData.scheduledAt;
      } else {
        apiData.status = 'draft';
      }

      const newNotification = await createNotification(apiData);
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
      await deleteNotification(notificationId);
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
      const result = await sendNotification(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId 
          ? { ...n, status: 'sent', sentAt: result.sentAt }
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
          <Button variant="outline" onClick={loadNotifications}>
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