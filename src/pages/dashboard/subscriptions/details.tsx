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
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchSubscriptionById, 
  cancelSubscription, 
  syncBilling, 
  generateReport, 
  exportInvoices, 
  updatePaymentMethod 
} from '@/api/subscriptions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingBilling, setSyncingBilling] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [downgradeDialogOpen, setDowngradeDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
  });

  useEffect(() => {
    loadSubscription();
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
        description: 'Failed to load subscription details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncBilling = async () => {
    if (!subscription) return;
    
    try {
      setSyncingBilling(true);
      const result = await syncBilling(subscription.id);
      
      toast({
        title: 'Billing synced',
        description: 'Billing data has been synchronized successfully.',
      });
      
      // Refresh subscription data
      loadSubscription();
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: 'Failed to sync billing data. Please try again.',
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

  const handleUpdatePaymentMethod = async () => {
    if (!subscription) return;
    
    try {
      const paymentData = {
        type: 'card',
        last4: newPaymentMethod.cardNumber.slice(-4),
        brand: 'Visa', // In a real app, detect from card number
        expiryMonth: parseInt(newPaymentMethod.expiryMonth),
        expiryYear: parseInt(newPaymentMethod.expiryYear),
      };
      
      await updatePaymentMethod(subscription.id, paymentData);
      
      toast({
        title: 'Payment method updated',
        description: 'Your payment method has been updated successfully.',
      });
      
      setPaymentDialogOpen(false);
      setNewPaymentMethod({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
      });
      
      // Refresh subscription data
      loadSubscription();
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update payment method. Please try again.',
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
        description: 'The subscription has been cancelled successfully.',
      });
      
      setCancelDialogOpen(false);
      
      // Refresh subscription data
      loadSubscription();
    } catch (error) {
      toast({
        title: 'Cancellation failed',
        description: 'Failed to cancel subscription. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateReport = async () => {
    if (!subscription) return;
    
    try {
      setGeneratingReport(true);
      
      const reportData = {
        reportType: 'billing',
        dateRange: '30d',
        format: 'pdf'
      };
      
      const result = await generateReport(subscription.id, reportData);
      
      toast({
        title: 'Report generated',
        description: 'Your report has been generated successfully.',
      });
      
      // In a real app, you would provide a download link or open the report
    } catch (error) {
      toast({
        title: 'Report generation failed',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleExportInvoices = async () => {
    if (!subscription) return;
    
    try {
      setExporting(true);
      
      const result = await exportInvoices(subscription.id, 'csv');
      
      toast({
        title: 'Invoices exported',
        description: 'Your invoices have been exported successfully.',
      });
      
      // In a real app, you would provide a download link
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export invoices. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
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

    // Show success message
    toast({
      title: 'Invoice downloaded',
      description: `Invoice ${invoice.invoiceNumber} downloaded successfully!`,
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
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Billing
              </>
            )}
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
                  <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setCancelDialogOpen(true)}>
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
              <Button variant="outline" className="w-full" onClick={() => setPaymentDialogOpen(true)}>
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
              <Button variant="outline" size="sm" onClick={handleExportInvoices} disabled={exporting}>
                {exporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleGenerateReport} disabled={generatingReport}>
                {generatingReport ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
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
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setPaymentDialogOpen(true)}>
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
                <p className="font-medium">{subscription.plan} Plan</p>
                <p className="text-sm text-gray-600">${subscription.amount}/{subscription.billingCycle}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nextBillingDate">Next Billing Date</Label>
              <Input
                id="nextBillingDate"
                type="date"
                defaultValue={subscription.nextBillingDate.split('T')[0]}
              />
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Cancelling the subscription for <span className="font-semibold">{subscription.salonName}</span> will:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
              <li>Immediately revoke access to premium features</li>
              <li>Stop future billing cycles</li>
              <li>Allow access until the end of the current billing period</li>
            </ul>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                This action cannot be undone. The user will need to create a new subscription to regain access.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Subscription
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleCancelSubscription}>
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Plan Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Subscription Plan</DialogTitle>
            <DialogDescription>
              Select a higher tier plan for {subscription.salonName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-3 bg-blue-50 rounded-lg mb-4">
              <p className="text-blue-800">
                <span className="font-semibold">Current Plan:</span> {subscription.plan} (${subscription.amount}/{subscription.billingCycle})
              </p>
            </div>
            
            {subscription.plan !== 'Premium' && (
              <div className="space-y-4">
                {subscription.plan === 'Basic' && (
                  <div className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Standard Plan</h3>
                        <p className="text-lg font-semibold text-gray-900">$49.99/month</p>
                      </div>
                    </div>
                    <ul className="space-y-1 mt-3">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Up to 500 bookings/month
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Up to 10 staff members
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Advanced reporting
                      </li>
                    </ul>
                  </div>
                )}
                
                <div className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Premium Plan</h3>
                      <p className="text-lg font-semibold text-gray-900">$99.99/month</p>
                    </div>
                  </div>
                  <ul className="space-y-1 mt-3">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Unlimited bookings
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Unlimited staff members
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Multi-location support
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {subscription.plan === 'Premium' && (
              <div className="text-center py-6">
                <Crown className="h-12 w-12 mx-auto text-purple-300 mb-2" />
                <p className="text-gray-700 font-medium">Already on the highest plan</p>
                <p className="text-gray-500 text-sm">This subscription is already on the Premium plan.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={subscription.plan === 'Premium'}
            >
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Downgrade Plan Dialog */}
      <Dialog open={downgradeDialogOpen} onOpenChange={setDowngradeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Downgrade Subscription Plan</DialogTitle>
            <DialogDescription>
              Select a lower tier plan for {subscription.salonName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-3 bg-yellow-50 rounded-lg mb-4">
              <p className="text-yellow-800">
                <span className="font-semibold">Current Plan:</span> {subscription.plan} (${subscription.amount}/{subscription.billingCycle})
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                Downgrading will reduce available features and limits.
              </p>
            </div>
            
            {subscription.plan !== 'Basic' && (
              <div className="space-y-4">
                {subscription.plan === 'Premium' && (
                  <div className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Standard Plan</h3>
                        <p className="text-lg font-semibold text-gray-900">$49.99/month</p>
                      </div>
                    </div>
                    <ul className="space-y-1 mt-3">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Up to 500 bookings/month
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Up to 10 staff members
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Advanced reporting
                      </li>
                    </ul>
                  </div>
                )}
                
                <div className="p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Basic Plan</h3>
                      <p className="text-lg font-semibold text-gray-900">$19.99/month</p>
                    </div>
                  </div>
                  <ul className="space-y-1 mt-3">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Up to 100 bookings/month
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Up to 3 staff members
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Basic reporting
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {subscription.plan === 'Basic' && (
              <div className="text-center py-6">
                <Zap className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-700 font-medium">Already on the lowest plan</p>
                <p className="text-gray-500 text-sm">This subscription is already on the Basic plan.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDowngradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-orange-600 hover:bg-orange-700"
              disabled={subscription.plan === 'Basic'}
            >
              Downgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <div className="p-3 bg-gray-50 rounded-lg mb-2">
                <p className="text-sm font-medium">Current Payment Method</p>
                <p className="text-gray-700">
                  {subscription.paymentMethod.brand} ending in {subscription.paymentMethod.last4}
                </p>
                <p className="text-xs text-gray-500">
                  Expires {subscription.paymentMethod.expiryMonth}/{subscription.paymentMethod.expiryYear}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
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
              
              <div className="grid grid-cols-3 gap-3">
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
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleUpdatePaymentMethod}
              disabled={!newPaymentMethod.cardNumber || !newPaymentMethod.cardholderName}
            >
              Update Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}