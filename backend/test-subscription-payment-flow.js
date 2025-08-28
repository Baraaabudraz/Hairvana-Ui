const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/backend/api/v0/salon/subscription';
const AUTH_TOKEN = 'your-jwt-token-here'; // Replace with actual token

const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

// Test data
const testData = {
  salonId: '6b27ceb3-6f54-432b-aaf4-9edbc0a1735a',
  planId: '00000000-0000-0000-0000-000000000001',
  billingCycle: 'yearly'
};

// Step 1: Validate subscription request
async function testSubscribeToPlan() {
  try {
    console.log('Step 1: Testing POST /subscribe (validation only)...');
    
    const response = await axios.post(`${BASE_URL}/subscribe`, testData, { headers });
    console.log('✅ Subscription validation successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Subscription validation failed:', error.response?.data || error.message);
  }
}

// Step 2: Create payment intent
async function testCreatePaymentIntent() {
  try {
    console.log('Step 2: Testing POST /backend/api/v0/salon/subscription/payment/create-intent...');
    
    const response = await axios.post(`${BASE_URL}/backend/api/v0/salon/subscription/payment/create-intent`, testData, { headers });
    console.log('✅ Payment intent created successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Payment intent creation failed:', error.response?.data || error.message);
  }
}

// Step 3: Get payment details
async function testGetPaymentDetails(paymentId) {
  try {
    console.log(`Step 3: Testing GET /backend/api/v0/salon/subscription/payment/${paymentId}...`);
    
    const response = await axios.get(`${BASE_URL}/backend/api/v0/salon/subscription/payment/${paymentId}`, { headers });
    console.log('✅ Payment details retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Get payment details failed:', error.response?.data || error.message);
  }
}

// Step 4: Check payment status
async function testCheckPaymentStatus(paymentId) {
  try {
    console.log(`Step 4: Testing GET /backend/api/v0/salon/subscription/payment/${paymentId}/status...`);
    
    const response = await axios.get(`${BASE_URL}/backend/api/v0/salon/subscription/payment/${paymentId}/status`, { headers });
    console.log('✅ Payment status checked:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Check payment status failed:', error.response?.data || error.message);
  }
}

// Step 5: Get payment history for salon
async function testGetPaymentHistory() {
  try {
    console.log('Step 5: Testing GET /backend/api/v0/salon/subscription/payment/salon/:salonId...');
    
    const response = await axios.get(`${BASE_URL}/backend/api/v0/salon/subscription/payment/salon/${testData.salonId}`, { headers });
    console.log('✅ Payment history retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Get payment history failed:', error.response?.data || error.message);
  }
}

// Step 6: Cancel payment (if needed)
async function testCancelPayment(paymentId) {
  try {
    console.log(`Step 6: Testing POST /backend/api/v0/salon/subscription/payment/${paymentId}/cancel...`);
    
    const response = await axios.post(`${BASE_URL}/backend/api/v0/salon/subscription/payment/${paymentId}/cancel`, {}, { headers });
    console.log('✅ Payment cancelled successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Cancel payment failed:', error.response?.data || error.message);
  }
}

// Complete payment flow test
async function testCompletePaymentFlow() {
  console.log('🚀 Testing Complete Subscription Payment Flow\n');
  
  try {
    // Step 1: Validate subscription
    const validationResult = await testSubscribeToPlan();
    if (!validationResult) return;
    
    // Step 2: Create payment intent
    const paymentIntent = await testCreatePaymentIntent();
    if (!paymentIntent) return;
    
    const { paymentId, clientSecret } = paymentIntent;
    console.log(`\n📋 Payment Intent Created:`);
    console.log(`   Payment ID: ${paymentId}`);
    console.log(`   Client Secret: ${clientSecret.substring(0, 20)}...`);
    console.log(`   Amount: $${paymentIntent.amount}`);
    console.log(`   Expires: ${paymentIntent.expiresAt}`);
    
    // Step 3: Get payment details
    await testGetPaymentDetails(paymentId);
    
    // Step 4: Check payment status (will be pending initially)
    const statusResult = await testCheckPaymentStatus(paymentId);
    if (statusResult) {
      console.log(`\n📊 Payment Status: ${statusResult.payment.status}`);
      if (statusResult.subscription) {
        console.log(`   Subscription ID: ${statusResult.subscription.id}`);
        console.log(`   Subscription Status: ${statusResult.subscription.status}`);
      } else {
        console.log('   Subscription: Not yet created (payment pending)');
      }
    }
    
    // Step 5: Get payment history
    await testGetPaymentHistory();
    
    console.log('\n✅ Payment flow test completed!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Complete payment using Stripe.js with the client secret');
    console.log('   2. Check payment status again to confirm subscription creation');
    console.log('   3. Use the subscription endpoints to manage the active subscription');
    
  } catch (error) {
    console.error('❌ Payment flow test failed:', error);
  }
}

// Test individual endpoints
async function testIndividualEndpoints() {
  console.log('🧪 Testing Individual Payment Endpoints\n');
  
  // Test subscription validation
  await testSubscribeToPlan();
  
  // Test payment intent creation
  const paymentIntent = await testCreatePaymentIntent();
  if (paymentIntent) {
    const { paymentId } = paymentIntent;
    
    // Test payment details
    await testGetPaymentDetails(paymentId);
    
    // Test payment status
    await testCheckPaymentStatus(paymentId);
    
    // Test payment history
    await testGetPaymentHistory();
    
    // Uncomment to test payment cancellation
    // await testCancelPayment(paymentId);
  }
}

// Run tests
async function runTests() {
  console.log('🎯 Salon Subscription Payment Flow Tests\n');
  
  // Test complete flow
  await testCompletePaymentFlow();
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test individual endpoints
  await testIndividualEndpoints();
}

// Run the tests
runTests().catch(console.error);

module.exports = {
  testSubscribeToPlan,
  testCreatePaymentIntent,
  testGetPaymentDetails,
  testCheckPaymentStatus,
  testGetPaymentHistory,
  testCancelPayment,
  testCompletePaymentFlow
};
