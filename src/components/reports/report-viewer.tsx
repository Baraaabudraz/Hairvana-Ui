'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Optimize Recharts imports - only import what we use
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Download,
  Printer,
  Share2,
  Mail,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Building2,
  Activity,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  X,
  FileSpreadsheet,
  Loader2,
  Clock,
  AlertTriangle,
  Heart,
  Zap,
  Server,
  Star
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { exportReportToExcel, exportReportToPDF, ReportData } from '@/lib/report-export';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ReportSection {
  title: string;
  type: 'summary' | 'chart' | 'table';
  chartType?: 'line' | 'bar' | 'area' | 'pie';
  data: any;
  headers?: string[];
}

interface ReportData {
  title: string;
  metadata: {
    templateId: string;
    generatedAt: string;
    parameters: any;
    reportPeriod: string;
  };
  sections: ReportSection[];
}

interface ReportViewerProps {
  reportData: ReportData;
  onClose: () => void;
}

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export function ReportViewer({ reportData, onClose }: ReportViewerProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'excel' as 'excel' | 'pdf',
    includeCharts: true,
    includeExplanatoryNotes: true,
    includeMetadata: true,
    customFileName: ''
  });
  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a blob with the report HTML content
    const reportHTML = generateReportHTML(reportData);
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportData.title.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportReportToExcel(reportData as ReportData);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportReportToPDF(reportData as ReportData);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export to PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWithOptions = async () => {
    try {
      setIsExporting(true);
      if (exportOptions.format === 'excel') {
        await exportReportToExcel(reportData as ReportData);
      } else {
        await exportReportToPDF(reportData as ReportData);
      }
      setExportDialogOpen(false);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: reportData.title,
        text: `Check out this ${reportData.title} report`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Report link copied to clipboard!');
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(reportData.title);
    const body = encodeURIComponent(`Please find the ${reportData.title} report attached.\n\nGenerated on: ${safeFormatDate(reportData.metadata?.generatedAt)}\nReport Period: ${reportData.metadata?.reportPeriod}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const renderChart = (section: ReportSection) => {
    const { chartType, data } = section;

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey={Object.keys(data[0])[0]} className="text-gray-600" fontSize={12} />
              <YAxis className="text-gray-600" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {Object.keys(data[0]).slice(1).map((key, index) => (
                <Line 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stroke={COLORS[index % COLORS.length]} 
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey={Object.keys(data[0])[0]} className="text-gray-600" fontSize={12} />
              <YAxis className="text-gray-600" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {Object.keys(data[0]).slice(1).map((key, index) => (
                <Bar 
                  key={key}
                  dataKey={key} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey={Object.keys(data[0])[0]} className="text-gray-600" fontSize={12} />
              <YAxis className="text-gray-600" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {Object.keys(data[0]).slice(1).map((key, index) => (
                <Area 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stackId="1"
                  stroke={COLORS[index % COLORS.length]} 
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  const renderSummary = (section: ReportSection) => {
    const { data } = section;
    
    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(data).filter(([key, value]) => 
            (typeof value === 'number' || typeof value === 'string') && 
            !['keyInsights', 'keyMetrics', 'highlights', 'insights', 'systemHealth', 'note'].includes(key) &&
            !['userJourney', 'demographics', 'engagementMetrics', 'churnAnalysis'].includes(key) &&
            !['cancellationAnalysis', 'popularServices', 'peakTimes', 'seasonalPatterns', 'servicePreferences'].includes(key) &&
            !['revenue', 'expenses', 'profitMargin', 'cashFlow', 'financialRatios', 'costAnalysis', 'budgetVsActual'].includes(key) &&
            !['systemUptime', 'responseTimes', 'errorRates', 'userSessions', 'platformHealth', 'performanceMetrics', 'infrastructureStatus'].includes(key) &&
            !['customerSegments', 'purchasePatterns', 'satisfactionScores', 'feedbackAnalysis', 'lifetimeValue', 'preferenceTrends', 'serviceRatings'].includes(key)
          ).map(([key, value]) => (
            <div key={key} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {typeof value === 'number' ? 
                  (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('profit') ? 
                    `$${value.toLocaleString()}` : 
                    key.toLowerCase().includes('rate') || key.toLowerCase().includes('margin') ? 
                      `${value}%` : 
                      value.toLocaleString()
                  ) : 
                  String(value)
                }
              </p>
            </div>
          ))}
        </div>

        {/* Complex Data Objects */}
        {data.userJourney && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Journey Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{data.userJourney.totalUsers}</p>
                <p className="text-sm text-blue-700">Total Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{data.userJourney.usersWithAppointments}</p>
                <p className="text-sm text-blue-700">With Appointments</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{data.userJourney.usersWithReviews}</p>
                <p className="text-sm text-blue-700">With Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{data.userJourney.conversionToAppointments}</p>
                <p className="text-sm text-blue-700">Appointment Conversion</p>
              </div>
            </div>
          </div>
        )}

        {data.demographics && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              User Demographics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">{data.demographics.totalUsers}</p>
                <p className="text-sm text-green-700">Total Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">{data.demographics.activeUsers}</p>
                <p className="text-sm text-green-700">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">{data.demographics.activePercentage}</p>
                <p className="text-sm text-green-700">Active Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">{data.demographics.growthRate}</p>
                <p className="text-sm text-green-700">Growth Rate</p>
              </div>
            </div>
          </div>
        )}

        {data.engagementMetrics && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6">
            <h4 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Engagement Metrics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-900">{data.engagementMetrics.appointmentEngagement}</p>
                <p className="text-sm text-orange-700">Appointment Engagement</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-900">{data.engagementMetrics.reviewEngagement}</p>
                <p className="text-sm text-orange-700">Review Engagement</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-900">{data.engagementMetrics.overallEngagement}</p>
                <p className="text-sm text-orange-700">Overall Engagement</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-900">{data.engagementMetrics.totalUsers}</p>
                <p className="text-sm text-orange-700">Total Users</p>
              </div>
            </div>
          </div>
        )}

        {data.churnAnalysis && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
            <h4 className="font-semibold text-red-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Churn Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-900">{data.churnAnalysis.churnRate}</p>
                <p className="text-sm text-red-700">Churn Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-900">{data.churnAnalysis.retentionRate}</p>
                <p className="text-sm text-red-700">Retention Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-900">{data.churnAnalysis.churnedUsers}</p>
                <p className="text-sm text-red-700">Churned Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-900">{data.churnAnalysis.previousPeriodUsers}</p>
                <p className="text-sm text-red-700">Previous Period Users</p>
              </div>
            </div>
          </div>
        )}

        {data.cancellationAnalysis && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Cancellation Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-900">{data.cancellationAnalysis.cancellationRate}</p>
                <p className="text-sm text-yellow-700">Cancellation Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-900">{data.cancellationAnalysis.completionRate}</p>
                <p className="text-sm text-yellow-700">Completion Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-900">{data.cancellationAnalysis.cancelledAppointments}</p>
                <p className="text-sm text-yellow-700">Cancelled Appointments</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-900">{data.cancellationAnalysis.totalAppointments}</p>
                <p className="text-sm text-yellow-700">Total Appointments</p>
              </div>
            </div>
          </div>
        )}

        {data.popularServices && Array.isArray(data.popularServices) && data.popularServices.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-6">
            <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Popular Services
            </h4>
            <div className="space-y-3">
              {data.popularServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium text-purple-900">{service.name}</p>
                    <p className="text-sm text-purple-700">${service.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-900">{service.bookingCount}</p>
                    <p className="text-sm text-purple-700">bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.peakTimes && Array.isArray(data.peakTimes) && data.peakTimes.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
            <h4 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Peak Booking Times
            </h4>
            <div className="space-y-3">
              {data.peakTimes.map((time, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium text-indigo-900">{time.timeLabel}</p>
                    <p className="text-sm text-indigo-700">Hour {time.hour}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-900">{time.bookingCount}</p>
                    <p className="text-sm text-indigo-700">bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.seasonalPatterns && Array.isArray(data.seasonalPatterns) && data.seasonalPatterns.length > 0 && (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-6">
            <h4 className="font-semibold text-teal-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Seasonal Patterns
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {data.seasonalPatterns.slice(-6).map((pattern, index) => (
                <div key={index} className="text-center p-3 bg-white rounded-lg border">
                  <p className="text-lg font-bold text-teal-900">{pattern.bookings}</p>
                  <p className="text-sm text-teal-700">{pattern.month}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.servicePreferences && Array.isArray(data.servicePreferences) && data.servicePreferences.length > 0 && (
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-6">
            <h4 className="font-semibold text-pink-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Service Preferences
            </h4>
            <div className="space-y-3">
              {data.servicePreferences.slice(0, 5).map((pref, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium text-pink-900">{pref.serviceName}</p>
                    <p className="text-sm text-pink-700">{pref.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-pink-900">{pref.bookingCount}</p>
                    <p className="text-sm text-pink-700">bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.revenue && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-6">
            <h4 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Subscription Revenue Breakdown
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-900">${data.revenue.totalRevenue?.toLocaleString() || 0}</p>
                <p className="text-sm text-emerald-700">Total Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-900">${data.revenue.subscriptionRevenue?.toLocaleString() || 0}</p>
                <p className="text-sm text-emerald-700">Subscription Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-900">${data.revenue.monthlyRevenue?.toLocaleString() || 0}</p>
                <p className="text-sm text-emerald-700">Monthly Revenue</p>
                <p className="text-xs text-emerald-600 mt-1">
                  (Monthly subscriptions + Annual subscriptions ÷ 12)
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-900">${data.revenue.yearlyRevenue?.toLocaleString() || 0}</p>
                <p className="text-sm text-emerald-700">Yearly Revenue</p>
              </div>
            </div>
            
            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-emerald-200">
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-800">${data.revenue.actualMonthlySubscriptions?.toLocaleString() || 0}</p>
                <p className="text-sm text-emerald-600">Actual Monthly Subscriptions</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-800">${data.revenue.actualAnnualSubscriptions?.toLocaleString() || 0}</p>
                <p className="text-sm text-emerald-600">Actual Annual Subscriptions</p>
              </div>
            </div>
            
            {/* Calculation Explanation */}
            <div className="mt-4 p-3 bg-emerald-100 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-800 font-medium mb-1">Monthly Revenue Calculation:</p>
              <p className="text-xs text-emerald-700">
                Monthly Revenue = Actual Monthly Subscriptions + (Actual Annual Subscriptions ÷ 12)
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                This represents your total monthly cash flow equivalent from all subscription types.
              </p>
            </div>
          </div>
        )}

        {data.expenses && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
            <h4 className="font-semibold text-red-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Expense Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-900">${data.expenses.totalExpenses?.toLocaleString() || 0}</p>
                <p className="text-sm text-red-700">Total Expenses</p>
                <p className="text-xs text-red-600 mt-1">(30% of subscription revenue)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-900">${data.expenses.operationalExpenses?.toLocaleString() || 0}</p>
                <p className="text-sm text-red-700">Operational</p>
                <p className="text-xs text-red-600 mt-1">(70% of total expenses)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-900">${data.expenses.marketingExpenses?.toLocaleString() || 0}</p>
                <p className="text-sm text-red-700">Marketing</p>
                <p className="text-xs text-red-600 mt-1">(20% of total expenses)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-900">{data.expenses.expenseRatio || '0%'}</p>
                <p className="text-sm text-red-700">Expense Ratio</p>
                <p className="text-xs text-red-600 mt-1">(Expenses ÷ Revenue)</p>
              </div>
            </div>
            
            {/* Expense Explanation */}
            <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 font-medium mb-1">Expense Calculation:</p>
              <p className="text-xs text-red-700">
                Total Expenses = 30% of Subscription Revenue (industry standard for SaaS businesses)
              </p>
              <p className="text-xs text-red-600 mt-1">
                Breakdown: 70% Operational (hosting, support, maintenance), 20% Marketing (customer acquisition), 10% Administrative (overhead)
              </p>
            </div>
          </div>
        )}

        {data.profitMargin && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Profit Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{data.profitMargin.profitMargin || '0%'}</p>
                <p className="text-sm text-blue-700">Profit Margin</p>
                <p className="text-xs text-blue-600 mt-1">(Gross Profit ÷ Revenue)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">${data.profitMargin.grossProfit?.toLocaleString() || 0}</p>
                <p className="text-sm text-blue-700">Gross Profit</p>
                <p className="text-xs text-blue-600 mt-1">(Revenue - Total Costs)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">${data.profitMargin.totalCosts?.toLocaleString() || 0}</p>
                <p className="text-sm text-blue-700">Total Costs</p>
                <p className="text-xs text-blue-600 mt-1">(30% of revenue)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">${data.profitMargin.netProfit?.toLocaleString() || 0}</p>
                <p className="text-sm text-blue-700">Net Profit</p>
                <p className="text-xs text-blue-600 mt-1">(After additional costs)</p>
              </div>
            </div>
            
            {/* Profit Explanation */}
            <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-1">Profit Calculation:</p>
              <p className="text-xs text-blue-700">
                Gross Profit = Total Revenue - Total Costs (30% of revenue)
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Net Profit = Gross Profit - Additional Costs (10% for taxes, fees, etc.)
              </p>
            </div>
          </div>
        )}

        {data.cashFlow && (
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-6">
            <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cash Flow Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-900">${data.cashFlow.operatingCashFlow?.toLocaleString() || 0}</p>
                <p className="text-sm text-purple-700">Operating Cash Flow</p>
                <p className="text-xs text-purple-600 mt-1">(70% of revenue)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-900">${data.cashFlow.investingCashFlow?.toLocaleString() || 0}</p>
                <p className="text-sm text-purple-700">Investing Cash Flow</p>
                <p className="text-xs text-purple-600 mt-1">(-10% of revenue)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-900">${data.cashFlow.netCashFlow?.toLocaleString() || 0}</p>
                <p className="text-sm text-purple-700">Net Cash Flow</p>
                <p className="text-xs text-purple-600 mt-1">(Sum of all flows)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-900">{data.cashFlow.cashFlowMargin || '0%'}</p>
                <p className="text-sm text-purple-700">Cash Flow Margin</p>
                <p className="text-xs text-purple-600 mt-1">(Net Flow ÷ Revenue)</p>
              </div>
            </div>
            
            {/* Cash Flow Explanation */}
            <div className="mt-4 p-3 bg-purple-100 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800 font-medium mb-1">Cash Flow Calculation:</p>
              <p className="text-xs text-purple-700">
                Operating: 70% of revenue (core business operations), Investing: -10% of revenue (capital investments), Financing: 5% of revenue (funding activities)
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Net Cash Flow = Operating + Investing + Financing (represents monthly cash position)
              </p>
            </div>
          </div>
        )}

        {data.financialRatios && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-6">
            <h4 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Financial Ratios
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-900">{data.financialRatios.profitMargin || '0%'}</p>
                <p className="text-sm text-amber-700">Profit Margin</p>
                <p className="text-xs text-amber-600 mt-1">(Gross Profit ÷ Revenue)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-900">{data.financialRatios.operatingMargin || '0%'}</p>
                <p className="text-sm text-amber-700">Operating Margin</p>
                <p className="text-xs text-amber-600 mt-1">(Operating Income ÷ Revenue)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-900">{data.financialRatios.netMargin || '0%'}</p>
                <p className="text-sm text-amber-700">Net Margin</p>
                <p className="text-xs text-amber-600 mt-1">(Net Profit ÷ Revenue)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-900">{data.financialRatios.revenueGrowth || '0%'}</p>
                <p className="text-sm text-amber-700">Revenue Growth</p>
                <p className="text-xs text-amber-600 mt-1">(YoY comparison)</p>
              </div>
            </div>
            
            {/* Financial Ratios Explanation */}
            <div className="mt-4 p-3 bg-amber-100 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800 font-medium mb-1">Financial Ratios:</p>
              <p className="text-xs text-amber-700">
                Profit Margin: 70% (industry standard for SaaS), Operating Margin: 70% (before additional costs), Net Margin: 65% (after all costs)
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Revenue Growth: 0% (requires historical data for year-over-year comparison)
              </p>
            </div>
          </div>
        )}

        {data.costAnalysis && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
            <h4 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Cost Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-900">${data.costAnalysis.totalCosts?.toLocaleString() || 0}</p>
                <p className="text-sm text-orange-700">Total Costs</p>
                <p className="text-xs text-orange-600 mt-1">(30% of revenue)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-900">${data.costAnalysis.operationalCosts?.toLocaleString() || 0}</p>
                <p className="text-sm text-orange-700">Operational Costs</p>
                <p className="text-xs text-orange-600 mt-1">(80% of total costs)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-900">${data.costAnalysis.marketingCosts?.toLocaleString() || 0}</p>
                <p className="text-sm text-orange-700">Marketing Costs</p>
                <p className="text-xs text-orange-600 mt-1">(15% of total costs)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-900">{data.costAnalysis.costPercentage || '0%'}</p>
                <p className="text-sm text-orange-700">Cost Percentage</p>
                <p className="text-xs text-orange-600 mt-1">(Costs ÷ Revenue)</p>
              </div>
            </div>
            
            {/* Cost Analysis Explanation */}
            <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800 font-medium mb-1">Cost Analysis:</p>
              <p className="text-xs text-orange-700">
                Total Costs = 30% of Subscription Revenue (industry standard for SaaS businesses)
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Breakdown: 80% Operational (hosting, support, maintenance), 15% Marketing (customer acquisition), 5% Administrative (overhead)
              </p>
            </div>
          </div>
        )}

        {data.budgetVsActual && (
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6">
            <h4 className="font-semibold text-cyan-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Budget vs Actual
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-900">${data.budgetVsActual.budgetedRevenue?.toLocaleString() || 0}</p>
                <p className="text-sm text-cyan-700">Budgeted Revenue</p>
                <p className="text-xs text-cyan-600 mt-1">(120% of actual)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-900">${data.budgetVsActual.actualRevenue?.toLocaleString() || 0}</p>
                <p className="text-sm text-cyan-700">Actual Revenue</p>
                <p className="text-xs text-cyan-600 mt-1">(Current subscriptions)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-900">${data.budgetVsActual.variance?.toLocaleString() || 0}</p>
                <p className="text-sm text-cyan-700">Variance</p>
                <p className="text-xs text-cyan-600 mt-1">(Actual - Budget)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-900">{data.budgetVsActual.performance || 'N/A'}</p>
                <p className="text-sm text-cyan-700">Performance</p>
                <p className="text-xs text-cyan-600 mt-1">(vs target)</p>
              </div>
            </div>
            
            {/* Budget vs Actual Explanation */}
            <div className="mt-4 p-3 bg-cyan-100 rounded-lg border border-cyan-200">
              <p className="text-sm text-cyan-800 font-medium mb-1">Budget vs Actual:</p>
              <p className="text-xs text-cyan-700">
                Budgeted Revenue = 120% of Actual Revenue (demonstration target for growth planning)
              </p>
              <p className="text-xs text-cyan-600 mt-1">
                Variance = Actual Revenue - Budgeted Revenue (negative means below target, positive means above target)
              </p>
            </div>
          </div>
        )}

        {/* Operational Metrics */}
        {data.systemUptime && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Uptime
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">{data.systemUptime.uptimePercentage}%</p>
                <p className="text-sm text-green-700">Uptime Percentage</p>
                <p className="text-xs text-green-600 mt-1">Current period</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">{data.systemUptime.downtimeHours}h</p>
                <p className="text-sm text-green-700">Downtime Hours</p>
                <p className="text-xs text-green-600 mt-1">Total downtime</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">{data.systemUptime.averageUptime}</p>
                <p className="text-sm text-green-700">Average Uptime</p>
                <p className="text-xs text-green-600 mt-1">30-day average</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">{data.systemUptime.status}</p>
                <p className="text-sm text-green-700">Status</p>
                <p className="text-xs text-green-600 mt-1">Overall health</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium mb-1">Last Incident:</p>
              <p className="text-xs text-green-700">{data.systemUptime.lastIncident}</p>
            </div>
          </div>
        )}

        {data.responseTimes && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Response Times
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{data.responseTimes.averageResponseTime}ms</p>
                <p className="text-sm text-blue-700">Average Response</p>
                <p className="text-xs text-blue-600 mt-1">Overall system</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{data.responseTimes.apiResponseTime}ms</p>
                <p className="text-sm text-blue-700">API Response</p>
                <p className="text-xs text-blue-600 mt-1">Backend APIs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{data.responseTimes.pageLoadTime}ms</p>
                <p className="text-sm text-blue-700">Page Load</p>
                <p className="text-xs text-blue-600 mt-1">Frontend pages</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{data.responseTimes.databaseQueryTime}ms</p>
                <p className="text-sm text-blue-700">Database Query</p>
                <p className="text-xs text-blue-600 mt-1">DB operations</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-1">Status:</p>
              <p className="text-xs text-blue-700">{data.responseTimes.status}</p>
            </div>
          </div>
        )}

        {data.errorRates && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
            <h4 className="font-semibold text-red-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Rates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-900">{data.errorRates.errorRate}%</p>
                <p className="text-sm text-red-700">Error Rate</p>
                <p className="text-xs text-red-600 mt-1">Overall system</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-900">{data.errorRates.totalErrors}</p>
                <p className="text-sm text-red-700">Total Errors</p>
                <p className="text-xs text-red-600 mt-1">Current period</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-900">{data.errorRates.criticalErrors}</p>
                <p className="text-sm text-red-700">Critical Errors</p>
                <p className="text-xs text-red-600 mt-1">High priority</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-900">{data.errorRates.warningErrors}</p>
                <p className="text-sm text-red-700">Warning Errors</p>
                <p className="text-xs text-red-600 mt-1">Medium priority</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 font-medium mb-1">Status:</p>
              <p className="text-xs text-red-700">{data.errorRates.status} - {data.errorRates.infoErrors} info-level errors</p>
            </div>
          </div>
        )}

        {data.userSessions && (
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-6">
            <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Sessions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-900">{data.userSessions.activeSessions}</p>
                <p className="text-sm text-purple-700">Active Sessions</p>
                <p className="text-xs text-purple-600 mt-1">Last 24 hours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-900">{data.userSessions.totalUsers}</p>
                <p className="text-sm text-purple-700">Total Users</p>
                <p className="text-xs text-purple-600 mt-1">Registered users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-900">{data.userSessions.averageSessionDuration}m</p>
                <p className="text-sm text-purple-700">Avg Session Duration</p>
                <p className="text-xs text-purple-600 mt-1">Minutes per session</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-900">{data.userSessions.peakConcurrentUsers}</p>
                <p className="text-sm text-purple-700">Peak Concurrent</p>
                <p className="text-xs text-purple-600 mt-1">Maximum simultaneous</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-purple-100 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800 font-medium mb-1">Status:</p>
              <p className="text-xs text-purple-700">{data.userSessions.status}</p>
            </div>
          </div>
        )}

        {data.platformHealth && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
            <h4 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Platform Health
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-900">{data.platformHealth.overallHealth}%</p>
                <p className="text-sm text-emerald-700">Overall Health</p>
                <p className="text-xs text-emerald-600 mt-1">System health score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-900">{data.platformHealth.cpuUsage}%</p>
                <p className="text-sm text-emerald-700">CPU Usage</p>
                <p className="text-xs text-emerald-600 mt-1">Current utilization</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-900">{data.platformHealth.memoryUsage}%</p>
                <p className="text-sm text-emerald-700">Memory Usage</p>
                <p className="text-xs text-emerald-600 mt-1">RAM utilization</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-900">{data.platformHealth.diskUsage}%</p>
                <p className="text-sm text-emerald-700">Disk Usage</p>
                <p className="text-xs text-emerald-600 mt-1">Storage utilization</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-emerald-100 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-800 font-medium mb-1">Network Latency:</p>
              <p className="text-xs text-emerald-700">{data.platformHealth.networkLatency}ms - Status: {data.platformHealth.status}</p>
            </div>
          </div>
        )}

        {data.performanceMetrics && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6">
            <h4 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Metrics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-900">{data.performanceMetrics.throughput}</p>
                <p className="text-sm text-orange-700">Throughput</p>
                <p className="text-xs text-orange-600 mt-1">Requests per minute</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-900">{data.performanceMetrics.averageLatency}ms</p>
                <p className="text-sm text-orange-700">Average Latency</p>
                <p className="text-xs text-orange-600 mt-1">Response time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-900">{data.performanceMetrics.availability}%</p>
                <p className="text-sm text-orange-700">Availability</p>
                <p className="text-xs text-orange-600 mt-1">Uptime percentage</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-900">{data.performanceMetrics.cacheHitRate}%</p>
                <p className="text-sm text-orange-700">Cache Hit Rate</p>
                <p className="text-xs text-orange-600 mt-1">Cache efficiency</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800 font-medium mb-1">Database Connections:</p>
              <p className="text-xs text-orange-700">{data.performanceMetrics.databaseConnections} active connections - Status: {data.performanceMetrics.status}</p>
            </div>
          </div>
        )}

        {data.infrastructureStatus && (
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-lg p-6">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Server className="h-5 w-5" />
              Infrastructure Status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{data.infrastructureStatus.servers}</p>
                <p className="text-sm text-slate-700">Servers</p>
                <p className="text-xs text-slate-600 mt-1">Web servers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{data.infrastructureStatus.database}</p>
                <p className="text-sm text-slate-700">Database</p>
                <p className="text-xs text-slate-600 mt-1">Data storage</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{data.infrastructureStatus.cache}</p>
                <p className="text-sm text-slate-700">Cache</p>
                <p className="text-xs text-slate-600 mt-1">Redis/Memcached</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{data.infrastructureStatus.cdn}</p>
                <p className="text-sm text-slate-700">CDN</p>
                <p className="text-xs text-slate-600 mt-1">Content delivery</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-slate-100 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-800 font-medium mb-1">Load Balancer:</p>
              <p className="text-xs text-slate-700">{data.infrastructureStatus.loadBalancer} - Monitoring: {data.infrastructureStatus.monitoring}</p>
              <p className="text-xs text-slate-600 mt-1">Overall Status: {data.infrastructureStatus.status}</p>
            </div>
          </div>
        )}

        {/* Customer Insights */}
        {data.customerSegments && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Segments
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-900">{data.customerSegments.totalUsers}</p>
                <p className="text-sm text-purple-700">Total Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-900">{data.customerSegments.activeUsers}</p>
                <p className="text-sm text-purple-700">Active Users</p>
                <p className="text-xs text-purple-600 mt-1">({data.customerSegments.activePercentage}%)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-900">{data.customerSegments.premiumUsers}</p>
                <p className="text-sm text-purple-700">Premium Users</p>
                <p className="text-xs text-purple-600 mt-1">({data.customerSegments.premiumPercentage}%)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-900">{data.customerSegments.newUsers}</p>
                <p className="text-sm text-purple-700">New Users</p>
                <p className="text-xs text-purple-600 mt-1">(Last 30 days)</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-purple-100 rounded-lg">
                <p className="text-lg font-bold text-purple-900">{data.customerSegments.regularUsers}</p>
                <p className="text-sm text-purple-700">Regular Users</p>
                <p className="text-xs text-purple-600 mt-1">(With appointments)</p>
              </div>
              <div className="text-center p-3 bg-purple-100 rounded-lg">
                <p className="text-lg font-bold text-purple-900">{data.customerSegments.inactiveUsers}</p>
                <p className="text-sm text-purple-700">Inactive Users</p>
                <p className="text-xs text-purple-600 mt-1">(No recent activity)</p>
              </div>
              <div className="text-center p-3 bg-purple-100 rounded-lg">
                <p className="text-lg font-bold text-purple-900">{data.customerSegments.usersWithReviews}</p>
                <p className="text-sm text-purple-700">Users with Reviews</p>
                <p className="text-xs text-purple-600 mt-1">(Engaged users)</p>
              </div>
            </div>
          </div>
        )}

        {data.purchasePatterns && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Purchase Patterns
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">{data.purchasePatterns.monthlySubscriptions}</p>
                <p className="text-sm text-green-700">Monthly Subscriptions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">{data.purchasePatterns.annualSubscriptions}</p>
                <p className="text-sm text-green-700">Annual Subscriptions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">{data.purchasePatterns.recentSubscriptions}</p>
                <p className="text-sm text-green-700">Recent Subscriptions</p>
                <p className="text-xs text-green-600 mt-1">(Last 30 days)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">{data.purchasePatterns.completionRate}%</p>
                <p className="text-sm text-green-700">Completion Rate</p>
                <p className="text-xs text-green-600 mt-1">(Appointments)</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-2">Revenue Breakdown</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Monthly Revenue:</span>
                    <span className="text-sm font-bold text-green-900">${data.purchasePatterns.monthlyRevenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Annual Revenue:</span>
                    <span className="text-sm font-bold text-green-900">${data.purchasePatterns.annualRevenue}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-2">Appointment Stats</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Total Appointments:</span>
                    <span className="text-sm font-bold text-green-900">{data.purchasePatterns.totalAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Completed:</span>
                    <span className="text-sm font-bold text-green-900">{data.purchasePatterns.completedAppointments}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {data.satisfactionScores && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Satisfaction Scores
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-900">{data.satisfactionScores.averageRating}</p>
                <p className="text-sm text-yellow-700">Average Rating</p>
                <p className="text-xs text-yellow-600 mt-1">(Out of 5)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-900">{data.satisfactionScores.satisfactionScore}</p>
                <p className="text-sm text-yellow-700">Satisfaction Score</p>
                <p className="text-xs text-yellow-600 mt-1">(Out of 100)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-900">{data.satisfactionScores.totalReviews}</p>
                <p className="text-sm text-yellow-700">Total Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-900">{data.satisfactionScores.recentReviews}</p>
                <p className="text-sm text-yellow-700">Recent Reviews</p>
                <p className="text-xs text-yellow-600 mt-1">(Last 30 days)</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-yellow-800 font-medium">Trend:</span>
                <span className={`text-sm font-bold ${
                  data.satisfactionScores.trend === 'improving' ? 'text-green-600' :
                  data.satisfactionScores.trend === 'declining' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {data.satisfactionScores.trend === 'improving' ? '↗️ Improving' :
                   data.satisfactionScores.trend === 'declining' ? '↘️ Declining' :
                   '→ Stable'}
                </span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Recent Average: {data.satisfactionScores.recentAverageRating} vs Overall: {data.satisfactionScores.averageRating}
              </p>
            </div>
          </div>
        )}

        {data.feedbackAnalysis && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Feedback Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{data.feedbackAnalysis.totalReviews}</p>
                <p className="text-sm text-blue-700">Total Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{data.feedbackAnalysis.reviewsWithComments}</p>
                <p className="text-sm text-blue-700">With Comments</p>
                <p className="text-xs text-blue-600 mt-1">({data.feedbackAnalysis.commentPercentage}%)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{data.feedbackAnalysis.sentiment.positive}</p>
                <p className="text-sm text-blue-700">Positive</p>
                <p className="text-xs text-blue-600 mt-1">({data.feedbackAnalysis.sentiment.positivePercentage}%)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{data.feedbackAnalysis.sentiment.negative}</p>
                <p className="text-sm text-blue-700">Negative</p>
                <p className="text-xs text-blue-600 mt-1">({data.feedbackAnalysis.sentiment.negativePercentage}%)</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-100 rounded-lg">
                <p className="text-lg font-bold text-blue-900">{data.feedbackAnalysis.sentiment.positive}</p>
                <p className="text-sm text-blue-700">Positive Reviews</p>
                <p className="text-xs text-blue-600 mt-1">(Rating ≥ 4)</p>
              </div>
              <div className="text-center p-3 bg-blue-100 rounded-lg">
                <p className="text-lg font-bold text-blue-900">{data.feedbackAnalysis.sentiment.neutral}</p>
                <p className="text-sm text-blue-700">Neutral Reviews</p>
                <p className="text-xs text-blue-600 mt-1">(Rating 2-3)</p>
              </div>
              <div className="text-center p-3 bg-blue-100 rounded-lg">
                <p className="text-lg font-bold text-blue-900">{data.feedbackAnalysis.sentiment.negative}</p>
                <p className="text-sm text-blue-700">Negative Reviews</p>
                <p className="text-xs text-blue-600 mt-1">(Rating ≤ 1)</p>
              </div>
            </div>
          </div>
        )}

        {data.lifetimeValue && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
            <h4 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Customer Lifetime Value
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-900">${data.lifetimeValue.customerLifetimeValue}</p>
                <p className="text-sm text-emerald-700">Customer Lifetime Value</p>
                <p className="text-xs text-emerald-600 mt-1">(CLV)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-900">${data.lifetimeValue.averageRevenuePerUser}</p>
                <p className="text-sm text-emerald-700">Avg Revenue per User</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-900">{data.lifetimeValue.retentionRate}%</p>
                <p className="text-sm text-emerald-700">Retention Rate</p>
                <p className="text-xs text-emerald-600 mt-1">(Active users)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-900">${data.lifetimeValue.averageSubscriptionValue}</p>
                <p className="text-sm text-emerald-700">Avg Subscription Value</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <h5 className="font-semibold text-emerald-900 mb-2">Revenue Breakdown</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-emerald-700">Total Revenue:</span>
                    <span className="text-sm font-bold text-emerald-900">${data.lifetimeValue.totalRevenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-emerald-700">Subscription:</span>
                    <span className="text-sm font-bold text-emerald-900">${data.lifetimeValue.revenueBreakdown.subscription}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-emerald-700">Appointments:</span>
                    <span className="text-sm font-bold text-emerald-900">${data.lifetimeValue.revenueBreakdown.appointments}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <h5 className="font-semibold text-emerald-900 mb-2">User Statistics</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-emerald-700">Total Users:</span>
                    <span className="text-sm font-bold text-emerald-900">{data.lifetimeValue.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-emerald-700">Retention Rate:</span>
                    <span className="text-sm font-bold text-emerald-900">{data.lifetimeValue.retentionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {data.preferenceTrends && (
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-6">
            <h4 className="font-semibold text-pink-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Preference Trends
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-900">{data.preferenceTrends.totalAppointments}</p>
                <p className="text-sm text-pink-700">Total Appointments</p>
                <p className="text-xs text-pink-600 mt-1">(Last 30 days)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-900">{data.preferenceTrends.averageAppointmentsPerDay}</p>
                <p className="text-sm text-pink-700">Avg per Day</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-900">{data.preferenceTrends.popularServices?.length || 0}</p>
                <p className="text-sm text-pink-700">Popular Services</p>
                <p className="text-xs text-pink-600 mt-1">(Tracked)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-900">{data.preferenceTrends.timePreferences?.length || 0}</p>
                <p className="text-sm text-pink-700">Time Slots</p>
                <p className="text-xs text-pink-600 mt-1">(Tracked)</p>
              </div>
            </div>
            {data.preferenceTrends.popularServices && data.preferenceTrends.popularServices.length > 0 && (
              <div className="mt-4 p-3 bg-pink-100 rounded-lg">
                <h5 className="font-semibold text-pink-900 mb-2">Top Services</h5>
                <div className="space-y-1">
                  {data.preferenceTrends.popularServices.slice(0, 3).map((service: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-pink-700">{service.service_name}</span>
                      <span className="font-bold text-pink-900">{service.booking_count} bookings</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {data.serviceRatings && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
            <h4 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Service Ratings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-900">{data.serviceRatings.overallRating}</p>
                <p className="text-sm text-indigo-700">Overall Rating</p>
                <p className="text-xs text-indigo-600 mt-1">(Out of 5)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-900">{data.serviceRatings.totalReviews}</p>
                <p className="text-sm text-indigo-700">Total Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-900">{data.serviceRatings.totalServices}</p>
                <p className="text-sm text-indigo-700">Total Services</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-900">{data.serviceRatings.servicesWithRatings}</p>
                <p className="text-sm text-indigo-700">Services with Ratings</p>
              </div>
            </div>
            {data.serviceRatings.topRatedServices && data.serviceRatings.topRatedServices.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <h5 className="font-semibold text-indigo-900 mb-2">Top Rated Services</h5>
                  <div className="space-y-1">
                    {data.serviceRatings.topRatedServices.slice(0, 3).map((service: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-indigo-700">{service.service_name}</span>
                        <span className="font-bold text-indigo-900">{service.average_rating} ⭐</span>
                      </div>
                    ))}
                  </div>
                </div>
                {data.serviceRatings.lowestRatedServices && data.serviceRatings.lowestRatedServices.length > 0 && (
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <h5 className="font-semibold text-indigo-900 mb-2">Lowest Rated Services</h5>
                    <div className="space-y-1">
                      {data.serviceRatings.lowestRatedServices.slice(0, 3).map((service: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-indigo-700">{service.service_name}</span>
                          <span className="font-bold text-indigo-900">{service.average_rating} ⭐</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Key Insights */}
        {(data.keyInsights || data.keyMetrics || data.highlights || data.insights || data.systemHealth) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Key Insights
            </h4>
            <ul className="space-y-2">
              {(data.keyInsights || data.keyMetrics || data.highlights || data.insights || data.systemHealth)?.map((insight: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-blue-800">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderTable = (section: ReportSection) => {
    const { headers, data } = section;
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              {headers?.map((header, index) => (
                <th key={index} className="px-4 py-3 text-left font-semibold text-sm">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any[], rowIndex: number) => (
              <tr key={rowIndex} className={`border-b ${rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-purple-50 transition-colors`}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-sm text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div>
            <h2 className="text-2xl font-bold">{reportData.title}</h2>
            <p className="text-purple-100 text-sm">
              Generated on {safeFormatDate(reportData.metadata?.generatedAt)} • 
              Period: {reportData.metadata.reportPeriod}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" title="Export Options">
                  <FileSpreadsheet className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Export Report</DialogTitle>
                  <DialogDescription>
                    Choose your export format and customize the output options.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="format">Export Format</Label>
                    <Select
                      value={exportOptions.format}
                      onValueChange={(value: 'excel' | 'pdf') =>
                        setExportOptions(prev => ({ ...prev, format: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel">Excel Spreadsheet (.xlsx)</SelectItem>
                        <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Export Options</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeCharts"
                        checked={exportOptions.includeCharts}
                        onCheckedChange={(checked) =>
                          setExportOptions(prev => ({ ...prev, includeCharts: !!checked }))
                        }
                      />
                      <Label htmlFor="includeCharts" className="text-sm">Include charts and visualizations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeExplanatoryNotes"
                        checked={exportOptions.includeExplanatoryNotes}
                        onCheckedChange={(checked) =>
                          setExportOptions(prev => ({ ...prev, includeExplanatoryNotes: !!checked }))
                        }
                      />
                      <Label htmlFor="includeExplanatoryNotes" className="text-sm">Include explanatory notes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeMetadata"
                        checked={exportOptions.includeMetadata}
                        onCheckedChange={(checked) =>
                          setExportOptions(prev => ({ ...prev, includeMetadata: !!checked }))
                        }
                      />
                      <Label htmlFor="includeMetadata" className="text-sm">Include report metadata</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleExportWithOptions}
                    disabled={isExporting}
                    className="w-full"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="ghost" size="sm" onClick={handlePrint} className="text-white hover:bg-white/20" title="Print Report">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload} className="text-white hover:bg-white/20" title="Download HTML">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} className="text-white hover:bg-white/20" title="Share Report">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleEmail} className="text-white hover:bg-white/20" title="Email Report">
              <Mail className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20" title="Close Report">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(95vh-80px)]">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Report Sections</h3>
              <nav className="space-y-2">
                {reportData.sections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSection(index)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === index
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {section.type === 'summary' && <BarChart3 className="h-4 w-4" />}
                      {section.type === 'chart' && <TrendingUp className="h-4 w-4" />}
                      {section.type === 'table' && <FileText className="h-4 w-4" />}
                      {section.title}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {reportData.sections.map((section, index) => (
                <div
                  key={index}
                  className={`${activeSection === index ? 'block' : 'hidden'}`}
                >
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {section.type === 'summary' && <BarChart3 className="h-5 w-5 text-purple-600" />}
                        {section.type === 'chart' && <TrendingUp className="h-5 w-5 text-blue-600" />}
                        {section.type === 'table' && <FileText className="h-5 w-5 text-green-600" />}
                        {section.title}
                      </CardTitle>
                      <CardDescription>
                        {section.type === 'summary' && 'Key metrics and insights overview'}
                        {section.type === 'chart' && `Visual representation of ${section.title.toLowerCase()}`}
                        {section.type === 'table' && `Detailed breakdown of ${section.title.toLowerCase()}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {section.type === 'summary' && renderSummary(section)}
                      {section.type === 'chart' && renderChart(section)}
                      {section.type === 'table' && renderTable(section)}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Report ID: {reportData.metadata.templateId} • 
              Generated by Hairvana Analytics Engine
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Section {activeSection + 1} of {reportData.sections.length}
              </Badge>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                  disabled={activeSection === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSection(Math.min(reportData.sections.length - 1, activeSection + 1))}
                  disabled={activeSection === reportData.sections.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function safeFormatDate(dateString: string | undefined, fmt: string = 'MMMM dd, yyyy HH:mm') {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isValid(date) ? format(date, fmt) : 'N/A';
}

function generateReportHTML(reportData: ReportData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportData.title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: #fff;
            padding: 40px;
          }
          .report-container { max-width: 1200px; margin: 0 auto; }
          .header { 
            background: linear-gradient(135deg, #8b5cf6, #ec4899);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .header h1 { font-size: 32px; margin-bottom: 10px; }
          .header p { opacity: 0.9; }
          .section { 
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .section h2 { 
            color: #8b5cf6;
            margin-bottom: 20px;
            font-size: 24px;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .metric-card {
            background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          }
          .metric-value {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .metric-label {
            color: #6b7280;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .insights {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 20px;
          }
          .insights h3 {
            color: #1e40af;
            margin-bottom: 15px;
          }
          .insights ul {
            list-style: none;
          }
          .insights li {
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
          }
          .insights li:before {
            content: '•';
            color: #3b82f6;
            font-weight: bold;
            position: absolute;
            left: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background: linear-gradient(135deg, #8b5cf6, #ec4899);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 12px 15px;
            border-bottom: 1px solid #e5e7eb;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          @media print {
            body { padding: 20px; }
            .section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <h1>${reportData.title}</h1>
            <p>Generated on ${safeFormatDate(reportData.metadata?.generatedAt)} | Period: ${reportData.metadata.reportPeriod}</p>
          </div>
          
          ${reportData.sections.map(section => `
            <div class="section">
              <h2>${section.title}</h2>
              ${section.type === 'summary' ? renderSummaryHTML(section) : ''}
              ${section.type === 'table' ? renderTableHTML(section) : ''}
              ${section.type === 'chart' ? '<p><em>Chart visualization available in interactive version</em></p>' : ''}
            </div>
          `).join('')}
          
          <div class="footer">
            <p>Report generated by Hairvana Analytics Engine</p>
            <p>Report ID: ${reportData.metadata.templateId}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function renderSummaryHTML(section: any): string {
  const { data } = section;
  
  const metrics = Object.entries(data).filter(([key]) => 
    typeof data[key] === 'number' && !['keyInsights', 'keyMetrics', 'highlights', 'insights', 'systemHealth'].includes(key)
  );
  
  const insights = data.keyInsights || data.keyMetrics || data.highlights || data.insights || data.systemHealth || [];
  
  return `
    <div class="metrics-grid">
      ${metrics.map(([key, value]) => `
        <div class="metric-card">
          <div class="metric-value">
            ${typeof value === 'number' ? 
              (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('profit') ? 
                `$${(value as number).toLocaleString()}` : 
                key.toLowerCase().includes('rate') || key.toLowerCase().includes('margin') ? 
                  `${value}%` : 
                  (value as number).toLocaleString()
              ) : 
              String(value)
            }
          </div>
          <div class="metric-label">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
        </div>
      `).join('')}
    </div>
    
    ${insights.length > 0 ? `
      <div class="insights">
        <h3>Key Insights</h3>
        <ul>
          ${insights.map((insight: string) => `<li>${insight}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
  `;
}

function renderTableHTML(section: any): string {
  const { headers, data } = section;
  
  return `
    <table>
      <thead>
        <tr>
          ${headers?.map((header: string) => `<th>${header}</th>`).join('') || ''}
        </tr>
      </thead>
      <tbody>
        ${data.map((row: any[]) => `
          <tr>
            ${row.map(cell => `<td>${cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}