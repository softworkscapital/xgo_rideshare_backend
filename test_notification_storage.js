const NotificationsCRUD = require('./cruds/notifications');

console.log('🔧 Testing Notification Storage');
console.log('================================\n');

async function testNotificationStorage() {
  try {
    console.log('📝 Testing notification storage...');
    
    const result = await NotificationsCRUD.storeNotification(
      'AAA-100034',
      'test-notification-123',
      'Test Title',
      'Test Body',
      'test',
      { event: 'test', userId: 'AAA-100034' },
      'sent'
    );
    
    console.log('✅ Notification stored successfully:', result);
    
  } catch (error) {
    console.error('❌ Notification storage error:', error.message);
    console.error('Full error:', error);
  }
}

testNotificationStorage().then(() => {
  console.log('\n🎉 Test completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
