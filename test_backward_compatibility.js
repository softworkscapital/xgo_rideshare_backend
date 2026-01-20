const http = require('http');

console.log('🔄 Testing Backward Compatibility');
console.log('===================================\n');

// Test old format (what was causing SQL errors)
function testOldFormat() {
  const postData = JSON.stringify({
    userId: 'old_format_user',
    deviceToken: { data: 'ExponentPushToken[7RnKfwNWwAg8USZh14iErj]', type: 'expo' }, // Old format (object)
    deviceType: 'android',
    appVersion: '1.0.0'
  });

  const options = {
    hostname: 'localhost',
    port: 3011,
    path: '/notifications/register-device',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('🔄 Old Format Test (should now work):');
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      console.log('');
      
      // Test new format
      testNewFormat();
    });
  });

  req.on('error', (e) => {
    console.error('❌ Old format test error:', e.message);
    console.log('💡 Make sure the backend server is running on port 3011');
  });

  req.write(postData);
  req.end();
}

// Test new format (what the fixed frontend sends)
function testNewFormat() {
  const postData = JSON.stringify({
    userId: 'new_format_user',
    deviceToken: 'ExponentPushToken[7RnKfwNWwAg8USZh14iErj]', // New format (string)
    deviceType: 'android',
    appVersion: '1.0.0'
  });

  const options = {
    hostname: 'localhost',
    port: 3011,
    path: '/notifications/register-device',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('✅ New Format Test (should work):');
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      console.log('');
      
      console.log('🎯 Backward compatibility test completed!');
      console.log('✅ Both old and new formats should now work');
    });
  });

  req.on('error', (e) => {
    console.error('❌ New format test error:', e.message);
  });

  req.write(postData);
  req.end();
}

// Start testing
console.log('🚀 Starting backward compatibility tests...');
testOldFormat();
