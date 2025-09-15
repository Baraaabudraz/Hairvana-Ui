import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Search,
  Calendar,
  CheckCircle,
  Crown,
  Star,
  Zap,
  Building2,
  Users,
  BarChart3,
  Plus,
  Save,
  User,
  Mail,
  Phone,
  AlertTriangle,
} from "lucide-react";
import { fetchUsersByRole } from "@/api/users";
import {
  createSubscription,
  fetchSubscriptionPlans,
} from "@/api/subscriptions";
import { apiFetch } from "@/lib/api";
import StripePayment from "@/components/stripe-payment";

const subscriptionSchema = z.object({
  owner_id: z.string().min(1, "Please select an owner"),
  plan_id: z.string().min(1, "Please select a plan"),
  billing_cycle: z.enum(["monthly", "yearly"]),
  start_date: z.string().min(1, "Start date is required"),
  next_billing_date: z.string().optional(),
  amount: z.number().min(0, "Amount must be positive"),
  status: z
    .enum(["active", "trial", "cancelled", "past_due"])
    .default("active"),
  trial_days: z.number().min(0).max(30).optional(),
  auto_renew: z.boolean().default(true),
});

type SubscriptionForm = z.infer<typeof subscriptionSchema>;

interface Plan {
  id: string;
  name: "Basic" | "Standard" | "Premium";
  price: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  limits: {
    max_bookings: number | "unlimited";
    max_staff: number | "unlimited";
    max_salons: number | "unlimited";
  };
  popular: boolean;
}

interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  avatar: string;
  salonCount?: number;
}

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

const planColors: Record<string, string> = {
  Basic: "from-gray-600 to-gray-700",
  Standard: "from-blue-600 to-blue-700",
  Premium: "from-purple-600 to-purple-700",
};

export default function CreateSubscriptionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [showOwnerSearch, setShowOwnerSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SubscriptionForm>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      billing_cycle: "monthly",
      start_date: new Date().toISOString().split("T")[0],
      auto_renew: true,
      trial_days: 14,
      owner_id: "",
      plan_id: "",
      amount: 0,
      status: "active",
    },
  });

  useEffect(() => {
    const loadOwners = async () => {
      try {
        setLoading(true);
        const response = await fetchUsersByRole("salon owner");
        console.log("Loaded owners:", response);
        if (response && response.users) {
          setOwners(response.users);
          setFilteredOwners(response.users);
        } else {
          setOwners([]);
          setFilteredOwners([]);
        }
      } catch (error) {
        console.error("Error loading owners:", error);
        setOwners([]);
        setFilteredOwners([]);
        toast({
          title: "Error",
          description: "Failed to load salon owners. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadOwners();
  }, [toast]);

  useEffect(() => {
    const filtered = owners.filter(
      (owner) =>
        owner.name.toLowerCase().includes(ownerSearch.toLowerCase()) ||
        owner.email.toLowerCase().includes(ownerSearch.toLowerCase()) ||
        (owner.phone && owner.phone.toLowerCase().includes(ownerSearch.toLowerCase()))
    );
    setFilteredOwners(filtered);
  }, [ownerSearch, owners]);

  const handleOwnerSelect = (owner: Owner) => {
    setSelectedOwner(owner);
    setValue("owner_id", owner.id);
    setShowOwnerSearch(false);
    setOwnerSearch("");
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setValue("plan_id", plan.id);
  };

  const handleBillingCycleChange = (cycle: "monthly" | "yearly") => {
    setBillingCycle(cycle);
    setValue("billing_cycle", cycle);
  };

  const calculatePrice = () => {
    if (!selectedPlan) return 0;
    if (billingCycle === "yearly") {
      return typeof selectedPlan.yearlyPrice === "number" &&
        !isNaN(selectedPlan.yearlyPrice)
        ? selectedPlan.yearlyPrice
        : 0;
    }
    return selectedPlan.price;
  };

  const calculateSavings = () => {
    if (!selectedPlan || billingCycle === "monthly") return 0;
    return selectedPlan.price * 12 - selectedPlan.yearlyPrice;
  };

  const onSubmit = async (data: SubscriptionForm) => {
    console.log("Form data:", data);
    console.log("Selected owner:", selectedOwner);
    console.log("Selected plan:", selectedPlan);

    setIsSubmitting(true);
    try {
      // Use selected owner and plan, or fallback to first available
      const ownerToUse = selectedOwner || owners[0];
      const planToUse = selectedPlan || plans[0];

      if (!ownerToUse || !planToUse) {
        throw new Error("Please select an owner and plan");
      }

      // Create payment intent instead of direct subscription
      const paymentData = {
        planId: planToUse.id,
        billingCycle: data.billing_cycle,
        userId: ownerToUse.id,
      };

      console.log("Creating payment intent:", paymentData);

      // Call the payment intent creation endpoint using the proper API client
      const responseData = await apiFetch('/subscription-payments/create-intent', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
      console.log("Payment intent created:", responseData);

      if (responseData.success && responseData.data) {
        const paymentIntentData = responseData.data;
        
        // Store payment intent data and show payment form
        setPaymentIntent(paymentIntentData);
        setShowPaymentForm(true);
        
        toast({
          title: "Payment Form Ready",
          description: `Please complete payment for ${planToUse.name} plan.`,
        });
      } else {
        throw new Error(responseData.message || 'Failed to create payment intent');
      }

    } catch (error) {
      console.error("Error creating payment intent:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again later.";
      toast({
        title: "Error creating payment intent",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handlePaymentSuccess = async (paymentIntent: any) => {
    console.log('Payment successful:', paymentIntent);
    
    // Automatically trigger webhook processing for new subscriptions
    try {
      console.log('Auto-triggering webhook processing for new subscription...');
      
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
            description: "Subscription has been created and activated successfully!",
          });
        } else {
          console.error('Auto-activation failed:', response);
          toast({
            title: "Payment Successful",
            description: "Payment completed but activation failed. Please use the manual activation button.",
            variant: "destructive",
          });
        }
      } else {
        console.error('Payment intent ID not found');
        toast({
          title: "Payment Successful",
          description: "Payment completed but activation failed. Please use the manual activation button.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in auto-activation:', error);
      toast({
        title: "Payment Successful",
        description: "Payment completed but activation failed. Please use the manual activation button.",
        variant: "destructive",
      });
    }
    
    setShowPaymentForm(false);
    setPaymentIntent(null);
    
    navigate("/dashboard/subscriptions", {
      state: { 
        message: "Subscription created and activated successfully!",
      }
    });
  };

  const checkPaymentStatus = async () => {
    if (!paymentIntent) return;
    
    try {
      // Call the test activation endpoint to manually activate if webhook didn't work
      const response = await apiFetch('/subscription-payments/test-activate', {
        method: 'POST',
        body: JSON.stringify({
          paymentIntentId: paymentIntent.clientSecret.split('_secret_')[0] // Extract payment intent ID
        }),
      });

      if (response.success) {
        toast({
          title: "Subscription Activated",
          description: "Your subscription has been successfully activated!",
        });
        
        navigate("/dashboard/subscriptions", {
          state: { 
            message: "Subscription activated successfully!",
          }
        });
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast({
        title: "Payment Status Check Failed",
        description: "Please contact support if your subscription is not active.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    setShowPaymentForm(false);
    setPaymentIntent(null);
    
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setPaymentIntent(null);
    
    toast({
      title: "Payment Cancelled",
      description: "Payment was cancelled. You can try again later.",
    });
  };

  const loadPlans = async () => {
    try {
      setPlansLoading(true);
      setPlansError(null);
      const data = await fetchSubscriptionPlans();
      // Map backend fields to camelCase and ensure numbers
      const mappedPlans = data.map((plan: any) => ({
        ...plan,
        yearlyPrice: Number(plan.yearly_price),
        price: Number(plan.price),
        // Optionally map other fields if needed
      }));
      setPlans(mappedPlans);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

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
            <p className="text-gray-600">Complete your subscription payment to activate the plan</p>
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
            planName={paymentIntent.plan.name}
            ownerName={paymentIntent.owner.name}
          />
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-3">
              If your payment was successful but the subscription isn't active yet, click the button below to check the status.
            </p>
            <Button 
              onClick={checkPaymentStatus}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Check Payment Status & Activate
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/subscriptions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Subscription
          </h1>
          <p className="text-gray-600">
            Set up a new subscription plan for a salon owner with payment gateway integration
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Owner Selection */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Select Salon Owner</CardTitle>
            <CardDescription>
              Choose the salon owner that will receive this subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedOwner ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search owners by name, email, or phone..."
                    value={ownerSearch}
                    onChange={(e) => setOwnerSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredOwners.map((owner) => (
                    <div
                      key={owner.id}
                      onClick={() => handleOwnerSelect(owner)}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={owner.avatar} alt={owner.name} />
                        <AvatarFallback>
                          {owner.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {owner.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {owner.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {owner.phone} • {owner.salonCount || 0} salon(s)
                        </p>
                      </div>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  ))}
                </div>

                {filteredOwners.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No available salon owners found</p>
                    <p className="text-sm">
                      All owners may already have active subscriptions
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={selectedOwner.avatar}
                      alt={selectedOwner.name}
                    />
                    <AvatarFallback>
                      {selectedOwner.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {selectedOwner.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedOwner.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedOwner.phone} • {selectedOwner.salonCount || 0} salon(s)
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedOwner(null);
                    setValue("owner_id", "");
                  }}
                >
                  Change Owner
                </Button>
              </div>
            )}
            {errors.owner_id && (
              <p className="text-sm text-red-500">{errors.owner_id.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Plan Selection */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Choose Subscription Plan</CardTitle>
            <CardDescription>
              Select the plan that best fits the owner's needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleBillingCycleChange("monthly")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === "monthly"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => handleBillingCycleChange("yearly")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === "yearly"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Yearly
                  <Badge className="ml-2 bg-green-100 text-green-800">
                    Save up to 17%
                  </Badge>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plansLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Loading plans...</p>
                </div>
              ) : plansError ? (
                <div className="text-center py-8 text-red-500">
                  <p>{plansError}</p>
                </div>
              ) : (
                plans.map((plan) => {
                  const PlanIcon = getPlanIcon(plan.name);
                  const isSelected = selectedPlan?.id === plan.id;
                  const price =
                    billingCycle === "yearly"
                      ? typeof plan.yearlyPrice === "number" &&
                        !isNaN(plan.yearlyPrice)
                        ? plan.yearlyPrice
                        : 0
                      : plan.price;
                  const savings =
                    billingCycle === "yearly"
                      ? plan.price * 12 - plan.yearlyPrice
                      : 0;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => handlePlanSelect(plan)}
                      className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-purple-200 bg-purple-50 shadow-lg"
                          : plan.popular
                          ? "border-blue-200 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      {plan.popular && !isSelected && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-blue-600 text-white">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-purple-600 text-white">
                            Selected
                          </Badge>
                        </div>
                      )}

                      <div className="text-center">
                        <div className="flex justify-center mb-4">
                          <div
                            className={`p-3 rounded-lg bg-gradient-to-r ${
                              planColors[plan.name] || "from-gray-600 to-gray-700"
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
                            ${price}
                          </span>
                          <span className="text-gray-600">
                            /{billingCycle === "yearly" ? "year" : "month"}
                          </span>
                        </div>
                        {billingCycle === "yearly" && savings > 0 && (
                          <p className="text-sm text-green-600 mt-1">
                            Save ${savings.toFixed(2)} per year
                          </p>
                        )}
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
                })
              )}
            </div>
            {errors.plan_id && (
              <p className="text-sm text-red-500 mt-4">
                {errors.plan_id.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Subscription Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>
              Configure the subscription settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date")}
                />
                {errors.start_date && (
                  <p className="text-sm text-red-500">
                    {errors.start_date.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trial_days">Trial Period (Days)</Label>
                <Input
                  id="trial_days"
                  type="number"
                  min="0"
                  max="30"
                  placeholder="14"
                  {...register("trial_days", { valueAsNumber: true })}
                />
                <p className="text-xs text-gray-500">0-30 days trial period</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto_renew"
                {...register("auto_renew")}
                className="rounded"
              />
              <Label htmlFor="auto_renew" className="text-sm">
                Enable automatic renewal
              </Label>
            </div>
          </CardContent>
        </Card>


        {/* Summary */}
        {selectedOwner && selectedPlan && (
          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle>Subscription Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Owner:</span>
                <span className="font-semibold">{selectedOwner.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-semibold">{selectedPlan.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Billing:</span>
                <span className="font-semibold capitalize">{billingCycle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-lg">
                  ${calculatePrice()}
                </span>
              </div>
              {billingCycle === "yearly" && calculateSavings() > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span>Annual Savings:</span>
                  <span className="font-semibold">
                    ${calculateSavings().toFixed(2)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link to="/dashboard/subscriptions">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>

          {/* Test Button for Debugging */}
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              try {
                const testData = {
                  ownerId: "1",
                  planId: "basic",
                  status: "active",
                  startDate: new Date().toISOString().split("T")[0],
                  nextBillingDate: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                  ).toISOString(),
                  amount: 19.99,
                  billingCycle: "monthly",
                  paymentMethod: {
                    type: "card",
                    cardNumber: "1234567890123456",
                    expiryMonth: "12",
                    expiryYear: "2025",
                    cvv: "123",
                    cardholderName: "Test User",
                  },
                  usage: {
                    bookings: 0,
                    staff: 0,
                    salons: 0,
                    bookingsLimit: 100,
                    staffLimit: 3,
                    salonsLimit: 1,
                  },
                  trialDays: 0,
                  autoRenew: true,
                };

                console.log("Testing with data:", testData);
                await createSubscription(testData);
                toast({
                  title: "Test successful",
                  description: "Subscription created successfully!",
                });
              } catch (error) {
                console.error("Test failed:", error);
                toast({
                  title: "Test failed",
                  description:
                    error instanceof Error ? error.message : "Unknown error",
                  variant: "destructive",
                });
              }
            }}
          >
            Test API
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Creating Payment Intent..." : "Create Payment Intent"}
          </Button>
        </div>
      </form>
    </div>
  );
}
