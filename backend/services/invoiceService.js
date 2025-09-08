const { format } = require('date-fns');

/**
 * Invoice Service - Handles invoice generation and related operations
 */
class InvoiceService {
  /**
   * Generate invoice HTML for a subscription payment
   * @param {Object} payment - Payment object
   * @param {Object} subscription - Subscription object
   * @param {Object} plan - Plan object
   * @param {Object} owner - Owner/User object
   * @returns {string} HTML string for the invoice
   */
  generateInvoiceHTML(payment, subscription, plan, owner, billingHistory) {
    const invoiceNumber = (billingHistory && (billingHistory.invoice_number || billingHistory.invoiceNumber)) || `INV-${payment.id.slice(0, 8).toUpperCase()}`;
    const paymentDate = payment.payment_date || payment.created_at || new Date();
    const amount = Number(payment.amount || 0);
    const taxAmount = Number(payment.tax_amount || 0);
    const subtotal = amount - taxAmount;
    const transactionId = (billingHistory && (billingHistory.transaction_id || billingHistory.transactionId)) || 'N/A';

    return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${invoiceNumber}</title>
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
                <span class="status-badge status-${payment.status}">${payment.status.toUpperCase()}</span>
              </div>
            </div>

            <!-- Invoice Details -->
            <div class="invoice-details">
              <div class="bill-to">
                <h3>Bill To</h3>
                <p><strong>${owner.name || 'Salon Owner'}</strong></p>
                <p>${owner.email || ''}</p>
                ${owner.phone ? `<p>Phone: ${owner.phone}</p>` : ''}
              </div>
              <div class="invoice-meta">
                <h3>Invoice Details</h3>
                <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
                <p><strong>Date:</strong> ${format(new Date(paymentDate), "MMMM dd, yyyy")}</p>
                <p><strong>Due Date:</strong> ${format(new Date(paymentDate), "MMMM dd, yyyy")}</p>
                <p><strong>Billing Period:</strong> ${format(new Date(paymentDate), "MMM dd")} - ${format(new Date(new Date(paymentDate).getTime() + 30 * 24 * 60 * 60 * 1000), "MMM dd, yyyy")}</p>
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
                    <strong>Subscription Payment</strong><br>
                    <small>Subscription service for salon management platform</small>
                  </td>
                  <td>${plan.name || 'Subscription'} Plan</td>
                  <td>${payment.billing_cycle || subscription?.billingCycle || 'monthly'}</td>
                  <td>$${subtotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <!-- Payment Information -->
            <div class="payment-info">
              <h4>Payment Information</h4>
              <p><strong>Payment Method:</strong> ${payment.method || 'Credit Card'}</p>
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              <p><strong>Payment Date:</strong> ${format(new Date(paymentDate), "MMMM dd, yyyy")}</p>
            </div>

            <!-- Totals -->
            <div class="totals-section">
              <table class="totals-table">
                <tr>
                  <td>Subtotal:</td>
                  <td>$${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Tax:</td>
                  <td>$${taxAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td><strong>Total Amount:</strong></td>
                  <td><strong>$${amount.toFixed(2)}</strong></td>
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
        </body>
      </html>`;
  }

  /**
   * Generate plain text version of invoice for email
   * @param {Object} payment - Payment object
   * @param {Object} subscription - Subscription object
   * @param {Object} plan - Plan object
   * @param {Object} owner - Owner/User object
   * @returns {string} Plain text version of the invoice
   */
  generateInvoiceText(payment, subscription, plan, owner, billingHistory) {
    const invoiceNumber = (billingHistory && (billingHistory.invoice_number || billingHistory.invoiceNumber)) || `INV-${payment.id.slice(0, 8).toUpperCase()}`;
    const paymentDate = payment.payment_date || payment.created_at || new Date();
    const amount = Number(payment.amount || 0);
    const taxAmount = Number(payment.tax_amount || 0);
    const subtotal = amount - taxAmount;
    const transactionId = (billingHistory && (billingHistory.transaction_id || billingHistory.transactionId)) || 'N/A';

    return `
INVOICE ${invoiceNumber}
═══════════════════════════════════════════════════════════════

Hairvana - Professional Salon Management Platform
admin@hairvana.com | (555) 123-4567

═══════════════════════════════════════════════════════════════

BILL TO:
${owner.name || 'Salon Owner'}
${owner.email || ''}
${owner.phone ? `Phone: ${owner.phone}` : ''}

INVOICE DETAILS:
Invoice #: ${invoiceNumber}
Date: ${format(new Date(paymentDate), "MMMM dd, yyyy")}
Due Date: ${format(new Date(paymentDate), "MMMM dd, yyyy")}
Billing Period: ${format(new Date(paymentDate), "MMM dd")} - ${format(new Date(new Date(paymentDate).getTime() + 30 * 24 * 60 * 60 * 1000), "MMM dd, yyyy")}

═══════════════════════════════════════════════════════════════

SERVICE DETAILS:
───────────────────────────────────────────────────────────────
Description: Subscription Payment
Plan: ${plan.name || 'Subscription'} Plan
Billing Cycle: ${payment.billing_cycle || subscription?.billingCycle || 'monthly'}
Amount: $${subtotal.toFixed(2)}

═══════════════════════════════════════════════════════════════

PAYMENT INFORMATION:
Payment Method: ${payment.method || 'Credit Card'}
Transaction ID: ${transactionId}
Payment Date: ${format(new Date(paymentDate), "MMMM dd, yyyy")}

═══════════════════════════════════════════════════════════════

TOTALS:
Subtotal: $${subtotal.toFixed(2)}
Tax: $${taxAmount.toFixed(2)}
───────────────────────────────────────────────────────────────
TOTAL AMOUNT: $${amount.toFixed(2)}

═══════════════════════════════════════════════════════════════

Thank you for your business!

This invoice was generated automatically by the Hairvana platform.
For questions about this invoice, please contact our support team.

Hairvana Inc. | 123 Business Ave, Suite 100 | Business City, BC 12345
© ${new Date().getFullYear()} Hairvana. All rights reserved.
═══════════════════════════════════════════════════════════════
    `;
  }
}

module.exports = new InvoiceService();
