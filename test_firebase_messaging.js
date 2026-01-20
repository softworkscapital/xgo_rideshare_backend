const admin = require('firebase-admin');
const firebaseNotificationService = require('./services/firebaseNotificationService');

console.log('🔥 Testing Firebase Messaging Object');
console.log('=====================================\n');

async function testFirebaseMessaging() {
  try {
    console.log('📱 1. Checking Firebase service...');
    console.log('Service initialized:', firebaseNotificationService.isInitialized);
    console.log('Messaging object:', typeof firebaseNotificationService.messaging);
    console.log('Messaging methods:', Object.getOwnPropertyNames(firebaseNotificationService.messaging));
    
    console.log('\n📋 2. Testing direct Firebase admin...');
    const serviceAccount = require('./services/firebase-service-account.json');
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'xgo-life-prod'
      });
    }
    
    const messaging = admin.messaging();
    console.log('Direct messaging object:', typeof messaging);
    console.log('Direct messaging methods:', Object.getOwnPropertyNames(messaging));
    
    console.log('\n📤 3. Testing sendMulticast method...');
    if (messaging.sendMulticast) {
      console.log('✅ sendMulticast method exists!');
      
      // Test with a simple payload
      const testPayload = {
        notification: {
          title: 'Test',
          body: 'Test message'
        },
        tokens: ['test-token']
      };
      
      console.log('Test payload prepared:', testPayload);
      console.log('🎯 Firebase messaging is ready!');
      
    } else {
      console.log('❌ sendMulticast method not found');
      console.log('Available methods:', Object.getOwnPropertyNames(messaging));
    }
    
  } catch (error) {
    console.error('❌ Firebase messaging test error:', error);
  }
}

testFirebaseMessaging().then(() => {
  console.log('\n🎉 Firebase messaging test completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
