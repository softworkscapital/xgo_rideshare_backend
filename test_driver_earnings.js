const http = require('http');

// Test Driver Earnings API
function testDriverEarnings() {
  return new Promise((resolve, reject) => {
    console.log('🧪 Testing Driver Earnings API...');
    
    // Test 1: Get driver summary
    console.log('\n📊 Testing driver summary...');
    const options1 = {
      hostname: 'localhost',
      port: 3011,
      path: '/commission/analytics/drivers-summary',
      method: 'GET'
    };
    
    const req1 = http.request(options1, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Driver Summary Response:', result);
          
          // Test 2: Get sample driver data
          console.log('\n👥 Testing sample driver data...');
          const options2 = {
            hostname: 'localhost',
            port: 3011,
            path: '/commission/analytics/drivers-summary/sample-driver-data',
            method: 'GET'
          };
          
          const req2 = http.request(options2, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => {
              try {
                const result2 = JSON.parse(data2);
                console.log('✅ Sample Driver Data Response:', result2);
                console.log('\n🎉 Driver Earnings API tests passed!');
                resolve();
              } catch (error) {
                console.error('❌ Parse Error:', error.message);
                console.error('Raw Response:', data2);
                reject(error);
              }
            });
          });
          
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
  console.log('🚀 Starting Driver Earnings Test...\n');
  
  try {
    await testDriverEarnings();
    console.log('\n✨ Testing Complete!');
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
  }
}

runTest();
