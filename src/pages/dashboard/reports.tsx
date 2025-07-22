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
import { generateReport } from '@/api/analytics';
import {
  fetchReports as fetchReportsApi,
  createReport as createReportApi,
  deleteReport as deleteReportApi,
  fetchReportTemplates as fetchReportTemplatesApi,
  fetchReportById
} from '@/api/reports';
import * as LucideIcons from 'lucide-react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
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
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [createMode, setCreateMode] = useState<'template' | 'manual'>('template');
  const [manualForm, setManualForm] = useState({
    name: '',
    description: '',
    sectionTitle: '',
    sectionData: '',
    note: '',
    type: 'analytics',
    period: 'monthly',
  });
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [page, limit, typeFilter, statusFilter, searchTerm]);

  useEffect(() => {
    if (selectedTemplate) {
      setSelectedFields(selectedTemplate.fields);
    }
  }, [selectedTemplate]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [templates, reportData] = await Promise.all([
        fetchReportTemplatesApi(),
        fetchReportsApi({ page, limit, status: statusFilter !== 'all' ? statusFilter : undefined, search: searchTerm || undefined }),
      ]);
      setReportTemplates(
        templates.map((tpl: any) => ({
          ...tpl,
          icon: LucideIcons[tpl.icon as keyof typeof LucideIcons] || LucideIcons.FileText,
        }))
      );
      setReports(reportData.reports || reportData);
      setTotalPages(reportData.totalPages || 1);
      setTotal(reportData.total || (reportData.reports ? reportData.reports.length : (reportData.length || 0)));
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

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
          fields: selectedFields, // <-- send selected fields
        }
      };
      await createReportApi(reportData);
      toast({ title: 'Report created successfully' });
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
      fetchAll();
    } catch (error: any) {
      toast({ title: 'Error creating report', description: 'Please try again later.', variant: 'destructive' });
    }
  };

  const handleManualCreateReport = async () => {
    let customSectionData = {};
    if (manualForm.sectionData) {
      try {
        customSectionData = JSON.parse(manualForm.sectionData);
      } catch {
        customSectionData = { value: manualForm.sectionData };
      }
    }
    try {
      await createReportApi({
        ...manualForm,
        sectionData: customSectionData,
      });
      toast({ title: 'Manual report created successfully' });
      setCreateDialogOpen(false);
      setManualForm({
        name: '',
        description: '',
        sectionTitle: '',
        sectionData: '',
        note: '',
        type: 'analytics',
        period: 'monthly',
      });
      fetchAll();
    } catch (error: any) {
      toast({ title: 'Error creating manual report', description: error.response?.data?.error || error.message, variant: 'destructive' });
    }
  };

  const handleShowReport = async (template: ReportTemplate) => {
    const reportId = `temp_${Date.now()}`;
    setGeneratingReports(prev => new Set(prev).add(reportId));

    try {
      const result = await generateReport(template.id, {
        dateRange: '30d',
        format: 'interactive',
        filters: []
      });

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
      await deleteReportApi(reportId);
      toast({ title: 'Report deleted' });
      fetchAll();
    } catch (error) {
      toast({ title: 'Error deleting report', description: 'Please try again later.', variant: 'destructive' });
    }
  };

  const handleViewReport = async (reportId: string) => {
    try {
      const report = await fetchReportById(reportId);
      if (report && report.parameters && report.sections) {
        setViewingReport(report);
      } else if (report && report.data) {
        setViewingReport(report.data);
      } else {
        toast({ title: 'Error', description: 'No report data available', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load report', variant: 'destructive' });
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
          <Button variant="outline" onClick={fetchAll}>
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
                  Choose a template or create a custom report manually
                </DialogDescription>
              </DialogHeader>
              <Tabs selectedIndex={createMode === 'template' ? 0 : 1} onSelect={i => setCreateMode(i === 0 ? 'template' : 'manual')} className="w-full">
                <TabList className="mb-4">
                  <Tab>From Template</Tab>
                  <Tab>Manual</Tab>
                </TabList>
                <TabPanel>
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
                                    checked={selectedFields.includes(field)}
                                    onChange={e => {
                                      setSelectedFields(prev =>
                                        e.target.checked ? [...prev, field] : prev.filter(f => f !== field)
                                      );
                                    }}
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
                </TabPanel>
                <TabPanel>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="manualReportName">Report Title</Label>
                      <Input
                        id="manualReportName"
                        placeholder="Enter report title"
                        value={manualForm.name}
                        onChange={e => setManualForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manualReportDescription">Description</Label>
                      <textarea
                        id="manualReportDescription"
                        rows={2}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="Enter description"
                        value={manualForm.description}
                        onChange={e => setManualForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manualSectionTitle">Section Title</Label>
                      <Input
                        id="manualSectionTitle"
                        placeholder="Section title (optional)"
                        value={manualForm.sectionTitle}
                        onChange={e => setManualForm(prev => ({ ...prev, sectionTitle: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manualSectionData">Section Data (JSON or text)</Label>
                      <textarea
                        id="manualSectionData"
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder='Example: {"customMetric": 42}'
                        value={manualForm.sectionData}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setManualForm(prev => ({ ...prev, sectionData: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manualNote">Note/Metadata</Label>
                      <Input
                        id="manualNote"
                        placeholder="Optional note or metadata"
                        value={manualForm.note}
                        onChange={e => setManualForm(prev => ({ ...prev, note: e.target.value }))}
                      />
                    </div>
                  </div>
                </TabPanel>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setSelectedTemplate(null);
                  setCreateDialogOpen(false);
                }}>
                  Cancel
                </Button>
                {createMode === 'template' && selectedTemplate && (
                  <Button onClick={handleCreateReport} className="bg-purple-600 hover:bg-purple-700">
                    Create Report
                  </Button>
                )}
                {createMode === 'manual' && (
                  <Button onClick={handleManualCreateReport} className="bg-purple-600 hover:bg-purple-700">
                    Create Manual Report
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
            {reports.map((report) => {
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
                        <span>{report.parameters?.format ? report.parameters.format.toUpperCase() : ''}</span>
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
                          onClick={() => handleViewReport(report.id)}
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

          {reports.length === 0 && (
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

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} variant="outline">Previous</Button>
        <span>Page {page} of {totalPages} ({total} reports)</span>
        <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} variant="outline">Next</Button>
        <select
          className="ml-4 border rounded px-2 py-1"
          value={limit}
          onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className="ml-2 text-sm text-gray-500">per page</span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
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