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
import { createSubscription } from '@/api/subscriptions';

const subscriptionSchema = z.object({
  salonId: z.string().min(1, 'Please select a salon'),
  plan: z.enum(['Basic', 'Standard', 'Premium'], {
    required_error: 'Please select a plan',
  }),
  billingCycle: z.enum(['monthly', 'yearly']),
  startDate: z.string().min(1, 'Start date is required'),
  paymentMethod: z.object({
    type: z.literal('card'),
    cardNumber: z.string().min(16, 'Card number must be 16 digits'),
    expiryMonth: z.string().min(1, 'Expiry month is required'),
    expiryYear: z.string().min(1, 'Expiry year is required'),
    cvv: z.string().min(3, 'CVV must be at least 3 digits'),
    cardholderName: z.string().min(2, 'Cardholder name is required'),
  }),
  trialDays: z.number().min(0).max(30).optional(),
  autoRenew: z.boolean().default(true),
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

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 19.99,
    yearlyPrice: 199.99,
    description: 'Perfect for small salons getting started',
    features: [
      'Up to 100 bookings/month',
      'Up to 3 staff members',
      'Basic customer management',
      'Online booking widget',
      'Email support',
      'Basic reporting'
    ],
    limits: {
      bookings: 100,
      staff: 3,
      locations: 1
    },
    popular: false
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 49.99,
    yearlyPrice: 499.99,
    description: 'Great for growing salons with more features',
    features: [
      'Up to 500 bookings/month',
      'Up to 10 staff members',
      'Advanced customer management',
      'Online booking & scheduling',
      'Email & chat support',
      'Advanced reporting',
      'SMS notifications',
      'Inventory management'
    ],
    limits: {
      bookings: 500,
      staff: 10,
      locations: 1
    },
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99.99,
    yearlyPrice: 999.99,
    description: 'Complete solution for established salons',
    features: [
      'Unlimited bookings',
      'Unlimited staff members',
      'Multi-location support',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'Marketing tools',
      'API access',
      'Staff management',
      'Inventory tracking',
      'Financial reporting'
    ],
    limits: {
      bookings: 'unlimited',
      staff: 'unlimited',
      locations: 'unlimited'
    },
    popular: false
  }
];

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SubscriptionForm>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      billingCycle: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      autoRenew: true,
      trialDays: 14,
    },
  });

  useEffect(() => {
    loadSalons();
  }, []);

  useEffect(() => {
    const filtered = salons.filter(salon =>
      salon.name.toLowerCase().includes(salonSearch.toLowerCase()) ||
      salon.location.toLowerCase().includes(salonSearch.toLowerCase()) ||
      salon.ownerName.toLowerCase().includes(salonSearch.toLowerCase())
    );
    setFilteredSalons(filtered);
  }, [salonSearch, salons]);

  const loadSalons = async () => {
    try {
      setLoading(true);
      // Fetch salons that don't have active subscriptions
      const params = { status: 'active' };
      const data = await fetchSalons(params);
      
      // In a real app, you would filter out salons that already have active subscriptions
      // For now, we'll use all active salons
      setSalons(data.salons);
      setFilteredSalons(data.salons);
    } catch (error) {
      console.error('Error fetching salons:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch salons. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalonSelect = (salon: Salon) => {
    setSelectedSalon(salon);
    setValue('salonId', salon.id);
    setShowSalonSearch(false);
    setSalonSearch('');
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setValue('plan', plan.name);
  };

  const handleBillingCycleChange = (cycle: 'monthly' | 'yearly') => {
    setBillingCycle(cycle);
    setValue('billingCycle', cycle);
  };

  const calculatePrice = () => {
    if (!selectedPlan) return 0;
    return billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.price;
  };

  const calculateSavings = () => {
    if (!selectedPlan || billingCycle === 'monthly') return 0;
    return (selectedPlan.price * 12) - selectedPlan.yearlyPrice;
  };

  const onSubmit = async (data: SubscriptionForm) => {
    setIsSubmitting(true);
    try {
      const subscriptionData = {
        ...data,
        amount: calculatePrice(),
        planDetails: selectedPlan,
        salonDetails: selectedSalon,
      };

      await createSubscription(subscriptionData);

      toast({
        title: 'Subscription created successfully',
        description: `${selectedSalon?.name} has been subscribed to the ${selectedPlan?.name} plan.`,
      });

      navigate('/dashboard/subscriptions');
    } catch (error) {
      toast({
        title: 'Error creating subscription',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
                    setValue('salonId', '');
                  }}
                >
                  Change Salon
                </Button>
              </div>
            )}
            {errors.salonId && (
              <p className="text-sm text-red-500">{errors.salonId.message}</p>
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
              {plans.map((plan) => {
                const PlanIcon = planIcons[plan.name];
                const isSelected = selectedPlan?.id === plan.id;
                const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
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
              })}
            </div>
            {errors.plan && (
              <p className="text-sm text-red-500 mt-4">{errors.plan.message}</p>
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
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trialDays">Trial Period (Days)</Label>
                <Input
                  id="trialDays"
                  type="number"
                  min="0"
                  max="30"
                  placeholder="14"
                  {...register('trialDays', { valueAsNumber: true })}
                />
                <p className="text-xs text-gray-500">0-30 days trial period</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoRenew"
                {...register('autoRenew')}
                className="rounded"
              />
              <Label htmlFor="autoRenew" className="text-sm">
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
                {...register('paymentMethod.cardholderName')}
              />
              {errors.paymentMethod?.cardholderName && (
                <p className="text-sm text-red-500">{errors.paymentMethod.cardholderName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                {...register('paymentMethod.cardNumber')}
              />
              {errors.paymentMethod?.cardNumber && (
                <p className="text-sm text-red-500">{errors.paymentMethod.cardNumber.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth">Month *</Label>
                <Input
                  id="expiryMonth"
                  placeholder="MM"
                  maxLength={2}
                  {...register('paymentMethod.expiryMonth')}
                />
                {errors.paymentMethod?.expiryMonth && (
                  <p className="text-sm text-red-500">{errors.paymentMethod.expiryMonth.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryYear">Year *</Label>
                <Input
                  id="expiryYear"
                  placeholder="YYYY"
                  maxLength={4}
                  {...register('paymentMethod.expiryYear')}
                />
                {errors.paymentMethod?.expiryYear && (
                  <p className="text-sm text-red-500">{errors.paymentMethod.expiryYear.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  maxLength={4}
                  {...register('paymentMethod.cvv')}
                />
                {errors.paymentMethod?.cvv && (
                  <p className="text-sm text-red-500">{errors.paymentMethod.cvv.message}</p>
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
          <Button
            type="submit"
            disabled={isSubmitting || !selectedSalon || !selectedPlan}
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