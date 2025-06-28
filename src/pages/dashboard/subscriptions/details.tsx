import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  FileText,
  Receipt,
  Eye,
  ExternalLink,
  Mail,
  Phone,
  Loader
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  fetchSubscriptionById, 
  updateSubscription, 
  cancelSubscription, 
  syncBilling, 
  generateReport, 
  exportInvoices, 
  updatePaymentMethod,
  fetchSubscriptionPlans
} from '@/api/subscriptions';

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

export default function SubscriptionDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [downgradeDialogOpen, setDowngradeDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  
  // Form states
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [reportSettings, setReportSettings] = useState({
    reportType: 'summary',
    dateRange: '30d',
    format: 'pdf'
  });

  useEffect(() => {
    loadSubscription();
    loadPlans();
  }, [params.id]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await fetchSubscriptionById(params.id as string);
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const plans = await fetchSubscriptionPlans();
      setAvailablePlans(plans);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const handleSyncBilling = async () => {
    if (!subscription) return;
    
    try {
      setIsSyncing(true);
      const result = await syncBilling(subscription.id);
      
      toast({
        title: 'Billing synced',
        description: 'Billing data has been synchronized successfully',
      });
      
      // Refresh subscription data
      loadSubscription();
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: 'Failed to synchronize billing data',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEditSubscription = async (data: any) => {
    if (!subscription) return;
    
    try {
      await updateSubscription(subscription.id, data);
      
      toast({
        title: 'Subscription updated',
        description: 'Subscription details have been updated successfully',
      });
      
      setEditDialogOpen(false);
      loadSubscription();
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update subscription',
        variant: 'destructive',
      });
    }
  };

  const handleUpgradePlan = async () => {
    if (!subscription || !selectedPlan) return;
    
    try {
      const planId = selectedPlan.id;
      const amount = billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.price;
      
      await updateSubscription(subscription.id, {
        plan_id: planId,
        amount,
        billing_cycle: billingCycle
      });
      
      toast({
        title: 'Plan upgraded',
        description: `Subscription has been upgraded to ${selectedPlan.name} plan`,
      });
      
      setUpgradeDialogOpen(false);
      setSelectedPlan(null);
      loadSubscription();
    } catch (error) {
      toast({
        title: 'Upgrade failed',
        description: 'Failed to upgrade subscription plan',
        variant: 'destructive',
      });
    }
  };

  const handleDowngradePlan = async () => {
    if (!subscription || !selectedPlan) return;
    
    try {
      const planId = selectedPlan.id;
      const amount = billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.price;
      
      await updateSubscription(subscription.id, {
        plan_id: planId,
        amount,
        billing_cycle: billingCycle
      });
      
      toast({
        title: 'Plan downgraded',
        description: `Subscription has been downgraded to ${selectedPlan.name} plan`,
      });
      
      setDowngradeDialogOpen(false);
      setSelectedPlan(null);
      loadSubscription();
    } catch (error) {
      toast({
        title: 'Downgrade failed',
        description: 'Failed to downgrade subscription plan',
        variant: 'destructive',
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      await cancelSubscription(subscription.id);
      
      toast({
        title: 'Subscription cancelled',
        description: 'The subscription has been cancelled successfully',
      });
      
      setCancelDialogOpen(false);
      loadSubscription();
    } catch (error) {
      toast({
        title: 'Cancellation failed',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePaymentMethod = async () => {
    if (!subscription) return;
    
    try {
      const paymentData = {
        type: 'card',
        last4: paymentMethod.cardNumber.slice(-4),
        brand: getCardBrand(paymentMethod.cardNumber),
        expiryMonth: parseInt(paymentMethod.expiryMonth),
        expiryYear: parseInt(paymentMethod.expiryYear)
      };
      
      await updatePaymentMethod(subscription.id, paymentData);
      
      toast({
        title: 'Payment method updated',
        description: 'The payment method has been updated successfully',
      });
      
      setPaymentDialogOpen(false);
      setPaymentMethod({
        cardholderName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
      });
      loadSubscription();
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update payment method',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateReport = async () => {
    if (!subscription) return;
    
    try {
      const result = await generateReport(subscription.id, reportSettings);
      
      toast({
        title: 'Report generated',
        description: 'The report has been generated successfully',
      });
      
      // In a real app, you might download the report or open it in a new tab
      console.log('Report data:', result);
      
      setReportDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Report generation failed',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    }
  };

  const handleExportInvoices = async (format: string = 'csv') => {
    if (!subscription) return;
    
    try {
      const result = await exportInvoices(subscription.id, format);
      
      toast({
        title: 'Invoices exported',
        description: `Invoices have been exported as ${format.toUpperCase()}`,
      });
      
      // In a real app, you would download the file
      console.log('Export data:', result);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export invoices',
        variant: 'destructive',
      });
    }
  };

  const handlePrintInvoice = (invoice: BillingHistory) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Print failed',
        description: 'Please allow popups to print invoices',
        variant: 'destructive',
      });
      return;
    }
    
    const invoiceHTML = generateInvoiceHTML(invoice);
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const handleViewInvoice = (invoice: BillingHistory) => {
    const viewWindow = window.open('', '_blank');
    if (!viewWindow) {
      toast({
        title: 'View failed',
        description: 'Please allow popups to view invoices',
        variant: 'destructive',
      });
      return;
    }
    
    const invoiceHTML = generateInvoiceHTML(invoice);
    viewWindow.document.write(invoiceHTML);
    viewWindow.document.close();
  };

  const handleDownloadInvoice = (invoice: BillingHistory) => {
    const invoiceHTML = generateInvoiceHTML(invoice);
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.invoiceNumber || invoice.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Invoice downloaded',
      description: 'The invoice has been downloaded successfully',
    });
  };

  const handleEmailInvoice = (invoice: BillingHistory) => {
    if (!subscription) return;
    
    const subject = `Invoice ${invoice.invoiceNumber || invoice.id} - ${subscription.salonName}`;
    const body = `Dear ${subscription.ownerName},

Please find attached your invoice ${invoice.invoiceNumber || invoice.id} for ${subscription.salonName}.

Invoice Details:
- Amount: $${invoice.amount.toFixed(2)}
- Date: ${format(new Date(invoice.date), 'MMMM dd, yyyy')}
- Status: ${invoice.status.toUpperCase()}

Thank you for your business!

Best regards,
Hairvana Team`;

    const mailtoLink = `mailto:${subscription.ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    
    toast({
      title: 'Email prepared',
      description: 'Email client opened with invoice details',
    });
  };

  const getCardBrand = (cardNumber: string): string => {
    // Simple card brand detection based on first digit
    const firstDigit = cardNumber.charAt(0);
    switch (firstDigit) {
      case '3': return 'American Express';
      case '4': return 'Visa';
      case '5': return 'Mastercard';
      case '6': return 'Discover';
      default: return 'Unknown';
    }
  };

  const getAvailableUpgrades = (currentPlan: string): Plan[] => {
    const planOrder = ['Basic', 'Standard', 'Premium'];
    const currentIndex = planOrder.indexOf(currentPlan);
    return availablePlans.filter(plan => planOrder.indexOf(plan.name) > currentIndex);
  };

  const getAvailableDowngrades = (currentPlan: string): Plan[] => {
    const planOrder = ['Basic', 'Standard', 'Premium'];
    const currentIndex = planOrder.indexOf(currentPlan);
    return availablePlans.filter(plan => planOrder.indexOf(plan.name) < currentIndex);
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

  const generateInvoiceHTML = (invoice: BillingHistory): string => {
    if (!subscription) return '';
    
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${invoice.invoiceNumber || invoice.id}</title>
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
                <p><strong>${subscription.salonName}</strong></p>
                <p>${subscription.ownerName}</p>
                <p>${subscription.ownerEmail}</p>
                <p>Salon ID: ${subscription.salonId}</p>
              </div>
              <div class="invoice-meta">
                <h3>Invoice Details</h3>
                <p><strong>Invoice #:</strong> ${invoice.invoiceNumber || invoice.id}</p>
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
                  <td>${subscription.plan} Plan</td>
                  <td>${subscription.billingCycle}</td>
                  <td>$${invoice.subtotal?.toFixed(2) || (invoice.amount - (invoice.taxAmount || 0)).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <!-- Payment Information -->
            <div class="payment-info">
              <h4>Payment Information</h4>
              <p><strong>Payment Method:</strong> ${subscription.paymentMethod?.brand || 'N/A'} ending in ${subscription.paymentMethod?.last4 || 'N/A'}</p>
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
          <Button 
            variant="outline" 
            onClick={handleSyncBilling}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Billing
          </Button>
          <Button 
            variant="outline"
            onClick={() => setEditDialogOpen(true)}
          >
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
                  <Button 
                    variant="outline" 
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => setUpgradeDialogOpen(true)}
                  >
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-orange-600 hover:text-orange-700"
                    onClick={() => setDowngradeDialogOpen(true)}
                  >
                    <ArrowDownCircle className="h-4 w-4 mr-2" />
                    Downgrade Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setCancelDialogOpen(true)}
                  >
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
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setPaymentDialogOpen(true)}
              >
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportInvoices('csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setReportDialogOpen(true)}
              >
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
                      {format(new Date(invoice.date), 'MMM dd, yyyy')} • Invoice #{invoice.invoiceNumber || invoice.id}
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

            {subscription.billingHistory.length === 0 && (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No billing history</h3>
                <p className="text-gray-600">This subscription doesn't have any billing records yet.</p>
              </div>
            )}
          </div>

          {/* Billing Summary */}
          {subscription.billingHistory.length > 0 && (
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
          )}
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
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setPaymentDialogOpen(true)}
              >
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
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  handleEditSubscription({ status: 'active' });
                }}
              >
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
              <Label htmlFor="nextBillingDate">Next Billing Date</Label>
              <Input
                id="nextBillingDate"
                type="date"
                defaultValue={subscription.nextBillingDate.split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue={subscription.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingCycle">Billing Cycle</Label>
              <Select defaultValue={subscription.billingCycle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // In a real app, you would get values from form fields
                handleEditSubscription({
                  next_billing_date: document.getElementById('nextBillingDate')?.value,
                  status: (document.querySelector('[data-radix-select-value]') as HTMLElement)?.innerText.toLowerCase(),
                  billing_cycle: (document.querySelectorAll('[data-radix-select-value]')[1] as HTMLElement)?.innerText.toLowerCase()
                });
              }}
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
            
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
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
                  onClick={() => setBillingCycle('yearly')}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getAvailableUpgrades(subscription.plan).map((plan) => {
                const PlanIcon = planIcons[plan.name];
                const isSelected = selectedPlan?.id === plan.id;
                const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
                
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
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
                        <p className="text-lg font-semibold text-gray-900">${price}/{billingCycle}</p>
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
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpgradePlan}
              disabled={!selectedPlan}
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
            
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
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
                  onClick={() => setBillingCycle('yearly')}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getAvailableDowngrades(subscription.plan).map((plan) => {
                const PlanIcon = planIcons[plan.name];
                const isSelected = selectedPlan?.id === plan.id;
                const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
                
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
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
                        <p className="text-lg font-semibold text-gray-900">${price}/{billingCycle}</p>
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
            <Button variant="outline" onClick={() => setDowngradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDowngradePlan}
              disabled={!selectedPlan}
              className="bg-orange-600 hover:bg-orange-700"
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
              Are you sure you want to cancel the subscription for {subscription.salonName}? 
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
              onClick={handleCancelSubscription}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Payment Method Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
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
            
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={paymentMethod.cardholderName}
                onChange={(e) => setPaymentMethod(prev => ({ ...prev, cardholderName: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentMethod.cardNumber}
                onChange={(e) => setPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth">Month</Label>
                <Input
                  id="expiryMonth"
                  placeholder="MM"
                  value={paymentMethod.expiryMonth}
                  onChange={(e) => setPaymentMethod(prev => ({ ...prev, expiryMonth: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryYear">Year</Label>
                <Input
                  id="expiryYear"
                  placeholder="YYYY"
                  value={paymentMethod.expiryYear}
                  onChange={(e) => setPaymentMethod(prev => ({ ...prev, expiryYear: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentMethod.cvv}
                  onChange={(e) => setPaymentMethod(prev => ({ ...prev, cvv: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePaymentMethod}
              disabled={!paymentMethod.cardNumber || !paymentMethod.cardholderName}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Subscription Report</DialogTitle>
            <DialogDescription>
              Create a detailed report for {subscription.salonName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select 
                value={reportSettings.reportType}
                onValueChange={(value) => setReportSettings(prev => ({ ...prev, reportType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Subscription Summary</SelectItem>
                  <SelectItem value="billing">Billing History</SelectItem>
                  <SelectItem value="usage">Usage Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select 
                value={reportSettings.dateRange}
                onValueChange={(value) => setReportSettings(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="format">Report Format</Label>
              <Select 
                value={reportSettings.format}
                onValueChange={(value) => setReportSettings(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateReport}
              className="bg-purple-600 hover:bg-purple-700"
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