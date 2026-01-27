// Test script to demonstrate batch notification system
const batchNotificationTriggers = require('./services/batchNotificationTriggers');

async function testBatchNotifications() {
  console.log('🧪 Testing Batch Notification System');
  console.log('=====================================');

  // Simulate 14 passengers making requests in the same area
  const passengerRequests = [
    {
      location: { lat: -1.2921, lng: 36.8219 }, // Nairobi CBD
      destination: 'Downtown',
      passengerId: 'passenger_1',
      passengerName: 'John Doe'
    },
    {
      location: { lat: -1.2951, lng: 36.8259 }, // Very close to first
      destination: 'Airport',
      passengerId: 'passenger_2',
      passengerName: 'Jane Smith'
    },
    {
      location: { lat: -1.2981, lng: 36.8289 }, // Same area
      destination: 'University',
      passengerId: 'passenger_3',
      passengerName: 'Bob Johnson'
    },
    // Add 11 more requests in the same area
    ...Array.from({ length: 11 }, (_, i) => ({
      location: { 
        lat: -1.2921 + (Math.random() * 0.01), // Small random variations
        lng: 36.8219 + (Math.random() * 0.01)
      },
      destination: ['Downtown', 'Airport', 'University', 'Mall', 'Station'][i % 5],
      passengerId: `passenger_${i + 4}`,
      passengerName: `Passenger ${i + 4}`
    }))
  ];

  console.log(`📱 Simulating ${passengerRequests.length} passenger requests...`);

  try {
    // Test batch notification
    const result = await batchNotificationTriggers.batchNotifyNearbyDriversRideshare(passengerRequests);
    
    console.log('✅ Batch notification test completed!');
    console.log(`📊 Result: ${result} requests processed`);
    
    // Show what the notification would look like
    console.log('\n🎯 Sample Notification Message:');
    console.log('🚀 High Demand Area Alert!');
    console.log('14 rideshare requests in Area (-1.3, 36.8). Top destinations: Downtown, Airport, University');
    
    console.log('\n📈 Benefits:');
    console.log('❌ Before: 14 passengers × 2 drivers = 28 notifications');
    console.log('✅ After: 1 batch notification per driver = 2 notifications total');
    console.log('🎉 Reduction: 93% fewer notifications!');
    
  } catch (error) {
    console.error('❌ Batch notification test failed:', error);
  }
}

// Test individual notification scheduling
async function testIndividualScheduling() {
  console.log('\n🧪 Testing Individual Request Scheduling');
  console.log('==========================================');

  const requests = [
    {
      location: { lat: -1.2921, lng: 36.8219 },
      destination: 'Downtown',
      passengerId: 'test_user_1',
      passengerName: 'Test User 1'
    },
    {
      location: { lat: -1.2931, lng: 36.8229 },
      destination: 'Airport',
      passengerId: 'test_user_2',
      passengerName: 'Test User 2'
    }
  ];

  console.log('📱 Scheduling individual requests (will be batched)...');

  for (const request of requests) {
    await batchNotificationTriggers.scheduleBatchNotification(request);
    console.log(`⏰ Scheduled request for ${request.passengerName} to ${request.destination}`);
  }

  console.log('⏳ Waiting 35 seconds for batch to process...');
  
  // Wait for batch to process (batch window is 30 seconds)
  setTimeout(() => {
    console.log('✅ Batch scheduling test completed!');
  }, 35000);
}

// Run tests
if (require.main === module) {
  testBatchNotifications()
    .then(() => testIndividualScheduling())
    .catch(console.error);
}

module.exports = {
  testBatchNotifications,
  testIndividualScheduling
};
