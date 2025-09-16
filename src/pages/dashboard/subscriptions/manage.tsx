import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Crown,
  Star,
  Zap,
  Building2,
  AlertTriangle,
  CreditCard,
  Calendar,
  Users,
  MapPin,
  TrendingUp,
  TrendingDown,
  X,
  CheckCircle,
  Clock,
  DollarSign,
  Info,
} from 'lucide-react';
import { fetchSubscriptionById, fetchSubscriptionPlans, updateSubscription, cancelSubscription } from '@/api/subscriptions';
import { apiFetch } from '@/lib/api';
import StripePayment from '@/components/stripe-payment';

// Plan icons mapping
const getPlanIcon = (planName: string) => {
  const normalizedName = planName.toLowerCase();
  
  if (normalizedName.includes('basic') || normalizedName.includes('starter') || normalizedName.includes('free')) {
    return Zap;
  }
  if (normalizedName.includes('standard') || normalizedName.includes('pro') || normalizedName.includes('business')) {
    return Star;
  }
  if (normalizedName.includes('premium') || normalizedName.includes('enterprise') || normalizedName.includes('unlimited')) {
    return Crown;
  }
  
  if (normalizedName.includes('trial')) {
    return AlertTriangle;
  }
  
  return Building2;
};

const planColors: Record<string, string> = {
  Basic: "from-gray-600 to-gray-700",
  Standard: "from-blue-600 to-blue-700",
  Premium: "from-purple-600 to-purple-700",
  Enterprise: "from-indigo-600 to-indigo-700",
};

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  yearlyPrice: number;
  limits: {
    max_salons: number | "unlimited";
    max_bookings: number | "unlimited";
    max_staff: number | "unlimited";
  };
  features: string[];
}

interface Subscription {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  plan: string;
  status: 'active' | 'trial' | 'cancelled' | 'past_due';
  startDate: string;
  nextBillingDate: string;
  amount: string;
  billingCycle: 'monthly' | 'yearly';
  usage: {
    salons: number;
    salonsLimit: number | "unlimited";
    bookings: number;
    bookingsLimit: number | "unlimited";
    staff: number;
    staffLimit: number | "unlimited";
  };
  features: string[];
}

export default function ManageSubscriptionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [downgradeDialogOpen, setDowngradeDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedNewPlan, setSelectedNewPlan] = useState<Plan | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [actionType, setActionType] = useState<'upgrade' | 'downgrade' | null>(null);

  useEffect(() => {
    if (id) {
      loadSubscription();
      loadPlans();
    }
  }, [id]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await fetchSubscriptionById(id!);
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const data = await fetchSubscriptionPlans();
      console.log('Raw plans data from API:', data);
      console.log('Data type:', typeof data);
      console.log('Data length:', data?.length);
      
      if (!data || !Array.isArray(data)) {
        console.error('Invalid plans data received:', data);
        return;
      }
      
      console.log('First plan structure:', data[0]);
      console.log('First plan ID:', data[0]?.id);
      console.log('First plan ID type:', typeof data[0]?.id);
      console.log('All plan IDs:', data.map(p => ({ id: p.id, name: p.name })));
      
      const mappedPlans = data.map((plan: any) => ({
        ...plan,
        yearlyPrice: Number(plan.yearly_price),
        price: Number(plan.price),
      }));
      console.log('Mapped plans data:', mappedPlans);
      console.log('First mapped plan:', mappedPlans[0]);
      console.log('Mapped plan IDs:', mappedPlans.map(p => ({ id: p.id, name: p.name })));
      setPlans(mappedPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const getCurrentPlan = () => {
    return plans.find(plan => plan.name === subscription?.plan);
  };

  const getAvailablePlans = () => {
    if (!subscription) return [];
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return plans;
    
    return plans.filter(plan => plan.id !== currentPlan.id);
  };

  const getUpgradePlans = () => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return [];
    
    return plans.filter(plan => plan.price > currentPlan.price);
  };

  const getDowngradePlans = () => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return [];
    
    return plans.filter(plan => plan.price < currentPlan.price);
  };

  const calculatePriceDifference = (newPlan: Plan) => {
    if (!subscription) return 0;
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return 0;
    
    const currentPrice = subscription.billingCycle === 'yearly' ? currentPlan.yearlyPrice : currentPlan.price;
    const newPrice = subscription.billingCycle === 'yearly' ? newPlan.yearlyPrice : newPlan.price;
    
    return newPrice - currentPrice;
  };

  const handleUpgradeClick = (plan: Plan) => {
    console.log('handleUpgradeClick called with plan:', plan);
    console.log('Plan ID:', plan.id);
    console.log('Plan ID type:', typeof plan.id);
    setSelectedNewPlan(plan);
    setActionType('upgrade');
    setUpgradeDialogOpen(true);
  };

  const handleDowngradeClick = (plan: Plan) => {
    setSelectedNewPlan(plan);
    setActionType('downgrade');
    setDowngradeDialogOpen(true);
  };

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const createPaymentIntent = async (plan: Plan, action: 'upgrade' | 'downgrade') => {
    try {
      if (!plan || !plan.id) {
        throw new Error('Plan or Plan ID is missing');
      }
      
      if (!subscription || !subscription.ownerId) {
        throw new Error('Subscription or Owner ID is missing');
      }
      
      const endpoint = action === 'upgrade' 
        ? '/subscription-payments/upgrade/create-intent'
        : '/subscription-payments/downgrade/create-intent';
      
      const requestData = {
        planId: plan.id,
        billingCycle: subscription?.billingCycle || 'monthly',
        userId: subscription?.ownerId
      };
      
      console.log('Request data before sending:', requestData);
      console.log('Plan ID:', plan.id);
      
      console.log(`Creating ${action} payment intent with data:`, requestData);
      console.log('Plan object:', plan);
      console.log('Plan ID:', plan.id);
      console.log('Plan ID type:', typeof plan.id);
      console.log('Plan ID length:', plan.id?.length);
      console.log('Subscription object:', subscription);
      
      const response = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      if (response.success && response.data) {
        setPaymentIntent(response.data);
        setShowPaymentForm(true);
        setUpgradeDialogOpen(false);
        setDowngradeDialogOpen(false);
        
        toast({
          title: "Payment Form Ready",
          description: `Please complete payment for ${action} to ${plan.name} plan.`,
        });
      }
    } catch (error) {
      console.error(`Error creating ${action} payment intent:`, error);
      toast({
        title: "Error",
        description: `Failed to create ${action} payment. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    console.log('Payment successful:', paymentIntent);
    
    // Automatically trigger webhook processing for upgrade/downgrade payments
    if (actionType === 'upgrade' || actionType === 'downgrade') {
      try {
        console.log('Auto-triggering webhook processing for upgrade/downgrade...');
        
        // Extract payment intent ID from client secret
        const paymentIntentId = paymentIntent?.clientSecret?.split('_secret_')[0] || paymentIntent?.id;
        
        if (paymentIntentId) {
          const response = await apiFetch('/subscription-payments/test-activate', {
            method: 'POST',
            body: JSON.stringify({ paymentIntentId: paymentIntentId })
          });

          if (response.success) {
            console.log('Auto-activation successful:', response);
            toast({
              title: "Payment Successful",
              description: `Subscription ${actionType} completed and activated successfully!`,
            });
          } else {
            console.error('Auto-activation failed:', response);
            toast({
              title: "Payment Successful",
              description: `Payment completed but activation failed. Please use the manual activation button.`,
              variant: "destructive",
            });
          }
        } else {
          console.error('Payment intent ID not found');
          toast({
            title: "Payment Successful",
            description: `Payment completed but activation failed. Please use the manual activation button.`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error in auto-activation:', error);
        toast({
          title: "Payment Successful",
          description: `Payment completed but activation failed. Please use the manual activation button.`,
          variant: "destructive",
        });
      }
    } else {
      // For other actions, show regular success message
      toast({
        title: "Payment Successful",
        description: `Subscription ${actionType} completed successfully!`,
      });
    }
    
    setShowPaymentForm(false);
    setPaymentIntent(null);
    setActionType(null);
    
    // Reload subscription data
    loadSubscription();
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    setShowPaymentForm(false);
    setPaymentIntent(null);
    setActionType(null);
    
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setPaymentIntent(null);
    setActionType(null);
    
    toast({
      title: "Payment Cancelled",
      description: "Payment was cancelled. You can try again later.",
    });
  };

  const confirmCancel = async () => {
    if (!subscription) return;
    
    try {
      await cancelSubscription(subscription.id);
      setSubscription({ ...subscription, status: 'cancelled' });
      setCancelDialogOpen(false);
      
      toast({
        title: "Subscription Cancelled",
        description: "The subscription has been cancelled successfully.",
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUsagePercentage = (used: number, limit: number | "unlimited") => {
    if (limit === "unlimited") return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const formatLimit = (limit: number | "unlimited") => {
    return limit === "unlimited" ? "Unlimited" : limit.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Subscription Not Found</h1>
          <p className="text-gray-600 mb-6">The subscription you're looking for doesn't exist.</p>
          <Link to="/dashboard/subscriptions">
            <Button>Back to Subscriptions</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();
  const upgradePlans = getUpgradePlans();
  const downgradePlans = getDowngradePlans();

  // Show payment form if payment intent is created
  if (showPaymentForm && paymentIntent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handlePaymentCancel}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Complete Payment</h1>
            <p className="text-gray-600">Complete your {actionType} payment to activate the new plan</p>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <StripePayment
            clientSecret={paymentIntent.clientSecret}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
            amount={paymentIntent.amount}
            currency={paymentIntent.currency}
            planName={paymentIntent.plan?.name || selectedNewPlan?.name || ''}
            ownerName={subscription.ownerName}
          />
        </div>
      </div>
    );
  }

  // Safety check for subscription data
  if (!subscription) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/subscriptions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Manage Subscription</h1>
            <p className="text-gray-600">Loading subscription data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading subscription information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/subscriptions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Manage Subscription</h1>
          <p className="text-gray-600">Manage {subscription.ownerName || 'Unknown'}'s subscription</p>
        </div>
      </div>

      {/* Current Subscription */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" alt={subscription.ownerName} />
                <AvatarFallback>
                  {subscription.ownerName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{subscription.ownerName}</CardTitle>
                <CardDescription>{subscription.ownerEmail}</CardDescription>
              </div>
            </div>
            <Badge 
              variant={subscription.status === 'active' ? 'default' : 'secondary'}
              className={subscription.status === 'active' ? 'bg-green-100 text-green-800' : ''}
            >
              {subscription.status ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) : 'Unknown'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Current Plan</h3>
              {currentPlan && (
                <div className={`p-4 rounded-lg bg-gradient-to-r ${planColors[currentPlan.name] || 'from-gray-600 to-gray-700'} text-white`}>
                  <div className="flex items-center gap-3 mb-2">
                    {React.createElement(getPlanIcon(currentPlan.name), { className: "h-6 w-6" })}
                    <h4 className="text-xl font-bold">{currentPlan.name}</h4>
                  </div>
                  <p className="text-sm opacity-90 mb-3">{currentPlan.description}</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-2xl font-bold">
                      ${subscription.billingCycle === 'yearly' ? currentPlan.yearlyPrice : currentPlan.price}
                    </span>
                    <span className="text-sm opacity-90">
                      /{subscription.billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Billing Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Started: {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Next billing: {subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Cycle: {subscription.billingCycle ? subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1) : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Usage Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Salons</span>
                </div>
                <div className="text-2xl font-bold">{subscription.usage?.salons || 0}</div>
                <div className="text-xs text-gray-500">of {formatLimit(subscription.usage?.salonsLimit || 0)}</div>
                <Progress 
                  value={getUsagePercentage(subscription.usage?.salons || 0, subscription.usage?.salonsLimit || 0)} 
                  className="mt-2"
                />
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Staff</span>
                </div>
                <div className="text-2xl font-bold">{subscription.usage?.staff || 0}</div>
                <div className="text-xs text-gray-500">of {formatLimit(subscription.usage?.staffLimit || 0)}</div>
                <Progress 
                  value={getUsagePercentage(subscription.usage?.staff || 0, subscription.usage?.staffLimit || 0)} 
                  className="mt-2"
                />
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Bookings</span>
                </div>
                <div className="text-2xl font-bold">{subscription.usage?.bookings || 0}</div>
                <div className="text-xs text-gray-500">of {formatLimit(subscription.usage?.bookingsLimit || 0)}</div>
                <Progress 
                  value={getUsagePercentage(subscription.usage?.bookings || 0, subscription.usage?.bookingsLimit || 0)} 
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upgrade Options */}
        {upgradePlans.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Upgrade Options
              </CardTitle>
              <CardDescription>
                Upgrade to a higher plan for more features and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upgradePlans.map((plan) => {
                const priceDiff = calculatePriceDifference(plan);
                const PlanIcon = getPlanIcon(plan.name);
                
                return (
                  <div key={plan.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <PlanIcon className="h-5 w-5 text-gray-600" />
                        <div>
                          <h4 className="font-semibold">{plan.name}</h4>
                          <p className="text-sm text-gray-600">{plan.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          ${subscription.billingCycle === 'yearly' ? plan.yearlyPrice : plan.price}
                          <span className="text-sm text-gray-500">
                            /{subscription.billingCycle === 'yearly' ? 'year' : 'month'}
                          </span>
                        </div>
                        {priceDiff > 0 && (
                          <div className="text-sm text-green-600">
                            +${priceDiff.toFixed(2)} more
                          </div>
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleUpgradeClick(plan)}
                      className="w-full"
                      size="sm"
                    >
                      Upgrade to {plan.name}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Downgrade Options */}
        {downgradePlans.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-500" />
                Downgrade Options
              </CardTitle>
              <CardDescription>
                Downgrade to a lower plan to reduce costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {downgradePlans.map((plan) => {
                const priceDiff = calculatePriceDifference(plan);
                const PlanIcon = getPlanIcon(plan.name);
                
                return (
                  <div key={plan.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <PlanIcon className="h-5 w-5 text-gray-600" />
                        <div>
                          <h4 className="font-semibold">{plan.name}</h4>
                          <p className="text-sm text-gray-600">{plan.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          ${subscription.billingCycle === 'yearly' ? plan.yearlyPrice : plan.price}
                          <span className="text-sm text-gray-500">
                            /{subscription.billingCycle === 'yearly' ? 'year' : 'month'}
                          </span>
                        </div>
                        {priceDiff < 0 && (
                          <div className="text-sm text-green-600">
                            ${Math.abs(priceDiff).toFixed(2)} less
                          </div>
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleDowngradeClick(plan)}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      Downgrade to {plan.name}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cancel Subscription */}
      <Card className="border-0 shadow-sm border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <X className="h-5 w-5" />
            Cancel Subscription
          </CardTitle>
          <CardDescription>
            Cancel this subscription. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Cancelling will immediately stop all subscription benefits. The owner will lose access to premium features.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={handleCancelClick}
            variant="destructive"
            className="mt-4"
          >
            Cancel Subscription
          </Button>
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Subscription</DialogTitle>
            <DialogDescription>
              Upgrade {subscription.ownerName}'s subscription to {selectedNewPlan?.name} plan.
            </DialogDescription>
          </DialogHeader>
          {selectedNewPlan && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Upgrade Details</h4>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>From:</span>
                    <span>{currentPlan?.name} - ${subscription.billingCycle === 'yearly' ? currentPlan?.yearlyPrice : currentPlan?.price}/{subscription.billingCycle === 'yearly' ? 'year' : 'month'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>To:</span>
                    <span>{selectedNewPlan.name} - ${subscription.billingCycle === 'yearly' ? selectedNewPlan.yearlyPrice : selectedNewPlan.price}/{subscription.billingCycle === 'yearly' ? 'year' : 'month'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Price difference:</span>
                    <span>+${calculatePriceDifference(selectedNewPlan).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                console.log('Upgrade proceed button clicked');
                console.log('selectedNewPlan:', selectedNewPlan);
                console.log('selectedNewPlan.id:', selectedNewPlan?.id);
                if (selectedNewPlan) {
                  createPaymentIntent(selectedNewPlan, 'upgrade');
                } else {
                  console.error('No plan selected for upgrade');
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Proceed with Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Downgrade Dialog */}
      <Dialog open={downgradeDialogOpen} onOpenChange={setDowngradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Downgrade Subscription</DialogTitle>
            <DialogDescription>
              Downgrade {subscription.ownerName}'s subscription to {selectedNewPlan?.name} plan.
            </DialogDescription>
          </DialogHeader>
          {selectedNewPlan && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">Downgrade Details</h4>
                <div className="space-y-2 text-sm text-orange-700">
                  <div className="flex justify-between">
                    <span>From:</span>
                    <span>{currentPlan?.name} - ${subscription.billingCycle === 'yearly' ? currentPlan?.yearlyPrice : currentPlan?.price}/{subscription.billingCycle === 'yearly' ? 'year' : 'month'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>To:</span>
                    <span>{selectedNewPlan.name} - ${subscription.billingCycle === 'yearly' ? selectedNewPlan.yearlyPrice : selectedNewPlan.price}/{subscription.billingCycle === 'yearly' ? 'year' : 'month'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Savings:</span>
                    <span>${Math.abs(calculatePriceDifference(selectedNewPlan)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Alert className="border-orange-200 bg-orange-50">
                <Info className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Downgrading may reduce available features and limits. Please review the new plan details carefully.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDowngradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedNewPlan && createPaymentIntent(selectedNewPlan, 'downgrade')}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              Proceed with Downgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel {subscription.ownerName}'s subscription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> Cancelling this subscription will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Immediately revoke access to premium features</li>
                <li>Stop all future billing</li>
                <li>Remove subscription benefits</li>
                <li>This action cannot be undone</li>
              </ul>
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Yes, Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
