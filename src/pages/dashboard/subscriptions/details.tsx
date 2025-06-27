import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Eye,
  ExternalLink,
  Mail,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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

export default function SubscriptionDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingBilling, setSyncingBilling] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [downgradeDialogOpen, setDowngradeDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [paymentMethodDialogOpen, setPaymentMethodDialogOpen] = useState(false);
  const [exportReportDialogOpen, setExportReportDialogOpen] = useState(false);
  const [generateReportDialogOpen, setGenerateReportDialogOpen] = useState(false);
  const [selectedNewPlan, setSelectedNewPlan] = useState<Plan | null>(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
  });

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

  const handleSyncBilling = async () => {
    setSyncingBilling(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Billing synced successfully',
        description: 'The billing information has been synchronized with the payment provider.',
      });
    } catch (error) {
      toast({
        title: 'Error syncing billing',
        description: 'Failed to sync billing information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSyncingBilling(false);
    }
  };

  const handleEditSubscription = () => {
    setEditDialogOpen(true);
  };

  const handleUpgradePlan = () => {
    setUpgradeDialogOpen(true);
  };

  const handleDowngradePlan = () => {
    setDowngradeDialogOpen(true);
  };

  const handleCancelSubscription = () => {
    setCancelDialogOpen(true);
  };

  const handleUpdatePaymentMethod = () => {
    setPaymentMethodDialogOpen(true);
  };

  const handleExportAll = () => {
    toast({
      title: 'Export started',
      description: 'Your billing history is being exported. The download will start shortly.',
    });
    
    // Simulate download delay
    setTimeout(() => {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent('Billing history export'));
      element.setAttribute('download', `billing-history-${subscription?.salonName.toLowerCase().replace(/\s+/g, '-')}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1000);
  };

  const handleGenerateReport = () => {
    setGenerateReportDialogOpen(true);
  };

  const confirmUpgradePlan = async () => {
    if (!selectedNewPlan) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (subscription) {
        setSubscription({
          ...subscription,
          plan: selectedNewPlan.name,
          amount: selectedNewPlan.price,
          features: selectedNewPlan.features,
          usage: {
            ...subscription.usage,
            bookingsLimit: selectedNewPlan.limits.bookings,
            staffLimit: selectedNewPlan.limits.staff,
            locationsLimit: selectedNewPlan.limits.locations
          }
        });
      }
      
      toast({
        title: 'Plan upgraded successfully',
        description: `The subscription has been upgraded to the ${selectedNewPlan.name} plan.`,
      });
      
      setUpgradeDialogOpen(false);
      setSelectedNewPlan(null);
    } catch (error) {
      toast({
        title: 'Error upgrading plan',
        description: 'Failed to upgrade the subscription plan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const confirmDowngradePlan = async () => {
    if (!selectedNewPlan) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (subscription) {
        setSubscription({
          ...subscription,
          plan: selectedNewPlan.name,
          amount: selectedNewPlan.price,
          features: selectedNewPlan.features,
          usage: {
            ...subscription.usage,
            bookingsLimit: selectedNewPlan.limits.bookings,
            staffLimit: selectedNewPlan.limits.staff,
            locationsLimit: selectedNewPlan.limits.locations
          }
        });
      }
      
      toast({
        title: 'Plan downgraded successfully',
        description: `The subscription has been downgraded to the ${selectedNewPlan.name} plan.`,
      });
      
      setDowngradeDialogOpen(false);
      setSelectedNewPlan(null);
    } catch (error) {
      toast({
        title: 'Error downgrading plan',
        description: 'Failed to downgrade the subscription plan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const confirmCancelSubscription = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (subscription) {
        setSubscription({
          ...subscription,
          status: 'cancelled'
        });
      }
      
      toast({
        title: 'Subscription cancelled',
        description: 'The subscription has been cancelled successfully.',
      });
      
      setCancelDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error cancelling subscription',
        description: 'Failed to cancel the subscription. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const confirmUpdatePaymentMethod = async () => {
    try {
      // Validate payment information
      if (!newPaymentMethod.cardNumber || !newPaymentMethod.expiryMonth || 
          !newPaymentMethod.expiryYear || !newPaymentMethod.cvv || 
          !newPaymentMethod.cardholderName) {
        toast({
          title: 'Missing information',
          description: 'Please fill in all payment details.',
          variant: 'destructive',
        });
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (subscription) {
        setSubscription({
          ...subscription,
          paymentMethod: {
            type: 'card',
            last4: newPaymentMethod.cardNumber.slice(-4),
            brand: 'Visa', // In a real app, detect from card number
            expiryMonth: parseInt(newPaymentMethod.expiryMonth),
            expiryYear: parseInt(newPaymentMethod.expiryYear)
          }
        });
      }
      
      toast({
        title: 'Payment method updated',
        description: 'The payment method has been updated successfully.',
      });
      
      setPaymentMethodDialogOpen(false);
      setNewPaymentMethod({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
      });
    } catch (error) {
      toast({
        title: 'Error updating payment method',
        description: 'Failed to update the payment method. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const confirmGenerateReport = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Report generated',
        description: 'The subscription report has been generated and is ready for download.',
      });
      
      // Simulate download
      setTimeout(() => {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent('Subscription report'));
        element.setAttribute('download', `subscription-report-${subscription?.salonName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }, 500);
      
      setGenerateReportDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error generating report',
        description: 'Failed to generate the report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const generateInvoiceHTML = (invoice: BillingHistory) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background: #fff;
              padding: 40px;
            }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              margin-bottom: 40px; 
              padding-bottom: 20px;
              border-bottom: 3px solid #8b5cf6;
            }
            .company-info h1 { 
              font-size: 32px; 
              font-weight: bold; 
              background: linear-gradient(135deg, #8b5cf6, #ec4899);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              margin-bottom: 5px;
            }
            .company-info p { color: #666; font-size: 14px; }
            .invoice-info { text-align: right; }
            .invoice-info h2 { 
              font-size: 28px; 
              color: #8b5cf6; 
              margin-bottom: 10px;
            }
            .invoice-details { 
              display: flex; 
              justify-content: space-between; 
              margin: 40px 0; 
              gap: 40px;
            }
            .bill-to, .invoice-meta { flex: 1; }
            .bill-to h3, .invoice-meta h3 { 
              font-size: 16px; 
              color: #8b5cf6; 
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .bill-to p, .invoice-meta p { 
              margin-bottom: 8px; 
              font-size: 14px;
            }
            .invoice-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 40px 0; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              border-radius: 8px;
              overflow: hidden;
            }
            .invoice-table th { 
              background: linear-gradient(135deg, #8b5cf6, #ec4899);
              color: white; 
              padding: 15px; 
              text-align: left; 
              font-weight: 600;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .invoice-table td { 
              padding: 15px; 
              border-bottom: 1px solid #eee; 
              font-size: 14px;
            }
            .invoice-table tbody tr:hover { background-color: #f8f9fa; }
            .totals-section { 
              margin-top: 40px; 
              text-align: right; 
            }
            .totals-table { 
              margin-left: auto; 
              width: 300px;
            }
            .totals-table tr td { 
              padding: 8px 15px; 
              border: none;
            }
            .totals-table tr:last-child td { 
              border-top: 2px solid #8b5cf6;
              font-weight: bold; 
              font-size: 18px;
              color: #8b5cf6;
            }
            .status-badge { 
              display: inline-block;
              padding: 4px 12px; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .status-paid { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-failed { background: #fee2e2; color: #991b1b; }
            .footer { 
              margin-top: 60px; 
              text-align: center; 
              color: #666; 
              font-size: 12px;
              border-top: 1px solid #eee;
              padding-top: 30px;
            }
            .footer p { margin-bottom: 5px; }
            .payment-info {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 30px 0;
              border-left: 4px solid #8b5cf6;
            }
            .payment-info h4 {
              color: #8b5cf6;
              margin-bottom: 10px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none !important; }
              .invoice-container { box-shadow: none; }
            }
            @page { margin: 1in; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <div class="company-info">
                <h1>Hairvana</h1>
                <p>Professional Salon Management Platform</p>
                <p>admin@hairvana.com | (555) 123-4567</p>
              </div>
              <div class="invoice-info">
                <h2>INVOICE</h2>
                <span class="status-badge status-${invoice.status}">${invoice.status.toUpperCase()}</span>
              </div>
            </div>

            <!-- Invoice Details -->
            <div class="invoice-details">
              <div class="bill-to">
                <h3>Bill To</h3>
                <p><strong>${subscription?.salonName}</strong></p>
                <p>${subscription?.ownerName}</p>
                <p>${subscription?.ownerEmail}</p>
                <p>Salon ID: ${subscription?.salonId}</p>
              </div>
              <div class="invoice-meta">
                <h3>Invoice Details</h3>
                <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Date:</strong> ${format(new Date(invoice.date), 'MMMM dd, yyyy')}</p>
                <p><strong>Due Date:</strong> ${format(new Date(invoice.date), 'MMMM dd, yyyy')}</p>
                <p><strong>Billing Period:</strong> ${format(new Date(invoice.date), 'MMM dd')} - ${format(new Date(new Date(invoice.date).getTime() + 30 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}</p>
              </div>
            </div>

            <!-- Service Details -->
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Plan</th>
                  <th>Billing Cycle</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${invoice.description}</strong><br>
                    <small>Subscription service for salon management platform</small>
                  </td>
                  <td>${subscription?.plan} Plan</td>
                  <td>${subscription?.billingCycle}</td>
                  <td>$${invoice.subtotal?.toFixed(2) || (invoice.amount - (invoice.taxAmount || 0)).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <!-- Payment Information -->
            <div class="payment-info">
              <h4>Payment Information</h4>
              <p><strong>Payment Method:</strong> ${subscription?.paymentMethod?.brand} ending in ${subscription?.paymentMethod?.last4}</p>
              <p><strong>Transaction ID:</strong> txn_${invoice.id}</p>
              <p><strong>Payment Date:</strong> ${format(new Date(invoice.date), 'MMMM dd, yyyy')}</p>
            </div>

            <!-- Totals -->
            <div class="totals-section">
              <table class="totals-table">
                <tr>
                  <td>Subtotal:</td>
                  <td>$${invoice.subtotal?.toFixed(2) || (invoice.amount - (invoice.taxAmount || 0)).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Tax (8%):</td>
                  <td>$${invoice.taxAmount?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr>
                  <td><strong>Total Amount:</strong></td>
                  <td><strong>$${invoice.amount.toFixed(2)}</strong></td>
                </tr>
              </table>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p><strong>Thank you for your business!</strong></p>
              <p>This invoice was generated automatically by the Hairvana platform.</p>
              <p>For questions about this invoice, please contact our support team.</p>
              <p style="margin-top: 20px; font-size: 10px; color: #999;">
                Hairvana Inc. | 123 Business Ave, Suite 100 | Business City, BC 12345
              </p>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.onafterprint = function() {
                  window.close();
                }
              }, 500);
            }
          </script>
        </body>
      </html>
    `;
  };

  const handlePrintInvoice = (invoice: BillingHistory) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to print invoices');
      return;
    }

    const invoiceHTML = generateInvoiceHTML(invoice);
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  const handleDownloadInvoice = (invoice: BillingHistory) => {
    // Create a blob with the HTML content
    const invoiceHTML = generateInvoiceHTML(invoice);
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Invoice downloaded',
      description: `Invoice ${invoice.invoiceNumber} has been downloaded successfully.`,
    });
  };

  const handleViewInvoice = (invoice: BillingHistory) => {
    const viewWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    if (!viewWindow) {
      alert('Please allow popups to view invoices');
      return;
    }

    const invoiceHTML = generateInvoiceHTML(invoice).replace(
      '<script>',
      '<!-- Auto-print disabled for view mode --><script style="display:none;">'
    );
    
    viewWindow.document.write(invoiceHTML);
    viewWindow.document.close();
  };

  const handleEmailInvoice = (invoice: BillingHistory) => {
    const subject = `Invoice ${invoice.invoiceNumber} - ${subscription?.salonName}`;
    const body = `Dear ${subscription?.ownerName},

Please find attached your invoice ${invoice.invoiceNumber} for ${subscription?.salonName}.

Invoice Details:
- Amount: $${invoice.amount.toFixed(2)}
- Date: ${format(new Date(invoice.date), 'MMMM dd, yyyy')}
- Status: ${invoice.status.toUpperCase()}

Thank you for your business!

Best regards,
Hairvana Team`;

    const mailtoLink = `mailto:${subscription?.ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const getAvailableUpgrades = (currentPlan: string) => {
    const planOrder = ['Basic', 'Standard', 'Premium'];
    const currentIndex = planOrder.indexOf(currentPlan);
    return plans.filter(plan => planOrder.indexOf(plan.name) > currentIndex);
  };

  const getAvailableDowngrades = (currentPlan: string) => {
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

  if (!subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Subscription not found</h2>
          <p className="text-gray-600 mt-2">The subscription you're looking for doesn't exist.</p>
          <Link to="/dashboard/subscriptions">
            <Button className="mt-4">Back to Subscriptions</Button>
          </Link>
        </div>
      </div>
    );
  }

  const PlanIcon = planIcons[subscription.plan];

  const bookingsPercentage = getUsagePercentage(subscription.usage.bookings, subscription.usage.bookingsLimit);
  const staffPercentage = getUsagePercentage(subscription.usage.staff, subscription.usage.staffLimit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/subscriptions">
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
          <Button variant="outline" onClick={handleSyncBilling} disabled={syncingBilling}>
            {syncingBilling ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Billing
          </Button>
          <Button variant="outline" onClick={handleEditSubscription}>
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
                  <Button variant="outline" className="text-blue-600 hover:text-blue-700" onClick={handleUpgradePlan}>
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                  <Button variant="outline" className="text-orange-600 hover:text-orange-700" onClick={handleDowngradePlan}>
                    <ArrowDownCircle className="h-4 w-4 mr-2" />
                    Downgrade Plan
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleCancelSubscription}>
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
              <Button variant="outline" className="w-full" onClick={handleUpdatePaymentMethod}>
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
              <Button variant="outline" size="sm" onClick={handleExportAll}>
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
              <Button variant="outline" size="sm" onClick={handleGenerateReport}>
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
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice)}
                      title="Download Invoice"
                      className="hover:bg-green-50 hover:text-green-600"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewInvoice(invoice)}
                      title="View Invoice"
                      className="hover:bg-purple-50 hover:text-purple-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEmailInvoice(invoice)}
                      title="Email Invoice"
                      className="hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Mail className="h-4 w-4" />
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
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleUpdatePaymentMethod}>
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

      {/* Edit Subscription Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update subscription details for {subscription.salonName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Plan</Label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <PlanIcon className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">{subscription.plan} Plan</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">${subscription.amount}/{subscription.billingCycle}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="billingCycle">Billing Cycle</Label>
              <select 
                id="billingCycle"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                defaultValue={subscription.billingCycle}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nextBillingDate">Next Billing Date</Label>
              <Input
                id="nextBillingDate"
                type="date"
                defaultValue={new Date(subscription.nextBillingDate).toISOString().split('T')[0]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                toast({
                  title: 'Subscription updated',
                  description: 'The subscription details have been updated successfully.',
                });
                setEditDialogOpen(false);
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Plan Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upgrade Subscription Plan</DialogTitle>
            <DialogDescription>
              Choose a higher tier plan for {subscription.salonName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Current Plan:</strong> {subscription.plan} - ${subscription.amount}/{subscription.billingCycle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getAvailableUpgrades(subscription.plan).map((plan) => {
                const PlanIcon = planIcons[plan.name];
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
            {getAvailableUpgrades(subscription.plan).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Crown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Already on the highest plan</p>
                <p className="text-sm">This subscription is already on the Premium plan.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setUpgradeDialogOpen(false);
              setSelectedNewPlan(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={confirmUpgradePlan}
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
              Choose a lower tier plan for {subscription.salonName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Current Plan:</strong> {subscription.plan} - ${subscription.amount}/{subscription.billingCycle}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Downgrading will reduce available features and limits.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getAvailableDowngrades(subscription.plan).map((plan) => {
                const PlanIcon = planIcons[plan.name];
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
            {getAvailableDowngrades(subscription.plan).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Already on the lowest plan</p>
                <p className="text-sm">This subscription is already on the Basic plan.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDowngradeDialogOpen(false);
              setSelectedNewPlan(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDowngradePlan}
              disabled={!selectedNewPlan}
              className="bg-orange-600 hover:bg-orange-700 text-black font-semibold"
            >
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Downgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the subscription for "{subscription.salonName}"? 
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
              onClick={confirmCancelSubscription}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Payment Method Dialog */}
      <Dialog open={paymentMethodDialogOpen} onOpenChange={setPaymentMethodDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Payment Method</DialogTitle>
            <DialogDescription>
              Enter new payment details for {subscription.salonName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {subscription.paymentMethod && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-800">
                  <strong>Current:</strong> {subscription.paymentMethod.brand} ending in {subscription.paymentMethod.last4}
                </p>
                <p className="text-xs text-gray-600">
                  Expires {subscription.paymentMethod.expiryMonth}/{subscription.paymentMethod.expiryYear}
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
            <Button variant="outline" onClick={() => {
              setPaymentMethodDialogOpen(false);
              setNewPaymentMethod({
                cardNumber: '',
                expiryMonth: '',
                expiryYear: '',
                cvv: '',
                cardholderName: '',
              });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={confirmUpdatePaymentMethod}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog open={generateReportDialogOpen} onOpenChange={setGenerateReportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Subscription Report</DialogTitle>
            <DialogDescription>
              Create a detailed report for this subscription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <select 
                id="reportType"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                defaultValue="billing"
              >
                <option value="billing">Billing History</option>
                <option value="usage">Usage Report</option>
                <option value="summary">Subscription Summary</option>
                <option value="comprehensive">Comprehensive Report</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <select 
                id="dateRange"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                defaultValue="all"
              >
                <option value="all">All Time</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="format">Report Format</Label>
              <select 
                id="format"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                defaultValue="pdf"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmGenerateReport}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}