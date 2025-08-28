const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/backend/api/v0/salon/subscription';
const AUTH_TOKEN = 'your-jwt-token-here'; // Replace with actual token

const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

// Test functions
async function testGetSubscriptionPlans() {
  try {
    console.log('Testing GET /plans...');
    const response = await axios.get(`${BASE_URL}/plans`, { headers });
    console.log('✅ Get subscription plans:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get subscription plans failed:', error.response?.data || error.message);
  }
}

async function testGetSubscriptionPlanById(planId) {
  try {
    console.log(`Testing GET /plans/${planId}...`);
    const response = await axios.get(`${BASE_URL}/plans/${planId}`, { headers });
    console.log('✅ Get subscription plan by ID:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get subscription plan by ID failed:', error.response?.data || error.message);
  }
}

async function testGetCurrentSubscription(salonId) {
  try {
    console.log(`Testing GET /current/${salonId}...`);
    const response = await axios.get(`${BASE_URL}/current/${salonId}`, { headers });
    console.log('✅ Get current subscription:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get current subscription failed:', error.response?.data || error.message);
  }
}

async function testSubscribeToPlan(salonId, planId) {
  try {
    console.log(`Testing POST /subscribe...`);
    const data = {
      salonId,
      planId
      // billingCycle is optional - will use plan default
    };
    const response = await axios.post(`${BASE_URL}/subscribe`, data, { headers });
    console.log('✅ Subscribe to plan:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Subscribe to plan failed:', error.response?.data || error.message);
  }
}

async function testUpgradeSubscription(salonId, planId) {
  try {
    console.log(`Testing POST /upgrade...`);
    const data = {
      salonId,
      planId
      // billingCycle is optional - will keep current billing cycle
    };
    const response = await axios.post(`${BASE_URL}/upgrade`, data, { headers });
    console.log('✅ Upgrade subscription:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Upgrade subscription failed:', error.response?.data || error.message);
  }
}

async function testDowngradeSubscription(salonId, planId) {
  try {
    console.log(`Testing POST /downgrade...`);
    const data = {
      salonId,
      planId
      // billingCycle is optional - will keep current billing cycle
    };
    const response = await axios.post(`${BASE_URL}/downgrade`, data, { headers });
    console.log('✅ Downgrade subscription:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Downgrade subscription failed:', error.response?.data || error.message);
  }
}

async function testGetSubscriptionUsage(salonId) {
  try {
    console.log(`Testing GET /usage/${salonId}...`);
    const response = await axios.get(`${BASE_URL}/usage/${salonId}`, { headers });
    console.log('✅ Get subscription usage:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get subscription usage failed:', error.response?.data || error.message);
  }
}

async function testGetBillingHistory(salonId) {
  try {
    console.log(`Testing GET /billing-history/${salonId}...`);
    const response = await axios.get(`${BASE_URL}/billing-history/${salonId}`, { headers });
    console.log('✅ Get billing history:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get billing history failed:', error.response?.data || error.message);
  }
}

async function testCancelSubscription(salonId) {
  try {
    console.log(`Testing POST /cancel...`);
    const data = { salonId };
    const response = await axios.post(`${BASE_URL}/cancel`, data, { headers });
    console.log('✅ Cancel subscription:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Cancel subscription failed:', error.response?.data || error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Salon Subscription API Tests...\n');
  
  // Test data (replace with actual values)
  const testSalonId = 'your-salon-id-here';
  const testPlanId = '00000000-0000-0000-0000-000000000001'; // Basic plan ID from seeders
  
  // Run tests
  await testGetSubscriptionPlans();
  console.log('');
  
  await testGetSubscriptionPlanById(testPlanId);
  console.log('');
  
  await testGetCurrentSubscription(testSalonId);
  console.log('');
  
  await testSubscribeToPlan(testSalonId, testPlanId);
  console.log('');
  
  await testGetSubscriptionUsage(testSalonId);
  console.log('');
  
  await testGetBillingHistory(testSalonId);
  console.log('');
  
  await testUpgradeSubscription(testSalonId, testPlanId);
  console.log('');
  
  await testDowngradeSubscription(testSalonId, testPlanId);
  console.log('');
  
  // Uncomment to test cancellation (will cancel the subscription)
  // await testCancelSubscription(testSalonId);
  
  console.log('✅ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testGetSubscriptionPlans,
  testGetSubscriptionPlanById,
  testGetCurrentSubscription,
  testSubscribeToPlan,
  testUpgradeSubscription,
  testDowngradeSubscription,
  testGetSubscriptionUsage,
  testGetBillingHistory,
  testCancelSubscription
};
