const axios = require('axios');

// Test Customer Performance API
async function testCustomerPerformance() {
  try {
    console.log('🧪 Testing Customer Performance API...');
    
    // Test 1: Get customer summary
    console.log('\n📊 Testing customer summary...');
    const summaryResponse = await axios.get('http://localhost:3011/commission/analytics/customers-performance');
    console.log('✅ Summary API Response:', summaryResponse.data);
    
    // Test 2: Get sample customer data
    console.log('\n👥 Testing sample customer data...');
    const sampleResponse = await axios.get('http://localhost:3011/commission/analytics/customers-performance/sample-customer-data');
    console.log('✅ Sample Data Response:', sampleResponse.data);
    
    // Test 3: Calculate customer performance
    console.log('\n🔢 Testing customer performance calculation...');
    const calcResponse = await axios.post('http://localhost:3011/commission/analytics/customers-performance/calculate-customer-performance', {
      date: '2025-08-09'
    });
    console.log('✅ Calculation Response:', calcResponse.data);
    
    console.log('\n🎉 All Customer Performance API tests passed!');
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
      console.error('Status:', error.response.status);
    }
  }
}

// Test Driver Earnings API
async function testDriverEarnings() {
  try {
    console.log('🧪 Testing Driver Earnings API...');
    
    // Test 1: Get driver summary
    console.log('\n📊 Testing driver summary...');
    const summaryResponse = await axios.get('http://localhost:3011/commission/analytics/drivers-summary');
    console.log('✅ Driver Summary Response:', summaryResponse.data);
    
    // Test 2: Get sample driver data
    console.log('\n👥 Testing sample driver data...');
    const sampleResponse = await axios.get('http://localhost:3011/commission/analytics/sample-driver-data');
    console.log('✅ Sample Driver Data Response:', sampleResponse.data);
    
    console.log('\n🎉 All Driver Earnings API tests passed!');
    
  } catch (error) {
    console.error('❌ Driver API Test Failed:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
      console.error('Status:', error.response.status);
    }
  }

// Run tests
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  await testCustomerPerformance();
  console.log('\n' + '='.repeat(50) + '\n');
  await testDriverEarnings();
  
  console.log('\n✨ Testing Complete!');
}

runTests();
