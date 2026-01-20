const http = require('http');

console.log('🔥 Testing Complete Firebase System');
console.log('===================================\n');

// Test device registration
function testDeviceRegistration() {
  const postData = JSON.stringify({
    userId: 'AAA-100034',
    deviceToken: 'test-token-123',
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
    console.log('📱 Device Registration Response:');
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      testNotificationSending();
    });
  });

  req.on('error', (e) => {
    console.error('❌ Device registration error:', e.message);
    console.log('💡 Make sure the backend server is running on port 3011');
  });

  req.write(postData);
  req.end();
}

// Test notification sending
function testNotificationSending() {
  console.log('\n📤 Testing Notification Sending...');
  
  const postData = JSON.stringify({
    userId: 'AAA-100034',
    title: 'Test Notification',
    body: 'Firebase is working with new database!'
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
    console.log('📤 Notification Sending Response:');
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      console.log('\n✅ Firebase system testing completed!');
      console.log('🎯 Next: Test with real device token from mobile app');
    });
  });

  req.on('error', (e) => {
    console.error('❌ Notification sending error:', e.message);
  });

  req.write(postData);
  req.end();
}

// Start testing
console.log('🚀 Starting Firebase system tests...');
testDeviceRegistration();
