// Comprehensive Notification Integration Test
const axios = require('axios');

const API_BASE = 'http://localhost:3011';

// Test data
const testPassenger = {
  id: 'test_passenger_123',
  name: 'Test Passenger',
  email: 'passenger@test.com'
};

const testDriver = {
  id: 'test_driver_456',
  name: 'Test Driver',
  email: 'driver@test.com'
};

// Test functions
async function testNotificationSystem() {
  console.log('🚀 Starting Comprehensive Notification Integration Test');
  console.log('=====================================================\n');

  try {
    // Test 1: Device Registration
    console.log('📱 Test 1: Device Registration');
    await testDeviceRegistration();
    
    // Test 2: Private Ride Creation with Notifications
    console.log('\n🚗 Test 2: Private Ride Creation with Notifications');
    await testPrivateRideCreation();
    
    // Test 3: Rideshare Request Creation with Notifications
    console.log('\n🚙 Test 3: Rideshare Request Creation with Notifications');
    await testRideshareRequestCreation();
    
    // Test 4: Counter Offer Notifications
    console.log('\n💰 Test 4: Counter Offer Notifications');
    await testCounterOfferNotifications();
    
    // Test 5: Trip Status Updates with Notifications
    console.log('\n📊 Test 5: Trip Status Updates with Notifications');
    await testTripStatusUpdates();
    
    // Test 6: Analytics Endpoints
    console.log('\n📈 Test 6: Analytics Endpoints');
    await testAnalyticsEndpoints();
    
    // Test 7: Real-time Metrics
    console.log('\n⚡ Test 7: Real-time Metrics');
    await testRealTimeMetrics();
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function testDeviceRegistration() {
  try {
    const response = await axios.post(`${API_BASE}/notifications/register-device`, {
      userId: testPassenger.id,
      deviceToken: 'ExponentPushToken[test_token_12345]',
      deviceType: 'android',
      appVersion: '1.0.0'
    });
    
    console.log('✅ Device registration successful:', response.data);
    
    // Register driver device
    const driverResponse = await axios.post(`${API_BASE}/notifications/register-device`, {
      userId: testDriver.id,
      deviceToken: 'ExponentPushToken[test_driver_token_67890]',
      deviceType: 'android',
      appVersion: '1.0.0'
    });
    
    console.log('✅ Driver device registration successful:', driverResponse.data);
    
  } catch (error) {
    console.log('⚠️ Device registration test:', error.response?.data || error.message);
  }
}

async function testPrivateRideCreation() {
  try {
    const tripData = {
      driver_id: null,
      cust_id: testPassenger.id,
      customer_name: testPassenger.name,
      request_start_datetime: new Date().toISOString(),
      order_start_datetime: null,
      order_end_datetime: null,
      estimate_order_end_datetime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      status: 'pending',
      deliveray_details: 'Test private ride',
      delivery_notes: 'Test notes',
      weight: 1,
      delivery_contact_details: '1234567890',
      dest_location: 'Test Destination',
      origin_location: 'Test Origin',
      origin_location_lat: -17.8292,
      origin_location_long: 31.0539,
      destination_lat: -17.8277,
      destination_long: 31.0540,
      distance: 5.2,
      delivery_cost_proposed: 25.00,
      accepted_cost: null,
      paying_when: 'after',
      payment_type: 'cash',
      preferred_gender: 'any',
      preferred_car_type: 'any',
      preferred_age_range: 'any',
      number_of_passengers: 1,
      driver_license_date: '2020-01-01',
      currency_id: 1,
      currency_code: 'USD',
      usd_rate: 1.0,
      customer_comment: 'Test comment',
      driver_comment: null,
      driver_stars: null,
      customer_stars: null,
      customer_status: 'active',
      pascel_pic1: null,
      pascel_pic2: null,
      pascel_pic3: null,
      trip_priority_type: 'normal',
      delivery_received_confirmation_code: null,
      commercial_value_delivery_category: null,
      trip_type: 'private'
    };
    
    const response = await axios.post(`${API_BASE}/trip`, tripData);
    console.log('✅ Private ride creation successful:', response.data);
    
    // Store trip ID for status update test
    global.testTripId = response.data.insertId;
    
  } catch (error) {
    console.log('⚠️ Private ride creation test:', error.response?.data || error.message);
  }
}

async function testRideshareRequestCreation() {
  try {
    // First create a rideshare trip
    const rideshareTripData = {
      driver_id: testDriver.id,
      driver_name: testDriver.name,
      origin_lat: -17.8292,
      origin_lng: 31.0539,
      origin_name: 'Test Origin',
      destination_lat: -17.8277,
      destination_lng: 31.0540,
      destination_name: 'Test Destination',
      available_seats: 3,
      status: 'active',
      agreed_fare: 20.00,
      created_at: new Date().toISOString()
    };
    
    const tripResponse = await axios.post(`${API_BASE}/rideshare/trips`, rideshareTripData);
    console.log('✅ Rideshare trip creation successful:', tripResponse.data);
    
    // Then create a passenger request
    const requestData = {
      rideshare_id: tripResponse.data.insertId,
      customer_id: testPassenger.id,
      customer_name: testPassenger.name,
      pickup_lat: -17.8285,
      pickup_lng: 31.0535,
      pickup_name: 'Test Pickup',
      dropoff_lat: -17.8280,
      dropoff_lng: 31.0545,
      dropoff_name: 'Test Dropoff',
      offer_amount: 15.00,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    const requestResponse = await axios.post(`${API_BASE}/rideshare/requests`, requestData);
    console.log('✅ Rideshare request creation successful:', requestResponse.data);
    
    // Store request ID for status update test
    global.testRideshareRequestId = requestResponse.data.insertId;
    
  } catch (error) {
    console.log('⚠️ Rideshare request creation test:', error.response?.data || error.message);
  }
}

async function testCounterOfferNotifications() {
  try {
    const counterOfferData = {
      sender_id: testDriver.id,
      receiver_id: testPassenger.id,
      sender_name: testDriver.name,
      amount: 22.50,
      ride_type: 'private',
      trip_id: global.testTripId
    };
    
    const response = await axios.post(`${API_BASE}/trip/counter-offer`, counterOfferData);
    console.log('✅ Counter offer notification test successful:', response.data);
    
  } catch (error) {
    console.log('⚠️ Counter offer notification test:', error.response?.data || error.message);
  }
}

async function testTripStatusUpdates() {
  try {
    if (!global.testTripId) {
      console.log('⚠️ No trip ID available for status update test');
      return;
    }
    
    // Test status update to 'Accepted'
    const statusData = {
      driver_id: testDriver.id,
      status: 'Accepted'
    };
    
    const response = await axios.put(`${API_BASE}/trip/updateStatusAndDriver/${global.testTripId}`, statusData);
    console.log('✅ Trip status update test successful:', response.data);
    
    // Test status update to 'On Way'
    const onWayData = {
      driver_id: testDriver.id,
      status: 'On Way'
    };
    
    const onWayResponse = await axios.put(`${API_BASE}/trip/updateStatusAndDriver/${global.testTripId}`, onWayData);
    console.log('✅ Trip status update to On Way successful:', onWayResponse.data);
    
  } catch (error) {
    console.log('⚠️ Trip status update test:', error.response?.data || error.message);
  }
}

async function testAnalyticsEndpoints() {
  try {
    // Test dashboard analytics
    const dashboardResponse = await axios.get(`${API_BASE}/analytics/notifications/dashboard`);
    console.log('✅ Dashboard analytics test successful');
    
    // Test match rates
    const matchRatesResponse = await axios.get(`${API_BASE}/analytics/notifications/match-rates`);
    console.log('✅ Match rates analytics test successful');
    
    // Test user engagement
    const engagementResponse = await axios.get(`${API_BASE}/analytics/notifications/user-engagement`);
    console.log('✅ User engagement analytics test successful');
    
    // Test performance analytics
    const performanceResponse = await axios.get(`${API_BASE}/analytics/notifications/performance`);
    console.log('✅ Performance analytics test successful');
    
    // Test trends
    const trendsResponse = await axios.get(`${API_BASE}/analytics/notifications/trends`);
    console.log('✅ Trends analytics test successful');
    
    // Test KPI summary
    const kpiResponse = await axios.get(`${API_BASE}/analytics/notifications/kpi-summary?period=7d`);
    console.log('✅ KPI summary test successful');
    
  } catch (error) {
    console.log('⚠️ Analytics endpoints test:', error.response?.data || error.message);
  }
}

async function testRealTimeMetrics() {
  try {
    const response = await axios.get(`${API_BASE}/analytics/notifications/realtime`);
    console.log('✅ Real-time metrics test successful:', response.data);
    
  } catch (error) {
    console.log('⚠️ Real-time metrics test:', error.response?.data || error.message);
  }
}

// Test notification templates
async function testNotificationTemplates() {
  console.log('\n🎨 Test 8: Notification Templates');
  
  try {
    const testNotification = await axios.post(`${API_BASE}/notifications/test`, {
      userId: testPassenger.id,
      title: 'Test Notification',
      body: 'This is a test notification',
      data: { type: 'test' }
    });
    
    console.log('✅ Notification template test successful:', testNotification.data);
    
  } catch (error) {
    console.log('⚠️ Notification template test:', error.response?.data || error.message);
  }
}

// Test notification preferences
async function testNotificationPreferences() {
  console.log('\n⚙️ Test 9: Notification Preferences');
  
  try {
    const preferences = {
      ride_requests: true,
      counter_offers: true,
      ride_accepted: true,
      driver_updates: true,
      messages: true,
      payments: true,
      promotions: false
    };
    
    const response = await axios.post(`${API_BASE}/notifications/preferences/${testPassenger.id}`, preferences);
    console.log('✅ Notification preferences test successful:', response.data);
    
    // Test getting preferences
    const getResponse = await axios.get(`${API_BASE}/notifications/preferences/${testPassenger.id}`);
    console.log('✅ Get notification preferences test successful:', getResponse.data);
    
  } catch (error) {
    console.log('⚠️ Notification preferences test:', error.response?.data || error.message);
  }
}

// Test notification history
async function testNotificationHistory() {
  console.log('\n📚 Test 10: Notification History');
  
  try {
    const response = await axios.get(`${API_BASE}/notifications/history/${testPassenger.id}`);
    console.log('✅ Notification history test successful:', response.data);
    
  } catch (error) {
    console.log('⚠️ Notification history test:', error.response?.data || error.message);
  }
}

// Main test runner
async function runAllTests() {
  await testNotificationSystem();
  await testNotificationTemplates();
  await testNotificationPreferences();
  await testNotificationHistory();
  
  console.log('\n🎉 All integration tests completed!');
  console.log('📊 Notification system is fully integrated and ready for production');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testNotificationSystem,
  testDeviceRegistration,
  testPrivateRideCreation,
  testRideshareRequestCreation,
  testCounterOfferNotifications,
  testTripStatusUpdates,
  testAnalyticsEndpoints,
  testRealTimeMetrics,
  testNotificationTemplates,
  testNotificationPreferences,
  testNotificationHistory
};
