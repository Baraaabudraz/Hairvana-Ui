"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Legend,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Clock,
  Star,
  MapPin,
  Zap,
  Download,
  Filter,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { fetchAnalytics } from "@/api/analytics";
// Replace xlsx with exceljs for security
import * as ExcelJS from "exceljs";
import { useAuthStore } from "@/stores/auth-store";

interface AnalyticsData {
  overview: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    expiredSubscriptions: number;
    totalRevenue: number;
    monthlyGrowth: number;
    mrr: number;
    annualRecurringRevenue: number;
  };
  revenue: {
    current: number;
    previous: number;
    growth: number;
    data: Array<{
      month: string;
      revenue: number;
      newSubscriptions: number;
      churned: number;
      netGrowth: number;
    }>;
  };
  subscriptions: {
    total: number;
    active: number;
    cancelled: number;
    churned: number;
    data: Array<{
      month: string;
      revenue: number;
      newSubscriptions: number;
      churned: number;
      netGrowth: number;
    }>;
  };
  userGrowth: {
    newUsers: number;
    returningUsers: number;
    data: Array<{
      month: string;
      revenue: number;
      newSubscriptions: number;
      churned: number;
      netGrowth: number;
    }>;
  };
  topServices: Array<{
    name: string;
    price: number;
    subscribers: number;
    revenue: number;
    growth: number;
  }>;
  geographicData: Array<{
    location: string;
    subscriptions: number;
    revenue: number;
    activeSubscriptions: number;
  }>;
  performanceMetrics: {
    averageRevenuePerUser: number;
    customerLifetimeValue: number;
    subscriptionRetentionRate: number;
    churnRate: number;
  };
}

const COLORS = [
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await fetchAnalytics(timeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth > 0 ? "text-green-600" : "text-red-600";
  };

  const handleExportExcel = () => {
    if (!analyticsData) return;
    const workbook = new ExcelJS.Workbook();
    
    // Set workbook properties
    workbook.creator = "Hairvana Admin Dashboard";
    workbook.lastModifiedBy = "Hairvana Analytics";
    workbook.created = new Date();
    workbook.modified = new Date();

    // Helper function to create styled headers
    const createStyledHeader = (worksheet: any, row: number, headers: string[]) => {
      const headerRow = worksheet.getRow(row);
      headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: "FFFFFF" }, size: 12 };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "8b5cf6" }
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } }
        };
      });
      headerRow.height = 25;
    };

    // Helper function to format currency cells
    const formatCurrencyCell = (cell: any, value: number) => {
      cell.value = value;
      cell.numFmt = '"$"#,##0.00';
      cell.alignment = { horizontal: "right" };
    };

    // Helper function to format percentage cells
    const formatPercentageCell = (cell: any, value: number) => {
      cell.value = value / 100;
      cell.numFmt = "0.00%";
      cell.alignment = { horizontal: "right" };
    };

    // Helper function to add borders to data rows
    const addBordersToRow = (row: any, columnCount: number) => {
      for (let i = 1; i <= columnCount; i++) {
        const cell = row.getCell(i);
        cell.border = {
          top: { style: "thin", color: { argb: "E5E7EB" } },
          left: { style: "thin", color: { argb: "E5E7EB" } },
          bottom: { style: "thin", color: { argb: "E5E7EB" } },
          right: { style: "thin", color: { argb: "E5E7EB" } }
        };
      }
    };

    // 1. Executive Summary Sheet
    const summaryWorksheet = workbook.addWorksheet("Executive Summary");
    
    // Add title
    summaryWorksheet.mergeCells("A1:F1");
    const titleCell = summaryWorksheet.getCell("A1");
    titleCell.value = "HAIRVANA SUBSCRIPTION ANALYTICS - EXECUTIVE SUMMARY";
    titleCell.font = { bold: true, size: 16, color: { argb: "1F2937" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "F3F4F6" }
    };
    summaryWorksheet.getRow(1).height = 30;

    // Add generation date
    summaryWorksheet.getCell("A2").value = `Generated on: ${new Date().toLocaleDateString()}`;
    summaryWorksheet.getCell("A2").font = { italic: true, color: { argb: "6B7280" } };
    summaryWorksheet.getRow(2).height = 20;

    // Key Metrics Table
    createStyledHeader(summaryWorksheet, 4, ["Metric", "Value", "Details"]);
    
    const summaryData = [
      ["Total Subscriptions", analyticsData.overview.totalSubscriptions, "All time subscriptions"],
      ["Active Subscriptions", analyticsData.overview.activeSubscriptions, "Currently active"],
      ["Cancelled Subscriptions", analyticsData.overview.cancelledSubscriptions, "Cancelled this period"],
      ["Expired Subscriptions", analyticsData.overview.expiredSubscriptions, "Expired subscriptions"],
      ["Monthly Recurring Revenue", analyticsData.overview.mrr, "MRR from active subscriptions"],
      ["Annual Recurring Revenue", analyticsData.overview.annualRecurringRevenue, "ARR from yearly plans"],
      ["Total Revenue", analyticsData.overview.totalRevenue, "All subscription revenue"],
      ["Monthly Growth", analyticsData.overview.monthlyGrowth, "Growth vs previous period"],
      ["Churn Rate", analyticsData.performanceMetrics.churnRate, "Percentage of churned customers"],
      ["Retention Rate", analyticsData.performanceMetrics.subscriptionRetentionRate, "Customer retention percentage"],
      ["Average Revenue Per User", analyticsData.performanceMetrics.averageRevenuePerUser, "ARPU calculation"],
      ["Customer Lifetime Value", analyticsData.performanceMetrics.customerLifetimeValue, "CLV estimation"]
    ];

    summaryData.forEach((row, index) => {
      const excelRow = summaryWorksheet.getRow(5 + index);
      excelRow.getCell(1).value = row[0];
      excelRow.getCell(3).value = row[2];
      
      const metricName = row[0] as string;
      const metricValue = row[1] as number;
      
      if (metricName.includes("Revenue") || metricName.includes("ARPU") || metricName.includes("CLV")) {
        formatCurrencyCell(excelRow.getCell(2), metricValue);
      } else if (metricName.includes("Growth") || metricName.includes("Rate")) {
        formatPercentageCell(excelRow.getCell(2), metricValue);
      } else {
        excelRow.getCell(2).value = metricValue;
        excelRow.getCell(2).alignment = { horizontal: "right" };
      }
      
      addBordersToRow(excelRow, 3);
    });

    // Set column widths
    summaryWorksheet.getColumn(1).width = 25;
    summaryWorksheet.getColumn(2).width = 15;
    summaryWorksheet.getColumn(3).width = 35;

    // 2. Revenue Analysis Sheet
    const revenueWorksheet = workbook.addWorksheet("Revenue Analysis");
    createStyledHeader(revenueWorksheet, 1, ["Month", "Revenue ($)", "New Subscriptions", "Churned", "Net Growth"]);
    
    analyticsData.revenue.data?.forEach((row, index) => {
      const excelRow = revenueWorksheet.getRow(2 + index);
      excelRow.getCell(1).value = row.month;
      formatCurrencyCell(excelRow.getCell(2), row.revenue);
      excelRow.getCell(3).value = row.newSubscriptions;
      excelRow.getCell(4).value = row.churned;
      excelRow.getCell(5).value = row.netGrowth;
      
      // Color code net growth
      const netGrowthCell = excelRow.getCell(5);
      if (row.netGrowth > 0) {
        netGrowthCell.font = { color: { argb: "059669" } };
      } else if (row.netGrowth < 0) {
        netGrowthCell.font = { color: { argb: "DC2626" } };
      }
      
      addBordersToRow(excelRow, 5);
    });

    // Set column widths
    revenueWorksheet.getColumn(1).width = 12;
    revenueWorksheet.getColumn(2).width = 15;
    revenueWorksheet.getColumn(3).width = 18;
    revenueWorksheet.getColumn(4).width = 12;
    revenueWorksheet.getColumn(5).width = 12;

    // 3. Subscription Plans Performance
    const plansWorksheet = workbook.addWorksheet("Plan Performance");
    createStyledHeader(plansWorksheet, 1, ["Plan Name", "Price ($)", "Subscribers", "Revenue ($)", "Market Share (%)"]);
    
    const totalSubscribers = analyticsData.topServices.reduce((sum, plan) => sum + plan.subscribers, 0);
    
    analyticsData.topServices?.forEach((plan, index) => {
      const excelRow = plansWorksheet.getRow(2 + index);
      excelRow.getCell(1).value = plan.name;
      formatCurrencyCell(excelRow.getCell(2), plan.price);
      excelRow.getCell(3).value = plan.subscribers;
      formatCurrencyCell(excelRow.getCell(4), plan.revenue);
      
      const marketShare = totalSubscribers > 0 ? (plan.subscribers / totalSubscribers) * 100 : 0;
      formatPercentageCell(excelRow.getCell(5), marketShare);
      
      addBordersToRow(excelRow, 5);
    });

    // Set column widths
    plansWorksheet.getColumn(1).width = 20;
    plansWorksheet.getColumn(2).width = 12;
    plansWorksheet.getColumn(3).width = 15;
    plansWorksheet.getColumn(4).width = 15;
    plansWorksheet.getColumn(5).width = 15;

    // 4. Geographic Distribution
    const geoWorksheet = workbook.addWorksheet("Geographic Analysis");
    createStyledHeader(geoWorksheet, 1, ["Location", "Total Subscriptions", "Active Subscriptions", "Revenue ($)", "Avg Revenue/Sub ($)"]);
    
    analyticsData.geographicData?.forEach((location, index) => {
      const excelRow = geoWorksheet.getRow(2 + index);
      excelRow.getCell(1).value = location.location;
      excelRow.getCell(2).value = location.subscriptions;
      excelRow.getCell(3).value = location.activeSubscriptions;
      formatCurrencyCell(excelRow.getCell(4), location.revenue);
      
      const avgRevenue = location.subscriptions > 0 ? location.revenue / location.subscriptions : 0;
      formatCurrencyCell(excelRow.getCell(5), avgRevenue);
      
      addBordersToRow(excelRow, 5);
    });

    // Set column widths
    geoWorksheet.getColumn(1).width = 20;
    geoWorksheet.getColumn(2).width = 18;
    geoWorksheet.getColumn(3).width = 18;
    geoWorksheet.getColumn(4).width = 15;
    geoWorksheet.getColumn(5).width = 18;

    // 5. Monthly Trends
    const trendsWorksheet = workbook.addWorksheet("Monthly Trends");
    createStyledHeader(trendsWorksheet, 1, ["Month", "New Subscriptions", "Churned", "Net Growth", "Revenue ($)", "Growth Rate (%)"]);
    
    analyticsData.subscriptions.data?.forEach((row, index) => {
      const excelRow = trendsWorksheet.getRow(2 + index);
      excelRow.getCell(1).value = row.month;
      excelRow.getCell(2).value = row.newSubscriptions;
      excelRow.getCell(3).value = row.churned;
      excelRow.getCell(4).value = row.netGrowth;
      formatCurrencyCell(excelRow.getCell(5), row.revenue);
      
      // Calculate growth rate
      const prevRevenue = index > 0 ? analyticsData.subscriptions.data[index - 1].revenue : row.revenue;
      const growthRate = prevRevenue > 0 ? ((row.revenue - prevRevenue) / prevRevenue) * 100 : 0;
      formatPercentageCell(excelRow.getCell(6), growthRate);
      
      // Color code growth
      const growthCell = excelRow.getCell(6);
      if (growthRate > 0) {
        growthCell.font = { color: { argb: "059669" } };
      } else if (growthRate < 0) {
        growthCell.font = { color: { argb: "DC2626" } };
      }
      
      addBordersToRow(excelRow, 6);
    });

    // Set column widths
    trendsWorksheet.getColumn(1).width = 12;
    trendsWorksheet.getColumn(2).width = 18;
    trendsWorksheet.getColumn(3).width = 12;
    trendsWorksheet.getColumn(4).width = 12;
    trendsWorksheet.getColumn(5).width = 15;
    trendsWorksheet.getColumn(6).width = 15;

    // Add data validation and protection
    [summaryWorksheet, revenueWorksheet, plansWorksheet, geoWorksheet, trendsWorksheet].forEach(ws => {
      ws.protect("", {
        selectLockedCells: false,
        selectUnlockedCells: true,
        formatCells: false,
        formatColumns: false,
        formatRows: false,
        insertRows: false,
        insertColumns: false,
        insertHyperlinks: false,
        deleteRows: false,
        deleteColumns: false,
        sort: false,
        autoFilter: false,
        pivotTables: false,
        objects: false,
        scenarios: false
      });
    });

    // Generate and download
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Hairvana_Subscription_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  if (user?.role === "customer") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">You do not have access to analytics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            No data available
          </h2>
          <p className="text-gray-600 mt-2">Unable to load analytics data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Subscription Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Comprehensive insights into salon subscription performance and revenue trends
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Monthly Recurring Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analyticsData.overview.mrr)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(analyticsData.overview.monthlyGrowth)}
                  <span
                    className={`text-sm font-medium ${getGrowthColor(
                      analyticsData.overview.monthlyGrowth
                    )}`}
                  >
                    {formatPercentage(analyticsData.overview.monthlyGrowth)}
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Subscriptions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.overview.activeSubscriptions.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-500">
                    {analyticsData.overview.totalSubscriptions} total subscriptions
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Annual Recurring Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analyticsData.overview.annualRecurringRevenue)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-500">
                    Yearly subscriptions
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  New Subscriptions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.userGrowth.newUsers.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-500">
                    This period
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Subscription Revenue Trend</CardTitle>
            <CardDescription>
              Monthly subscription revenue and growth metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={analyticsData.revenue.data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-gray-200"
                />
                <XAxis
                  dataKey="month"
                  className="text-gray-600"
                  fontSize={12}
                />
                <YAxis
                  className="text-gray-600"
                  fontSize={12}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    name === "revenue" ? `$${value.toLocaleString()}` : value.toLocaleString(),
                    name === "revenue"
                      ? "Subscription Revenue"
                      : name === "newSubscriptions"
                      ? "New Subscriptions"
                      : name === "churned"
                      ? "Churned"
                      : "Net Growth",
                  ]}
                  labelStyle={{ color: "#374151" }}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="newSubscriptions"
                  fill="#10b981"
                  name="New Subscriptions"
                />
                <Bar dataKey="churned" fill="#ef4444" name="Churned" />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  name="Subscription Revenue"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Subscription Growth</CardTitle>
            <CardDescription>New subscriptions vs churn over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.subscriptions.data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-gray-200"
                />
                <XAxis
                  dataKey="month"
                  className="text-gray-600"
                  fontSize={12}
                />
                <YAxis className="text-gray-600" fontSize={12} />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    value.toLocaleString(),
                    name === "newSubscriptions"
                      ? "New Subscriptions"
                      : name === "churned"
                      ? "Churned"
                      : "Net Growth",
                  ]}
                  labelStyle={{ color: "#374151" }}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="newSubscriptions"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="New Subscriptions"
                />
                <Area
                  type="monotone"
                  dataKey="churned"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.6}
                  name="Churned"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Status Analysis */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Subscription Status Overview</CardTitle>
          <CardDescription>
            Monthly subscription status trends and net growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={analyticsData.subscriptions.data}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200"
              />
              <XAxis dataKey="month" className="text-gray-600" fontSize={12} />
              <YAxis className="text-gray-600" fontSize={12} />
              <Tooltip
                formatter={(value: any, name: string) => [
                  value.toLocaleString(),
                  name === "newSubscriptions"
                    ? "New Subscriptions"
                    : name === "churned"
                    ? "Churned"
                    : "Net Growth",
                ]}
                labelStyle={{ color: "#374151" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="newSubscriptions" fill="#10b981" name="New Subscriptions" />
              <Bar dataKey="churned" fill="#ef4444" name="Churned" />
              <Line
                type="monotone"
                dataKey="netGrowth"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="Net Growth"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Metrics and Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Subscription Performance Metrics</CardTitle>
            <CardDescription>
              Key performance indicators for subscription business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg. Revenue Per User
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      analyticsData.performanceMetrics.averageRevenuePerUser
                    )}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">MRR</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Retention Rate
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {analyticsData.performanceMetrics.subscriptionRetentionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">High</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Churn Rate
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {analyticsData.performanceMetrics.churnRate.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Badge className="bg-red-100 text-red-800">Monitor</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Customer Lifetime Value
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      analyticsData.performanceMetrics.customerLifetimeValue
                    )}
                  </p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-800">CLV</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Churn Rate
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {analyticsData.performanceMetrics.churnRate.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Badge className="bg-red-100 text-red-800">Monitor</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Top Subscription Plans</CardTitle>
            <CardDescription>
              Most popular subscription plans by subscribers and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topServices.map((plan, index) => (
                <div
                  key={plan.name}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {plan.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {plan.subscribers.toLocaleString()} subscribers
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(plan.price)}/mo
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(plan.revenue)} total revenue
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>
            Subscription distribution and revenue by location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.geographicData.map((location) => (
              <div
                key={location.location}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {location.location}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {location.subscriptions} subscriptions
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active:</span>
                    <span className="text-sm font-medium">
                      {location.activeSubscriptions.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(location.revenue)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common analytics tasks and reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <span className="font-medium">Custom Report</span>
              <span className="text-xs text-gray-500">
                Create detailed reports
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Download className="h-6 w-6 text-blue-600" />
              <span className="font-medium">Export Data</span>
              <span className="text-xs text-gray-500">
                Download analytics data
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Eye className="h-6 w-6 text-green-600" />
              <span className="font-medium">Live Dashboard</span>
              <span className="text-xs text-gray-500">
                Real-time monitoring
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
