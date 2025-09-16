"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  XCircle,
  Plus,
  Building2,
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Zap,
  Star,
  Crown,
} from "lucide-react";
import { format } from "date-fns";
import {
  fetchSubscriptions,
  cancelSubscription,
  updateSubscription,
  SubscriptionParams,
  fetchSubscriptionPlans,
} from "@/api/subscriptions";
import { apiFetch } from "@/lib/api";
import StripePayment from "@/components/stripe-payment";

type SubscriptionStatus = "active" | "trial" | "cancelled" | "past_due";
type PlanType = "Basic" | "Standard" | "Premium";

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
  bookingsLimit: number | "unlimited";
  staff: number;
  staffLimit: number | "unlimited";
  locations: number;
  locationsLimit: number | "unlimited";
}

interface Subscription {
  id: string;
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
  // Salon information (owner can have multiple salons)
  salonId: string | null;
  salonName: string | null;
  salonCount?: number; // Number of salons under this owner
}

interface Plan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  limits: {
    bookings: number | "unlimited";
    staff: number | "unlimited";
    locations: number | "unlimited";
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
  active: "bg-green-100 text-green-800",
  trial: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  past_due: "bg-yellow-100 text-yellow-800",
};

const planColors: Record<PlanType, string> = {
  Basic: "bg-gray-100 text-gray-800",
  Standard: "bg-blue-100 text-blue-800",
  Premium: "bg-purple-100 text-purple-800",
};

const planIcons: Record<string, any> = {
  Basic: Zap,
  Standard: Star,
  Premium: Crown,
};

const getPlanIcon = (planName: string) => {
  // Normalize plan name for comparison
  const normalizedName = planName.toLowerCase().trim();
  
  // Direct mapping
  if (planIcons[planName]) {
    return planIcons[planName];
  }
  
  // Flexible mapping based on keywords
  if (normalizedName.includes('basic') || normalizedName.includes('starter') || normalizedName.includes('free')) {
    return Zap;
  }
  if (normalizedName.includes('standard') || normalizedName.includes('pro') || normalizedName.includes('business')) {
    return Star;
  }
  if (normalizedName.includes('premium') || normalizedName.includes('enterprise') || normalizedName.includes('unlimited')) {
    return Crown;
  }
  
  // Default fallback based on common plan types
  if (normalizedName.includes('trial')) {
    return AlertTriangle;
  }
  
  // Ultimate fallback
  return Building2; // Generic business icon
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [stats, setStats] = useState<SubscriptionStats>({
    total: 0,
    active: 0,
    trial: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SubscriptionStatus>(
    "all"
  );
  const [planFilter, setPlanFilter] = useState<"all" | PlanType>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [downgradeDialogOpen, setDowngradeDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [selectedNewPlan, setSelectedNewPlan] = useState<Plan | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [actionType, setActionType] = useState<'upgrade' | 'downgrade' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setPlansLoading(true);
      setPlansError(null);
      const data = await fetchSubscriptionPlans();
      setPlans(data);
    } catch (error: any) {
      setPlansError("Failed to load plans");
      toast({
        title: "Error",
        description: "Failed to load subscription plans. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
    // eslint-disable-next-line
  }, [statusFilter, planFilter, searchTerm, page, limit]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const params: SubscriptionParams = { page, limit };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (planFilter !== "all") {
        (params as any).plan = planFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      params.includePlans = true;
      const data = await fetchSubscriptions(params);
      setSubscriptions(data.subscriptions);
      setStats(data.stats);
      setTotalPages(data.totalPages || 1);
      setTotal(
        data.total ||
          (data.subscriptions ? data.subscriptions.length : data.length || 0)
      );
    } catch (error) {
      console.error("Error loading subscriptions:", error);
      toast({
        title: "Error",
        description: "Failed to load subscriptions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      await cancelSubscription(subscriptionId);

      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === subscriptionId
            ? { ...sub, status: "cancelled" as SubscriptionStatus }
            : sub
        )
      );

      toast({
        title: "Subscription cancelled",
        description: "The subscription has been cancelled successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createPaymentIntent = async (plan: Plan, action: 'upgrade' | 'downgrade') => {
    try {
      if (!plan || !plan.id) {
        throw new Error('Plan or Plan ID is missing');
      }
      
      if (!selectedSubscription || !selectedSubscription.ownerId) {
        throw new Error('Subscription or Owner ID is missing');
      }
      
      const endpoint = action === 'upgrade' 
        ? '/subscription-payments/upgrade/create-intent'
        : '/subscription-payments/downgrade/create-intent';
      
      const requestData = {
        planId: plan.id,
        billingCycle: selectedSubscription?.billingCycle || 'monthly',
        userId: selectedSubscription?.ownerId
      };
      
      console.log(`Creating ${action} payment intent with data:`, requestData);
      
      const response = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      if (response.success && response.data) {
        setPaymentIntent(response.data);
        setActionType(action); // Set the action type for the payment
        setShowPaymentForm(true);
      setUpgradeDialogOpen(false);
        setDowngradeDialogOpen(false);
        
        toast({
          title: "Payment Intent Created",
          description: `Please complete the payment to ${action} your subscription.`,
        });
      } else {
        throw new Error(response.message || 'Failed to create payment intent');
      }
    } catch (error: any) {
      console.error(`Error creating ${action} payment intent:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to create ${action} payment intent. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleUpgradePlan = async () => {
    if (!selectedSubscription || !selectedNewPlan) return;
    await createPaymentIntent(selectedNewPlan, 'upgrade');
  };

  const handleDowngradePlan = async () => {
    if (!selectedSubscription || !selectedNewPlan) return;
    await createPaymentIntent(selectedNewPlan, 'downgrade');
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    console.log('Payment successful:', paymentIntent);
    
    // Automatically trigger webhook processing for upgrade/downgrade payments
    if (actionType === 'upgrade' || actionType === 'downgrade') {
      try {
        console.log('Auto-triggering webhook processing for upgrade/downgrade...');
        
        // Extract payment intent ID from the payment intent object
        const paymentIntentId = paymentIntent?.id || paymentIntent?.clientSecret?.split('_secret_')[0];
        
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
      // For new subscriptions, show regular success message
      toast({
        title: "Payment Successful",
        description: `Subscription ${actionType} completed successfully!`,
      });
    }
    
    setShowPaymentForm(false);
    setPaymentIntent(null);
    setActionType(null);
    
    // Refresh the subscriptions list
    loadSubscriptions();
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
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
  };

  const checkPaymentStatus = async (paymentId: string) => {
    try {
      console.log('Checking payment status for:', paymentId);
      
      const response = await apiFetch('/subscription-payments/test-activate', {
        method: 'POST',
        body: JSON.stringify({ paymentIntentId: paymentId })
      });

      if (response.success) {
        console.log('Payment status check successful:', response);
        // Refresh the subscriptions list
        loadSubscriptions();
        // Close the payment form
        setShowPaymentForm(false);
        setPaymentIntent(null);
        setActionType(null);
        
        // Show success message
        alert('Subscription activated successfully!');
      } else {
        console.error('Payment status check failed:', response);
        alert('Failed to activate subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      alert('Error checking payment status. Please try again.');
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


  const confirmCancel = () => {
    if (selectedSubscription) {
      handleCancelSubscription(selectedSubscription.id);
      setCancelDialogOpen(false);
      setSelectedSubscription(null);
    }
  };

  const getAvailableUpgrades = (currentPlan: PlanType) => {
    const planOrder = ["Basic", "Standard", "Premium"];
    const currentIndex = planOrder.indexOf(currentPlan);
    return plans.filter(
      (plan) => planOrder.indexOf(plan.name as PlanType) > currentIndex
    );
  };

  const getAvailableDowngrades = (currentPlan: PlanType) => {
    const planOrder = ["Basic", "Standard", "Premium"];
    const currentIndex = planOrder.indexOf(currentPlan);
    return plans.filter(
      (plan) => planOrder.indexOf(plan.name as PlanType) < currentIndex
    );
  };

  const getUsagePercentage = (current: number, limit: number | "unlimited") => {
    if (limit === "unlimited") return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
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
          <h1 className="text-2xl font-bold text-gray-900">
            Subscription Management
          </h1>
          <p className="text-gray-600">
            Manage salon owner subscriptions, billing, and plans
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/subscriptions/new">
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
                <p className="text-sm font-medium text-gray-600">
                  Total Subscriptions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
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
                <p className="text-2xl font-bold text-blue-600">
                  {stats.trial}
                </p>
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
                <p className="text-2xl font-bold text-red-600">
                  {stats.cancelled}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Monthly Revenue
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
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
            Subscription plans available for salon owners (covers all their salons)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plansLoading ? (
            <div className="min-h-[200px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
          ) : plansError ? (
            <div className="min-h-[200px] flex items-center justify-center text-red-500">
              {plansError}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const PlanIcon = getPlanIcon(plan.name);
                return (
                  <div
                    key={plan.id}
                    className={`relative p-6 rounded-lg border-2 ${
                      plan.popular
                        ? "border-purple-200 bg-purple-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-purple-600 text-white">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <div
                          className={`p-3 rounded-lg bg-gradient-to-r ${
                            plan.name === "Basic"
                              ? "from-gray-600 to-gray-700"
                              : plan.name === "Standard"
                              ? "from-blue-600 to-blue-700"
                              : "from-purple-600 to-purple-700"
                          }`}
                        >
                          <PlanIcon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 mt-2">{plan.description}</p>
                      <div className="mt-4">
                        <span className="text-3xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        or ${plan.yearlyPrice}/year (save $
                        {(plan.price * 12 - plan.yearlyPrice).toFixed(2)})
                      </p>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
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
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                All Status
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                onClick={() => setStatusFilter("active")}
                size="sm"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Button>
              <Button
                variant={statusFilter === "trial" ? "default" : "outline"}
                onClick={() => setStatusFilter("trial")}
                size="sm"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Trial
              </Button>
              <Button
                variant={statusFilter === "cancelled" ? "default" : "outline"}
                onClick={() => setStatusFilter("cancelled")}
                size="sm"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Cancelled
              </Button>

              {/* Plan Filters */}
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <Button
                variant={planFilter === "all" ? "default" : "outline"}
                onClick={() => setPlanFilter("all")}
                size="sm"
              >
                All Plans
              </Button>
              <Button
                variant={planFilter === "Basic" ? "default" : "outline"}
                onClick={() => setPlanFilter("Basic")}
                size="sm"
              >
                Basic
              </Button>
              <Button
                variant={planFilter === "Standard" ? "default" : "outline"}
                onClick={() => setPlanFilter("Standard")}
                size="sm"
              >
                Standard
              </Button>
              <Button
                variant={planFilter === "Premium" ? "default" : "outline"}
                onClick={() => setPlanFilter("Premium")}
                size="sm"
              >
                Premium
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptions.map((subscription) => {
              const PlanIcon = getPlanIcon(subscription.plan);
              const usage = subscription.usage || {};
              const bookings = usage.bookings ?? 0;
              const bookingsLimit = usage.bookingsLimit ?? "unlimited";
              const staff = usage.staff ?? 0;
              const staffLimit = usage.staffLimit ?? "unlimited";
              const bookingsPercentage = getUsagePercentage(
                bookings,
                bookingsLimit
              );
              const staffPercentage = getUsagePercentage(staff, staffLimit);

              return (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src="/default-owner.png"
                          alt={subscription.ownerName}
                        />
                        <AvatarFallback>
                          {subscription.ownerName
                            ? subscription.ownerName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                        <PlanIcon className="h-3 w-3 text-gray-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {subscription.ownerName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {subscription.ownerEmail}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {subscription.salonCount ? `${subscription.salonCount} salon${subscription.salonCount > 1 ? 's' : ''}` : 'Salon owner'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Next billing:{" "}
                          {(() => {
                            if (!subscription.nextBillingDate) return "N/A";
                            const date = new Date(subscription.nextBillingDate);
                            return isNaN(date.getTime())
                              ? "N/A"
                              : format(date, "MMM dd, yyyy");
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Usage Indicators */}
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900">
                        {bookings}
                        {bookingsLimit !== "unlimited" && `/${bookingsLimit}`}
                      </p>
                      <p className="text-xs text-gray-500">Bookings</p>
                      {bookingsLimit !== "unlimited" && (
                        <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                          <div
                            className={`h-1 rounded-full ${getUsageColor(
                              bookingsPercentage
                            )}`}
                            style={{ width: `${bookingsPercentage}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900">
                        {staff}
                        {staffLimit !== "unlimited" && `/${staffLimit}`}
                      </p>
                      <p className="text-xs text-gray-500">Staff</p>
                      {staffLimit !== "unlimited" && (
                        <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                          <div
                            className={`h-1 rounded-full ${getUsageColor(
                              staffPercentage
                            )}`}
                            style={{ width: `${staffPercentage}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900">
                        ${subscription.amount}
                      </p>
                      <p className="text-xs text-gray-500">
                        {subscription.billingCycle}
                      </p>
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
                          <Link
                            to={`/dashboard/subscriptions/${subscription.id}`}
                            className="flex items-center w-full"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/dashboard/subscriptions/${subscription.id}/manage`}
                            className="flex items-center w-full"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Manage Subscription
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/dashboard/users/${subscription.ownerId}`}
                            className="flex items-center w-full"
                          >
                            <Users className="mr-2 h-4 w-4" />
                            View Owner Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/dashboard/salons?owner=${subscription.ownerId}`}
                            className="flex items-center w-full"
                          >
                            <Building2 className="mr-2 h-4 w-4" />
                            View Owner's Salons
                          </Link>
                        </DropdownMenuItem>
                        {subscription.status === "active" && (
                          <>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => openUpgradeDialog(subscription)}
                            >
                              <ArrowUpCircle className="mr-2 h-4 w-4" />
                              Upgrade Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => openDowngradeDialog(subscription)}
                            >
                              <ArrowDownCircle className="mr-2 h-4 w-4" />
                              Downgrade Plan
                            </DropdownMenuItem>
                          </>
                        )}
                        {subscription.status === "active" && (
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer"
                            onClick={() => openCancelDialog(subscription)}
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

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          variant="outline"
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages} ({total} subscriptions)
        </span>
        <Button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          variant="outline"
        >
          Next
        </Button>
        <select
          className="ml-4 border rounded px-2 py-1"
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className="ml-2 text-sm text-gray-500">per page</span>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the subscription for "
              {selectedSubscription?.ownerName}"? This action will immediately
              revoke access to premium features for all their salons and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              The owner and all their salons will lose access to:
            </p>
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
              Choose a higher tier plan for "{selectedSubscription?.ownerName}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Current Plan:</strong> {selectedSubscription?.plan} - $
                {selectedSubscription?.amount}/month
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedSubscription &&
                getAvailableUpgrades(selectedSubscription?.plan).map((plan) => {
                  const PlanIcon = getPlanIcon(plan.name);
                  const isSelected = selectedNewPlan?.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedNewPlan(plan)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-purple-200 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-r ${
                            plan.name === "Standard"
                              ? "from-blue-600 to-blue-700"
                              : "from-purple-600 to-purple-700"
                          }`}
                                                    >
                              <PlanIcon className="h-5 w-5 text-white" />
                            </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {plan.name}
                          </h3>
                          <p className="text-lg font-semibold text-gray-900">
                            ${plan.price}/month
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {plan.description}
                      </p>
                      <ul className="space-y-1">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-gray-700">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
            </div>
            {selectedSubscription &&
              getAvailableUpgrades(selectedSubscription?.plan).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Crown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Already on the highest plan</p>
                  <p className="text-sm">
                    This subscription is already on the Premium plan.
                  </p>
                </div>
              )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpgradeDialogOpen(false)}
            >
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
              Choose a lower tier plan for "{selectedSubscription?.ownerName}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Current Plan:</strong> {selectedSubscription?.plan} - $
                {selectedSubscription?.amount}/month
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Downgrading will reduce available features and limits.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedSubscription &&
                getAvailableDowngrades(selectedSubscription?.plan).map(
                  (plan) => {
                    const PlanIcon = getPlanIcon(plan.name);
                    const isSelected = selectedNewPlan?.id === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedNewPlan(plan)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-orange-200 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-r ${
                              plan.name === "Basic"
                                ? "from-gray-600 to-gray-700"
                                : "from-blue-600 to-blue-700"
                            }`}
                          >
                            <PlanIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {plan.name}
                            </h3>
                            <p className="text-lg font-semibold text-gray-900">
                              ${plan.price}/month
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {plan.description}
                        </p>
                        <ul className="space-y-1">
                          {plan.features.slice(0, 4).map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-xs text-gray-700">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                )}
            </div>
            {selectedSubscription &&
              getAvailableDowngrades(selectedSubscription?.plan).length ===
                0 && (
                <div className="text-center py-8 text-gray-500">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Already on the lowest plan</p>
                  <p className="text-sm">
                    This subscription is already on the Basic plan.
                  </p>
                </div>
              )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDowngradeDialogOpen(false)}
            >
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


      {/* Payment Form Dialog */}
      {showPaymentForm && paymentIntent && selectedNewPlan && selectedSubscription && (
        <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
          <DialogContent className="max-w-2xl">
          <DialogHeader>
              <DialogTitle>
                Complete {actionType === 'upgrade' ? 'Upgrade' : 'Downgrade'} Payment
              </DialogTitle>
            <DialogDescription>
                Complete your payment to {actionType} {selectedSubscription.ownerName}'s subscription to {selectedNewPlan.name} plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-blue-900">{selectedNewPlan.name} Plan</h4>
                    <p className="text-sm text-blue-700">{selectedNewPlan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-900">
                      ${selectedSubscription.billingCycle === 'yearly' ? selectedNewPlan.yearlyPrice : selectedNewPlan.price}
                    </p>
                    <p className="text-sm text-blue-700">
                      per {selectedSubscription.billingCycle === 'yearly' ? 'year' : 'month'}
                </p>
              </div>
              </div>
              </div>

              <StripePayment
                clientSecret={paymentIntent.clientSecret}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
                amount={selectedSubscription.billingCycle === 'yearly' ? selectedNewPlan.yearlyPrice.toString() : selectedNewPlan.price.toString()}
                currency="USD"
                planName={selectedNewPlan.name}
                ownerName={selectedSubscription.ownerName}
              />
              
              {/* Manual Activation Button */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-800">Webhook Not Working?</h4>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  If the payment completed but the subscription wasn't updated automatically, 
                  click the button below to manually activate the subscription.
                </p>
            <Button
                  onClick={() => {
                    // Use the payment intent ID from the client secret
                    const paymentIntentId = paymentIntent.clientSecret?.split('_secret_')[0];
                    if (paymentIntentId) {
                      checkPaymentStatus(paymentIntentId);
                    } else {
                      alert('Payment intent ID not found. Please try again.');
                    }
                  }}
              variant="outline"
                  size="sm"
                  className="w-full border-yellow-300 text-yellow-800 hover:bg-yellow-100"
            >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Payment Status & Activate
            </Button>
              </div>
            </div>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
}
