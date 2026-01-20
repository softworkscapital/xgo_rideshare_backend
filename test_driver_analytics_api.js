const http = require('http');

// Configuration
const API_BASE = 'http://localhost:3011';
const TEST_DRIVER_ID = 'AAA-100002';

// Helper function to make HTTP requests
const makeRequest = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3011,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            status: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

// Test function
const testEndpoint = async (name, method, path, data = null, expectedStatus = 200) => {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   ${method} ${path}`);
  
  try {
    const response = await makeRequest(method, path, data);
    
    if (response.status === expectedStatus) {
      console.log(`✅ SUCCESS - Status: ${response.status}`);
      if (response.data && typeof response.data === 'object') {
        console.log(`   Response keys: ${Object.keys(response.data).join(', ')}`);
      }
      return true;
    } else {
      console.log(`❌ FAILED - Status: ${response.status} (expected ${expectedStatus})`);
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ERROR - ${error.message}`);
    return false;
  }
};

// Main test suite
async function runDriverAnalyticsTests() {
  console.log('🚀 Starting Driver Analytics API Tests');
  console.log('==========================================');
  
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Get comprehensive driver statistics
  totalTests++;
  if (await testEndpoint(
    'Get Comprehensive Driver Statistics',
    'GET',
    `/driver/${TEST_DRIVER_ID}/comprehensive_stats`
  )) {
    passedTests++;
  }

  // Test 2: Get earnings summary
  totalTests++;
  if (await testEndpoint(
    'Get Driver Earnings Summary',
    'GET',
    `/driver/${TEST_DRIVER_ID}/earnings_summary`
  )) {
    passedTests++;
  }

  // Test 3: Get performance summary
  totalTests++;
  if (await testEndpoint(
    'Get Driver Performance Summary',
    'GET',
    `/driver/${TEST_DRIVER_ID}/performance_summary`
  )) {
    passedTests++;
  }

  // Test 4: Get activity summary
  totalTests++;
  if (await testEndpoint(
    'Get Driver Activity Summary',
    'GET',
    `/driver/${TEST_DRIVER_ID}/activity_summary`
  )) {
    passedTests++;
  }

  // Test 5: Update private trip status
  totalTests++;
  if (await testEndpoint(
    'Update Private Trip Status',
    'PUT',
    `/driver/${TEST_DRIVER_ID}/private_trip_status`,
    {
      status: 'Completed',
      earnings: 25.50,
      distance: 12.3,
      duration: 45
    }
  )) {
    passedTests++;
  }

  // Test 6: Update rideshare trip status
  totalTests++;
  if (await testEndpoint(
    'Update Rideshare Trip Status',
    'PUT',
    `/driver/${TEST_DRIVER_ID}/rideshare_trip_status`,
    {
      status: 'Completed',
      earnings: 15.75,
      distance: 8.7,
      duration: 30
    }
  )) {
    passedTests++;
  }

  // Test 7: Update earnings
  totalTests++;
  if (await testEndpoint(
    'Update Driver Earnings',
    'PUT',
    `/driver/${TEST_DRIVER_ID}/earnings`,
    {
      earnings: 30.00,
      tripType: 'private'
    }
  )) {
    passedTests++;
  }

  // Test 8: Update performance metrics
  totalTests++;
  if (await testEndpoint(
    'Update Performance Metrics',
    'PUT',
    `/driver/${TEST_DRIVER_ID}/performance_metrics`,
    {
      completion_rate: 85.5,
      average_trip_duration: 35.2,
      total_distance: 150.5,
      average_distance: 12.5,
      peak_hours_trips: 8,
      off_peak_hours_trips: 12
    }
  )) {
    passedTests++;
  }

  // Test 9: Update activity metrics
  totalTests++;
  if (await testEndpoint(
    'Update Activity Metrics',
    'PUT',
    `/driver/${TEST_DRIVER_ID}/activity_metrics`,
    {
      days_active: 15,
      average_trips_per_day: 3.2,
      longest_streak_days: 7,
      current_streak_days: 2
    }
  )) {
    passedTests++;
  }

  // Test 10: Verify updates with comprehensive stats
  totalTests++;
  if (await testEndpoint(
    'Verify Updates - Get Comprehensive Stats',
    'GET',
    `/driver/${TEST_DRIVER_ID}/comprehensive_stats`
  )) {
    passedTests++;
  }

  // Test 11: Test invalid status (should fail)
  totalTests++;
  if (await testEndpoint(
    'Test Invalid Private Trip Status',
    'PUT',
    `/driver/${TEST_DRIVER_ID}/private_trip_status`,
    {
      status: 'InvalidStatus'
    },
    400 // Expect 400 error
  )) {
    passedTests++;
  }

  // Test 12: Test invalid earnings (should fail)
  totalTests++;
  if (await testEndpoint(
    'Test Invalid Earnings Amount',
    'PUT',
    `/driver/${TEST_DRIVER_ID}/earnings`,
    {
      earnings: -10,
      tripType: 'private'
    },
    400 // Expect 400 error
  )) {
    passedTests++;
  }

  // Results summary
  console.log('\n==========================================');
  console.log('📊 Test Results Summary');
  console.log('==========================================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Driver analytics API is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the server and endpoints.');
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Restart the server if endpoints are not found');
  console.log('2. Check database connection if data-related errors occur');
  console.log('3. Verify API routes are properly mounted');
  console.log('4. Test with mobile app integration');
}

// Run tests
if (require.main === module) {
  runDriverAnalyticsTests().catch(console.error);
}

module.exports = { runDriverAnalyticsTests };
