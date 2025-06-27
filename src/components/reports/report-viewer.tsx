'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  X
} from 'lucide-react';
import { format } from 'date-fns';

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
    const body = encodeURIComponent(`Please find the ${reportData.title} report attached.\n\nGenerated on: ${format(new Date(reportData.metadata.generatedAt), 'MMMM dd, yyyy HH:mm')}\nReport Period: ${reportData.metadata.reportPeriod}`);
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
          {Object.entries(data).filter(([key]) => 
            typeof data[key] === 'number' && !['keyInsights', 'keyMetrics', 'highlights', 'insights', 'systemHealth'].includes(key)
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
              Generated on {format(new Date(reportData.metadata.generatedAt), 'MMMM dd, yyyy HH:mm')} • 
              Period: {reportData.metadata.reportPeriod}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handlePrint} className="text-white hover:bg-white/20">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload} className="text-white hover:bg-white/20">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} className="text-white hover:bg-white/20">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleEmail} className="text-white hover:bg-white/20">
              <Mail className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
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
            <p>Generated on ${format(new Date(reportData.metadata.generatedAt), 'MMMM dd, yyyy HH:mm')} | Period: ${reportData.metadata.reportPeriod}</p>
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