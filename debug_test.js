const http = require('http');

// Test to see what trips are actually found
function testDebugQuery() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Debug: Testing what trips are found...');
    
    // Test with a simple query to see what's happening
    const options = {
      hostname: 'localhost',
      port: 3011,
      path: '/commission/analytics/customers-performance/sample-customer-data',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Sample Customer Data:', result);
          
          // Now test calculation with debug
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
                resolve();
              } catch (error) {
                console.error('❌ Parse Error:', error.message);
                console.error('Raw Response:', data2);
                reject(error);
              }
            });
          });
          
          req2.write(JSON.stringify({ date: '2025-08-15' }));
          req2.end();
          
        } catch (error) {
          console.error('❌ Parse Error:', error.message);
          console.error('Raw Response:', data);
          reject(error);
        }
      });
    });
    
    req.end();
  });
}

// Run test
async function runTest() {
  console.log('🚀 Debug Test...\n');
  
  try {
    await testDebugQuery();
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
  }
}

runTest();
