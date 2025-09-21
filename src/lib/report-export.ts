import * as ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export interface ReportData {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  createdAt: string;
  generatedAt: string;
  createdBy: string;
  size: string;
  downloadUrl: string;
  parameters: {
    fields: string[];
    format: string;
    endDate: string;
    filters: string[];
    schedule: string;
    dateRange: string;
    startDate: string;
  };
  title: string;
  metadata: {
    period: string;
    createdAt: string;
    autoFilled: boolean;
    reportPeriod?: string;
    generatedAt?: string;
  };
  sections: Array<{
    data: any;
    type: string;
    title: string;
    chartType?: string;
  }>;
}

export class ReportExporter {
  private reportData: ReportData;

  constructor(reportData: ReportData) {
    this.reportData = reportData;
  }

  // Enhanced Excel Export with Professional Formatting
  async exportToExcel(): Promise<void> {
    try {
      const workbook = new ExcelJS.Workbook();
    
    // Set workbook properties
    workbook.creator = "Hairvana Admin Dashboard";
    workbook.lastModifiedBy = "Hairvana Reports";
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.properties.title = this.reportData.title;
    workbook.properties.description = this.reportData.description;
    workbook.properties.keywords = "Hairvana, Reports, Analytics, Financial, Subscription";
    workbook.properties.category = "Business Reports";

    // Create main summary sheet
    const summarySheet = workbook.addWorksheet("Report Summary", {
      properties: { tabColor: { argb: "8b5cf6" } }
    });

    // Add report header
    this.addReportHeader(summarySheet);
    
    // Add report metadata
    this.addReportMetadata(summarySheet);
    
    // Add key metrics
    this.addKeyMetrics(summarySheet);

    // Create detailed sheets for each section
    this.reportData.sections.forEach((section, index) => {
      if (section.type === "summary" && section.data) {
        this.createDetailedSheet(workbook, section, index);
      }
    });

    // Add explanatory notes section to summary sheet
    this.addExplanatoryNotesToSummary(summarySheet);

    // Create charts sheet
    this.createChartsSheet(workbook);

      // Generate and download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      
      this.downloadFile(blob, `${this.reportData.title.replace(/\s+/g, '-').toLowerCase()}-report.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('Failed to export report to Excel format');
    }
  }

  // PDF Export with Professional Layout
  async exportToPDF(): Promise<void> {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Add company header
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(31, 41, 55); // Dark gray
    pdf.text("HAIRVANA ADMIN DASHBOARD", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    // Add decorative line
    pdf.setDrawColor(139, 92, 246); // Purple
    pdf.setLineWidth(2);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 15;

    // Add title
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(139, 92, 246); // Purple
    pdf.text(this.reportData.title, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Add description
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(55, 65, 81); // Gray
    const descriptionLines = pdf.splitTextToSize(this.reportData.description, pageWidth - 40);
    pdf.text(descriptionLines, 20, yPosition);
    yPosition += descriptionLines.length * 6 + 15;

    // Add metadata box
    pdf.setFillColor(249, 250, 251); // Light gray background
    pdf.rect(20, yPosition, pageWidth - 40, 25, "F");
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(31, 41, 55);
    pdf.text("Report Information", 25, yPosition + 8);
    
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated: ${new Date(this.reportData.generatedAt).toLocaleDateString()}`, 25, yPosition + 12);
    pdf.text(`Period: ${this.reportData.metadata.reportPeriod || "N/A"}`, 25, yPosition + 16);
    pdf.text(`Created by: ${this.reportData.createdBy}`, 25, yPosition + 20);
    yPosition += 35;

    // Add sections
    this.reportData.sections.forEach((section, index) => {
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      }

      // Section header with background
      pdf.setFillColor(16, 185, 129); // Green background
      pdf.rect(20, yPosition - 5, pageWidth - 40, 15, "F");
      
      // Section title
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255); // White text
      pdf.text(section.title, 25, yPosition + 3);
      yPosition += 20;

      // Section data
      if (section.type === "summary" && section.data) {
        yPosition = this.addSectionDataToPDF(pdf, section.data, yPosition, pageWidth);
      }

      yPosition += 20;
    });

    // Add general explanatory notes section
    yPosition = this.addGeneralExplanatoryNotesToPDF(pdf, yPosition, pageWidth);

      // Download the PDF
      pdf.save(`${this.reportData.title.replace(/\s+/g, '-').toLowerCase()}-report.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Failed to export report to PDF format');
    }
  }

  // Helper Methods
  private addReportHeader(worksheet: ExcelJS.Worksheet): void {
    // Company header with logo placeholder
    worksheet.mergeCells("A1:F1");
    const companyCell = worksheet.getCell("A1");
    companyCell.value = "HAIRVANA ADMIN DASHBOARD";
    companyCell.font = { bold: true, size: 14, color: { argb: "FFFFFF" } };
    companyCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "1f2937" }
    };
    companyCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 25;

    // Title
    worksheet.mergeCells("A2:F2");
    const titleCell = worksheet.getCell("A2");
    titleCell.value = this.reportData.title;
    titleCell.font = { bold: true, size: 18, color: { argb: "FFFFFF" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "8b5cf6" }
    };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(2).height = 35;

    // Description
    worksheet.mergeCells("A3:F3");
    const descCell = worksheet.getCell("A3");
    descCell.value = this.reportData.description;
    descCell.font = { size: 12, italic: true, color: { argb: "374151" } };
    descCell.alignment = { horizontal: "center", vertical: "middle" };
    descCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "f9fafb" }
    };
    worksheet.getRow(3).height = 30;

    // Add border to header section
    worksheet.getRow(1).border = {
      bottom: { style: "thin", color: { argb: "d1d5db" } }
    };
    worksheet.getRow(2).border = {
      bottom: { style: "thin", color: { argb: "d1d5db" } }
    };
    worksheet.getRow(3).border = {
      bottom: { style: "medium", color: { argb: "8b5cf6" } }
    };
  }

  private addReportMetadata(worksheet: ExcelJS.Worksheet): void {
    const metadata = [
      ["Generated", new Date(this.reportData.generatedAt).toLocaleDateString()],
      ["Period", this.reportData.metadata.reportPeriod || "N/A"],
      ["Created By", this.reportData.createdBy],
      ["Report Type", this.reportData.type],
      ["Status", this.reportData.status],
      ["Size", this.reportData.size]
    ];

    let row = 5; // Start after header
    metadata.forEach(([label, value]) => {
      const labelCell = worksheet.getCell(`A${row}`);
      const valueCell = worksheet.getCell(`B${row}`);
      
      labelCell.value = label;
      labelCell.font = { bold: true, color: { argb: "374151" } };
      labelCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "f3f4f6" }
      };
      
      valueCell.value = value;
      valueCell.font = { color: { argb: "1f2937" } };
      valueCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "ffffff" }
      };
      
      // Add borders
      labelCell.border = {
        top: { style: "thin", color: { argb: "d1d5db" } },
        bottom: { style: "thin", color: { argb: "d1d5db" } },
        left: { style: "thin", color: { argb: "d1d5db" } },
        right: { style: "thin", color: { argb: "d1d5db" } }
      };
      valueCell.border = {
        top: { style: "thin", color: { argb: "d1d5db" } },
        bottom: { style: "thin", color: { argb: "d1d5db" } },
        left: { style: "thin", color: { argb: "d1d5db" } },
        right: { style: "thin", color: { argb: "d1d5db" } }
      };
      
      row++;
    });

    // Style the metadata section
    worksheet.getRow(4).height = 20;
    for (let i = 5; i < row; i++) {
      worksheet.getRow(i).height = 20;
    }
  }

  private addKeyMetrics(worksheet: ExcelJS.Worksheet): void {
    const summarySection = this.reportData.sections.find(s => s.type === "summary");
    if (!summarySection || !summarySection.data) return;

    let row = 12; // Start after metadata
    
    // Add section header
    const headerCell = worksheet.getCell(`A${row}`);
    headerCell.value = "Key Metrics Summary";
    headerCell.font = { bold: true, size: 18, color: { argb: "FFFFFF" } };
    headerCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "10b981" }
    };
    headerCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.mergeCells(`A${row}:D${row}`);
    worksheet.getRow(row).height = 35;
    row++;

    // Add table headers
    const headers = ["Metric", "Value", "Type", "Description"];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(row, index + 1);
      cell.value = header;
      cell.font = { bold: true, size: 12, color: { argb: "FFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "374151" }
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "medium", color: { argb: "1f2937" } },
        bottom: { style: "medium", color: { argb: "1f2937" } },
        left: { style: "medium", color: { argb: "1f2937" } },
        right: { style: "medium", color: { argb: "1f2937" } }
      };
    });
    worksheet.getRow(row).height = 25;
    row++;

    // Add metrics with enhanced table formatting
    const metrics = this.extractSimpleMetrics(summarySection.data);
    metrics.forEach(([key, value], index) => {
      const metricCell = worksheet.getCell(`A${row}`);
      const valueCell = worksheet.getCell(`B${row}`);
      const typeCell = worksheet.getCell(`C${row}`);
      const descCell = worksheet.getCell(`D${row}`);
      
      // Metric name
      metricCell.value = this.formatMetricName(key);
      metricCell.font = { bold: true, color: { argb: "1f2937" } };
      
      // Value with conditional formatting
      valueCell.value = this.formatMetricValue(value, key);
      if (typeof value === "number") {
        if (key.toLowerCase().includes("revenue") || key.toLowerCase().includes("profit")) {
          valueCell.numFmt = '"$"#,##0.00';
          valueCell.font = { bold: true, color: { argb: "059669" } }; // Green for revenue
        } else if (key.toLowerCase().includes("rate") || key.toLowerCase().includes("margin")) {
          valueCell.numFmt = "0.00%";
          valueCell.font = { bold: true, color: { argb: "dc2626" } }; // Red for rates
        } else {
          valueCell.font = { bold: true, color: { argb: "1f2937" } };
        }
      } else {
        valueCell.font = { bold: true, color: { argb: "1f2937" } };
      }
      
      // Type classification
      typeCell.value = this.getMetricType(key, value);
      typeCell.font = { italic: true, color: { argb: "6b7280" } };
      
      // Description
      descCell.value = this.getMetricDescription(key);
      descCell.font = { size: 10, color: { argb: "6b7280" } };
      descCell.alignment = { wrapText: true, vertical: "top" };
      
      // Apply alternating row colors
      const bgColor = index % 2 === 0 ? "f9fafb" : "ffffff";
      [metricCell, valueCell, typeCell, descCell].forEach(cell => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: bgColor }
        };
        cell.border = {
          top: { style: "thin", color: { argb: "d1d5db" } },
          bottom: { style: "thin", color: { argb: "d1d5db" } },
          left: { style: "thin", color: { argb: "d1d5db" } },
          right: { style: "thin", color: { argb: "d1d5db" } }
        };
      });
      
      worksheet.getRow(row).height = 30;
      row++;
    });

    // Set column widths
    worksheet.getColumn("A").width = 35;
    worksheet.getColumn("B").width = 20;
    worksheet.getColumn("C").width = 15;
    worksheet.getColumn("D").width = 50;
  }

  private addExplanatoryNotesToSummary(worksheet: ExcelJS.Worksheet): void {
    const summarySection = this.reportData.sections.find(s => s.type === "summary");
    if (!summarySection || !summarySection.data) return;

    // Find the last row with data
    let lastRow = 12; // Start after key metrics
    const metrics = this.extractSimpleMetrics(summarySection.data);
    lastRow += metrics.length + 4; // Account for table headers

    // Add explanatory notes section with enhanced formatting
    const notesHeader = worksheet.getCell(`A${lastRow}`);
    notesHeader.value = "📊 Calculation Explanations & Methodology";
    notesHeader.font = { bold: true, size: 16, color: { argb: "FFFFFF" } };
    notesHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "f59e0b" }
    };
    notesHeader.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.mergeCells(`A${lastRow}:D${lastRow}`);
    worksheet.getRow(lastRow).height = 30;
    lastRow++;

    // Add methodology section
    const methodologyHeader = worksheet.getCell(`A${lastRow}`);
    methodologyHeader.value = "📈 General Methodology";
    methodologyHeader.font = { bold: true, size: 12, color: { argb: "1f2937" } };
    methodologyHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "fef3c7" }
    };
    worksheet.mergeCells(`A${lastRow}:D${lastRow}`);
    worksheet.getRow(lastRow).height = 25;
    lastRow++;

    // Add general explanatory notes with enhanced formatting
    const generalNotes = [
      {
        title: "Report Scope",
        description: "This report contains subscription-based financial metrics only, focusing on recurring revenue streams."
      },
      {
        title: "Industry Standards",
        description: "All calculations are based on industry standards for SaaS businesses and subscription models."
      },
      {
        title: "Monthly Revenue Calculation",
        description: "Monthly Revenue includes both monthly subscriptions and monthly equivalent of annual subscriptions (Annual ÷ 12)."
      },
      {
        title: "Expense Calculation",
        description: "Expenses are calculated as 30% of subscription revenue, following industry standard SaaS cost structures."
      },
      {
        title: "Profit Margins",
        description: "Profit margins reflect typical SaaS business performance metrics and industry benchmarks."
      }
    ];

    generalNotes.forEach((note, index) => {
      // Title cell
      const titleCell = worksheet.getCell(`A${lastRow}`);
      titleCell.value = `• ${note.title}`;
      titleCell.font = { bold: true, color: { argb: "1f2937" }, size: 11 };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: index % 2 === 0 ? "fef3c7" : "fef7cd" }
      };
      
      // Description cell
      const descCell = worksheet.getCell(`B${lastRow}`);
      descCell.value = note.description;
      descCell.font = { color: { argb: "374151" }, size: 10 };
      descCell.alignment = { wrapText: true, vertical: "top" };
      descCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: index % 2 === 0 ? "fef3c7" : "fef7cd" }
      };
      
      // Merge cells for better layout
      worksheet.mergeCells(`B${lastRow}:D${lastRow}`);
      
      // Add borders
      [titleCell, descCell].forEach(cell => {
        cell.border = {
          top: { style: "thin", color: { argb: "f59e0b" } },
          bottom: { style: "thin", color: { argb: "f59e0b" } },
          left: { style: "thin", color: { argb: "f59e0b" } },
          right: { style: "thin", color: { argb: "f59e0b" } }
        };
      });
      
      worksheet.getRow(lastRow).height = 25;
      lastRow++;
    });

    // Add detailed calculation formulas section
    lastRow += 2;
    const formulasHeader = worksheet.getCell(`A${lastRow}`);
    formulasHeader.value = "🧮 Detailed Calculation Formulas";
    formulasHeader.font = { bold: true, size: 12, color: { argb: "1f2937" } };
    formulasHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "dbeafe" }
    };
    worksheet.mergeCells(`A${lastRow}:D${lastRow}`);
    worksheet.getRow(lastRow).height = 25;
    lastRow++;

    const formulas = [
      {
        metric: "Monthly Revenue",
        formula: "Monthly Revenue = Actual Monthly Subscriptions + (Actual Annual Subscriptions ÷ 12)"
      },
      {
        metric: "Total Expenses",
        formula: "Total Expenses = 30% of Subscription Revenue (Industry Standard)"
      },
      {
        metric: "Gross Profit",
        formula: "Gross Profit = Total Revenue - Total Costs"
      },
      {
        metric: "Net Profit",
        formula: "Net Profit = Gross Profit - Additional Costs (10% for taxes, fees, etc.)"
      },
      {
        metric: "Profit Margin",
        formula: "Profit Margin = (Gross Profit ÷ Total Revenue) × 100"
      }
    ];

    formulas.forEach((formula, index) => {
      // Metric cell
      const metricCell = worksheet.getCell(`A${lastRow}`);
      metricCell.value = formula.metric;
      metricCell.font = { bold: true, color: { argb: "1e40af" }, size: 10 };
      metricCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: index % 2 === 0 ? "dbeafe" : "e0e7ff" }
      };
      
      // Formula cell
      const formulaCell = worksheet.getCell(`B${lastRow}`);
      formulaCell.value = formula.formula;
      formulaCell.font = { color: { argb: "374151" }, size: 9 };
      formulaCell.alignment = { wrapText: true, vertical: "top" };
      formulaCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: index % 2 === 0 ? "dbeafe" : "e0e7ff" }
      };
      
      // Merge cells for formula
      worksheet.mergeCells(`B${lastRow}:D${lastRow}`);
      
      // Add borders
      [metricCell, formulaCell].forEach(cell => {
        cell.border = {
          top: { style: "thin", color: { argb: "3b82f6" } },
          bottom: { style: "thin", color: { argb: "3b82f6" } },
          left: { style: "thin", color: { argb: "3b82f6" } },
          right: { style: "thin", color: { argb: "3b82f6" } }
        };
      });
      
      worksheet.getRow(lastRow).height = 25;
      lastRow++;
    });

    // Set column widths
    worksheet.getColumn("A").width = 25;
    worksheet.getColumn("B").width = 60;
  }

  private createDetailedSheet(workbook: ExcelJS.Workbook, section: any, index: number): void {
    const sheetName = `Section ${index + 1}`;
    const worksheet = workbook.addWorksheet(sheetName, {
      properties: { tabColor: { argb: "06b6d4" } }
    });

    // Add section title
    const titleCell = worksheet.getCell("A1");
    titleCell.value = section.title;
    titleCell.font = { bold: true, size: 14, color: { argb: "FFFFFF" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "06b6d4" }
    };
    worksheet.getRow(1).height = 25;

    // Add detailed data
    this.addDetailedDataToSheet(worksheet, section.data);
  }

  private createChartsSheet(workbook: ExcelJS.Workbook): void {
    const worksheet = workbook.addWorksheet("Charts & Visualizations", {
      properties: { tabColor: { argb: "f59e0b" } }
    });

    // Add title
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "Charts & Visualizations";
    titleCell.font = { bold: true, size: 14, color: { argb: "FFFFFF" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "f59e0b" }
    };
    worksheet.getRow(1).height = 25;

    // Add note about charts
    const noteCell = worksheet.getCell("A3");
    noteCell.value = "Note: Charts and visualizations are available in the web interface. This sheet contains the underlying data for chart generation.";
    noteCell.font = { italic: true, color: { argb: "666666" } };
    noteCell.alignment = { wrapText: true };
    worksheet.getRow(3).height = 40;
    worksheet.getColumn("A").width = 80;
  }

  private addDetailedDataToSheet(worksheet: ExcelJS.Worksheet, data: any): void {
    let row = 3;
    
    // Handle complex data objects
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        // Complex object - create a subsection with table format
        const headerCell = worksheet.getCell(`A${row}`);
        headerCell.value = `📊 ${this.formatMetricName(key)}`;
        headerCell.font = { bold: true, size: 14, color: { argb: "FFFFFF" } };
        headerCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "8b5cf6" }
        };
        headerCell.alignment = { horizontal: "center", vertical: "middle" };
        worksheet.mergeCells(`A${row}:D${row}`);
        worksheet.getRow(row).height = 25;
        row++;

        // Add table headers for complex objects
        const headers = ["Metric", "Value", "Type", "Description"];
        headers.forEach((header, index) => {
          const cell = worksheet.getCell(row, index + 1);
          cell.value = header;
          cell.font = { bold: true, size: 11, color: { argb: "FFFFFF" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "6b7280" }
          };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "medium", color: { argb: "374151" } },
            bottom: { style: "medium", color: { argb: "374151" } },
            left: { style: "medium", color: { argb: "374151" } },
            right: { style: "medium", color: { argb: "374151" } }
          };
        });
        worksheet.getRow(row).height = 20;
        row++;

        // Add object properties with table formatting
        Object.entries(value as any).forEach(([subKey, subValue], index) => {
          const metricCell = worksheet.getCell(`A${row}`);
          const valueCell = worksheet.getCell(`B${row}`);
          const typeCell = worksheet.getCell(`C${row}`);
          const descCell = worksheet.getCell(`D${row}`);
          
          // Metric name
          metricCell.value = this.formatMetricName(subKey);
          metricCell.font = { bold: true, color: { argb: "1f2937" } };
          
          // Value with conditional formatting
          valueCell.value = this.formatMetricValue(subValue, subKey);
          if (typeof subValue === "number") {
            if (subKey.toLowerCase().includes("revenue") || subKey.toLowerCase().includes("profit")) {
              valueCell.numFmt = '"$"#,##0.00';
              valueCell.font = { bold: true, color: { argb: "059669" } };
            } else if (subKey.toLowerCase().includes("rate") || subKey.toLowerCase().includes("margin")) {
              valueCell.numFmt = "0.00%";
              valueCell.font = { bold: true, color: { argb: "dc2626" } };
            } else {
              valueCell.font = { bold: true, color: { argb: "1f2937" } };
            }
          } else {
            valueCell.font = { bold: true, color: { argb: "1f2937" } };
          }
          
          // Type classification
          typeCell.value = this.getMetricType(subKey, subValue);
          typeCell.font = { italic: true, color: { argb: "6b7280" } };
          
          // Description
          descCell.value = this.getMetricDescription(subKey);
          descCell.font = { size: 9, color: { argb: "6b7280" } };
          descCell.alignment = { wrapText: true, vertical: "top" };
          
          // Apply alternating row colors and borders
          const bgColor = index % 2 === 0 ? "f9fafb" : "ffffff";
          [metricCell, valueCell, typeCell, descCell].forEach(cell => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: bgColor }
            };
            cell.border = {
              top: { style: "thin", color: { argb: "d1d5db" } },
              bottom: { style: "thin", color: { argb: "d1d5db" } },
              left: { style: "thin", color: { argb: "d1d5db" } },
              right: { style: "thin", color: { argb: "d1d5db" } }
            };
          });
          
          worksheet.getRow(row).height = 25;
          row++;
        });

        // Add explanatory notes for specific sections
        row = this.addExplanatoryNotes(worksheet, key, row);
        row += 2; // Add spacing
      } else if (typeof value === "number" || typeof value === "string") {
        // Simple metric with enhanced formatting
        const keyCell = worksheet.getCell(`A${row}`);
        const valueCell = worksheet.getCell(`B${row}`);
        const typeCell = worksheet.getCell(`C${row}`);
        const descCell = worksheet.getCell(`D${row}`);
        
        keyCell.value = this.formatMetricName(key);
        keyCell.font = { bold: true, color: { argb: "1f2937" } };
        
        valueCell.value = this.formatMetricValue(value, key);
        if (typeof value === "number") {
          if (key.toLowerCase().includes("revenue") || key.toLowerCase().includes("profit")) {
            valueCell.numFmt = '"$"#,##0.00';
            valueCell.font = { bold: true, color: { argb: "059669" } };
          } else if (key.toLowerCase().includes("rate") || key.toLowerCase().includes("margin")) {
            valueCell.numFmt = "0.00%";
            valueCell.font = { bold: true, color: { argb: "dc2626" } };
          } else {
            valueCell.font = { bold: true, color: { argb: "1f2937" } };
          }
        } else {
          valueCell.font = { bold: true, color: { argb: "1f2937" } };
        }
        
        typeCell.value = this.getMetricType(key, value);
        typeCell.font = { italic: true, color: { argb: "6b7280" } };
        
        descCell.value = this.getMetricDescription(key);
        descCell.font = { size: 9, color: { argb: "6b7280" } };
        descCell.alignment = { wrapText: true, vertical: "top" };
        
        // Apply formatting
        const bgColor = "f9fafb";
        [keyCell, valueCell, typeCell, descCell].forEach(cell => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: bgColor }
          };
          cell.border = {
            top: { style: "thin", color: { argb: "d1d5db" } },
            bottom: { style: "thin", color: { argb: "d1d5db" } },
            left: { style: "thin", color: { argb: "d1d5db" } },
            right: { style: "thin", color: { argb: "d1d5db" } }
          };
        });
        
        worksheet.getRow(row).height = 25;
        row++;
      }
    });

    // Set column widths
    worksheet.getColumn("A").width = 35;
    worksheet.getColumn("B").width = 20;
    worksheet.getColumn("C").width = 15;
    worksheet.getColumn("D").width = 50;
  }

  private addExplanatoryNotes(worksheet: ExcelJS.Worksheet, sectionKey: string, row: number): number {
    const notes = this.getExplanatoryNotes(sectionKey);
    if (!notes) return row;

    // Add explanation header with enhanced formatting
    const explanationHeader = worksheet.getCell(`A${row}`);
    explanationHeader.value = "💡 Calculation Explanation";
    explanationHeader.font = { bold: true, size: 12, color: { argb: "1f2937" } };
    explanationHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "fef3c7" }
    };
    explanationHeader.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.mergeCells(`A${row}:D${row}`);
    worksheet.getRow(row).height = 25;
    row++;

    // Add explanation text with enhanced formatting
    notes.forEach((note, index) => {
      const noteCell = worksheet.getCell(`A${row}`);
      noteCell.value = `• ${note}`;
      noteCell.font = { italic: true, color: { argb: "374151" }, size: 10 };
      noteCell.alignment = { wrapText: true, vertical: "top" };
      noteCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: index % 2 === 0 ? "fef3c7" : "fef7cd" }
      };
      noteCell.border = {
        top: { style: "thin", color: { argb: "f59e0b" } },
        bottom: { style: "thin", color: { argb: "f59e0b" } },
        left: { style: "thin", color: { argb: "f59e0b" } },
        right: { style: "thin", color: { argb: "f59e0b" } }
      };
      worksheet.mergeCells(`A${row}:D${row}`);
      worksheet.getRow(row).height = 25;
      row++;
    });

    return row;
  }

  private getExplanatoryNotes(sectionKey: string): string[] | null {
    const notesMap: { [key: string]: string[] } = {
      revenue: [
        "Monthly Revenue = Actual Monthly Subscriptions + (Actual Annual Subscriptions ÷ 12)",
        "This represents your total monthly cash flow equivalent from all subscription types.",
        "Yearly Revenue shows only annual subscriptions, not total revenue."
      ],
      expenses: [
        "Total Expenses = 30% of Subscription Revenue (industry standard for SaaS businesses)",
        "Breakdown: 70% Operational (hosting, support, maintenance), 20% Marketing (customer acquisition), 10% Administrative (overhead)"
      ],
      profitMargin: [
        "Gross Profit = Total Revenue - Total Costs (30% of revenue)",
        "Net Profit = Gross Profit - Additional Costs (10% for taxes, fees, etc.)"
      ],
      cashFlow: [
        "Operating: 70% of revenue (core business operations)",
        "Investing: -10% of revenue (capital investments)",
        "Financing: 5% of revenue (funding activities)",
        "Net Cash Flow = Operating + Investing + Financing (represents monthly cash position)"
      ],
      financialRatios: [
        "Profit Margin: 70% (industry standard for SaaS)",
        "Operating Margin: 70% (before additional costs)",
        "Net Margin: 65% (after all costs)",
        "Revenue Growth: 0% (requires historical data for year-over-year comparison)"
      ],
      costAnalysis: [
        "Total Costs = 30% of Subscription Revenue (industry standard for SaaS businesses)",
        "Breakdown: 80% Operational (hosting, support, maintenance), 15% Marketing (customer acquisition), 5% Administrative (overhead)"
      ],
      budgetVsActual: [
        "Budgeted Revenue = 120% of Actual Revenue (demonstration target for growth planning)",
        "Variance = Actual Revenue - Budgeted Revenue (negative means below target, positive means above target)"
      ]
    };

    return notesMap[sectionKey] || null;
  }

  private addSectionDataToPDF(pdf: jsPDF, data: any, yPosition: number, pageWidth: number): number {
    let currentY = yPosition;

    Object.entries(data).forEach(([key, value], index) => {
      if (currentY > pdf.internal.pageSize.getHeight() - 30) {
        pdf.addPage();
        currentY = 20;
      }

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        // Complex object with enhanced formatting
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(139, 92, 246); // Purple
        pdf.text(this.formatMetricName(key), 25, currentY);
        currentY += 10;

        // Add background for complex objects
        const startY = currentY - 5;
        pdf.setFillColor(248, 250, 252); // Very light gray
        pdf.rect(25, startY, pageWidth - 50, 5, "F");
        currentY += 5;

        Object.entries(value as any).forEach(([subKey, subValue], subIndex) => {
          if (currentY > pdf.internal.pageSize.getHeight() - 20) {
            pdf.addPage();
            currentY = 20;
          }

          // Alternate row colors
          if (subIndex % 2 === 0) {
            pdf.setFillColor(249, 250, 251);
            pdf.rect(25, currentY - 3, pageWidth - 50, 8, "F");
          }

          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(31, 41, 55);
          pdf.text(this.formatMetricName(subKey), 30, currentY);
          
          pdf.setFont("helvetica", "normal");
          const formattedValue = this.formatMetricValue(subValue, subKey);
          if (typeof subValue === "number") {
            if (subKey.toLowerCase().includes("revenue") || subKey.toLowerCase().includes("profit")) {
              pdf.setTextColor(5, 150, 105); // Green for revenue
            } else if (subKey.toLowerCase().includes("rate") || subKey.toLowerCase().includes("margin")) {
              pdf.setTextColor(220, 38, 38); // Red for rates
            } else {
              pdf.setTextColor(31, 41, 55);
            }
          } else {
            pdf.setTextColor(31, 41, 55);
          }
          pdf.text(formattedValue, pageWidth - 100, currentY);
          currentY += 8;
        });

        // Add explanatory notes for this section
        currentY = this.addExplanatoryNotesToPDF(pdf, key, currentY, pageWidth);
        currentY += 10;
      } else {
        // Simple metric with enhanced formatting
        if (index % 2 === 0) {
          pdf.setFillColor(249, 250, 251);
          pdf.rect(25, currentY - 3, pageWidth - 50, 8, "F");
        }

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(31, 41, 55);
        pdf.text(this.formatMetricName(key), 30, currentY);
        
        pdf.setFont("helvetica", "normal");
        const formattedValue = this.formatMetricValue(value, key);
        if (typeof value === "number") {
          if (key.toLowerCase().includes("revenue") || key.toLowerCase().includes("profit")) {
            pdf.setTextColor(5, 150, 105); // Green for revenue
          } else if (key.toLowerCase().includes("rate") || key.toLowerCase().includes("margin")) {
            pdf.setTextColor(220, 38, 38); // Red for rates
          } else {
            pdf.setTextColor(31, 41, 55);
          }
        } else {
          pdf.setTextColor(31, 41, 55);
        }
        pdf.text(formattedValue, pageWidth - 100, currentY);
        currentY += 8;
      }
    });

    return currentY;
  }

  private addExplanatoryNotesToPDF(pdf: jsPDF, sectionKey: string, yPosition: number, pageWidth: number): number {
    const notes = this.getExplanatoryNotes(sectionKey);
    if (!notes) return yPosition;

    let currentY = yPosition;

    // Check if we need a new page
    if (currentY > pdf.internal.pageSize.getHeight() - 40) {
      pdf.addPage();
      currentY = 20;
    }

    // Add explanation header
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(102, 102, 102); // Gray color
    pdf.text("Calculation Explanation:", 30, currentY);
    currentY += 5;

    // Add explanation text
    notes.forEach(note => {
      if (currentY > pdf.internal.pageSize.getHeight() - 15) {
        pdf.addPage();
        currentY = 20;
      }

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(102, 102, 102); // Gray color
      
      // Split long text into multiple lines
      const lines = pdf.splitTextToSize(note, pageWidth - 50);
      lines.forEach((line: string) => {
        pdf.text(line, 35, currentY);
        currentY += 4;
      });
      currentY += 2;
    });

    // Reset text color
    pdf.setTextColor(0, 0, 0);

    return currentY;
  }

  private addGeneralExplanatoryNotesToPDF(pdf: jsPDF, yPosition: number, pageWidth: number): number {
    let currentY = yPosition;

    // Check if we need a new page
    if (currentY > pdf.internal.pageSize.getHeight() - 60) {
      pdf.addPage();
      currentY = 20;
    }

    // Add section header
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Calculation Explanations", 20, currentY);
    currentY += 15;

    // Add general explanatory notes
    const generalNotes = [
      "This report contains subscription-based financial metrics only.",
      "All calculations are based on industry standards for SaaS businesses.",
      "Monthly Revenue includes both monthly subscriptions and monthly equivalent of annual subscriptions.",
      "Expenses are calculated as 30% of subscription revenue (industry standard).",
      "Profit margins reflect typical SaaS business performance metrics."
    ];

    generalNotes.forEach(note => {
      if (currentY > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        currentY = 20;
      }

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(102, 102, 102); // Gray color
      
      // Split long text into multiple lines
      const lines = pdf.splitTextToSize(`• ${note}`, pageWidth - 40);
      lines.forEach((line: string) => {
        pdf.text(line, 20, currentY);
        currentY += 5;
      });
      currentY += 3;
    });

    // Reset text color
    pdf.setTextColor(0, 0, 0);

    return currentY;
  }

  private extractSimpleMetrics(data: any): Array<[string, any]> {
    return Object.entries(data).filter(([key, value]) => 
      (typeof value === "number" || typeof value === "string") && 
      !["keyInsights", "keyMetrics", "highlights", "insights", "systemHealth", "note"].includes(key) &&
      !["userJourney", "demographics", "engagementMetrics", "churnAnalysis"].includes(key) &&
      !["cancellationAnalysis", "popularServices", "peakTimes", "seasonalPatterns", "servicePreferences"].includes(key) &&
      !["revenue", "expenses", "profitMargin", "cashFlow", "financialRatios", "costAnalysis", "budgetVsActual"].includes(key)
    );
  }

  private formatMetricName(name: string): string {
    return name.replace(/([A-Z])/g, ' $1').trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private formatMetricValue(value: any, key: string): any {
    if (typeof value === "number") {
      if (key.toLowerCase().includes("revenue") || key.toLowerCase().includes("profit")) {
        return value.toLocaleString();
      } else if (key.toLowerCase().includes("rate") || key.toLowerCase().includes("margin")) {
        return (value / 100).toFixed(2);
      }
      return value.toLocaleString();
    }
    return String(value);
  }

  private getMetricType(key: string, value: any): string {
    if (typeof value === "number") {
      if (key.toLowerCase().includes("revenue") || key.toLowerCase().includes("profit")) {
        return "Financial";
      } else if (key.toLowerCase().includes("rate") || key.toLowerCase().includes("margin")) {
        return "Percentage";
      } else if (key.toLowerCase().includes("count") || key.toLowerCase().includes("total")) {
        return "Count";
      } else {
        return "Numeric";
      }
    }
    return "Text";
  }

  private getMetricDescription(key: string): string {
    const descriptions: { [key: string]: string } = {
      newUsers: "Number of new user registrations in the selected period",
      activeUsers: "Number of users who have been active in the selected period",
      totalSubscriptions: "Total number of subscriptions across all plans",
      activeSubscriptions: "Number of currently active subscriptions",
      cancelledSubscriptions: "Number of subscriptions cancelled in the period",
      expiredSubscriptions: "Number of subscriptions that have expired",
      totalRevenue: "Total revenue generated from all sources",
      subscriptionRevenue: "Revenue generated specifically from subscriptions",
      monthlyRevenue: "Monthly recurring revenue including annual subscriptions converted to monthly equivalent",
      yearlyRevenue: "Revenue from annual subscription plans only",
      mrr: "Monthly Recurring Revenue - predictable monthly income from subscriptions",
      annualRecurringRevenue: "Annual Recurring Revenue - predictable yearly income from subscriptions",
      averageRevenuePerUser: "Average revenue generated per user",
      customerLifetimeValue: "Estimated total value of a customer over their lifetime",
      subscriptionRetentionRate: "Percentage of subscribers who remain active",
      churnRate: "Percentage of subscribers who cancelled their subscriptions",
      growthRate: "Period-over-period growth rate",
      profitMargin: "Percentage of revenue that represents profit",
      operatingMargin: "Percentage of revenue remaining after operating expenses",
      netMargin: "Percentage of revenue remaining after all expenses"
    };

    return descriptions[key] || "Key performance indicator for business analysis";
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Export utility functions
export const exportReportToExcel = async (reportData: ReportData): Promise<void> => {
  const exporter = new ReportExporter(reportData);
  await exporter.exportToExcel();
};

export const exportReportToPDF = async (reportData: ReportData): Promise<void> => {
  const exporter = new ReportExporter(reportData);
  await exporter.exportToPDF();
};
