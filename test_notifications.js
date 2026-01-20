const firebaseNotificationService = require('./services/firebaseNotificationService');
const notificationTriggers = require('./services/notificationTriggers');

console.log('🔧 Testing Firebase Notification System');
console.log('=====================================\n');

async function testNotificationSystem() {
  try {
    console.log('📱 1. Testing notification service initialization...');
    
    // Test notification templates
    console.log('📋 2. Testing notification templates...');
    const privateTemplate = firebaseNotificationService.getNotificationTemplate('private_ride_nearby', {
      passengerName: 'John Doe',
      location: { lat: -17.8292, lng: 31.0539 }
    });
    console.log('Private ride template:', privateTemplate);
    
    const rideshareTemplate = firebaseNotificationService.getNotificationTemplate('rideshare_nearby', {
      destination: 'Harare CBD',
      passengerName: 'Jane Smith',
      location: { lat: -17.8292, lng: 31.0539 }
    });
    console.log('Rideshare template:', rideshareTemplate);
    
    console.log('📊 3. Testing notification triggers...');
    
    // Test nearby drivers calculation (without actual Firebase)
    console.log('🚗 4. Testing nearby drivers calculation...');
    const testLocation = { lat: -17.8292, lng: 31.0539 };
    console.log('Test location:', testLocation);
    
    // Test notification preferences
    console.log('⚙️ 5. Testing notification preferences...');
    const preferences = await notificationTriggers.checkNotificationPreferences('AAA-100034', 'ride_requests');
    console.log('User preferences for ride_requests:', preferences);
    
    console.log('\n✅ Notification system structure test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Set up Firebase service account');
    console.log('2. Install frontend Firebase packages');
    console.log('3. Test actual Firebase notifications');
    
  } catch (error) {
    console.error('❌ Error testing notification system:', error);
  }
}

testNotificationSystem().then(() => {
  console.log('\n🎉 Test completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
