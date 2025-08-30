# Automatic Invoice Generation System

This document describes the automatic invoice generation and email sending system that has been implemented for subscription payments in the Hairvana platform.

## Overview

When a payment is created using the endpoint `{{ServerUrl}}/api/v0/salon/subscription/payment/create-payment`, the system now automatically:

1. **Generates a professional invoice** with all payment details
2. **Sends the invoice via email** to the salon owner
3. **Provides both HTML and plain text versions** of the invoice

## Features

### 🎨 Professional Invoice Design
- **Modern HTML template** with Hairvana branding
- **Responsive design** that works on all devices
- **Print-friendly** styling for physical copies
- **Professional color scheme** with gradients and proper typography

### 📧 Email Integration
- **Automatic email sending** when payments are processed
- **Rich HTML email** with embedded invoice
- **Plain text fallback** for email clients that don't support HTML
- **Professional email templates** with Hairvana branding

### 🔧 Technical Features
- **Automatic invoice numbering** (INV-XXXXXXXX format)
- **Tax calculation support** (subtotal, tax, total)
- **Multiple payment method support** (Stripe, etc.)
- **Billing cycle information** (monthly/yearly)
- **Transaction ID tracking**

## Implementation Details

### Files Created/Modified

#### New Files:
- `backend/services/invoiceService.js` - Invoice generation service
- `backend/test-invoice.js` - Test script for invoice functionality

#### Modified Files:
- `backend/services/emailService.js` - Extended with invoice email functionality
- `backend/services/subscriptionPaymentService.js` - Added automatic invoice sending
- `backend/controllers/Api/salon/subscriptionPaymentController.js` - Added manual invoice endpoint
- `backend/routes/Api/v0/salon/subscription.js` - Added invoice route

### Key Functions

#### Invoice Generation
```javascript
// Generate HTML invoice
const htmlInvoice = invoiceService.generateInvoiceHTML(payment, subscription, plan, owner);

// Generate text invoice
const textInvoice = invoiceService.generateInvoiceText(payment, subscription, plan, owner);
```

#### Email Sending
```javascript
// Send invoice email
const emailSent = await emailService.sendInvoiceEmail(
  owner.email,
  payment,
  subscription,
  plan,
  owner
);
```

#### Automatic Integration
```javascript
// Automatically called when payment is successful
exports.handleSuccessfulSubscriptionPayment = async (paymentIntentId) => {
  // ... payment processing ...
  
  // Send invoice email after successful transaction
  const emailSent = await emailService.sendInvoiceEmail(
    result.owner.email,
    result.payment,
    result.subscription,
    result.plan,
    result.owner
  );
};
```

## API Endpoints

### Automatic Invoice (Built-in)
When a payment is created via `POST /api/v0/salon/subscription/payment/create-payment`, the invoice is automatically generated and sent.

### Manual Invoice Sending
```
POST /api/v0/salon/subscription/payment/:paymentId/send-invoice
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice email sent successfully",
  "data": {
    "email": "owner@salon.com",
    "paymentId": "payment-uuid",
    "sent": true
  }
}
```

## Invoice Content

### Invoice Includes:
- **Company Information**: Hairvana branding and contact details
- **Bill To**: Salon owner information
- **Invoice Details**: Invoice number, date, due date, billing period
- **Service Details**: Plan name, billing cycle, amount
- **Payment Information**: Payment method, transaction ID, payment date
- **Totals**: Subtotal, tax, total amount
- **Footer**: Company address and support information

### Email Content:
- **Professional header** with Hairvana branding
- **Payment summary** with key details
- **Embedded invoice** (HTML version)
- **Plain text invoice** (fallback)
- **Support information** and contact details

## Configuration

### Email Settings
The system uses the existing email configuration:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@hairvana.com
```

### Dependencies
- `date-fns` - For date formatting (already installed)
- `nodemailer` - For email sending (already installed)

## Testing

### Run Test Script
```bash
cd backend
node test-invoice.js
```

This will:
1. Test invoice generation (HTML and text)
2. Test email template generation
3. Save sample files to `backend/test-output/`
4. Test email sending (if configured)

### Sample Files Generated:
- `sample-invoice.html` - HTML invoice
- `sample-invoice.txt` - Text invoice
- `sample-email.html` - HTML email
- `sample-email.txt` - Text email

## Error Handling

### Graceful Degradation
- **Email failures don't break payment processing**
- **Invoice generation errors are logged but don't stop the flow**
- **Fallback values for missing data**

### Logging
- **Success logs**: Invoice sent successfully
- **Error logs**: Failed email attempts
- **Debug logs**: Invoice generation details

## Security Considerations

### Data Protection
- **Email addresses are validated** before sending
- **Payment data is sanitized** in invoice generation
- **No sensitive payment details** in email content

### Access Control
- **Manual invoice sending** requires authentication
- **Payment ownership verification** before sending
- **User can only send invoices for their own payments**

## Future Enhancements

### Potential Improvements:
1. **PDF generation** for invoices
2. **Invoice storage** in database
3. **Invoice history** in admin dashboard
4. **Custom invoice templates** per salon
5. **Multi-language support**
6. **Invoice download** from dashboard
7. **Bulk invoice sending** for multiple payments

### Integration Opportunities:
1. **Accounting software** integration
2. **Tax calculation** services
3. **Payment gateway** webhooks
4. **CRM system** integration

## Troubleshooting

### Common Issues:

#### Email Not Sending
- Check email configuration in environment variables
- Verify SMTP settings
- Check email provider limits

#### Invoice Generation Errors
- Verify payment data structure
- Check date formatting
- Ensure all required fields are present

#### Missing Dependencies
- Ensure `date-fns` is installed
- Verify `nodemailer` configuration
- Check file permissions

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=invoice:*
```

## Support

For issues with the invoice system:
1. Check the logs for error messages
2. Run the test script to verify functionality
3. Verify email configuration
4. Contact the development team

---

**Note**: This system is designed to be robust and handle edge cases gracefully. If email sending fails, the payment process continues normally, and the failure is logged for investigation.
