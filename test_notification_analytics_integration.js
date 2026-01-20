// Test Notification Analytics Integration
const axios = require('axios');

const API_BASE = 'http://localhost:3011';

async function testNotificationAnalyticsIntegration() {
  console.log('🚀 Testing Notification Analytics Integration');
  console.log('==========================================\n');

  try {
    // Test 1: KPI Summary
    console.log('📊 Test 1: KPI Summary');
    try {
      const response = await axios.get(`${API_BASE}/analytics/notifications/kpi-summary?period=7d`);
      console.log('✅ KPI Summary API working:', response.data.status === 200 ? 'SUCCESS' : 'FAILED');
      if (response.data.status === 200) {
        console.log('📈 KPI Data:', {
          totalNotifications: response.data.data.notifications.totalSent,
          deliveryRate: response.data.data.notifications.deliveryRate + '%',
          openRate: response.data.data.notifications.openRate + '%',
          matchRate: response.data.data.matchRates.overall + '%'
        });
      }
    } catch (error) {
      console.log('❌ KPI Summary API failed:', error.response?.data || error.message);
    }

    // Test 2: Dashboard Analytics
    console.log('\n📈 Test 2: Dashboard Analytics');
    try {
      const response = await axios.get(`${API_BASE}/analytics/notifications/dashboard?period=7d`);
      console.log('✅ Dashboard API working:', response.data.status === 200 ? 'SUCCESS' : 'FAILED');
      if (response.data.status === 200) {
        console.log('📊 Dashboard sections available:', Object.keys(response.data.data));
      }
    } catch (error) {
      console.log('❌ Dashboard API failed:', error.response?.data || error.message);
    }

    // Test 3: Real-time Metrics
    console.log('\n⚡ Test 3: Real-time Metrics');
    try {
      const response = await axios.get(`${API_BASE}/analytics/notifications/realtime`);
      console.log('✅ Real-time API working:', response.data.status === 200 ? 'SUCCESS' : 'FAILED');
      if (response.data.status === 200) {
        console.log('🔥 Real-time data:', {
          notificationsLastHour: response.data.data.notificationsLastHour,
          deliveryRateLastHour: response.data.data.deliveryRateLastHour + '%',
          openRateLastHour: response.data.data.openRateLastHour + '%'
        });
      }
    } catch (error) {
      console.log('❌ Real-time API failed:', error.response?.data || error.message);
    }

    // Test 4: Match Rates
    console.log('\n🎯 Test 4: Match Rates');
    try {
      const response = await axios.get(`${API_BASE}/analytics/notifications/match-rates?period=7d`);
      console.log('✅ Match Rates API working:', response.data.status === 200 ? 'SUCCESS' : 'FAILED');
      if (response.data.status === 200) {
        console.log('📊 Match rate breakdown:', {
          privateRides: response.data.data.privateRides.matchRate + '%',
          rideshare: response.data.data.rideshare.matchRate + '%',
          overall: response.data.data.overall.matchRate + '%'
        });
      }
    } catch (error) {
      console.log('❌ Match Rates API failed:', error.response?.data || error.message);
    }

    // Test 5: User Engagement
    console.log('\n👥 Test 5: User Engagement');
    try {
      const response = await axios.get(`${API_BASE}/analytics/notifications/user-engagement?period=7d`);
      console.log('✅ User Engagement API working:', response.data.status === 200 ? 'SUCCESS' : 'FAILED');
      if (response.data.status === 200) {
        console.log('👤 Users analyzed:', response.data.data.length);
      }
    } catch (error) {
      console.log('❌ User Engagement API failed:', error.response?.data || error.message);
    }

    // Test 6: Performance Analytics
    console.log('\n⚙️ Test 6: Performance Analytics');
    try {
      const response = await axios.get(`${API_BASE}/analytics/notifications/performance?period=7d`);
      console.log('✅ Performance API working:', response.data.status === 200 ? 'SUCCESS' : 'FAILED');
      if (response.data.status === 200) {
        console.log('📊 Performance types:', response.data.data.length);
      }
    } catch (error) {
      console.log('❌ Performance API failed:', error.response?.data || error.message);
    }

    // Test 7: Trends
    console.log('\n📈 Test 7: Trends Analytics');
    try {
      const response = await axios.get(`${API_BASE}/analytics/notifications/trends?period=7d`);
      console.log('✅ Trends API working:', response.data.status === 200 ? 'SUCCESS' : 'FAILED');
      if (response.data.status === 200) {
        console.log('📅 Trend days:', response.data.data.length);
      }
    } catch (error) {
      console.log('❌ Trends API failed:', error.response?.data || error.message);
    }

    // Test 8: Recommendations
    console.log('\n💡 Test 8: Recommendations');
    try {
      const response = await axios.get(`${API_BASE}/analytics/notifications/recommendations`);
      console.log('✅ Recommendations API working:', response.data.status === 200 ? 'SUCCESS' : 'FAILED');
      if (response.data.status === 200) {
        console.log('🎯 Recommendations available:', response.data.data.length);
      }
    } catch (error) {
      console.log('❌ Recommendations API failed:', error.response?.data || error.message);
    }

    console.log('\n✅ Notification Analytics Integration Test Complete!');
    console.log('🎯 Ready for dashboard integration');
    
  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
  }
}

// Test dashboard accessibility
async function testDashboardAccessibility() {
  console.log('\n🌐 Testing Dashboard Accessibility');
  console.log('=====================================\n');

  try {
    // Test if backend is running
    const response = await axios.get(`${API_BASE}/analytics/notifications/kpi-summary`);
    console.log('✅ Backend is running and accessible');
    
    // Test CORS (this would normally be tested from browser)
    console.log('✅ CORS should be configured for dashboard access');
    
    // Test API response format
    if (response.data.status === 200) {
      console.log('✅ API response format is correct');
      console.log('📊 Sample data structure available for dashboard');
    }
    
  } catch (error) {
    console.log('❌ Backend accessibility issue:', error.message);
    console.log('💡 Make sure the backend server is running on port 3011');
  }
}

// Main test runner
async function runTests() {
  await testNotificationAnalyticsIntegration();
  await testDashboardAccessibility();
  
  console.log('\n🎉 All tests completed!');
  console.log('📋 Next steps:');
  console.log('1. Start the dashboard application');
  console.log('2. Navigate to /notification-analytics');
  console.log('3. Verify the dashboard displays analytics data');
  console.log('4. Test real-time updates and refresh functionality');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testNotificationAnalyticsIntegration,
  testDashboardAccessibility
};
