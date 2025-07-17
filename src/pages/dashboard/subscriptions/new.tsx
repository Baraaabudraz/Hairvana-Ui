import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Search, 
  CreditCard, 
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
  Phone
} from 'lucide-react';
import { fetchSalons } from '@/api/salons';
import { createSubscription, fetchSubscriptionPlans } from '@/api/subscriptions';

const subscriptionSchema = z.object({
  salon_id: z.string().min(1, 'Please select a salon'),
  plan_id: z.string().min(1, 'Please select a plan'),
  billing_cycle: z.enum(['monthly', 'yearly']),
  start_date: z.string().min(1, 'Start date is required'),
  next_billing_date: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  status: z.enum(['active', 'trial', 'cancelled', 'past_due']).default('active'),
  payment_method: z.object({
    type: z.literal('card'),
    cardNumber: z.string().min(16, 'Card number must be 16 digits'),
    expiryMonth: z.string().min(1, 'Expiry month is required'),
    expiryYear: z.string().min(1, 'Expiry year is required'),
    cvv: z.string().min(3, 'CVV must be at least 3 digits'),
    cardholderName: z.string().min(2, 'Cardholder name is required'),
  }),
  trial_days: z.number().min(0).max(30).optional(),
  auto_renew: z.boolean().default(true),
});

type SubscriptionForm = z.infer<typeof subscriptionSchema>;

interface Plan {
  id: string;
  name: 'Basic' | 'Standard' | 'Premium';
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

interface Salon {
  id: string;
  name: string;
  location: string;
  ownerName: string;
  ownerEmail: string;
  status: string;
  avatar: string;
}

const planIcons = {
  Basic: Zap,
  Standard: Star,
  Premium: Crown,
};

const planColors = {
  Basic: 'from-gray-600 to-gray-700',
  Standard: 'from-blue-600 to-blue-700',
  Premium: 'from-purple-600 to-purple-700',
};

export default function CreateSubscriptionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>([]);
  const [salonSearch, setSalonSearch] = useState('');
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showSalonSearch, setShowSalonSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SubscriptionForm>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      billing_cycle: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      auto_renew: true,
      trial_days: 14,
      salon_id: '',
      plan_id: '',
      amount: 0,
      status: 'active',
      payment_method: {
        type: 'card',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
      },
    },
  });

  useEffect(() => {
    const loadSalons = async () => {
      try {
        setLoading(true);
        const response = await fetchSalons();
        console.log('Loaded salons:', response);
        if (response && response.salons) {
          setSalons(response.salons);
          setFilteredSalons(response.salons);
        } else {
          setSalons([]);
          setFilteredSalons([]);
        }
      } catch (error) {
        console.error('Error loading salons:', error);
        setSalons([]);
        setFilteredSalons([]);
        toast({
          title: 'Error',
          description: 'Failed to load salons. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    loadSalons();
  }, [toast]);

  useEffect(() => {
    const filtered = salons.filter(salon =>
      salon.name.toLowerCase().includes(salonSearch.toLowerCase()) ||
      salon.location.toLowerCase().includes(salonSearch.toLowerCase()) ||
      salon.ownerName.toLowerCase().includes(salonSearch.toLowerCase())
    );
    setFilteredSalons(filtered);
  }, [salonSearch, salons]);

  const handleSalonSelect = (salon: Salon) => {
    setSelectedSalon(salon);
    setValue('salon_id', salon.id);
    setShowSalonSearch(false);
    setSalonSearch('');
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setValue('plan_id', plan.id);
  };

  const handleBillingCycleChange = (cycle: 'monthly' | 'yearly') => {
    setBillingCycle(cycle);
    setValue('billing_cycle', cycle);
  };

  const calculatePrice = () => {
    if (!selectedPlan) return 0;
    if (billingCycle === 'yearly') {
      return typeof selectedPlan.yearlyPrice === 'number' && !isNaN(selectedPlan.yearlyPrice) ? selectedPlan.yearlyPrice : 0;
    }
    return selectedPlan.price;
  };

  const calculateSavings = () => {
    if (!selectedPlan || billingCycle === 'monthly') return 0;
    return (selectedPlan.price * 12) - selectedPlan.yearlyPrice;
  };

  const onSubmit = async (data: SubscriptionForm) => {
    console.log('Form data:', data);
    console.log('Selected salon:', selectedSalon);
    console.log('Selected plan:', selectedPlan);
    
    setIsSubmitting(true);
    try {
      // Use selected salon and plan, or fallback to first available
      const salonToUse = selectedSalon || salons[0];
      const planToUse = selectedPlan || plans[0];
      
      if (!salonToUse || !planToUse) {
        throw new Error('Please select a salon and plan');
      }

      // Calculate next billing date
      const startDate = new Date(data.start_date);
      const nextBillingDate = new Date(startDate);
      
      if (data.billing_cycle === 'monthly') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      }

      const subscriptionData = {
        salon_id: salonToUse.id,
        plan_id: planToUse.id,
        status: data.trial_days && data.trial_days > 0 ? 'trial' : 'active',
        start_date: data.start_date,
        next_billing_date: nextBillingDate.toISOString(),
        amount: calculatePrice(),
        billing_cycle: data.billing_cycle,
        payment_method: {
          type: 'card',
          cardNumber: data.payment_method.cardNumber.replace(/\s/g, ''),
          expiryMonth: data.payment_method.expiryMonth,
          expiryYear: data.payment_method.expiryYear,
          cvv: data.payment_method.cvv,
          cardholderName: data.payment_method.cardholderName,
        },
        usage: {
          bookingsUsed: 0,
          staffUsed: 0,
          locationsUsed: 0,
          bookingsLimit: planToUse.limits.bookings || 0,
          staffLimit: planToUse.limits.staff || 0,
          locationsLimit: planToUse.limits.locations || 0,
        },
        trial_days: data.trial_days || 0,
        auto_renew: data.auto_renew,
      };

      console.log('Sending subscription data:', subscriptionData);

      await createSubscription(subscriptionData);

      toast({
        title: 'Subscription created successfully',
        description: `${salonToUse.name} has been subscribed to the ${planToUse.name} plan.`,
      });

      navigate('/dashboard/subscriptions');
    } catch (error) {
      console.error('Error creating subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again later.';
      toast({
        title: 'Error creating subscription',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

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
      setPlansError('Failed to load plans');
      toast({
        title: 'Error',
        description: 'Failed to load subscription plans. Please try again.',
        variant: 'destructive',
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/subscriptions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Subscription</h1>
          <p className="text-gray-600">Set up a new subscription plan for a salon</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Salon Selection */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Select Salon</CardTitle>
            <CardDescription>
              Choose the salon that will receive this subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedSalon ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search salons by name, location, or owner..."
                    value={salonSearch}
                    onChange={(e) => setSalonSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredSalons.map((salon) => (
                    <div
                      key={salon.id}
                      onClick={() => handleSalonSelect(salon)}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={salon.avatar} alt={salon.name} />
                        <AvatarFallback>{salon.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{salon.name}</h4>
                        <p className="text-sm text-gray-600">{salon.location}</p>
                        <p className="text-xs text-gray-500">{salon.ownerName} • {salon.ownerEmail}</p>
                      </div>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  ))}
                </div>
                
                {filteredSalons.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No available salons found</p>
                    <p className="text-sm">All salons may already have active subscriptions</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedSalon.avatar} alt={selectedSalon.name} />
                    <AvatarFallback>{selectedSalon.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedSalon.name}</h4>
                    <p className="text-sm text-gray-600">{selectedSalon.location}</p>
                    <p className="text-xs text-gray-500">{selectedSalon.ownerName} • {selectedSalon.ownerEmail}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedSalon(null);
                    setValue('salon_id', '');
                  }}
                >
                  Change Salon
                </Button>
              </div>
            )}
            {errors.salon_id && (
              <p className="text-sm text-red-500">{errors.salon_id.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Plan Selection */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Choose Subscription Plan</CardTitle>
            <CardDescription>
              Select the plan that best fits the salon's needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleBillingCycleChange('monthly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => handleBillingCycleChange('yearly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === 'yearly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Yearly
                  <Badge className="ml-2 bg-green-100 text-green-800">Save up to 17%</Badge>
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
                  const PlanIcon = planIcons[plan.name];
                  const isSelected = selectedPlan?.id === plan.id;
                  const price = billingCycle === 'yearly' ? (typeof plan.yearlyPrice === 'number' && !isNaN(plan.yearlyPrice) ? plan.yearlyPrice : 0) : plan.price;
                  const savings = billingCycle === 'yearly' ? (plan.price * 12) - plan.yearlyPrice : 0;
                  
                  return (
                    <div
                      key={plan.id}
                      onClick={() => handlePlanSelect(plan)}
                      className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-purple-200 bg-purple-50 shadow-lg'
                          : plan.popular
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {plan.popular && !isSelected && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-purple-600 text-white">Selected</Badge>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="flex justify-center mb-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${planColors[plan.name]}`}>
                            <PlanIcon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        <p className="text-gray-600 mt-2">{plan.description}</p>
                        <div className="mt-4">
                          <span className="text-3xl font-bold text-gray-900">${price}</span>
                          <span className="text-gray-600">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                        </div>
                        {billingCycle === 'yearly' && savings > 0 && (
                          <p className="text-sm text-green-600 mt-1">
                            Save ${savings.toFixed(2)} per year
                          </p>
                        )}
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
                })
              )}
            </div>
            {errors.plan_id && (
              <p className="text-sm text-red-500 mt-4">{errors.plan_id.message}</p>
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
                  {...register('start_date')}
                />
                {errors.start_date && (
                  <p className="text-sm text-red-500">{errors.start_date.message}</p>
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
                  {...register('trial_days', { valueAsNumber: true })}
                />
                <p className="text-xs text-gray-500">0-30 days trial period</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto_renew"
                {...register('auto_renew')}
                className="rounded"
              />
              <Label htmlFor="auto_renew" className="text-sm">
                Enable automatic renewal
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
            <CardDescription>
              Enter the payment details for this subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name *</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                {...register('payment_method.cardholderName')}
              />
              {errors.payment_method?.cardholderName && (
                <p className="text-sm text-red-500">{errors.payment_method.cardholderName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                {...register('payment_method.cardNumber')}
              />
              {errors.payment_method?.cardNumber && (
                <p className="text-sm text-red-500">{errors.payment_method.cardNumber.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth">Month *</Label>
                <Input
                  id="expiryMonth"
                  placeholder="MM"
                  maxLength={2}
                  {...register('payment_method.expiryMonth')}
                />
                {errors.payment_method?.expiryMonth && (
                  <p className="text-sm text-red-500">{errors.payment_method.expiryMonth.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryYear">Year *</Label>
                <Input
                  id="expiryYear"
                  placeholder="YYYY"
                  maxLength={4}
                  {...register('payment_method.expiryYear')}
                />
                {errors.payment_method?.expiryYear && (
                  <p className="text-sm text-red-500">{errors.payment_method.expiryYear.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  maxLength={4}
                  {...register('payment_method.cvv')}
                />
                {errors.payment_method?.cvv && (
                  <p className="text-sm text-red-500">{errors.payment_method.cvv.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {selectedSalon && selectedPlan && (
          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle>Subscription Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Salon:</span>
                <span className="font-semibold">{selectedSalon.name}</span>
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
                <span className="font-semibold text-lg">${calculatePrice()}</span>
              </div>
              {billingCycle === 'yearly' && calculateSavings() > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span>Annual Savings:</span>
                  <span className="font-semibold">${calculateSavings().toFixed(2)}</span>
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
                  salon_id: '1',
                  plan_id: 'basic',
                  status: 'active',
                  start_date: new Date().toISOString().split('T')[0],
                  next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  amount: 19.99,
                  billing_cycle: 'monthly',
                  payment_method: {
                    type: 'card',
                    cardNumber: '1234567890123456',
                    expiryMonth: '12',
                    expiryYear: '2025',
                    cvv: '123',
                    cardholderName: 'Test User',
                  },
                  usage: {
                    bookingsUsed: 0,
                    staffUsed: 0,
                    locationsUsed: 0,
                    bookingsLimit: 100,
                    staffLimit: 3,
                    locationsLimit: 1,
                  },
                  trial_days: 0,
                  auto_renew: true,
                };
                
                console.log('Testing with data:', testData);
                await createSubscription(testData);
                toast({
                  title: 'Test successful',
                  description: 'Subscription created successfully!',
                });
              } catch (error) {
                console.error('Test failed:', error);
                toast({
                  title: 'Test failed',
                  description: error instanceof Error ? error.message : 'Unknown error',
                  variant: 'destructive',
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
            {isSubmitting ? 'Creating Subscription...' : 'Create Subscription'}
          </Button>
        </div>
      </form>
    </div>
  );
}