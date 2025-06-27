'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  CreditCard, 
  Calendar,
  DollarSign,
  Building2,
  User,
  CheckCircle,
  XCircle,
  Edit,
  Download,
  Crown,
  Star,
  Zap,
  AlertTriangle,
  TrendingUp,
  Users,
  BarChart3,
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
  Printer,
  FileText,
  Receipt,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

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
  invoiceNumber?: string;
  taxAmount?: number;
  subtotal?: number;
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
  plan: 'Basic' | 'Standard' | 'Premium';
  status: 'active' | 'trial' | 'cancelled' | 'past_due';
  startDate: string;
  nextBillingDate: string;
  amount: number;
  billingCycle: string;
  features: string[];
  usage: Usage;
  paymentMethod: PaymentMethod | null;
  billingHistory: BillingHistory[];
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  trial: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  past_due: 'bg-yellow-100 text-yellow-800',
};

const planColors = {
  Basic: 'bg-gray-100 text-gray-800',
  Standard: 'bg-blue-100 text-blue-800',
  Premium: 'bg-purple-100 text-purple-800',
};

const planIcons = {
  Basic: Zap,
  Standard: Star,
  Premium: Crown,
};

const billingStatusColors = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function SubscriptionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        // In a real app, you would fetch from your API
        // For demo purposes, we'll use mock data based on the ID
        const mockSubscriptions: Record<string, Subscription> = {
          '1': {
            id: '1',
            salonId: '1',
            salonName: 'Luxe Hair Studio',
            ownerId: '3',
            ownerName: 'Maria Rodriguez',
            ownerEmail: 'maria@luxehair.com',
            plan: 'Premium',
            status: 'active',
            startDate: '2024-01-15',
            nextBillingDate: '2024-07-15',
            amount: 99.99,
            billingCycle: 'monthly',
            features: [
              'Unlimited bookings',
              'Advanced analytics',
              'Priority support',
              'Custom branding',
              'Marketing tools',
              'Multi-location support',
              'Staff management',
              'Inventory tracking'
            ],
            usage: {
              bookings: 156,
              bookingsLimit: 'unlimited',
              staff: 8,
              staffLimit: 'unlimited',
              locations: 2,
              locationsLimit: 'unlimited'
            },
            paymentMethod: {
              type: 'card',
              last4: '4242',
              brand: 'Visa',
              expiryMonth: 12,
              expiryYear: 2025
            },
            billingHistory: [
              {
                id: 'inv_001',
                date: '2024-06-15',
                amount: 99.99,
                status: 'paid',
                description: 'Premium Plan - Monthly',
                invoiceNumber: 'INV-2024-001',
                taxAmount: 8.00,
                subtotal: 91.99
              },
              {
                id: 'inv_002',
                date: '2024-05-15',
                amount: 99.99,
                status: 'paid',
                description: 'Premium Plan - Monthly',
                invoiceNumber: 'INV-2024-002',
                taxAmount: 8.00,
                subtotal: 91.99
              },
              {
                id: 'inv_003',
                date: '2024-04-15',
                amount: 99.99,
                status: 'paid',
                description: 'Premium Plan - Monthly',
                invoiceNumber: 'INV-2024-003',
                taxAmount: 8.00,
                subtotal: 91.99
              },
              {
                id: 'inv_004',
                date: '2024-03-15',
                amount: 99.99,
                status: 'paid',
                description: 'Premium Plan - Monthly',
                invoiceNumber: 'INV-2024-004',
                taxAmount: 8.00,
                subtotal: 91.99
              },
              {
                id: 'inv_005',
                date: '2024-02-15',
                amount: 99.99,
                status: 'paid',
                description: 'Premium Plan - Monthly',
                invoiceNumber: 'INV-2024-005',
                taxAmount: 8.00,
                subtotal: 91.99
              }
            ]
          },
          '2': {
            id: '2',
            salonId: '4',
            salonName: 'Luxe Hair Downtown',
            ownerId: '3',
            ownerName: 'Maria Rodriguez',
            ownerEmail: 'maria@luxehair.com',
            plan: 'Standard',
            status: 'active',
            startDate: '2024-02-01',
            nextBillingDate: '2024-07-01',
            amount: 49.99,
            billingCycle: 'monthly',
            features: [
              'Up to 500 bookings/month',
              'Basic analytics',
              'Email support',
              'Online booking',
              'Customer management',
              'Basic reporting'
            ],
            usage: {
              bookings: 89,
              bookingsLimit: 500,
              staff: 4,
              staffLimit: 10,
              locations: 1,
              locationsLimit: 1
            },
            paymentMethod: {
              type: 'card',
              last4: '4242',
              brand: 'Visa',
              expiryMonth: 12,
              expiryYear: 2025
            },
            billingHistory: [
              {
                id: 'inv_006',
                date: '2024-06-01',
                amount: 49.99,
                status: 'paid',
                description: 'Standard Plan - Monthly',
                invoiceNumber: 'INV-2024-006',
                taxAmount: 4.00,
                subtotal: 45.99
              },
              {
                id: 'inv_007',
                date: '2024-05-01',
                amount: 49.99,
                status: 'paid',
                description: 'Standard Plan - Monthly',
                invoiceNumber: 'INV-2024-007',
                taxAmount: 4.00,
                subtotal: 45.99
              }
            ]
          }
        };
        
        const subscriptionData = mockSubscriptions[params.id as string];
        if (subscriptionData) {
          setSubscription(subscriptionData);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [params.id]);

  const handlePrintInvoice = (invoice: BillingHistory) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; }
            .company-name { font-size: 24px; font-weight: bold; color: #8b5cf6; }
            .invoice-title { font-size: 20px; margin: 20px 0; }
            .invoice-details { display: flex; justify-content: space-between; margin: 30px 0; }
            .billing-info { margin: 20px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            .table th { background-color: #f8f9fa; font-weight: bold; }
            .total-section { margin-top: 30px; text-align: right; }
            .total-row { margin: 5px 0; }
            .grand-total { font-size: 18px; font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Hairvana</div>
            <div>Admin Dashboard</div>
          </div>
          
          <div class="invoice-title">INVOICE</div>
          
          <div class="invoice-details">
            <div>
              <strong>Invoice Number:</strong> ${invoice.invoiceNumber}<br>
              <strong>Date:</strong> ${format(new Date(invoice.date), 'MMMM dd, yyyy')}<br>
              <strong>Status:</strong> ${invoice.status.toUpperCase()}
            </div>
            <div>
              <strong>Bill To:</strong><br>
              ${subscription?.salonName}<br>
              ${subscription?.ownerName}<br>
              ${subscription?.ownerEmail}
            </div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Period</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${invoice.description}</td>
                <td>${format(new Date(invoice.date), 'MMM dd')} - ${format(new Date(new Date(invoice.date).getTime() + 30 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}</td>
                <td>$${invoice.subtotal?.toFixed(2) || (invoice.amount - (invoice.taxAmount || 0)).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">Subtotal: $${invoice.subtotal?.toFixed(2) || (invoice.amount - (invoice.taxAmount || 0)).toFixed(2)}</div>
            <div class="total-row">Tax: $${invoice.taxAmount?.toFixed(2) || '0.00'}</div>
            <div class="total-row grand-total">Total: $${invoice.amount.toFixed(2)}</div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice.</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  const handleDownloadInvoice = (invoice: BillingHistory) => {
    // In a real app, this would download a PDF
    // For demo purposes, we'll show a toast
    alert(`Downloading invoice ${invoice.invoiceNumber} as PDF...`);
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
          <h2 className="text-2xl font-bold text-gray-900">Subscription not found</h2>
          <p className="text-gray-600 mt-2">The subscription you're looking for doesn't exist.</p>
          <Link href="/dashboard/subscriptions">
            <Button className="mt-4">Back to Subscriptions</Button>
          </Link>
        </div>
      </div>
    );
  }

  const PlanIcon = planIcons[subscription.plan];

  const getUsagePercentage = (current: number, limit: number | 'unlimited') => {
    if (limit === 'unlimited') return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const bookingsPercentage = getUsagePercentage(subscription.usage.bookings, subscription.usage.bookingsLimit);
  const staffPercentage = getUsagePercentage(subscription.usage.staff, subscription.usage.staffLimit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/subscriptions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{subscription.salonName} Subscription</h1>
            <p className="text-gray-600">Subscription Details & Management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Billing
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Subscription
          </Button>
        </div>
      </div>

      {/* Subscription Overview */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" alt={subscription.salonName} />
                  <AvatarFallback className="text-lg">
                    {subscription.salonName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                  <PlanIcon className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{subscription.salonName}</h2>
                <p className="text-gray-600">{subscription.ownerName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={planColors[subscription.plan]}>
                    {subscription.plan} Plan
                  </Badge>
                  <Badge className={statusColors[subscription.status]}>
                    {subscription.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Started {format(new Date(subscription.startDate), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${subscription.amount}/{subscription.billingCycle}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {subscription.status === 'active' && (
                <>
                  <Button variant="outline" className="text-blue-600 hover:text-blue-700">
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                  <Button variant="outline" className="text-orange-600 hover:text-orange-700">
                    <ArrowDownCircle className="h-4 w-4 mr-2" />
                    Downgrade Plan
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Subscription
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Bookings Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscription.usage.bookings}
                  {subscription.usage.bookingsLimit !== 'unlimited' && `/${subscription.usage.bookingsLimit}`}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            {subscription.usage.bookingsLimit !== 'unlimited' && (
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(bookingsPercentage)}`}
                  style={{ width: `${bookingsPercentage}%` }}
                />
              </div>
            )}
            {subscription.usage.bookingsLimit === 'unlimited' && (
              <p className="text-sm text-green-600 font-medium">Unlimited</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Staff Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscription.usage.staff}
                  {subscription.usage.staffLimit !== 'unlimited' && `/${subscription.usage.staffLimit}`}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
            {subscription.usage.staffLimit !== 'unlimited' && (
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(staffPercentage)}`}
                  style={{ width: `${staffPercentage}%` }}
                />
              </div>
            )}
            {subscription.usage.staffLimit === 'unlimited' && (
              <p className="text-sm text-green-600 font-medium">Unlimited</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Locations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscription.usage.locations}
                  {subscription.usage.locationsLimit !== 'unlimited' && `/${subscription.usage.locationsLimit}`}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
            {subscription.usage.locationsLimit === 'unlimited' ? (
              <p className="text-sm text-green-600 font-medium">Unlimited</p>
            ) : (
              <p className="text-sm text-gray-600">
                {subscription.usage.locationsLimit - subscription.usage.locations} remaining
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Billing Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Current Plan</p>
                <p className="text-sm text-gray-600">{subscription.plan} - ${subscription.amount}/{subscription.billingCycle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Next Billing Date</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(subscription.nextBillingDate), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
            {subscription.paymentMethod && (
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-sm text-gray-600">
                    {subscription.paymentMethod.brand} ending in {subscription.paymentMethod.last4}
                  </p>
                  <p className="text-xs text-gray-500">
                    Expires {subscription.paymentMethod.expiryMonth}/{subscription.paymentMethod.expiryYear}
                  </p>
                </div>
              </div>
            )}
            <div className="pt-4">
              <Button variant="outline" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Update Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Plan Features */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Plan Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscription.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices & Billing History */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Invoices & Billing History
              </CardTitle>
              <CardDescription>
                View and manage all invoices and billing records
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscription.billingHistory.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{invoice.description}</p>
                      <Badge className={billingStatusColors[invoice.status as keyof typeof billingStatusColors]}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {format(new Date(invoice.date), 'MMM dd, yyyy')} • Invoice #{invoice.invoiceNumber}
                    </p>
                    {invoice.taxAmount && (
                      <p className="text-xs text-gray-500">
                        Subtotal: ${invoice.subtotal?.toFixed(2)} + Tax: ${invoice.taxAmount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${invoice.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Total Amount</p>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handlePrintInvoice(invoice)}
                      title="Print Invoice"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice)}
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Billing Summary */}
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{subscription.billingHistory.length}</p>
                <p className="text-sm text-gray-600">Total Invoices</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {subscription.billingHistory.filter(inv => inv.status === 'paid').length}
                </p>
                <p className="text-sm text-gray-600">Paid Invoices</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  ${subscription.billingHistory.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total Billed</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  ${(subscription.billingHistory.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0)).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total Tax</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Alerts */}
      {subscription.status === 'trial' && (
        <Card className="border-0 shadow-sm border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertTriangle className="h-5 w-5" />
              Trial Period Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              This subscription is currently in trial period. The trial will end on {format(new Date(subscription.nextBillingDate), 'MMMM dd, yyyy')}.
            </p>
            <div className="mt-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <CreditCard className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {subscription.status === 'cancelled' && (
        <Card className="border-0 shadow-sm border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <XCircle className="h-5 w-5" />
              Subscription Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              This subscription has been cancelled. Access will continue until {format(new Date(subscription.nextBillingDate), 'MMMM dd, yyyy')}.
            </p>
            <div className="mt-4">
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Reactivate Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}