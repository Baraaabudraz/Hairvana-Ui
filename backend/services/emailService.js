const nodemailer = require('nodemailer');

/**
 * Email Service - Handles sending emails for password reset and notifications
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

        initializeTransporter() {
        try {
          this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email service configuration error:', error);
        } else {
          console.log('Email service is ready to send messages');
        }
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async sendPasswordResetEmail(email, resetToken, resetUrl, userName = 'User') {
    try {
      if (!this.transporter) {
        console.error('Email transporter not initialized');
        return false;
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@hairvana.com',
        to: email,
        subject: 'Password Reset Request - Hairvana',
        html: this.generatePasswordResetEmailHTML(userName, resetUrl, resetToken),
        text: this.generatePasswordResetEmailText(userName, resetUrl, resetToken)
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  generatePasswordResetEmailHTML(userName, resetUrl, resetToken) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Hairvana</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; line-height: 1.6; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
                     <!-- Header -->
           <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%); padding: 40px 20px; text-align: center;">
             <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: white;">
                 <circle cx="6" cy="6" r="3" stroke="white" stroke-width="2"/>
                 <path d="M8.12 8.12 12 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                 <path d="M20 4 8.12 15.88" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                 <circle cx="6" cy="18" r="3" stroke="white" stroke-width="2"/>
                 <path d="M14.8 14.8 20 20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>
             </div>
            <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700; letter-spacing: -0.025em;">Hairvana</h1>
            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">Password Reset Request</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">Hello ${userName},</h2>
            
            <p style="margin: 0 0 16px; color: #6b7280; font-size: 16px;">
              We received a request to reset your password for your Hairvana account. To ensure your account security, please click the button below to create a new password.
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}?token=${resetToken}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.3); transition: all 0.2s;">
                Reset Your Password
              </a>
            </div>

            <!-- Security Notice -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#d97706" stroke-width="2"/>
                  <path d="M12 8V12" stroke="#d97706" stroke-width="2" stroke-linecap="round"/>
                  <path d="M12 16H12.01" stroke="#d97706" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <strong style="color: #92400e; font-size: 16px;">Security Information</strong>
              </div>
              <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
                <li style="margin-bottom: 4px;">This link will expire in 1 hour for your security</li>
                <li style="margin-bottom: 4px;">If you didn't request this password reset, please ignore this email</li>
                <li style="margin-bottom: 4px;">This link can only be used once for security purposes</li>
                <li style="margin-bottom: 0;">Never share this link with anyone</li>
              </ul>
            </div>

            <!-- Manual Link -->
            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; font-weight: 500;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="margin: 0; word-break: break-all; color: #8b5cf6; font-size: 12px; font-family: 'Courier New', monospace; background: #f3f4f6; padding: 8px; border-radius: 4px;">${resetUrl}?token=${resetToken}</p>
            </div>

            <!-- Support Info -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                If you have any questions or need assistance, please don't hesitate to contact our support team.
              </p>
            </div>
          </div>

                     <!-- Footer -->
           <div style="background: #f9fafb; padding: 24px 30px; text-align: center;">
             <div style="margin-bottom: 16px;">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <circle cx="6" cy="6" r="3" stroke="#8b5cf6" stroke-width="2"/>
                 <path d="M8.12 8.12 12 12" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                 <path d="M20 4 8.12 15.88" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                 <circle cx="6" cy="18" r="3" stroke="#8b5cf6" stroke-width="2"/>
                 <path d="M14.8 14.8 20 20" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>
             </div>
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; font-weight: 500;">Hairvana</p>
            <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">This email was sent from Hairvana. Please do not reply to this email.</p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} Hairvana. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePasswordResetEmailText(userName, resetUrl, resetToken) {
    return `
🔐 PASSWORD RESET REQUEST - HAIRVANA
═══════════════════════════════════════════════════════════════

Hello ${userName},

We received a request to reset your password for your Hairvana account. 
To ensure your account security, please use the link below to create a new password.

🔗 RESET YOUR PASSWORD:
${resetUrl}?token=${resetToken}

⚠️  SECURITY INFORMATION:
• This link will expire in 1 hour for your security
• If you didn't request this password reset, please ignore this email
• This link can only be used once for security purposes
• Never share this link with anyone

📧 Need help? Contact our support team if you have any questions.

Best regards,
The Hairvana Team

═══════════════════════════════════════════════════════════════
This email was sent from Hairvana. Please do not reply to this email.
© ${new Date().getFullYear()} Hairvana. All rights reserved.
    `;
  }

  /**
   * Send invoice email to salon owner
   * @param {string} email - Recipient email
   * @param {Object} payment - Payment object
   * @param {Object} subscription - Subscription object
   * @param {Object} plan - Plan object
   * @param {Object} owner - Owner/User object
   * @returns {boolean} Success status
   */
  async sendInvoiceEmail(email, payment, subscription, plan, owner, billingHistory) {
    try {
      if (!this.transporter) {
        console.error('Email transporter not initialized');
        return false;
      }

      const invoiceService = require('./invoiceService');
      const invoiceHTML = invoiceService.generateInvoiceHTML(payment, subscription, plan, owner, billingHistory);
      const invoiceText = invoiceService.generateInvoiceText(payment, subscription, plan, owner, billingHistory);
      const invoiceNumber = (billingHistory && (billingHistory.invoice_number || billingHistory.invoiceNumber)) || `INV-${payment.id.slice(0, 8).toUpperCase()}`;

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@hairvana.com',
        to: email,
        subject: `Invoice ${invoiceNumber} - ${plan.name || 'Subscription'} Payment`,
        html: this.generateInvoiceEmailHTML(owner.name || 'Salon Owner', invoiceHTML, payment, plan),
        text: this.generateInvoiceEmailText(owner.name || 'Salon Owner', invoiceText, payment, plan)
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Invoice email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('Failed to send invoice email:', error);
      return false;
    }
  }

  /**
   * Send cancellation confirmation email
   * @param {string} email
   * @param {Object} subscription
   * @param {Object} owner
   * @param {Object} plan
   * @returns {boolean}
   */
  async sendCancellationEmail(email, subscription, owner, plan) {
    try {
      if (!this.transporter) {
        console.error('Email transporter not initialized');
        return false;
      }
      const html = this.generateCancellationEmailHTML(owner.name || 'Salon Owner', subscription, plan);
      const text = this.generateCancellationEmailText(owner.name || 'Salon Owner', subscription, plan);
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@hairvana.com',
        to: email,
        subject: `Subscription Cancellation Confirmation - ${plan?.name || 'Hairvana'}`,
        html,
        text
      };
      await this.transporter.sendMail(mailOptions);
      console.log('Cancellation confirmation email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('Failed to send cancellation confirmation email:', error);
      return false;
    }
  }

  generateCancellationEmailHTML(ownerName, subscription, plan) {
    const endDate = subscription?.endDate ? new Date(subscription.endDate) : new Date();
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Cancellation - Hairvana</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; line-height: 1.6; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #f97316 50%, #f59e0b 100%); padding: 32px 20px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">Subscription Cancelled</h1>
            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.95);">${plan?.name || 'Subscription'} plan</p>
          </div>
          <div style="padding: 28px 24px;">
            <p style="margin: 0 0 12px; color: #111827; font-size: 16px;">Hello ${ownerName},</p>
            <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">This is a confirmation that your subscription has been cancelled. No further charges will occur.</p>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
              <p style="margin: 0 0 6px; color: #374151; font-size: 14px;"><strong>Plan:</strong> ${plan?.name || 'Subscription'}</p>
              <p style="margin: 0 0 6px; color: #374151; font-size: 14px;"><strong>Status:</strong> Cancelled</p>
              <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Cancelled At:</strong> ${endDate.toISOString()}</p>
            </div>
            <p style="margin: 16px 0 0; color: #6b7280; font-size: 13px;">If this was a mistake or you wish to reactivate, please log in to your dashboard.</p>
          </div>
          <div style="background: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} Hairvana. All rights reserved.</div>
        </div>
      </body>
      </html>
    `;
  }

  generateCancellationEmailText(ownerName, subscription, plan) {
    const endDate = subscription?.endDate ? new Date(subscription.endDate).toISOString() : new Date().toISOString();
    return `
SUBSCRIPTION CANCELLED - HAIRVANA

Hello ${ownerName},

This is a confirmation that your ${plan?.name || 'Subscription'} plan has been cancelled. No further charges will occur.

PLAN: ${plan?.name || 'Subscription'}
STATUS: Cancelled
CANCELLED AT: ${endDate}

If this was a mistake or you wish to reactivate, please log in to your dashboard.

© ${new Date().getFullYear()} Hairvana. All rights reserved.
    `;
  }

  /**
   * Generate HTML email template for invoice
   * @param {string} ownerName - Owner name
   * @param {string} invoiceHTML - Invoice HTML content
   * @param {Object} payment - Payment object
   * @param {Object} plan - Plan object
   * @returns {string} HTML email template
   */
  generateInvoiceEmailHTML(ownerName, invoiceHTML, payment, plan) {
    const invoiceNumber = `INV-${payment.id.slice(0, 8).toUpperCase()}`;
    const amount = Number(payment.amount || 0);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoiceNumber} - Hairvana</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; line-height: 1.6; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%); padding: 40px 20px; text-align: center;">
            <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: white;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="14,2 14,8 20,8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="10,9 9,9 8,9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700; letter-spacing: -0.025em;">Hairvana</h1>
            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">Invoice ${invoiceNumber}</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">Hello ${ownerName},</h2>
            
            <p style="margin: 0 0 16px; color: #6b7280; font-size: 16px;">
              Thank you for your subscription payment! Your invoice for the ${plan.name || 'Subscription'} plan has been generated and is attached below.
            </p>

            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#0ea5e9" stroke-width="2"/>
                  <path d="M12 6V12L16 14" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <strong style="color: #0c4a6e; font-size: 16px;">Payment Summary</strong>
              </div>
              <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                <li style="margin-bottom: 4px;">Invoice Number: ${invoiceNumber}</li>
                <li style="margin-bottom: 4px;">Amount: $${amount.toFixed(2)}</li>
                <li style="margin-bottom: 4px;">Plan: ${plan.name || 'Subscription'}</li>
                <li style="margin-bottom: 0;">Status: ${payment.status.toUpperCase()}</li>
              </ul>
            </div>

            <p style="margin: 0 0 16px; color: #6b7280; font-size: 16px;">
              Please find your detailed invoice attached below. You can also access your billing history and manage your subscription through your Hairvana dashboard.
            </p>

            <!-- Support Info -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                If you have any questions about this invoice or need assistance with your subscription, please don't hesitate to contact our support team.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 24px 30px; text-align: center;">
            <div style="margin-bottom: 16px;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="6" cy="6" r="3" stroke="#8b5cf6" stroke-width="2"/>
                <path d="M8.12 8.12 12 12" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20 4 8.12 15.88" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="6" cy="18" r="3" stroke="#8b5cf6" stroke-width="2"/>
                <path d="M14.8 14.8 20 20" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; font-weight: 500;">Hairvana</p>
            <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">This email was sent from Hairvana. Please do not reply to this email.</p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} Hairvana. All rights reserved.</p>
          </div>
        </div>

        <!-- Invoice Attachment -->
        <div style="margin-top: 40px; padding: 20px; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">Invoice Details</h3>
          ${invoiceHTML}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text email template for invoice
   * @param {string} ownerName - Owner name
   * @param {string} invoiceText - Invoice text content
   * @param {Object} payment - Payment object
   * @param {Object} plan - Plan object
   * @returns {string} Plain text email template
   */
  generateInvoiceEmailText(ownerName, invoiceText, payment, plan) {
    const invoiceNumber = `INV-${payment.id.slice(0, 8).toUpperCase()}`;
    const amount = Number(payment.amount || 0);

    return `
📄 INVOICE ${invoiceNumber} - HAIRVANA
═══════════════════════════════════════════════════════════════

Hello ${ownerName},

Thank you for your subscription payment! Your invoice for the ${plan.name || 'Subscription'} plan has been generated and is included below.

📋 PAYMENT SUMMARY:
• Invoice Number: ${invoiceNumber}
• Amount: $${amount.toFixed(2)}
• Plan: ${plan.name || 'Subscription'}
• Status: ${payment.status.toUpperCase()}

Please find your detailed invoice below. You can also access your billing history and manage your subscription through your Hairvana dashboard.

If you have any questions about this invoice or need assistance with your subscription, please don't hesitate to contact our support team.

Best regards,
The Hairvana Team

═══════════════════════════════════════════════════════════════

${invoiceText}

═══════════════════════════════════════════════════════════════
This email was sent from Hairvana. Please do not reply to this email.
© ${new Date().getFullYear()} Hairvana. All rights reserved.
    `;
  }
}

module.exports = new EmailService(); 