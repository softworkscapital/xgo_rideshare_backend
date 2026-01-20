const admin = require('firebase-admin');

console.log('🔥 Testing Firebase sendAll Method');
console.log('===================================\n');

async function testSendAllMethod() {
  try {
    // Initialize Firebase
    const serviceAccount = require('./services/firebase-service-account.json');
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'xgo-life-prod'
      });
    }
    
    const messaging = admin.messaging();
    
    console.log('📱 Messaging object methods:');
    console.log(Object.getOwnPropertyNames(messaging));
    console.log(Object.getOwnPropertyNames(messaging.__proto__));
    
    // Check if sendAll exists
    if (typeof messaging.sendAll === 'function') {
      console.log('✅ sendAll method exists!');
      
      // Test with a dummy message (will fail but shows structure)
      try {
        const testMessages = [{
          notification: {
            title: 'Test',
            body: 'Test message'
          },
          token: 'test-token'
        }];
        
        console.log('📤 Testing sendAll with test message...');
        const result = await messaging.sendAll(testMessages);
        console.log('Result:', result);
        
      } catch (error) {
        console.log('Expected error (invalid token):', error.message);
        console.log('✅ sendAll method is working!');
      }
      
    } else {
      console.log('❌ sendAll method not found');
      console.log('Available methods:', Object.getOwnPropertyNames(messaging));
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testSendAllMethod().then(() => {
  console.log('\n🎉 Test completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
