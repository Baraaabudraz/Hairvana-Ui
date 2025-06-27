'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  XCircle, 
  Plus,
  CreditCard,
  Building2,
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  Crown,
  Star,
  Zap,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

type SubscriptionStatus = 'active' | 'trial' | 'cancelled' | 'past_due';
type PlanType = 'Basic' | 'Standard' | 'Premium';

interface PaymentMethod {
  type: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: string;
  description: string;
}

interface Usage {
  bookings: number;
  bookingsLimit: number | 'unlimited';
  staff: number;
  staffLimit: number | 'unlimited';
  locations: number;
  locationsLimit: number | 'unlimited';
}

interface Subscription {
  id: string;
  salonId: string;
  salonName: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  plan: PlanType;
  status: SubscriptionStatus;
  startDate: string;
  nextBillingDate: string;
  amount: number;
  billingCycle: string;
  features: string[];
  usage: Usage;
  paymentMethod: PaymentMethod | null;
  billingHistory: BillingHistory[];
}

interface Plan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  limits: {
    bookings: number | 'unlimited';
    staff: number | 'unlimited';
    locations: number | 'unlimited';
  };
  popular: boolean;
}

interface SubscriptionStats {
  total: number;
  active: number;
  trial: number;
  cancelled: number;
  totalRevenue: number;
}

const statusColors: Record<SubscriptionStatus, string> = {
  active: 'bg-green-100 text-green-800',
  trial: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  past_due: 'bg-yellow-100 text-yellow-800',
};

const planColors: Record<PlanType, string> = {
  Basic: 'bg-gray-100 text-gray-800',
  Standard: 'bg-blue-100 text-blue-800',
  Premium: 'bg-purple-100 text-purple-800',
};

const planIcons = {
  Basic: Zap,
  Standard: Star,
  Premium: Crown,
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    total: 0,
    active: 0,
    trial: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubscriptionStatus>('all');
  const [planFilter, setPlanFilter] = useState<'all' | PlanType>('all');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [downgradeDialogOpen, setDowngradeDialogOpen] = useState(false);
  const [editBillingDialogOpen, setEditBillingDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [selectedNewPlan, setSelectedNewPlan] = useState<Plan | null>(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter, searchTerm]);

  const fetchSubscriptions = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('includePlans', 'true');

      const response = await fetch(`/api/subscriptions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch subscriptions');

      const data = await response.json();
      setSubscriptions(data.subscriptions);
      setStats(data.stats);
      if (data.plans) setPlans(data.plans);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subscriptions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.salonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' || subscription.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      setSubscriptions(prev => prev.map(sub => 
        sub.id === subscriptionId ? { ...sub, status: 'cancelled' as SubscriptionStatus } : sub
      ));

      toast({
        title: 'Subscription cancelled',
        description: 'The subscription has been cancelled successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpgradePlan = async () => {
    if (!selectedSubscription || !selectedNewPlan) return;

    try {
      const response = await fetch(`/api/subscriptions/${selectedSubscription.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          plan: selectedNewPlan.name,
          amount: selectedNewPlan.price,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upgrade subscription');
      }

      setSubscriptions(prev => prev.map(sub => 
        sub.id === selectedSubscription.id 
          ? { ...sub, plan: selectedNewPlan.name as PlanType, amount: selectedNewPlan.price }
          : sub
      ));

      toast({
        title: 'Plan upgraded successfully',
        description: `${selectedSubscription.salonName} has been upgraded to ${selectedNewPlan.name} plan.`,
      });

      setUpgradeDialogOpen(false);
      setSelectedSubscription(null);
      setSelectedNewPlan(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upgrade plan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDowngradePlan = async () => {
    if (!selectedSubscription || !selectedNewPlan) return;

    try {
      const response = await fetch(`/api/subscriptions/${selectedSubscription.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          plan: selectedNewPlan.name,
          amount: selectedNewPlan.price,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to downgrade subscription');
      }

      setSubscriptions(prev => prev.map(sub => 
        sub.id === selectedSubscription.id 
          ? { ...sub, plan: selectedNewPlan.name as PlanType, amount: selectedNewPlan.price }
          : sub
      ));

      toast({
        title: 'Plan downgraded successfully',
        description: `${selectedSubscription.salonName} has been downgraded to ${selectedNewPlan.name} plan.`,
      });

      setDowngradeDialogOpen(false);
      setSelectedSubscription(null);
      setSelectedNewPlan(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to downgrade plan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePaymentMethod = async () => {
    if (!selectedSubscription) return;

    try {
      const response = await fetch(`/api/subscriptions/${selectedSubscription.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          paymentMethod: {
            type: 'card',
            last4: newPaymentMethod.cardNumber.slice(-4),
            brand: 'Visa', // In real app, detect from card number
            expiryMonth: parseInt(newPaymentMethod.expiryMonth),
            expiryYear: parseInt(newPaymentMethod.expiryYear),
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment method');
      }

      setSubscriptions(prev => prev.map(sub => 
        sub.id === selectedSubscription.id 
          ? { 
              ...sub, 
              paymentMethod: {
                type: 'card',
                last4: newPaymentMethod.cardNumber.slice(-4),
                brand: 'Visa',
                expiryMonth: parseInt(newPaymentMethod.expiryMonth),
                expiryYear: parseInt(newPaymentMethod.expiryYear),
              }
            }
          : sub
      ));

      toast({
        title: 'Payment method updated',
        description: 'The payment method has been updated successfully.',
      });

      setEditBillingDialogOpen(false);
      setSelectedSubscription(null);
      setNewPaymentMethod({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update payment method. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openCancelDialog = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setCancelDialogOpen(true);
  };

  const openUpgradeDialog = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setUpgradeDialogOpen(true);
  };

  const openDowngradeDialog = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setDowngradeDialogOpen(true);
  };

  const openEditBillingDialog = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setEditBillingDialogOpen(true);
  };

  const confirmCancel = () => {
    if (selectedSubscription) {
      handleCancelSubscription(selectedSubscription.id);
      setCancelDialogOpen(false);
      setSelectedSubscription(null);
    }
  };

  const getAvailableUpgrades = (currentPlan: PlanType) => {
    const planOrder = ['Basic', 'Standard', 'Premium'];
    const currentIndex = planOrder.indexOf(currentPlan);
    return plans.filter(plan => planOrder.indexOf(plan.name) > currentIndex);
  };

  const getAvailableDowngrades = (currentPlan: PlanType) => {
    const planOrder = ['Basic', 'Standard', 'Premium'];
    const currentIndex = planOrder.indexOf(currentPlan);
    return plans.filter(plan => planOrder.indexOf(plan.name) < currentIndex);
  };

  const getUsagePercentage = (current: number, limit: number | 'unlimited') => {
    if (limit === 'unlimited') return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600">Manage salon subscriptions, billing, and plans</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Billing
          </Button>
          <Link href="/dashboard/subscriptions/new">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Subscription
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trial</p>
                <p className="text-2xl font-bold text-blue-600">{stats.trial}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Plans */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Subscription plans available for salon owners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const PlanIcon = planIcons[plan.name as PlanType];
              return (
                <div key={plan.id} className={`relative p-6 rounded-lg border-2 ${
                  plan.popular ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-white'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${
                        plan.name === 'Basic' ? 'from-gray-600 to-gray-700' :
                        plan.name === 'Standard' ? 'from-blue-600 to-blue-700' :
                        'from-purple-600 to-purple-700'
                      }`}>
                        <PlanIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600 mt-2">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      or ${plan.yearlyPrice}/year (save ${((plan.price * 12) - plan.yearlyPrice).toFixed(2)})
                    </p>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Status Filters */}
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                All Status
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                size="sm"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Button>
              <Button
                variant={statusFilter === 'trial' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('trial')}
                size="sm"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Trial
              </Button>
              <Button
                variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('cancelled')}
                size="sm"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Cancelled
              </Button>
              
              {/* Plan Filters */}
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <Button
                variant={planFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setPlanFilter('all')}
                size="sm"
              >
                All Plans
              </Button>
              <Button
                variant={planFilter === 'Basic' ? 'default' : 'outline'}
                onClick={() => setPlanFilter('Basic')}
                size="sm"
              >
                Basic
              </Button>
              <Button
                variant={planFilter === 'Standard' ? 'default' : 'outline'}
                onClick={() => setPlanFilter('Standard')}
                size="sm"
              >
                Standard
              </Button>
              <Button
                variant={planFilter === 'Premium' ? 'default' : 'outline'}
                onClick={() => setPlanFilter('Premium')}
                size="sm"
              >
                Premium
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubscriptions.map((subscription) => {
              const PlanIcon = planIcons[subscription.plan];
              const bookingsPercentage = getUsagePercentage(subscription.usage.bookings, subscription.usage.bookingsLimit);
              const staffPercentage = getUsagePercentage(subscription.usage.staff, subscription.usage.staffLimit);
              
              return (
                <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2`} alt={subscription.salonName} />
                        <AvatarFallback>{subscription.salonName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                        <PlanIcon className="h-3 w-3 text-gray-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{subscription.salonName}</h3>
                      <p className="text-sm text-gray-600">{subscription.ownerName}</p>
                      <p className="text-xs text-gray-500">{subscription.ownerEmail}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Next billing: {format(new Date(subscription.nextBillingDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    {/* Usage Indicators */}
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900">
                        {subscription.usage.bookings}
                        {subscription.usage.bookingsLimit !== 'unlimited' && `/${subscription.usage.bookingsLimit}`}
                      </p>
                      <p className="text-xs text-gray-500">Bookings</p>
                      {subscription.usage.bookingsLimit !== 'unlimited' && (
                        <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                          <div 
                            className={`h-1 rounded-full ${getUsageColor(bookingsPercentage)}`}
                            style={{ width: `${bookingsPercentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900">
                        {subscription.usage.staff}
                        {subscription.usage.staffLimit !== 'unlimited' && `/${subscription.usage.staffLimit}`}
                      </p>
                      <p className="text-xs text-gray-500">Staff</p>
                      {subscription.usage.staffLimit !== 'unlimited' && (
                        <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                          <div 
                            className={`h-1 rounded-full ${getUsageColor(staffPercentage)}`}
                            style={{ width: `${staffPercentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900">${subscription.amount}</p>
                      <p className="text-xs text-gray-500">{subscription.billingCycle}</p>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <Badge className={planColors[subscription.plan]}>
                        {subscription.plan}
                      </Badge>
                      <Badge className={statusColors[subscription.status]}>
                        {subscription.status}
                      </Badge>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/subscriptions/${subscription.id}`} className="flex items-center w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/salons/${subscription.salonId}`} className="flex items-center w-full">
                            <Building2 className="mr-2 h-4 w-4" />
                            View Salon
                          </Link>
                        </DropdownMenuItem>
                        {subscription.status === 'active' && (
                          <>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onSelect={(e) => {
                                e.preventDefault();
                                openUpgradeDialog(subscription);
                              }}
                            >
                              <ArrowUpCircle className="mr-2 h-4 w-4" />
                              Upgrade Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onSelect={(e) => {
                                e.preventDefault();
                                openDowngradeDialog(subscription);
                              }}
                            >
                              <ArrowDownCircle className="mr-2 h-4 w-4" />
                              Downgrade Plan
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onSelect={(e) => {
                            e.preventDefault();
                            openEditBillingDialog(subscription);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Billing
                        </DropdownMenuItem>
                        {subscription.status === 'active' && (
                          <DropdownMenuItem 
                            className="text-red-600 cursor-pointer"
                            onSelect={(e) => {
                              e.preventDefault();
                              openCancelDialog(subscription);
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Subscription
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the subscription for "{selectedSubscription?.salonName}"? 
              This action will immediately revoke access to premium features and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">The salon will lose access to:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Advanced booking features</li>
              <li>Analytics and reporting</li>
              <li>Priority support</li>
              <li>Custom branding options</li>
            </ul>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upgrade Plan Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upgrade Subscription Plan</DialogTitle>
            <DialogDescription>
              Choose a higher tier plan for "{selectedSubscription?.salonName}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Current Plan:</strong> {selectedSubscription?.plan} - ${selectedSubscription?.amount}/month
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getAvailableUpgrades(selectedSubscription?.plan || 'Basic').map((plan) => {
                const PlanIcon = planIcons[plan.name as PlanType];
                const isSelected = selectedNewPlan?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedNewPlan(plan)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected ? 'border-purple-200 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${
                        plan.name === 'Standard' ? 'from-blue-600 to-blue-700' : 'from-purple-600 to-purple-700'
                      }`}>
                        <PlanIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{plan.name}</h3>
                        <p className="text-lg font-semibold text-gray-900">${plan.price}/month</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            {getAvailableUpgrades(selectedSubscription?.plan || 'Basic').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Crown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Already on the highest plan</p>
                <p className="text-sm">This subscription is already on the Premium plan.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpgradePlan}
              disabled={!selectedNewPlan}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Downgrade Plan Dialog */}
      <Dialog open={downgradeDialogOpen} onOpenChange={setDowngradeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Downgrade Subscription Plan</DialogTitle>
            <DialogDescription>
              Choose a lower tier plan for "{selectedSubscription?.salonName}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Current Plan:</strong> {selectedSubscription?.plan} - ${selectedSubscription?.amount}/month
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Downgrading will reduce available features and limits.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getAvailableDowngrades(selectedSubscription?.plan || 'Premium').map((plan) => {
                const PlanIcon = planIcons[plan.name as PlanType];
                const isSelected = selectedNewPlan?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedNewPlan(plan)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected ? 'border-orange-200 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${
                        plan.name === 'Basic' ? 'from-gray-600 to-gray-700' : 'from-blue-600 to-blue-700'
                      }`}>
                        <PlanIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{plan.name}</h3>
                        <p className="text-lg font-semibold text-gray-900">${plan.price}/month</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            {getAvailableDowngrades(selectedSubscription?.plan || 'Basic').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Already on the lowest plan</p>
                <p className="text-sm">This subscription is already on the Basic plan.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDowngradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDowngradePlan}
              disabled={!selectedNewPlan}
              className="bg-orange-600 hover:bg-orange-700 text-black font-semibold"
            >
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Downgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Billing Dialog */}
      <Dialog open={editBillingDialogOpen} onOpenChange={setEditBillingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>
              Update the payment method for "{selectedSubscription?.salonName}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSubscription?.paymentMethod && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-800">
                  <strong>Current:</strong> {selectedSubscription.paymentMethod.brand} ending in {selectedSubscription.paymentMethod.last4}
                </p>
                <p className="text-xs text-gray-600">
                  Expires {selectedSubscription.paymentMethod.expiryMonth}/{selectedSubscription.paymentMethod.expiryYear}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={newPaymentMethod.cardholderName}
                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardholderName: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={newPaymentMethod.cardNumber}
                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth">Month</Label>
                  <Input
                    id="expiryMonth"
                    placeholder="MM"
                    value={newPaymentMethod.expiryMonth}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryMonth: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryYear">Year</Label>
                  <Input
                    id="expiryYear"
                    placeholder="YYYY"
                    value={newPaymentMethod.expiryYear}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryYear: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={newPaymentMethod.cvv}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cvv: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBillingDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePaymentMethod}
              disabled={!newPaymentMethod.cardNumber || !newPaymentMethod.cardholderName}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}