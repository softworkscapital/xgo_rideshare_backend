const http = require('http');

console.log('🔧 Testing Fixed Device Registration');
console.log('===================================\n');

// Test with the correct token format (what the frontend now sends)
function testCorrectTokenFormat() {
  const postData = JSON.stringify({
    userId: 'test_user_123',
    deviceToken: 'ExponentPushToken[7RnKfwNWwAg8USZh14iErj]', // Correct format
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
    console.log('📱 Correct Token Format Test:');
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      console.log('');
      
      // Test with incorrect format (what was causing the SQL error)
      testIncorrectTokenFormat();
    });
  });

  req.on('error', (e) => {
    console.error('❌ Correct format test error:', e.message);
    console.log('💡 Make sure the backend server is running on port 3011');
  });

  req.write(postData);
  req.end();
}

// Test with the incorrect token format (what was causing the SQL error)
function testIncorrectTokenFormat() {
  const postData = JSON.stringify({
    userId: 'test_user_456',
    deviceToken: { data: 'ExponentPushToken[7RnKfwNWwAg8USZh14iErj]', type: 'expo' }, // Incorrect format (object)
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
    console.log('🚫 Incorrect Token Format Test (should fail):');
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      console.log('');
      
      // Test notification sending
      testNotificationSending();
    });
  });

  req.on('error', (e) => {
    console.error('❌ Incorrect format test error:', e.message);
  });

  req.write(postData);
  req.end();
}

// Test notification sending
function testNotificationSending() {
  console.log('📤 Testing Notification Sending...\n');
  
  const postData = JSON.stringify({
    userId: 'test_user_123',
    title: 'Backend Test Notification',
    body: 'Testing backend after SQL fix'
  });

  const options = {
    hostname: 'localhost',
    port: 3011,
    path: '/notifications/test',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('📤 Notification Sending Test:');
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      console.log('\n✅ All tests completed!');
      console.log('🎯 If the correct format test passed and incorrect format failed, the fix is working!');
    });
  });

  req.on('error', (e) => {
    console.error('❌ Notification sending error:', e.message);
  });

  req.write(postData);
  req.end();
}

// Start testing
console.log('🚀 Starting backend tests...');
testCorrectTokenFormat();
