'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ReportViewer } from '@/components/reports/report-viewer';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Plus,
  Eye,
  Trash2,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Activity,
  Mail,
  Printer,
  FileSpreadsheet,
  FileImage,
  Settings,
  Search,
  RefreshCw,
  Play,
  Loader2
} from 'lucide-react';
import { format, subDays, subMonths, subYears } from 'date-fns';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'operational' | 'user' | 'salon' | 'custom';
  status: 'completed' | 'generating' | 'scheduled' | 'failed';
  createdAt: string;
  generatedAt?: string;
  createdBy: string;
  size?: string;
  downloadUrl?: string;
  parameters: {
    dateRange: string;
    filters: string[];
    format: 'pdf' | 'excel' | 'csv';
  };
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'operational' | 'user' | 'salon' | 'custom';
  icon: any;
  color: string;
  fields: string[];
  popular: boolean;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'revenue-summary',
    name: 'Revenue Summary',
    description: 'Comprehensive revenue analysis with breakdowns by source, time period, and geography',
    type: 'financial',
    icon: DollarSign,
    color: 'from-green-600 to-emerald-600',
    fields: ['Total Revenue', 'Subscription Revenue', 'Commission Revenue', 'Growth Rate', 'Geographic Breakdown'],
    popular: true
  },
  {
    id: 'salon-performance',
    name: 'Salon Performance',
    description: 'Detailed analysis of salon metrics including bookings, ratings, and utilization',
    type: 'salon',
    icon: Building2,
    color: 'from-blue-600 to-cyan-600',
    fields: ['Active Salons', 'Booking Volume', 'Average Rating', 'Utilization Rate', 'Top Performers'],
    popular: true
  },
  {
    id: 'user-analytics',
    name: 'User Analytics',
    description: 'User behavior analysis including acquisition, retention, and engagement metrics',
    type: 'user',
    icon: Users,
    color: 'from-purple-600 to-pink-600',
    fields: ['New Users', 'Active Users', 'Retention Rate', 'User Journey', 'Demographics'],
    popular: false
  },
  {
    id: 'booking-trends',
    name: 'Booking Trends',
    description: 'Booking patterns, seasonal trends, and service popularity analysis',
    type: 'operational',
    icon: Calendar,
    color: 'from-orange-600 to-red-600',
    fields: ['Booking Volume', 'Completion Rate', 'Popular Services', 'Peak Times', 'Cancellation Analysis'],
    popular: true
  },
  {
    id: 'financial-overview',
    name: 'Financial Overview',
    description: 'Complete financial dashboard with P&L, cash flow, and key financial metrics',
    type: 'financial',
    icon: BarChart3,
    color: 'from-indigo-600 to-purple-600',
    fields: ['Revenue', 'Expenses', 'Profit Margin', 'Cash Flow', 'Financial Ratios'],
    popular: false
  },
  {
    id: 'operational-metrics',
    name: 'Operational Metrics',
    description: 'Platform operational health including uptime, performance, and system metrics',
    type: 'operational',
    icon: Activity,
    color: 'from-teal-600 to-green-600',
    fields: ['System Uptime', 'Response Times', 'Error Rates', 'User Sessions', 'Platform Health'],
    popular: false
  }
];

const statusColors = {
  completed: 'bg-green-100 text-green-800',
  generating: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
};

const statusIcons = {
  completed: CheckCircle,
  generating: Clock,
  scheduled: Calendar,
  failed: AlertCircle,
};

const typeColors = {
  financial: 'bg-green-100 text-green-800',
  operational: 'bg-blue-100 text-blue-800',
  user: 'bg-purple-100 text-purple-800',
  salon: 'bg-orange-100 text-orange-800',
  custom: 'bg-gray-100 text-gray-800',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'financial' | 'operational' | 'user' | 'salon' | 'custom'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'generating' | 'scheduled' | 'failed'>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportForm, setReportForm] = useState({
    name: '',
    description: '',
    dateRange: '30d',
    startDate: '',
    endDate: '',
    format: 'pdf' as 'pdf' | 'excel' | 'csv',
    filters: [] as string[],
    schedule: 'once' as 'once' | 'daily' | 'weekly' | 'monthly',
  });
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set());
  const [viewingReport, setViewingReport] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Mock data for demonstration
      const mockReports: Report[] = [
        {
          id: '1',
          name: 'Monthly Revenue Report',
          description: 'Comprehensive revenue analysis for June 2024',
          type: 'financial',
          status: 'completed',
          createdAt: '2024-06-15T10:30:00Z',
          generatedAt: '2024-06-15T10:35:00Z',
          createdBy: 'John Smith',
          size: '2.4 MB',
          downloadUrl: '/reports/monthly-revenue-june-2024.pdf',
          parameters: {
            dateRange: '30d',
            filters: ['all-salons', 'all-regions'],
            format: 'pdf'
          }
        },
        {
          id: '2',
          name: 'Salon Performance Dashboard',
          description: 'Q2 2024 salon performance metrics and analytics',
          type: 'salon',
          status: 'completed',
          createdAt: '2024-06-14T14:20:00Z',
          generatedAt: '2024-06-14T14:28:00Z',
          createdBy: 'Sarah Johnson',
          size: '5.1 MB',
          downloadUrl: '/reports/salon-performance-q2-2024.xlsx',
          parameters: {
            dateRange: '90d',
            filters: ['active-salons', 'premium-tier'],
            format: 'excel'
          }
        },
        {
          id: '3',
          name: 'User Acquisition Report',
          description: 'New user acquisition and onboarding analysis',
          type: 'user',
          status: 'generating',
          createdAt: '2024-06-15T16:45:00Z',
          createdBy: 'Mike Davis',
          parameters: {
            dateRange: '7d',
            filters: ['new-users', 'all-channels'],
            format: 'csv'
          }
        },
        {
          id: '4',
          name: 'Weekly Operations Summary',
          description: 'Platform operational metrics and system health',
          type: 'operational',
          status: 'scheduled',
          createdAt: '2024-06-15T09:00:00Z',
          createdBy: 'System Scheduler',
          parameters: {
            dateRange: '7d',
            filters: ['system-metrics', 'performance-data'],
            format: 'pdf'
          }
        },
        {
          id: '5',
          name: 'Custom Analytics Report',
          description: 'Custom report for marketing team analysis',
          type: 'custom',
          status: 'failed',
          createdAt: '2024-06-15T12:15:00Z',
          createdBy: 'Lisa Thompson',
          parameters: {
            dateRange: '60d',
            filters: ['marketing-data', 'conversion-metrics'],
            format: 'excel'
          }
        }
      ];

      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch reports. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateReport = async () => {
    if (!selectedTemplate) return;

    try {
      const reportData = {
        templateId: selectedTemplate.id,
        name: reportForm.name || selectedTemplate.name,
        description: reportForm.description || selectedTemplate.description,
        type: selectedTemplate.type,
        parameters: {
          dateRange: reportForm.dateRange,
          startDate: reportForm.startDate,
          endDate: reportForm.endDate,
          format: reportForm.format,
          filters: reportForm.filters,
          schedule: reportForm.schedule,
        }
      };

      // In a real app, you would make an API call here
      const newReport: Report = {
        id: Date.now().toString(),
        name: reportData.name,
        description: reportData.description,
        type: reportData.type,
        status: 'generating',
        createdAt: new Date().toISOString(),
        createdBy: 'Current User',
        parameters: {
          dateRange: reportData.parameters.dateRange,
          filters: reportData.parameters.filters,
          format: reportData.parameters.format
        }
      };

      setReports(prev => [newReport, ...prev]);

      toast({
        title: 'Report created successfully',
        description: `${reportData.name} is now being generated.`,
      });

      setCreateDialogOpen(false);
      setSelectedTemplate(null);
      setReportForm({
        name: '',
        description: '',
        dateRange: '30d',
        startDate: '',
        endDate: '',
        format: 'pdf',
        filters: [],
        schedule: 'once',
      });

      // Simulate report generation completion
      setTimeout(() => {
        setReports(prev => prev.map(report => 
          report.id === newReport.id 
            ? { ...report, status: 'completed', generatedAt: new Date().toISOString(), size: '3.2 MB' }
            : report
        ));
      }, 3000);
    } catch (error) {
      toast({
        title: 'Error creating report',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleShowReport = async (template: ReportTemplate) => {
    const reportId = `temp_${Date.now()}`;
    setGeneratingReports(prev => new Set(prev).add(reportId));

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
          parameters: {
            dateRange: '30d',
            format: 'interactive',
            filters: []
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const result = await response.json();
      setViewingReport(result.data);

      toast({
        title: 'Report generated successfully',
        description: `${template.name} is ready for viewing.`,
      });
    } catch (error) {
      toast({
        title: 'Error generating report',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleDownloadReport = (report: Report) => {
    if (report.status !== 'completed' || !report.downloadUrl) {
      toast({
        title: 'Report not available',
        description: 'This report is not ready for download yet.',
        variant: 'destructive',
      });
      return;
    }

    // In a real app, you would trigger the actual download
    toast({
      title: 'Download started',
      description: `Downloading ${report.name}...`,
    });
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      setReports(prev => prev.filter(report => report.id !== reportId));
      toast({
        title: 'Report deleted',
        description: 'The report has been permanently removed.',
      });
    } catch (error) {
      toast({
        title: 'Error deleting report',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '1y': return 'Last year';
      case 'custom': return 'Custom range';
      default: return range;
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate, manage, and download comprehensive business reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReports}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Report</DialogTitle>
                <DialogDescription>
                  Choose a template and configure your report parameters
                </DialogDescription>
              </DialogHeader>
              
              {!selectedTemplate ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportTemplates.map((template) => {
                      const Icon = template.icon;
                      return (
                        <div
                          key={template.id}
                          onClick={() => setSelectedTemplate(template)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-purple-200 hover:bg-purple-50 ${
                            template.popular ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          {template.popular && (
                            <Badge className="mb-2 bg-blue-600 text-white">Popular</Badge>
                          )}
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${template.color}`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{template.name}</h3>
                              <Badge className={typeColors[template.type]}>{template.type}</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-700">Includes:</p>
                            {template.fields.slice(0, 3).map((field) => (
                              <p key={field} className="text-xs text-gray-600">• {field}</p>
                            ))}
                            {template.fields.length > 3 && (
                              <p className="text-xs text-gray-500">+{template.fields.length - 3} more</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${selectedTemplate.color}`}>
                        <selectedTemplate.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedTemplate.name}</h3>
                        <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reportName">Report Name</Label>
                        <Input
                          id="reportName"
                          placeholder={selectedTemplate.name}
                          value={reportForm.name}
                          onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reportDescription">Description</Label>
                        <textarea
                          id="reportDescription"
                          rows={3}
                          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder={selectedTemplate.description}
                          value={reportForm.description}
                          onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateRange">Date Range</Label>
                        <Select value={reportForm.dateRange} onValueChange={(value) => setReportForm(prev => ({ ...prev, dateRange: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                            <SelectItem value="1y">Last year</SelectItem>
                            <SelectItem value="custom">Custom range</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {reportForm.dateRange === 'custom' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={reportForm.startDate}
                              onChange={(e) => setReportForm(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={reportForm.endDate}
                              onChange={(e) => setReportForm(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="format">Export Format</Label>
                        <Select value={reportForm.format} onValueChange={(value: 'pdf' | 'excel' | 'csv') => setReportForm(prev => ({ ...prev, format: value }))}>
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

                      <div className="space-y-2">
                        <Label htmlFor="schedule">Schedule</Label>
                        <Select value={reportForm.schedule} onValueChange={(value: 'once' | 'daily' | 'weekly' | 'monthly') => setReportForm(prev => ({ ...prev, schedule: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">Generate once</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Report Fields</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedTemplate.fields.map((field) => (
                            <div key={field} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={field}
                                defaultChecked
                                className="rounded"
                              />
                              <Label htmlFor={field} className="text-sm">{field}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setSelectedTemplate(null);
                  setCreateDialogOpen(false);
                }}>
                  Cancel
                </Button>
                {selectedTemplate && (
                  <Button onClick={handleCreateReport} className="bg-purple-600 hover:bg-purple-700">
                    Create Report
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Report Templates */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Report Templates</CardTitle>
          <CardDescription>
            Generate instant reports with pre-configured templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              const isGenerating = Array.from(generatingReports).some(id => id.includes(template.id));
              
              return (
                <div key={template.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  {template.popular && (
                    <Badge className="mb-2 bg-blue-600 text-white">Popular</Badge>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${template.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <Badge className={typeColors[template.type]}>{template.type}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleShowReport(template)}
                      disabled={isGenerating}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Show Report
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setCreateDialogOpen(true);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="salon">Salon</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="generating">Generating</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>
            View and manage all your generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const StatusIcon = statusIcons[report.status];
              return (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{report.name}</h3>
                        <Badge className={typeColors[report.type]}>{report.type}</Badge>
                        <Badge className={statusColors[report.status]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{report.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Created by {report.createdBy}</span>
                        <span>•</span>
                        <span>{format(new Date(report.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                        {report.size && (
                          <>
                            <span>•</span>
                            <span>{report.size}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{getDateRangeLabel(report.parameters.dateRange)}</span>
                        <span>•</span>
                        <span>{report.parameters.format.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.status === 'completed' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReport(report)}
                          className="hover:bg-green-50 hover:text-green-600"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-purple-50 hover:text-purple-600"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {report.status === 'generating' && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Generating...</span>
                      </div>
                    )}
                    {report.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-orange-50 hover:text-orange-600"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReport(report.id)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more reports.'
                  : 'Create your first report to get started with analytics.'}
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Generating</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reports.filter(r => r.status === 'generating').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === 'scheduled').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Viewer Modal */}
      {viewingReport && (
        <ReportViewer
          reportData={viewingReport}
          onClose={() => setViewingReport(null)}
        />
      )}
    </div>
  );
}