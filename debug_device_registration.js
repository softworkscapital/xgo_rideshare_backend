const NotificationsCRUD = require('./cruds/notifications');

console.log('🔍 Debugging Device Registration Issue');
console.log('=====================================\n');

// Test the exact same token that's failing
const testToken = 'ExponentPushToken[haUrzVH3EdNSoxzTW-4FLl]';
const userId = 'login_screen_test_user';

console.log('Testing with:');
console.log('User ID:', userId);
console.log('Device Token:', testToken);

async function testDeviceRegistration() {
  try {
    console.log('\n📱 Attempting to register device token...');
    
    const result = await NotificationsCRUD.registerDeviceToken(
      userId, 
      testToken, 
      'android', 
      '1.0.0'
    );
    
    console.log('✅ Success:', result);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    
    // Check if it's a SQL syntax error
    if (error.message.includes('SQL syntax') || error.message.includes('ER_PARSE_ERROR')) {
      console.log('\n🔍 This appears to be a SQL syntax error.');
      console.log('💡 Possible causes:');
      console.log('   1. Database table structure mismatch');
      console.log('   2. Reserved keyword conflict');
      console.log('   3. Incorrect field name in query');
    }
  }
}

// Test getting device tokens
async function testGetDeviceTokens() {
  try {
    console.log('\n🔍 Testing get device tokens...');
    const tokens = await NotificationsCRUD.getUserDeviceTokens(userId);
    console.log('Device tokens found:', tokens);
  } catch (error) {
    console.error('❌ Error getting device tokens:', error.message);
  }
}

// Run tests
testDeviceRegistration().then(() => {
  testGetDeviceTokens();
}).catch(console.error);
