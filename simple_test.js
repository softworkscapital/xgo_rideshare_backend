const http = require('http');

// Test Customer Performance API
function testCustomerPerformance() {
  return new Promise((resolve, reject) => {
    console.log('🧪 Testing Customer Performance API...');
    
    // Test 1: Get customer summary
    console.log('\n📊 Testing customer summary...');
    const options1 = {
      hostname: 'localhost',
      port: 3011,
      path: '/commission/analytics/customers-performance',
      method: 'GET'
    };
    
    const req1 = http.request(options1, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Summary API Response:', result);
          
          // Test 2: Calculate customer performance
          console.log('\n🔢 Testing customer performance calculation...');
          const options2 = {
            hostname: 'localhost',
            port: 3011,
            path: '/commission/analytics/customers-performance/calculate-customer-performance',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          };
          
          const req2 = http.request(options2, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => {
              try {
                const result2 = JSON.parse(data2);
                console.log('✅ Calculation Response:', result2);
                console.log('\n🎉 Customer Performance API tests passed!');
                resolve();
              } catch (error) {
                console.error('❌ Parse Error:', error.message);
                console.error('Raw Response:', data2);
                reject(error);
              }
            });
          });
          
          req2.write(JSON.stringify({ date: '2025-08-09' }));
          req2.end();
          
        } catch (error) {
          console.error('❌ Parse Error:', error.message);
          console.error('Raw Response:', data);
          reject(error);
        }
      });
    });
    
    req1.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      reject(error);
    });
    
    req1.end();
  });
}

// Run test
async function runTest() {
  console.log('🚀 Starting API Test...\n');
  
  try {
    await testCustomerPerformance();
    console.log('\n✨ Testing Complete!');
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
  }
}

runTest();
