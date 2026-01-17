const http = require('http');

// Test individual customer details API
function testCustomerDetails() {
  return new Promise((resolve, reject) => {
    console.log('🧪 Testing Customer Details API...');
    
    // Test customer details for AAA-100034 (the one with real data)
    const options = {
      hostname: 'localhost',
      port: 3011,
      path: '/commission/analytics/customers-performance/customer-details/AAA-100034',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Customer Details Response:', result);
          resolve();
        } catch (error) {
          console.error('❌ Parse Error:', error.message);
          console.error('Raw Response:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      reject(error);
    });
    
    req.end();
  });
}

// Run test
async function runTest() {
  console.log('🚀 Testing Customer Details API...\n');
  
  try {
    await testCustomerDetails();
    console.log('\n✨ Testing Complete!');
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
  }
}

runTest();
