// MOBILE APP INTEGRATION GUIDE
// Add these calls at the exact places where status changes happen in your mobile app

// ===========================================
// 1. CONFIGURATION
// ===========================================

const API_URL = "http://172.16.77.32:3011"; // Your API base URL

// ===========================================
// 2. PRIVATE RIDE STATUS UPDATES
// ===========================================

const updateCustomerPrivateStatus = async (customerId, status, tripRevenue = 0, rating = null) => {
  try {
    const response = await fetch(`${API_URL}/customerdetails/${customerId}/private_trip_status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: status,
        tripRevenue: tripRevenue || 0,
        rating: rating || null
      })
    });
    
    const result = await response.json();
    console.log('Customer private status updated:', result);
    return result;
  } catch (error) {
      console.error('Failed to update customer private status:', error);
  }
};

// ===========================================
// 3. RIDESHARE REQUEST STATUS UPDATES
// ===========================================

const updateCustomerRideshareRequestStatus = async (customerId, status, offerAmount = 0, rating = null) => {
  try {
    const response = await fetch(`${API_URL}/customerdetails/${customerId}/rideshare_request_status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: status,
        offerAmount: offerAmount || 0,
        rating: rating || null
      })
    });
    
    const result = await response.json();
    console.log('Customer rideshare request status updated:', result);
    return result;
  } catch (error) {
      console.error('Failed to update customer rideshare request status:', error);
  }
};

// ===========================================
// 4. RIDESHARE DRIVER STATUS UPDATES
// ===========================================

const updateCustomerRideshareDriverStatus = async (customerId, status, revenue = 0) => {
  try {
    const response = await fetch(`${API_URL}/customerdetails/${customerId}/rideshare_driver_status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: status,
        revenue: revenue || 0
      })
    });
    
    const result = await response.json();
    console.log('Customer rideshare driver status updated:', result);
    return result;
  } catch (error) {
      console.error('Failed to update customer rideshare driver status:', error);
  }
};

// ===========================================
// 5. INTEGRATION POINTS - WHERE TO CALL THESE
// ===========================================

/*
=== IN YOUR TRIP STATUS HANDLERS ===

When a private trip status changes:
- Call updateCustomerPrivateStatus()

When a rideshare request status changes:
- Call updateCustomerRideshareRequestStatus()

When a rideshare driver status changes:
- Call updateCustomerRideshareDriverStatus()

=== EXAMPLE INTEGRATIONS ===

// In your trip completion handler:
if (tripType === 'private' && newStatus === 'Completed') {
  await updateCustomerPrivateStatus(customerId, 'Completed', tripCost, customerRating);
}

if (tripType === 'private' && newStatus === 'Trip Ended') {
  await updateCustomerPrivateStatus(customerId, 'Trip Ended', tripCost, customerRating);
}

if (tripType === 'private' && newStatus === 'Cancelled') {
  await updateCustomerPrivateStatus(customerId, 'Cancelled', 0, null);
}

// In rideshare request completion:
if (tripType === 'rideshare' && newStatus === 'Completed') {
  await updateCustomerRideshareRequestStatus(customerId, 'Completed', offerAmount, customerRating);
}

// In rideshare driver completion:
if (driverStatus === 'Completed') {
  await updateCustomerRideshareDriverStatus(driverId, 'Completed', driverRevenue);
}

// In rating submission handlers:
if (customerRating !== null) {
  if (tripType === 'private') {
    await updateCustomerPrivateStatus(customerId, getCurrentStatus(tripId), 0, customerRating);
  } else if (tripType === 'rideshare') {
    await updateCustomerRideshareRequestStatus(customerId, getCurrentStatus(tripId), 0, customerRating);
  }
}

=== VALID STATUS VALUES ===

Private Ride Statuses:
- 'New Order'
- 'Pending'
- 'Accepted'
- 'In-Transit'
- 'InTransit'
- 'Completed'
- 'Trip Ended'
- 'TripEnded'
- 'Counter Offer'
- 'Just In'
- 'Waiting Payment'
- 'Cancelled'

Rideshare Statuses:
- 'Created Shared Ride Request'
- 'Completed'
- 'Cancelled'

=== WHAT EACH CALL DOES ===

1. Updates the specific status count in customer_details table
2. Updates financial totals (spend/earnings) if provided
3. Updates ratings if provided
4. Updates last trip date for completed trips
5. Calculates new averages automatically

=== TESTING ===

You can test the endpoints directly:

PUT /customerdetails/{customerId}/private_trip_status
{
  "status": "Completed",
  "tripRevenue": 25.50,
  "rating": 5
}

PUT /customerdetails/{customerId}/rideshare_request_status
{
  "status": "Completed",
  "offerAmount": 15.00,
  "rating": 4
}

PUT /customerdetails/{customerId}/rideshare_driver_status
{
  "status": "Completed",
  "revenue": 20.00
}

=== BENEFITS ===

✅ Real-time analytics - Reports update instantly
✅ Status granularity - Track exact status values
✅ Financial tracking - Automatic spend/earnings calculation
✅ Rating tracking - Customer ratings are tracked
✅ Backward compatible - Existing code continues to work
✅ Performance optimized - Only updates relevant fields

*/

export {
  updateCustomerPrivateStatus,
  updateCustomerRideshareRequestStatus,
  updateCustomerRideshareDriverStatus
};
