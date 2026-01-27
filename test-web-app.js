// Test script for web app password protection
// This tests the actual web app endpoints

const https = require('https');
const http = require('http');

console.log('🧪 Testing Focus Web App Password Protection\n');

// Test configuration
const WEB_APP_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:5001';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test functions
async function testWebAppAccess() {
  console.log('=== Test 1: Web App Access ===');
  try {
    const response = await makeRequest(WEB_APP_URL);
    if (response.statusCode === 200) {
      console.log('✅ Web app is accessible');
      return true;
    } else {
      console.log(`❌ Web app returned status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Web app error: ${error.message}`);
    return false;
  }
}

async function testBackendHealth() {
  console.log('\n=== Test 2: Backend Health ===');
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      console.log('✅ Backend is healthy');
      console.log(`   Status: ${data.status}`);
      console.log(`   Uptime: ${Math.round(data.uptime)} seconds`);
      return true;
    } else {
      console.log(`❌ Backend returned status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Backend error: ${error.message}`);
    return false;
  }
}

async function testAuthEndpoint() {
  console.log('\n=== Test 3: Auth Endpoint ===');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Auth endpoint is working');
      const data = JSON.parse(response.body);
      console.log(`   User: ${data.user?.email || 'Unknown'}`);
      return true;
    } else {
      console.log(`❌ Auth endpoint returned status: ${response.statusCode}`);
      console.log(`   Response: ${response.body}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Auth endpoint error: ${error.message}`);
    return false;
  }
}

async function testFocusEndpoint() {
  console.log('\n=== Test 4: Focus Endpoint ===');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/focus/sessions`);
    
    if (response.statusCode === 200 || response.statusCode === 401) {
      console.log('✅ Focus endpoint is accessible');
      console.log(`   Status: ${response.statusCode} (401 expected without auth)`);
      return true;
    } else {
      console.log(`❌ Focus endpoint returned status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Focus endpoint error: ${error.message}`);
    return false;
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Focus Web App Tests...\n');
  
  const results = {
    webApp: await testWebAppAccess(),
    backend: await testBackendHealth(),
    auth: await testAuthEndpoint(),
    focus: await testFocusEndpoint()
  };
  
  console.log('\n=== Test Results Summary ===');
  console.log(`Web App Access: ${results.webApp ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Backend Health: ${results.backend ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Auth Endpoint: ${results.auth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Focus Endpoint: ${results.focus ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\nOverall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 Ready for manual testing!');
    console.log('   - Open http://localhost:3001 in your browser');
    console.log('   - Sign in with test@example.com / password123');
    console.log('   - Test password protection functionality');
  } else {
    console.log('\n⚠️  Fix issues before manual testing');
  }
}

// Run the tests
runTests().catch(console.error);


