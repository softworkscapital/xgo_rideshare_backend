// UPDATED MOBILE APP INTEGRATION GUIDE
// Customer Performance Ratings (Ratings Received FROM Drivers)

// ===========================================
// 1. CUSTOMER PERFORMANCE RATING ENDPOINT
// ===========================================

const updateCustomerPerformanceRating = async (customerId, rating, tripType) => {
  try {
    const response = await fetch(`${API_URL}/customerdetails/${customerId}/customer_performance_rating`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating: rating,           // 1-5 stars from driver
        tripType: tripType        // 'private' or 'rideshare'
      })
    });
    
    const result = await response.json();
    console.log('Customer performance rating updated:', result);
    return result;
  } catch (error) {
      console.error('Failed to update customer performance rating:', error);
  }
};

// ===========================================
// 2. WHERE TO CALL THIS
// ===========================================

/*
=== WHEN DRIVERS RATE CUSTOMERS ===

Call this when a driver submits a rating for a customer's performance:

// In private trip rating handler:
if (driverRatesCustomer) {
  await updateCustomerPerformanceRating(customerId, driverRating, 'private');
}

// In rideshare rating handler:
if (driverRatesCustomer) {
  await updateCustomerPerformanceRating(customerId, driverRating, 'rideshare');
}

=== EXAMPLE SCENARIOS ===

// Driver gives customer 4 stars for private trip
await updateCustomerPerformanceRating('AAA-100001', 4, 'private');

// Driver gives customer 5 stars for rideshare trip
await updateCustomerPerformanceRating('AAA-100001', 5, 'rideshare');

=== API RESPONSE ===

{
  "status": "200",
  "message": "Customer performance rating updated successfully",
  "customer_id": "AAA-100001",
  "trip_type": "private",
  "rating": 4,
  "new_total": 15,
  "new_average": 4.2
}

=== WHAT THIS TRACKS ===

Customer Performance Metrics:
- How well customer behaves as passenger
- Punctuality, communication, behavior
- Driver's perspective on customer quality
- Customer's average rating across all trips

=== DATABASE FIELDS UPDATED ===

For private trips:
- private_total_ratings_received (count)
- private_average_rating_received (average)

For rideshare trips:
- rideshare_total_ratings_received (count)
- rideshare_average_rating_received (average)

=== VALIDATION ===

- Rating must be 1-5 stars
- Trip type must be 'private' or 'rideshare'
- Customer must exist in database

=== BENEFITS ===

✅ Customer Quality Tracking - Monitor customer behavior
✅ Driver Feedback - Capture driver experience with customers
✅ Performance Analytics - Identify high/low performing customers
✅ Service Quality - Maintain service standards
✅ Dispute Resolution - Rating history for customer issues

*/

export { updateCustomerPerformanceRating };
