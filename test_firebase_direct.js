const admin = require('firebase-admin');
const NotificationsCRUD = require('./cruds/notifications');

console.log('🔥 Testing Firebase Direct (Bypass Server)');
console.log('========================================\n');

async function testFirebaseDirect() {
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
    
    console.log('📱 1. Testing device registration...');
    const deviceResult = await NotificationsCRUD.registerDeviceToken(
      'AAA-100034',
      'test-token-123',
      'android',
      '1.0.0'
    );
    console.log('Device registration result:', deviceResult);
    
    console.log('\n📤 2. Testing notification sending...');
    
    // Get device tokens
    const tokens = await NotificationsCRUD.getUserDeviceTokens('AAA-100034');
    console.log('Device tokens found:', tokens);
    
    if (tokens.length > 0) {
      // Prepare messages
      const messages = tokens.map(token => ({
        notification: {
          title: 'Test Notification',
          body: 'Firebase is working directly!',
          sound: 'default',
          badge: '1'
        },
        data: { event: 'test', userId: 'AAA-100034' },
        token: token
      }));
      
      console.log('📤 Sending notifications with sendEach...');
      const response = await messaging.sendEach(messages);
      
      console.log('✅ Notification sent successfully!');
      console.log('Response:', {
        successCount: response.successCount,
        failureCount: response.failureCount
      });
      
      if (response.failureCount > 0) {
        console.log('Failed responses:', response.responses.filter(r => !r.success));
      }
      
    } else {
      console.log('⚠️ No device tokens found');
    }
    
  } catch (error) {
    console.error('❌ Direct test error:', error);
  }
}

testFirebaseDirect().then(() => {
  console.log('\n🎉 Direct Firebase test completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
