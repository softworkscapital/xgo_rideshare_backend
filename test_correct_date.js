const http = require('http');

// Test Customer Performance API with correct date
function testCustomerPerformance() {
  return new Promise((resolve, reject) => {
    console.log('🧪 Testing Customer Performance API with correct date...');
    
    // Test with date that matches trip data
    console.log('\n📊 Testing customer performance calculation for 2025-08-15...');
    const options = {
      hostname: 'localhost',
      port: 3011,
      path: '/commission/analytics/customers-performance/calculate-customer-performance',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Calculation Response:', result);
          console.log('\n🎉 Test Complete!');
          resolve();
        } catch (error) {
          console.error('❌ Parse Error:', error.message);
          console.error('Raw Response:', data);
          reject(error);
        }
      });
    });
    
    req.write(JSON.stringify({ date: '2025-08-15' }));
    req.end();
  });
}

// Run test
async function runTest() {
  console.log('🚀 Testing with correct date...\n');
  
  try {
    await testCustomerPerformance();
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
  }
}

runTest();
