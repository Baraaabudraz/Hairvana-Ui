// Simple test to check if security settings endpoint is working
const fetch = require('node-fetch');

async function testSecurityEndpoint() {
  try {
    console.log('🧪 Testing Security Settings API Endpoint...');
    
    // Test the endpoint directly
    const response = await fetch('http://localhost:5000/api/settings/security', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail auth, but we can see the response
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response body:', data);
    
    if (response.status === 401) {
      console.log('✅ Endpoint is accessible (401 is expected without valid token)');
    } else if (response.status === 200) {
      console.log('✅ Endpoint is working correctly');
    } else {
      console.log('❌ Unexpected response status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
  }
}

testSecurityEndpoint();
