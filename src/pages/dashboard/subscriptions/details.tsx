import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  Phone,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  fetchSubscriptionById,
  updateSubscription,
  cancelSubscription,
  fetchSubscriptionPlans,
  updatePaymentMethod,
} from "@/api/subscriptions";
import { createBillingHistory, fetchBillingHistoryById } from "@/api/billing-histories";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";

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
  invoice_number?: string;
  taxAmount?: number;
  subtotal?: number;
  tax_amount?: number;
  total?: number;
  transaction_id?: string;
  transactionId?: string;
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
  salonId?: string;
  salonName?: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  plan: "Basic" | "Standard" | "Premium";
  status: "active" | "trial" | "cancelled" | "past_due";
  startDate: string;
  nextBillingDate: string;
  amount: number;
  billingCycle: string;
  features: string[];
  usage: Usage;
  paymentMethod: PaymentMethod | null;
  billingHistory: BillingHistory[];
  salonPhone?: string;
  salonEmail?: string;
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

const statusColors = {
  active: "bg-green-100 text-green-800",
  trial: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  past_due: "bg-yellow-100 text-yellow-800",
};

const planColors = {
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

const billingStatusColors = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function SubscriptionDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshSession } = useAuthStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [downgradeDialogOpen, setDowngradeDialogOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedNewPlan, setSelectedNewPlan] = useState<Plan | null>(null);
  const [editBillingDialogOpen, setEditBillingDialogOpen] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
  });
  const [generateInvoiceDialogOpen, setGenerateInvoiceDialogOpen] =
    useState(false);
  const [newInvoice, setNewInvoice] = useState({
    amount: "",
    description: "",
    taxAmount: "",
    status: "paid",
    notes: "",
    date: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [editSubscriptionDialogOpen, setEditSubscriptionDialogOpen] = useState(false);
  const [editSubscriptionData, setEditSubscriptionData] = useState({
    billingCycle: "",
    autoRenew: true,
    trialDays: 0,
  });

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setSubscription(null); // Reset subscription to null when starting to fetch
        const data = await fetchSubscriptionById(params.id as string);
        console.log("data", data);
        setSubscription(data);
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setSubscription(null); // Ensure subscription is null on error
        toast({
          title: "Error",
          description: "Failed to load subscription details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSubscription();
    } else {
      setLoading(false);
      setSubscription(null);
    }
  }, [params.id, toast]);

  useEffect(() => {
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
    loadPlans();
  }, [toast]);

  const generateInvoiceHTML = (invoice: BillingHistory) => {
    // Fallbacks for subscription fields to avoid 'undefined' in invoice
    const salonName = subscription?.salonName || "";
    const ownerName = subscription?.ownerName || "";
    const ownerEmail = subscription?.ownerEmail || "";
    const salonPhone = subscription?.salonPhone || "";
    const salonEmail = subscription?.salonEmail || "";
    const plan = subscription?.plan || "";
    const billingCycle = subscription?.billingCycle || "";
    const paymentMethodBrand = subscription?.paymentMethod?.brand || "";
    const paymentMethodLast4 = subscription?.paymentMethod?.last4 || "";
    const paymentMethodExpiryMonth =
      subscription?.paymentMethod?.expiryMonth || "";
    const paymentMethodExpiryYear =
      subscription?.paymentMethod?.expiryYear || "";

    // Return a string, not JSX
    return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${
            invoice.invoiceNumber || invoice.invoice_number || ""
          }</title>
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
                <span class="status-badge status-${
                  invoice.status
                }">${invoice.status.toUpperCase()}</span>
              </div>
            </div>

            <!-- Invoice Details -->
            <div class="invoice-details">
              <div class="bill-to">
                <h3>Bill To</h3>
                <p><strong>${salonName}</strong></p>
                <p>${ownerName}</p>
                ${salonEmail ? `<p>Email: ${salonEmail}</p>` : ""}
                ${salonPhone ? `<p>Phone: ${salonPhone}</p>` : ""}
                ${
                  ownerEmail && ownerEmail !== salonEmail
                    ? `<p>Owner Email: ${ownerEmail}</p>`
                    : ""
                }
              </div>
              <div class="invoice-meta">
                <h3>Invoice Details</h3>
                <p><strong>Invoice #:</strong> ${
                  invoice.invoiceNumber || invoice.invoice_number || ""
                }</p>
                <p><strong>Date:</strong> ${
                  invoice.date && !isNaN(new Date(invoice.date).getTime())
                    ? format(new Date(invoice.date), "MMMM dd, yyyy")
                    : "N/A"
                }</p>
                <p><strong>Due Date:</strong> ${
                  invoice.date && !isNaN(new Date(invoice.date).getTime())
                    ? format(new Date(invoice.date), "MMMM dd, yyyy")
                    : "N/A"
                }</p>
                <p><strong>Billing Period:</strong> ${
                  invoice.date && !isNaN(new Date(invoice.date).getTime()) ? format(new Date(invoice.date), "MMM dd") : "N/A"
                } - ${
      invoice.date && !isNaN(new Date(invoice.date).getTime())
        ? format(
            new Date(
              new Date(invoice.date).getTime() + 30 * 24 * 60 * 60 * 1000
            ),
            "MMM dd, yyyy"
          )
        : "N/A"
    }</p>
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
                    <strong>${invoice.description || ""}</strong><br>
                    <small>Subscription service for salon management platform</small>
                  </td>
                  <td>${plan} Plan</td>
                  <td>${billingCycle}</td>
                  <td>$${
                    invoice.subtotal !== undefined
                      ? Number(invoice.subtotal).toFixed(2)
                      : Number(invoice.amount ?? 0).toFixed(2)
                  }</td>
                </tr>
              </tbody>
            </table>

            <!-- Payment Information -->
            <div class="payment-info">
              <h4>Payment Information</h4>
              <p><strong>Payment Method:</strong> ${paymentMethodBrand} ending in ${paymentMethodLast4}</p>
              <p><strong>Transaction ID:</strong> ${
                invoice.transaction_id ?? invoice.transactionId ?? ""
              }</p>
              <p><strong>Payment Date:</strong> ${
                invoice.date && !isNaN(new Date(invoice.date).getTime())
                  ? format(new Date(invoice.date), "MMMM dd, yyyy")
                  : "N/A"
              }</p>
            </div>

            <!-- Totals -->
            <div class="totals-section">
              <table class="totals-table">
                <tr>
                  <td>Subtotal:</td>
                  <td>$${
                    invoice.subtotal !== undefined
                      ? Number(invoice.subtotal).toFixed(2)
                      : (
                          Number(invoice.amount ?? 0) -
                          Number(invoice.taxAmount ?? invoice.tax_amount ?? 0)
                        ).toFixed(2)
                  }</td>
                </tr>
                <tr>
                  <td>Tax:</td>
                  <td>$${
                    invoice.taxAmount !== undefined
                      ? Number(invoice.taxAmount).toFixed(2)
                      : invoice.tax_amount !== undefined
                      ? Number(invoice.tax_amount).toFixed(2)
                      : "0.00"
                  }</td>
                </tr>
                <tr>
                  <td><strong>Total Amount:</strong></td>
                  <td><strong>$${Number(invoice.total ?? 0).toFixed(
                    2
                  )}</strong></td>
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
      </html>`;
  };

  const resolveInvoiceFromBackend = async (invoice: BillingHistory): Promise<BillingHistory> => {
    try {
      // If transaction_id already present, use as-is
      if (invoice.transaction_id || (invoice as any).transactionId) {
        return invoice;
      }
      // Fetch the latest record from backend to get canonical transaction_id
      const latest = await fetchBillingHistoryById(invoice.id);
      return { ...invoice, ...latest } as BillingHistory;
    } catch (e) {
      // On failure, return original invoice without fabricating any ID
      return invoice;
    }
  };

  const handlePrintInvoice = (invoice: BillingHistory) => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) {
      alert("Please allow popups to print invoices");
      return;
    }

    // Show temporary content to keep popup open while fetching
    printWindow.document.write("<html><body><p>Preparing invoice…</p></body></html>");
    printWindow.document.close();

    (async () => {
      const resolved = await resolveInvoiceFromBackend(invoice);
      const invoiceHTML = generateInvoiceHTML(resolved);
      printWindow.document.open();
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
    })();
  };

  const handleDownloadInvoice = async (invoice: BillingHistory) => {
    const resolved = await resolveInvoiceFromBackend(invoice);
    const invoiceHTML = generateInvoiceHTML(resolved);
    const blob = new Blob([invoiceHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${
      resolved.invoiceNumber || resolved.invoice_number
    }.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(
      `Invoice ${
        resolved.invoiceNumber || resolved.invoice_number
      } downloaded successfully!`
    );
  };

  const handleViewInvoice = async (invoice: BillingHistory) => {
    const viewWindow = window.open(
      "",
      "_blank",
      "width=900,height=700,scrollbars=yes"
    );
    if (!viewWindow) {
      alert("Please allow popups to view invoices");
      return;
    }

    const resolved = await resolveInvoiceFromBackend(invoice);
    const invoiceHTML = generateInvoiceHTML(resolved).replace(
      "<script>",
      '<!-- Auto-print disabled for view mode --><script style="display:none;">'
    );

    viewWindow.document.write(invoiceHTML);
    viewWindow.document.close();
  };

  const handleEmailInvoice = (invoice: BillingHistory) => {
    const subject = `Invoice ${
      invoice.invoiceNumber || invoice.invoice_number
    } - ${subscription?.salonName || subscription?.ownerName || "Subscription"}`;
    const body = `Dear ${subscription?.ownerName},

Please find attached your invoice ${
      invoice.invoiceNumber || invoice.invoice_number
    } for ${subscription?.salonName || subscription?.ownerName || "your subscription"}.

Invoice Details:
- Amount: $${Number(invoice.amount).toFixed(2)}
- Date: ${invoice.date && !isNaN(new Date(invoice.date).getTime()) ? format(new Date(invoice.date), "MMMM dd, yyyy") : "N/A"}
- Status: ${invoice.status.toUpperCase()}

Thank you for your business!

Best regards,
Hairvana Team`;

    const mailtoLink = `mailto:${
      subscription?.ownerEmail
    }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  // Dialog openers
  const openCancelDialog = () => setCancelDialogOpen(true);
  const openUpgradeDialog = () => setUpgradeDialogOpen(true);
  const openDowngradeDialog = () => setDowngradeDialogOpen(true);
  const openEditBillingDialog = () => setEditBillingDialogOpen(true);
  const openGenerateInvoiceDialog = () => {
    setFormErrors({});
    setNewInvoice((prev) => ({
      ...prev,
      amount: subscription?.amount ? String(subscription.amount) : "",
    }));
    setGenerateInvoiceDialogOpen(true);
  };

  const openEditSubscriptionDialog = () => {
    if (subscription) {
      setEditSubscriptionData({
        billingCycle: subscription?.billingCycle || "monthly",
        autoRenew: true, // You might want to get this from subscription data
        trialDays: 0, // You might want to get this from subscription data
      });
    }
    setEditSubscriptionDialogOpen(true);
  };

  // Confirm actions
  const confirmCancel = async () => {
    if (!subscription) return;
    try {
      await cancelSubscription(subscription.id);
      setSubscription({ ...subscription, status: "cancelled" });
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
    } finally {
      setCancelDialogOpen(false);
    }
  };

  const handleUpgradePlan = async () => {
    if (!subscription || !selectedNewPlan) return;
    try {
      await updateSubscription(subscription.id, {
        plan_id: selectedNewPlan.id,
        amount: selectedNewPlan.price,
      });
      setSubscription((prev) =>
        prev
          ? {
              ...prev,
              plan: selectedNewPlan.name as Subscription["plan"],
              amount: selectedNewPlan.price,
              usage: {
                ...prev.usage,
                bookingsLimit: selectedNewPlan.limits.bookings,
                staffLimit: selectedNewPlan.limits.staff,
                locationsLimit: selectedNewPlan.limits.locations,
              },
            }
          : prev
      );
      toast({
        title: "Plan upgraded successfully",
        description: `${subscription?.salonName || subscription?.ownerName || "Subscription"} has been upgraded to ${selectedNewPlan.name} plan.`,
      });
      setUpgradeDialogOpen(false);
      setSelectedNewPlan(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upgrade plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDowngradePlan = async () => {
    if (!subscription || !selectedNewPlan) return;
    try {
      await updateSubscription(subscription.id, {
        plan_id: selectedNewPlan.id,
        amount: selectedNewPlan.price,
      });
      setSubscription((prev) =>
        prev
          ? {
              ...prev,
              plan: selectedNewPlan.name as Subscription["plan"],
              amount: selectedNewPlan.price,
              usage: {
                ...prev.usage,
                bookingsLimit: selectedNewPlan.limits.bookings,
                staffLimit: selectedNewPlan.limits.staff,
                locationsLimit: selectedNewPlan.limits.locations,
              },
            }
          : prev
      );
      toast({
        title: "Plan downgraded successfully",
        description: `${subscription?.salonName || subscription?.ownerName || "Subscription"} has been downgraded to ${selectedNewPlan.name} plan.`,
      });
      setDowngradeDialogOpen(false);
      setSelectedNewPlan(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to downgrade plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePaymentMethod = async () => {
    if (!subscription) return;
    try {
      const paymentData = {
        type: "card",
        last4: newPaymentMethod.cardNumber.slice(-4),
        brand: "Visa", // In real app, detect from card number
        expiryMonth: parseInt(newPaymentMethod.expiryMonth),
        expiryYear: parseInt(newPaymentMethod.expiryYear),
      };
      await updatePaymentMethod(subscription.id, paymentData);
      setSubscription({ ...subscription, paymentMethod: paymentData });
      toast({
        title: "Payment method updated",
        description: "The payment method has been updated successfully.",
      });
      setEditBillingDialogOpen(false);
      setNewPaymentMethod({
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        cardholderName: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment method. Please try again.",
        variant: "destructive",
      });
    }
  };

  const validateInvoice = () => {
    const errors: { [key: string]: string } = {};
    if (
      !newInvoice.amount ||
      isNaN(Number(newInvoice.amount)) ||
      Number(newInvoice.amount) <= 0
    ) {
      errors.amount = "Amount must be a positive number";
    }
    if (!newInvoice.description) {
      errors.description = "Description is required";
    }
    if (
      newInvoice.taxAmount &&
      (isNaN(Number(newInvoice.taxAmount)) || Number(newInvoice.taxAmount) < 0)
    ) {
      errors.taxAmount = "Tax must be a non-negative number";
    }
    if (
      newInvoice.taxAmount &&
      Number(newInvoice.taxAmount) > Number(newInvoice.amount)
    ) {
      errors.taxAmount = "Tax cannot exceed amount";
    }
    return errors;
  };

  const handleUpdateSubscription = async () => {
    if (!subscription) return;
    try {
      await updateSubscription(subscription.id, {
        billing_cycle: editSubscriptionData.billingCycle,
        auto_renew: editSubscriptionData.autoRenew,
        trial_days: editSubscriptionData.trialDays,
      });
      
      setSubscription((prev) =>
        prev
          ? {
              ...prev,
              billingCycle: editSubscriptionData.billingCycle,
            }
          : prev
      );
      
      toast({
        title: "Subscription updated",
        description: "Subscription details have been updated successfully.",
      });
      
      setEditSubscriptionDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateInvoice = async () => {
    const errors = validateInvoice();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!subscription) return;
    
    // Check authentication before making API call
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "No authentication token found. Please log in again.",
        variant: "destructive",
      });
      return;
    }
    
    // Try to refresh session if needed
    const sessionRefreshed = await refreshSession();
    if (!sessionRefreshed) {
      toast({
        title: "Authentication Error",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      return;
    }
    
    setGeneratingInvoice(true);
    
    // Generate invoice number outside try block so it's available for retry
    const invoice_number = `INV-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 10000
    )}`;
    
    try {
      const created = await createBillingHistory({
        subscription_id: subscription.id,
        date: newInvoice.date ? new Date(newInvoice.date).toISOString() : new Date().toISOString(),
        amount: Number(newInvoice.amount),
        status: newInvoice.status,
        description: newInvoice.description,
        invoice_number: invoice_number,
        tax_amount: newInvoice.taxAmount ? Number(newInvoice.taxAmount) : undefined,
        notes: newInvoice.notes || undefined,
      });
      // Map backend snake_case fields to camelCase for frontend use
      const mappedInvoice = {
        ...created,
        amount: Number(created.amount),
        taxAmount:
          created.taxAmount !== undefined
            ? created.taxAmount
            : created.tax_amount,
        subtotal: created.subtotal,
        total:
          created.total !== undefined
            ? created.total
            : created.total_amount !== undefined
            ? created.total_amount
            : Number(created.amount) +
              Number(
                created.taxAmount !== undefined
                  ? created.taxAmount
                  : created.tax_amount || 0
              ),
        invoiceNumber:
          created.invoiceNumber !== undefined
            ? created.invoiceNumber
            : created.invoice_number,
      };
      setSubscription((prev) =>
        prev
          ? {
              ...prev,
              billingHistory: [mappedInvoice, ...prev.billingHistory],
            }
          : prev
      );
      toast({
        title: "Invoice generated!",
        description: `Invoice for $${Number(newInvoice.amount).toFixed(
          2
        )} created successfully.`,
        variant: "default",
      });
      setTimeout(() => {
        setGenerateInvoiceDialogOpen(false);
        setNewInvoice({
          amount: "",
          description: "",
          taxAmount: "",
          status: "paid",
          notes: "",
          date: "",
        });
      }, 1200);
    } catch (error: any) {
      console.error('Invoice generation error:', error);
      let errorMessage = "Failed to generate invoice. Please try again.";
      
      if (error.message) {
        if (error.message.includes("Unauthorized") || error.message.includes("No user")) {
          // Try to refresh session one more time
          const sessionRefreshed = await refreshSession();
          if (!sessionRefreshed) {
            errorMessage = "Your session has expired. Please log in again.";
          } else {
            // If session was refreshed, try the request again
            try {
              // Regenerate invoice number for retry to ensure it's unique
              const retryInvoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(
                Math.random() * 10000
              )}`;
              
              const created = await createBillingHistory({
                subscription_id: subscription.id,
                date: newInvoice.date ? new Date(newInvoice.date).toISOString() : new Date().toISOString(),
                amount: Number(newInvoice.amount),
                status: newInvoice.status,
                description: newInvoice.description,
                invoice_number: retryInvoiceNumber,
                tax_amount: newInvoice.taxAmount ? Number(newInvoice.taxAmount) : undefined,
                notes: newInvoice.notes || undefined,
              });
              
              // Map backend snake_case fields to camelCase for frontend use
              const mappedInvoice = {
                ...created,
                amount: Number(created.amount),
                taxAmount:
                  created.taxAmount !== undefined
                    ? created.taxAmount
                    : created.tax_amount,
                subtotal: created.subtotal,
                total:
                  created.total !== undefined
                    ? created.total
                    : created.total_amount !== undefined
                    ? created.total_amount
                    : Number(created.amount) +
                      Number(
                        created.taxAmount !== undefined
                          ? created.taxAmount
                          : created.tax_amount || 0
                      ),
                invoiceNumber:
                  created.invoiceNumber !== undefined
                    ? created.invoiceNumber
                    : created.invoice_number,
              };
              
              setSubscription((prev) =>
                prev
                  ? {
                      ...prev,
                      billingHistory: [mappedInvoice, ...prev.billingHistory],
                    }
                  : prev
              );
              
              toast({
                title: "Invoice generated!",
                description: `Invoice for $${Number(newInvoice.amount).toFixed(
                  2
                )} created successfully.`,
                variant: "default",
              });
              
              setTimeout(() => {
                setGenerateInvoiceDialogOpen(false);
                setNewInvoice({
                  amount: "",
                  description: "",
                  taxAmount: "",
                  status: "paid",
                  notes: "",
                  date: "",
                });
              }, 1200);
              
              return; // Success, exit early
            } catch (retryError: any) {
              console.error('Retry invoice generation error:', retryError);
              errorMessage = "Authentication failed. Please log in again.";
            }
          }
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // Plan helpers
  const getAvailableUpgrades = (currentPlan: string) => {
    const planOrder = ["Basic", "Standard", "Premium"];
    const currentIndex = planOrder.indexOf(currentPlan);
    return plans.filter((plan) => planOrder.indexOf(plan.name) > currentIndex);
  };
  const getAvailableDowngrades = (currentPlan: string) => {
    const planOrder = ["Basic", "Standard", "Premium"];
    const currentIndex = planOrder.indexOf(currentPlan);
    return plans.filter((plan) => planOrder.indexOf(plan.name) < currentIndex);
  };

  // Show loading spinner while loading or if subscription is null
  if (loading || !subscription) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      );
    }
    
    // If not loading but subscription is null, show not found
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Subscription not found
          </h2>
          <p className="text-gray-600 mt-2">
            The subscription you're looking for doesn't exist.
          </p>
          <Link to="/dashboard/subscriptions">
            <Button className="mt-4">Back to Subscriptions</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Helper functions
  const getUsagePercentage = (current: number, limit: number | "unlimited") => {
    if (limit === "unlimited") return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatDate = (dateString: string | null | undefined, formatString: string = "MMM dd, yyyy") => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return "N/A";
    }
    try {
      return format(new Date(dateString), formatString);
    } catch (error) {
      return "N/A";
    }
  };

  // Only calculate these if subscription exists
  const PlanIcon = subscription ? getPlanIcon(subscription.plan) : null;
  const bookingsPercentage = subscription ? getUsagePercentage(
    subscription.usage.bookings,
    subscription.usage.bookingsLimit
  ) : 0;
  const staffPercentage = subscription ? getUsagePercentage(
    subscription.usage.staff,
    subscription.usage.staffLimit
  ) : 0;

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
            <h1 className="text-2xl font-bold text-gray-900">
              {subscription?.salonName || subscription?.ownerName || "Subscription"} Details
            </h1>
            <p className="text-gray-600">Subscription Details & Management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Billing
          </Button>
          <Button variant="outline" onClick={openEditSubscriptionDialog}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Subscription
          </Button>
          <Button variant="outline" onClick={openGenerateInvoiceDialog}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Invoice
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
                  <AvatarImage
                    src="https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2"
                    alt={subscription?.salonName || subscription?.ownerName || "Salon"}
                  />
                  <AvatarFallback className="text-lg">
                    {(subscription?.salonName || subscription?.ownerName || "S")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                  {PlanIcon && <PlanIcon className="h-4 w-4 text-gray-600" />}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {subscription?.salonName || subscription?.ownerName || "Salon"}
                </h2>
                <p className="text-gray-600">{subscription?.ownerName || "Owner"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={planColors[subscription?.plan || "Basic"]}>
                    {subscription?.plan || "Basic"} Plan
                  </Badge>
                  <Badge className={statusColors[subscription?.status || "active"]}>
                    {subscription?.status || "active"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Started{" "}
                    {formatDate(subscription?.startDate, "MMM dd, yyyy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />${subscription?.amount || 0}/
                    {subscription?.billingCycle || "monthly"}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {subscription?.status === "active" && (
                <>
                  <Button
                    variant="outline"
                    className="text-blue-600 hover:text-blue-700"
                    onClick={openUpgradeDialog}
                  >
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                  <Button
                    variant="outline"
                    className="text-orange-600 hover:text-orange-700"
                    onClick={openDowngradeDialog}
                  >
                    <ArrowDownCircle className="h-4 w-4 mr-2" />
                    Downgrade Plan
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={openCancelDialog}
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
                <p className="text-sm font-medium text-gray-600">
                  Bookings Usage
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscription?.usage?.bookings || 0}
                  {subscription?.usage?.bookingsLimit !== "unlimited" &&
                    `/${subscription?.usage?.bookingsLimit}`}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            {subscription?.usage?.bookingsLimit !== "unlimited" && (
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-2 rounded-full ${getUsageColor(
                    bookingsPercentage
                  )}`}
                  style={{ width: `${bookingsPercentage}%` }}
                />
              </div>
            )}
            {subscription?.usage?.bookingsLimit === "unlimited" && (
              <p className="text-sm text-green-600 font-medium">Unlimited</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Staff Members
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscription?.usage?.staff || 0}
                  {subscription?.usage?.staffLimit !== "unlimited" &&
                    `/${subscription?.usage?.staffLimit}`}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
            {subscription?.usage?.staffLimit !== "unlimited" && (
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-2 rounded-full ${getUsageColor(
                    staffPercentage
                  )}`}
                  style={{ width: `${staffPercentage}%` }}
                />
              </div>
            )}
            {subscription?.usage?.staffLimit === "unlimited" && (
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
                  {subscription?.usage?.locations || 0}
                  {subscription?.usage?.locationsLimit !== "unlimited" &&
                    `/${subscription?.usage?.locationsLimit}`}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
            {subscription?.usage?.locationsLimit === "unlimited" ? (
              <p className="text-sm text-green-600 font-medium">Unlimited</p>
                          ) : (
                <p className="text-sm text-gray-600">
                  {(subscription?.usage?.locationsLimit || 0) -
                    (subscription?.usage?.locations || 0)}{" "}
                  remaining
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
                <p className="text-sm text-gray-600">
                  {subscription?.plan || "Basic"} - ${subscription?.amount || 0}/
                  {subscription?.billingCycle || "monthly"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Next Billing Date</p>
                <p className="text-sm text-gray-600">
                  {formatDate(subscription?.nextBillingDate, "MMMM dd, yyyy")}
                </p>
              </div>
            </div>
            {subscription?.paymentMethod && (
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-sm text-gray-600">
                    {subscription?.paymentMethod?.brand || "Card"} ending in{" "}
                    {subscription?.paymentMethod?.last4 || "****"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Expires {subscription?.paymentMethod?.expiryMonth || "MM"}/
                    {subscription?.paymentMethod?.expiryYear || "YYYY"}
                  </p>
                </div>
              </div>
            )}
            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={openEditBillingDialog}
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
              {(subscription?.features || []).map((feature, index) => (
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
            {(subscription?.billingHistory || []).map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {invoice.description}
                      </p>
                      <Badge
                        className={
                          billingStatusColors[
                            invoice.status as keyof typeof billingStatusColors
                          ]
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatDate(invoice.date, "MMM dd, yyyy")} • Invoice
                      #{invoice.invoiceNumber || invoice.invoice_number || ""}
                    </p>
                    {invoice.taxAmount && (
                      <p className="text-xs text-gray-500">
                        Subtotal: $
                        {invoice.subtotal
                          ? Number(invoice.subtotal).toFixed(2)
                          : "0.00"}{" "}
                        + Tax: $
                        {invoice.taxAmount
                          ? Number(invoice.taxAmount).toFixed(2)
                          : "0.00"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${Number(invoice.total ?? 0).toFixed(2)}
                    </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {subscription?.billingHistory?.length || 0}
                </p>
                <p className="text-sm text-gray-600">Total Invoices</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {
                    (subscription?.billingHistory || []).filter(
                      (inv) => inv.status === "paid"
                    ).length
                  }
                </p>
                <p className="text-sm text-gray-600">Paid Invoices</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  $
                  {(subscription?.billingHistory || [])
                    .reduce((sum, inv) => sum + Number(inv.total), 0)
                    .toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total Billed</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  $
                  {(subscription?.billingHistory || [])
                    .reduce((sum, inv) => sum + Number(inv.tax_amount || 0), 0)
                    .toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total Tax</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Alerts */}
      {subscription?.status === "trial" && (
        <Card className="border-0 shadow-sm border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertTriangle className="h-5 w-5" />
              Trial Period Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              This subscription is currently in trial period. The trial will end
              on{" "}
              {formatDate(subscription?.nextBillingDate, "MMMM dd, yyyy")}.
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

      {subscription?.status === "cancelled" && (
        <Card className="border-0 shadow-sm border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <XCircle className="h-5 w-5" />
              Subscription Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              This subscription has been cancelled. Access will continue until{" "}
              {formatDate(subscription?.nextBillingDate, "MMMM dd, yyyy")}.
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

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the subscription for "
              {subscription?.salonName || subscription?.ownerName || "this subscription"}"? This action will immediately revoke
              access to premium features and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              The salon will lose access to:
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
              Choose a higher tier plan for "{subscription?.salonName || subscription?.ownerName || "this subscription"}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Current Plan:</strong> {subscription?.plan} - $
                {subscription?.amount}/month
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscription &&
                getAvailableUpgrades(subscription?.plan || "Basic").map((plan) => {
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
            {subscription &&
              getAvailableUpgrades(subscription?.plan || "Basic").length === 0 && (
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
              Choose a lower tier plan for "{subscription?.salonName || subscription?.ownerName || "this subscription"}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Current Plan:</strong> {subscription?.plan} - $
                {subscription?.amount}/month
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Downgrading will reduce available features and limits.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscription &&
                getAvailableDowngrades(subscription?.plan || "Basic").map((plan) => {
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
                })}
            </div>
            {subscription &&
              getAvailableDowngrades(subscription?.plan || "Basic").length === 0 && (
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

      {/* Edit Billing Dialog */}
      <Dialog
        open={editBillingDialogOpen}
        onOpenChange={setEditBillingDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>
              Update the payment method for "{subscription?.salonName || subscription?.ownerName || "this subscription"}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {subscription?.paymentMethod && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-800">
                  <strong>Current:</strong> {subscription?.paymentMethod?.brand || "Card"}{" "}
                  ending in {subscription?.paymentMethod?.last4 || "****"}
                </p>
                <p className="text-xs text-gray-600">
                  Expires {subscription?.paymentMethod?.expiryMonth || "MM"}/
                  {subscription?.paymentMethod?.expiryYear || "YYYY"}
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
                  onChange={(e) =>
                    setNewPaymentMethod((prev) => ({
                      ...prev,
                      cardholderName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={newPaymentMethod.cardNumber}
                  onChange={(e) =>
                    setNewPaymentMethod((prev) => ({
                      ...prev,
                      cardNumber: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth">Month</Label>
                  <Input
                    id="expiryMonth"
                    placeholder="MM"
                    value={newPaymentMethod.expiryMonth}
                    onChange={(e) =>
                      setNewPaymentMethod((prev) => ({
                        ...prev,
                        expiryMonth: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryYear">Year</Label>
                  <Input
                    id="expiryYear"
                    placeholder="YYYY"
                    value={newPaymentMethod.expiryYear}
                    onChange={(e) =>
                      setNewPaymentMethod((prev) => ({
                        ...prev,
                        expiryYear: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={newPaymentMethod.cvv}
                    onChange={(e) =>
                      setNewPaymentMethod((prev) => ({
                        ...prev,
                        cvv: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditBillingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePaymentMethod}
              disabled={
                !newPaymentMethod.cardNumber || !newPaymentMethod.cardholderName
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Invoice Dialog */}
      <Dialog
        open={generateInvoiceDialogOpen}
        onOpenChange={setGenerateInvoiceDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for "{subscription?.salonName || subscription?.ownerName || "this subscription"}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Amount"
                value={newInvoice.amount}
                onChange={(e) =>
                  setNewInvoice((prev) => ({ ...prev, amount: e.target.value }))
                }
                className={formErrors.amount ? "border-red-500" : ""}
              />
              {formErrors.amount && (
                <p className="text-red-500 text-xs">{formErrors.amount}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Description"
                value={newInvoice.description}
                onChange={(e) =>
                  setNewInvoice((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={formErrors.description ? "border-red-500" : ""}
              />
              {formErrors.description && (
                <p className="text-red-500 text-xs">{formErrors.description}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxAmount">Tax Amount</Label>
              <Input
                id="taxAmount"
                type="number"
                placeholder="Tax Amount"
                value={newInvoice.taxAmount}
                onChange={(e) =>
                  setNewInvoice((prev) => ({
                    ...prev,
                    taxAmount: e.target.value,
                  }))
                }
                className={formErrors.taxAmount ? "border-red-500" : ""}
              />
              {formErrors.taxAmount && (
                <p className="text-red-500 text-xs">{formErrors.taxAmount}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                placeholder="Additional notes (optional)"
                value={newInvoice.notes}
                onChange={(e) =>
                  setNewInvoice((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="w-full border rounded px-2 py-1 min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Invoice Date</Label>
              <Input
                id="date"
                type="date"
                value={newInvoice.date}
                onChange={(e) =>
                  setNewInvoice((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full border rounded px-2 py-1"
                value={newInvoice.status}
                onChange={(e) =>
                  setNewInvoice((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            {/* Live preview of totals */}
            <div className="text-right text-sm mt-2">
              <span>
                Subtotal: ${Number(newInvoice.amount || 0).toFixed(2)}
              </span>
              <br />
              <span>Tax: ${Number(newInvoice.taxAmount || 0).toFixed(2)}</span>
              <br />
              <span className="font-bold">
                Total: $
                {(
                  Number(newInvoice.amount || 0) +
                  Number(newInvoice.taxAmount || 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGenerateInvoiceDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateInvoice}
              disabled={
                generatingInvoice ||
                Object.keys(formErrors).length > 0 ||
                !newInvoice.amount ||
                !newInvoice.description
              }
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              {generatingInvoice ? "Generating..." : "Generate Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subscription Dialog */}
      <Dialog
        open={editSubscriptionDialogOpen}
        onOpenChange={setEditSubscriptionDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update subscription settings for "{subscription?.salonName || subscription?.ownerName || "this subscription"}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="billingCycle">Billing Cycle</Label>
              <select
                id="billingCycle"
                className="w-full border rounded px-3 py-2"
                value={editSubscriptionData.billingCycle}
                onChange={(e) =>
                  setEditSubscriptionData((prev) => ({
                    ...prev,
                    billingCycle: e.target.value,
                  }))
                }
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trialDays">Trial Days</Label>
              <Input
                id="trialDays"
                type="number"
                min="0"
                max="30"
                placeholder="0"
                value={editSubscriptionData.trialDays}
                onChange={(e) =>
                  setEditSubscriptionData((prev) => ({
                    ...prev,
                    trialDays: parseInt(e.target.value) || 0,
                  }))
                }
              />
              <p className="text-xs text-gray-500">0-30 days trial period</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoRenew"
                checked={editSubscriptionData.autoRenew}
                onChange={(e) =>
                  setEditSubscriptionData((prev) => ({
                    ...prev,
                    autoRenew: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <Label htmlFor="autoRenew" className="text-sm">
                Enable automatic renewal
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditSubscriptionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSubscription}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Update Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
