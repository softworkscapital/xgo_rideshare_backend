// Test SMS Notification System
const smsNotificationService = require('./services/smsNotificationService');
const smsTemplates = require('./services/smsTemplates');

async function testSMSNotifications() {
  console.log('🧪 Testing SMS Notification System');
  console.log('==================================');

  // Test 1: Template formatting
  console.log('\n📝 Testing Template Formatting...');
  const batchData = {
    totalRequests: 14,
    areaName: 'Area (-1.3, 36.8)',
    destinations: ['Downtown', 'Airport', 'University'],
    driverName: 'John Driver'
  };

  const highDemandMessage = smsTemplates.formatMessage('rideshare_batch_high_demand', batchData);
  console.log('High Demand Message:');
  console.log(highDemandMessage);

  const mediumDemandMessage = smsTemplates.formatMessage('rideshare_batch_medium', batchData);
  console.log('\nMedium Demand Message:');
  console.log(mediumDemandMessage);

  // Test 2: Template conditions
  console.log('\n🔍 Testing Template Conditions...');
  
  const highDemandCheck = smsTemplates.shouldSend('rideshare_batch_high_demand', { totalRequests: 14 });
  console.log(`High demand template (14 requests): ${highDemandCheck ? '✅ Send' : '❌ Skip'}`);

  const mediumDemandCheck = smsTemplates.shouldSend('rideshare_batch_medium', { totalRequests: 3 });
  console.log(`Medium demand template (3 requests): ${mediumDemandCheck ? '✅ Send' : '❌ Skip'}`);

  // Test 3: Driver assignment notification
  console.log('\n🚗 Testing Driver Assignment SMS...');
  const driverAssignmentData = {
    passengerName: 'Jane Passenger',
    driverName: 'Mike Driver'
  };

  const driverAssignmentMessage = smsTemplates.formatMessage('driver_assigned', driverAssignmentData);
  console.log('Driver Assignment Message:');
  console.log(driverAssignmentMessage);

  // Test 4: Promotional notifications
  console.log('\n🎁 Testing Promotional SMS...');
  const promoData = {
    driverName: 'Sarah Driver'
  };

  const weekendBonusMessage = smsTemplates.formatMessage('weekend_bonus', promoData);
  console.log('Weekend Bonus Message:');
  console.log(weekendBonusMessage);

  // Test 5: Template statistics
  console.log('\n📊 Template Statistics:');
  const stats = smsTemplates.getTemplateStats();
  console.log(`Total templates: ${stats.total}`);
  console.log(`High priority: ${stats.highPriority}`);
  console.log(`Medium priority: ${stats.mediumPriority}`);
  console.log(`Low priority: ${stats.lowPriority}`);
  console.log(`With conditions: ${stats.withConditions}`);

  // Test 6: Phone number validation
  console.log('\n📱 Testing Phone Number Validation...');
  const testNumbers = [
    '+263770000000', // Valid
    '263770000000',   // Valid (will add +)
    '0770000000',     // Valid (will add +)
    'invalid',        // Invalid
    '+123456789012345' // Valid
  ];

  testNumbers.forEach(number => {
    const cleaned = smsNotificationService.cleanPhoneNumber(number);
    const isValid = smsNotificationService.validatePhoneNumber(cleaned);
    console.log(`${number} -> ${cleaned} (${isValid ? '✅ Valid' : '❌ Invalid'})`);
  });

  console.log('\n✅ SMS Notification System Test Completed!');
}

// Test actual SMS sending (commented out for safety)
async function testActualSMS() {
  console.log('\n🧪 Testing Actual SMS Sending...');
  console.log('⚠️  This will send real SMS messages!');
  
  // Uncomment to test actual SMS sending
  /*
  const testPhoneNumber = '+263770000000'; // Replace with test number
  const testMessage = '🧪 XGO Test Message\n\nThis is a test message from the XGO SMS notification system.\n\n- XGO Team';
  
  try {
    const result = await smsNotificationService.sendSMS(testPhoneNumber, testMessage);
    console.log(`SMS sending result: ${result ? '✅ Success' : '❌ Failed'}`);
  } catch (error) {
    console.error('SMS sending error:', error);
  }
  */
  
  console.log('ℹ️  Actual SMS testing is disabled. Uncomment the code above to test.');
}

// Test batch SMS with mock drivers
async function testBatchSMS() {
  console.log('\n🧪 Testing Batch SMS Logic...');
  
  const mockDrivers = [
    { driver_id: 'driver_1', phone_number: '+263770000001', name: 'John Driver' },
    { driver_id: 'driver_2', phone_number: '+263770000002', name: 'Jane Driver' },
    { driver_id: 'driver_3', phone_number: null, name: 'No Phone Driver' } // Should be skipped
  ];

  const batchData = {
    totalRequests: 12,
    areaName: 'Area (-1.3, 36.8)',
    destinations: ['Downtown', 'Airport', 'University']
  };

  console.log(`Mock drivers: ${mockDrivers.length} drivers, ${mockDrivers.filter(d => d.phone_number).length} with phone numbers`);
  console.log(`Batch data: ${batchData.totalRequests} requests in ${batchData.areaName}`);
  
  // Test the logic without actually sending
  const phoneNumbers = mockDrivers.map(driver => driver.phone_number).filter(Boolean);
  console.log(`Would send SMS to ${phoneNumbers.length} drivers: ${phoneNumbers.join(', ')}`);
  
  // Test template selection
  const templateKey = batchData.totalRequests >= 10 ? 'rideshare_batch_high_demand' : 'rideshare_batch_medium';
  console.log(`Selected template: ${templateKey}`);
  
  const message = smsTemplates.formatMessage(templateKey, {
    driverName: 'Driver',
    totalRequests: batchData.totalRequests,
    areaName: batchData.areaName,
    destinations: batchData.destinations.slice(0, 3).join(', ')
  });
  
  console.log('Message that would be sent:');
  console.log(message);
}

// Run all tests
if (require.main === module) {
  testSMSNotifications()
    .then(() => testBatchSMS())
    .then(() => testActualSMS())
    .catch(console.error);
}

module.exports = {
  testSMSNotifications,
  testBatchSMS,
  testActualSMS
};
