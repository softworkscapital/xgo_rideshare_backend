// ===========================================
// DRIVER ANALYTICS MOBILE APP INTEGRATION
// ===========================================
// 
// This file provides integration examples for mobile apps to use the new driver analytics API endpoints
// 
// Author: Driver Analytics System
// Date: 2025-01-20
// Purpose: Mobile app integration guide for driver analytics

// ===========================================
// 1. TRIP STATUS UPDATES
// ===========================================

// Update driver private trip status
// Call this when private trip status changes
export const updateDriverPrivateTripStatus = async (driverId, status, earnings = 0, distance = 0, duration = 0) => {
  try {
    const response = await fetch(`${API_BASE_URL}/driver/${driverId}/private_trip_status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        status,
        earnings,
        distance,
        duration
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Private trip status updated:', result.message);
      return result;
    } else {
      console.error('❌ Failed to update private trip status:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('❌ Error updating private trip status:', error);
    throw error;
  }
};

// Update driver rideshare trip status
// Call this when rideshare trip status changes
export const updateDriverRideshareTripStatus = async (driverId, status, earnings = 0, distance = 0, duration = 0) => {
  try {
    const response = await fetch(`${API_BASE_URL}/driver/${driverId}/rideshare_trip_status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        status,
        earnings,
        distance,
        duration
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Rideshare trip status updated:', result.message);
      return result;
    } else {
      console.error('❌ Failed to update rideshare trip status:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('❌ Error updating rideshare trip status:', error);
    throw error;
  }
};

// ===========================================
// 2. EARNINGS UPDATES
// ===========================================

// Update driver earnings
// Call this when trip is completed and earnings are calculated
export const updateDriverEarnings = async (driverId, earnings, tripType) => {
  try {
    const response = await fetch(`${API_BASE_URL}/driver/${driverId}/earnings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        earnings,
        tripType // 'private' or 'rideshare'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Driver earnings updated:', result.message);
      return result;
    } else {
      console.error('❌ Failed to update driver earnings:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('❌ Error updating driver earnings:', error);
    throw error;
  }
};

// ===========================================
// 3. COMPREHENSIVE STATISTICS
// ===========================================

// Get comprehensive driver statistics
// Call this to display complete driver analytics dashboard
export const getComprehensiveDriverStatistics = async (driverId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/driver/${driverId}/comprehensive_stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Comprehensive driver statistics retrieved');
      return result;
    } else {
      console.error('❌ Failed to get comprehensive driver statistics:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('❌ Error getting comprehensive driver statistics:', error);
    throw error;
  }
};

// Get driver earnings summary
// Call this to display earnings breakdown
export const getDriverEarningsSummary = async (driverId, days = 30) => {
  try {
    const response = await fetch(`${API_BASE_URL}/driver/${driverId}/earnings_summary?days=${days}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Driver earnings summary retrieved');
      return result;
    } else {
      console.error('❌ Failed to get driver earnings summary:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('❌ Error getting driver earnings summary:', error);
    throw error;
  }
};

// ===========================================
// 4. INTEGRATION EXAMPLES
// ===========================================

// Example: Private Trip Completion Flow
export const handlePrivateTripCompletion = async (driverId, tripData) => {
  try {
    const { earnings, distance, duration } = tripData;
    
    // 1. Update trip status to 'Completed'
    await updateDriverPrivateTripStatus(driverId, 'Completed', earnings, distance, duration);
    
    // 2. Update earnings
    await updateDriverEarnings(driverId, earnings, 'private');
    
    // 3. Get updated statistics
    const stats = await getComprehensiveDriverStatistics(driverId);
    
    console.log('✅ Private trip completion handled successfully');
    return stats;
  } catch (error) {
    console.error('❌ Error handling private trip completion:', error);
    throw error;
  }
};

// Example: Rideshare Trip Completion Flow
export const handleRideshareTripCompletion = async (driverId, tripData) => {
  try {
    const { earnings, distance, duration } = tripData;
    
    // 1. Update trip status to 'Completed'
    await updateDriverRideshareTripStatus(driverId, 'Completed', earnings, distance, duration);
    
    // 2. Update earnings
    await updateDriverEarnings(driverId, earnings, 'rideshare');
    
    // 3. Get updated statistics
    const stats = await getComprehensiveDriverStatistics(driverId);
    
    console.log('✅ Rideshare trip completion handled successfully');
    return stats;
  } catch (error) {
    console.error('❌ Error handling rideshare trip completion:', error);
    throw error;
  }
};

// Example: Real-time Status Updates
export const handleTripStatusChange = async (driverId, status, tripType, tripData = {}) => {
  try {
    const { earnings = 0, distance = 0, duration = 0 } = tripData;
    
    if (tripType === 'private') {
      await updateDriverPrivateTripStatus(driverId, status, earnings, distance, duration);
    } else if (tripType === 'rideshare') {
      await updateDriverRideshareTripStatus(driverId, status, earnings, distance, duration);
    } else {
      throw new Error('Invalid trip type. Must be "private" or "rideshare"');
    }
    
    console.log(`✅ ${tripType} trip status updated to: ${status}`);
    
    // If trip is completed, update earnings
    if (status === 'Completed' && earnings > 0) {
      await updateDriverEarnings(driverId, earnings, tripType);
      console.log(`✅ Earnings updated for ${tripType} trip: $${earnings}`);
    }
    
  } catch (error) {
    console.error('❌ Error handling trip status change:', error);
    throw error;
  }
};

// ===========================================
// 5. HELPER FUNCTIONS
// ===========================================

// Get authentication token
const getAuthToken = async () => {
  // Implement your auth token retrieval logic here
  return localStorage.getItem('authToken') || '';
};

// API base URL
const API_BASE_URL = 'http://localhost:3011'; // Update with your actual API URL

// ===========================================
// 6. USAGE INSTRUCTIONS
// ===========================================

/*
USAGE INSTRUCTIONS:

1. IMPORT THE FUNCTIONS:
   import { 
     updateDriverPrivateTripStatus,
     updateDriverRideshareTripStatus,
     updateDriverEarnings,
     getComprehensiveDriverStatistics,
     handlePrivateTripCompletion,
     handleRideshareTripCompletion,
     handleTripStatusChange
   } from './driverAnalyticsIntegration';

2. UPDATE TRIP STATUS:
   await handleTripStatusChange(driverId, 'Completed', 'private', {
     earnings: 25.50,
     distance: 12.3,
     duration: 45
   });

3. GET DRIVER STATISTICS:
   const stats = await getComprehensiveDriverStatistics(driverId);

4. HANDLE TRIP COMPLETION:
   await handlePrivateTripCompletion(driverId, {
     earnings: 25.50,
     distance: 12.3,
     duration: 45
   });

STATUS MAPPINGS:
- Private: 'New Order', 'Pending', 'Accepted', 'In-Transit', 'InTransit', 'Completed', 'Trip Ended', 'TripEnded', 'Counter Offer', 'Just In', 'Waiting Payment', 'Cancelled'
- Rideshare: 'Created Shared Ride Request', 'In-Transit', 'Completed', 'Cancelled'

API ENDPOINTS:
- PUT /driver/{id}/private_trip_status
- PUT /driver/{id}/rideshare_trip_status
- PUT /driver/{id}/earnings
- GET /driver/{id}/comprehensive_stats
- GET /driver/{id}/earnings_summary
- GET /driver/{id}/performance_summary
- GET /driver/{id}/activity_summary
*/
