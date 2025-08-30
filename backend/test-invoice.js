/**
 * Test script for invoice generation and email sending
 * Run with: node test-invoice.js
 */

const invoiceService = require('./services/invoiceService');
const emailService = require('./services/emailService');

// Mock data for testing
const mockPayment = {
  id: 'test-payment-123',
  amount: 99.99,
  status: 'paid',
  billing_cycle: 'monthly',
  method: 'stripe',
  transaction_id: 'txn_test_123',
  payment_date: new Date(),
  created_at: new Date()
};

const mockSubscription = {
  id: 'test-subscription-123',
  billingCycle: 'monthly',
  status: 'active'
};

const mockPlan = {
  id: 'test-plan-123',
  name: 'Professional Plan',
  description: 'Professional salon management features'
};

const mockOwner = {
  id: 'test-owner-123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890'
};

async function testInvoiceGeneration() {
  console.log('🧪 Testing Invoice Generation...\n');

  try {
    // Test HTML invoice generation
    console.log('📄 Generating HTML invoice...');
    const htmlInvoice = invoiceService.generateInvoiceHTML(mockPayment, mockSubscription, mockPlan, mockOwner);
    console.log('✅ HTML invoice generated successfully');
    console.log('📏 HTML length:', htmlInvoice.length, 'characters\n');

    // Test text invoice generation
    console.log('📝 Generating text invoice...');
    const textInvoice = invoiceService.generateInvoiceText(mockPayment, mockSubscription, mockPlan, mockOwner);
    console.log('✅ Text invoice generated successfully');
    console.log('📏 Text length:', textInvoice.length, 'characters\n');

    // Test email templates
    console.log('📧 Testing email templates...');
    const emailHTML = emailService.generateInvoiceEmailHTML(mockOwner.name, htmlInvoice, mockPayment, mockPlan);
    const emailText = emailService.generateInvoiceEmailText(mockOwner.name, textInvoice, mockPayment, mockPlan);
    console.log('✅ Email templates generated successfully');
    console.log('📏 Email HTML length:', emailHTML.length, 'characters');
    console.log('📏 Email text length:', emailText.length, 'characters\n');

    console.log('🎉 All tests passed! Invoice generation is working correctly.');
    
    // Save sample files for inspection
    const fs = require('fs');
    const path = require('path');
    
    const testDir = path.join(__dirname, 'test-output');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }
    
    fs.writeFileSync(path.join(testDir, 'sample-invoice.html'), htmlInvoice);
    fs.writeFileSync(path.join(testDir, 'sample-invoice.txt'), textInvoice);
    fs.writeFileSync(path.join(testDir, 'sample-email.html'), emailHTML);
    fs.writeFileSync(path.join(testDir, 'sample-email.txt'), emailText);
    
    console.log('📁 Sample files saved to:', testDir);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Test email sending (only if email is configured)
async function testEmailSending() {
  console.log('\n📧 Testing Email Sending...\n');
  
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email not configured. Set EMAIL_USER and EMAIL_PASS environment variables to test email sending.');
    console.log('   Skipping email sending test...\n');
    return;
  }

  try {
    console.log('📤 Attempting to send test invoice email...');
    const emailSent = await emailService.sendInvoiceEmail(
      mockOwner.email,
      mockPayment,
      mockSubscription,
      mockPlan,
      mockOwner
    );
    
    if (emailSent) {
      console.log('✅ Test invoice email sent successfully!');
      console.log('📧 Sent to:', mockOwner.email);
    } else {
      console.log('❌ Failed to send test invoice email');
    }
  } catch (error) {
    console.error('❌ Email sending test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Invoice System Tests\n');
  console.log('=' .repeat(50));
  
  await testInvoiceGeneration();
  await testEmailSending();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Tests completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testInvoiceGeneration, testEmailSending };
