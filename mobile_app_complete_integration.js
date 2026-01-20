// COMPLETE MOBILE APP INTEGRATION
// Add this file to your mobile app project and import where needed

import { API_URL } from './config';

// ===========================================
// 1. CUSTOMER STATUS UPDATE FUNCTIONS
// ===========================================

// Update customer private trip status (real-time analytics)
export const updateCustomerPrivateStatus = async (customerId, status, tripRevenue = 0, rating = null) => {
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
    throw error;
  }
};

// Update customer rideshare request status (real-time analytics)
export const updateCustomerRideshareRequestStatus = async (customerId, status, offerAmount = 0, rating = null) => {
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
    throw error;
  }
};

// Update customer performance rating (driver rating customer)
export const updateCustomerPerformanceRating = async (customerId, rating, tripType) => {
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
    throw error;
  }
};

// ===========================================
// 2. INTEGRATION POINTS - WHERE TO CALL THESE
// ===========================================

/*
=== IN YOUR TRIP COMPLETION HANDLERS ===

// Private trip completion handler
const handlePrivateTripCompletion = async (tripData) => {
  const { customerId, status, tripCost, driverRating } = tripData;
  
  // Update customer status and analytics
  await updateCustomerPrivateStatus(customerId, status, tripCost, driverRating);
  
  // ... rest of your completion logic
};

// Rideshare request completion handler
const handleRideshareRequestCompletion = async (requestData) => {
  const { customerId, status, offerAmount, driverRating } = requestData;
  
  // Update customer status and analytics
  await updateCustomerRideshareRequestStatus(customerId, status, offerAmount, driverRating);
  
  // ... rest of your completion logic
};

// Driver rating customer handler
const handleDriverRatingCustomer = async (ratingData) => {
  const { customerId, rating, tripType } = ratingData;
  
  // Update customer performance rating
  await updateCustomerPerformanceRating(customerId, rating, tripType);
  
  // ... rest of your rating logic
};

=== STATUS CHANGE EXAMPLES ===

// When private trip status changes to 'Completed'
if (newStatus === 'Completed') {
  await updateCustomerPrivateStatus(customerId, 'Completed', tripCost, customerRating);
}

// When private trip status changes to 'Trip Ended'
if (newStatus === 'Trip Ended') {
  await updateCustomerPrivateStatus(customerId, 'Trip Ended', tripCost, customerRating);
}

// When private trip gets cancelled
if (newStatus === 'Cancelled') {
  await updateCustomerPrivateStatus(customerId, 'Cancelled', 0, null);
}

// When rideshare request completes
if (rideshareStatus === 'Completed') {
  await updateCustomerRideshareRequestStatus(customerId, 'Completed', offerAmount, customerRating);
}

// When driver rates customer (separate from status change)
if (driverRating !== null) {
  await updateCustomerPerformanceRating(customerId, driverRating, tripType);
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

=== ERROR HANDLING ===

try {
  await updateCustomerPrivateStatus(customerId, 'Completed', tripCost, rating);
  // Handle success
} catch (error) {
  // Handle error - maybe retry or log
  console.error('Failed to update customer analytics:', error);
}

=== BATCH UPDATES ===

// For multiple status changes, you can batch them
const batchUpdateCustomerAnalytics = async (updates) => {
  for (const update of updates) {
    try {
      if (update.type === 'private') {
        await updateCustomerPrivateStatus(update.customerId, update.status, update.revenue, update.rating);
      } else if (update.type === 'rideshare') {
        await updateCustomerRideshareRequestStatus(update.customerId, update.status, update.offerAmount, update.rating);
      }
    } catch (error) {
      console.error(`Failed to update ${update.customerId}:`, error);
    }
  }
};

*/

export {
  updateCustomerPrivateStatus,
  updateCustomerRideshareRequestStatus,
  updateCustomerPerformanceRating
};
