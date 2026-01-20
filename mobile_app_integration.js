// MOBILE APP INTEGRATION POINTS
// Add these calls at the exact places where status changes happen in your mobile app

// ===========================================
// 1. PRIVATE RIDE STATUS UPDATES
// ===========================================

// In Trip.js or wherever private trip status changes:
const updateCustomerPrivateStatus = async (customerId, status, tripRevenue, rating) => {
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

// CALL THIS WHEN:
// - Trip status changes to 'Completed'
// - Trip status changes to 'Trip Ended'
// - Trip status changes to 'Cancelled'
// - Customer gives rating to driver

// Example in trip completion handler:
if (newStatus === 'Completed') {
  await updateCustomerPrivateStatus(customerId, 'Completed', tripCost, customerRating);
  // ... rest of completion logic
}

// ===========================================
// 2. RIDESHARE REQUEST STATUS UPDATES
// ===========================================

const updateCustomerRideshareRequestStatus = async (customerId, status, offerAmount, rating) => {
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

// CALL THIS WHEN:
// - Rideshare request status changes to 'Completed'
// - Rideshare request status changes to 'Cancelled'
// - Customer gives rating to driver

// Example in rideshare completion handler:
if (newStatus === 'Completed') {
  await updateCustomerRideshareRequestStatus(customerId, 'Completed', offerAmount, customerRating);
  // ... rest of completion logic
}

// ===========================================
// 3. RIDESHARE DRIVER STATUS UPDATES
// ===========================================

const updateCustomerRideshareDriverStatus = async (customerId, status, revenue) => {
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

// CALL THIS WHEN:
// - Rideshare trip status changes to 'Completed'
// - Rideshare trip status changes to 'Cancelled'
// - Driver creates new rideshare trip

// Example in rideshare trip completion handler:
if (newStatus === 'Completed') {
  await updateCustomerRideshareDriverStatus(driverId, 'Completed', tripRevenue);
  // ... rest of completion logic
}

// ===========================================
// 4. INTEGRATION IN EXISTING HANDLERS
// ===========================================

// In your existing trip status change handlers, add these calls:

// Example in trip.js status change handler:
const handleStatusChange = async (tripId, oldStatus, newStatus) => {
  // ... existing status change logic
  
  // ADD REAL-TIME CUSTOMER UPDATES
  if (trip.cust_id) {
    if (isPrivateTrip(tripId)) {
      // Private ride - update customer private status
      await updateCustomerPrivateStatus(
        trip.cust_id, 
        newStatus, 
        trip.delivery_cost_proposed, 
        trip.customer_stars
      );
    } else if (isRideshareRequest(tripId)) {
      // Rideshare request - update customer rideshare status
      await updateCustomerRideshareRequestStatus(
        trip.passenger_id, 
        newStatus, 
        trip.offer_amount, 
        trip.passenger_rating
      );
    }
  }
  
  // ... rest of status change logic
};

// Example in rating submission handlers:
const handleCustomerRating = async (customerId, rating, tripType, tripId) => {
  // ... existing rating logic
  
  // UPDATE CUSTOMER STATUS WITH RATING
  if (tripType === 'private') {
    await updateCustomerPrivateStatus(customerId, getCurrentStatus(tripId), 0, rating);
  } else if (tripType === 'rideshare') {
    await updateCustomerRideshareRequestStatus(customerId, getCurrentStatus(tripId), 0, rating);
  }
  
  // ... rest of rating logic
};

// ===========================================
// 5. HELPER FUNCTIONS
// ===========================================

const isPrivateTrip = (tripId) => {
  // Your logic to determine if this is a private trip
  // Check if tripId exists in trip table
  return true; // Replace with actual logic
};

const isRideshareRequest = (tripId) => {
  // Your logic to determine if this is a rideshare request
  // Check if tripId exists in rideshare_requests table
  return false; // Replace with actual logic
};

const getCurrentStatus = (tripId) => {
  // Your logic to get current status of a trip
  return 'Completed'; // Replace with actual logic
};

// ===========================================
// 7. DETOUR DISTANCE INTEGRATION
// ===========================================

// Get current detour distance settings for mobile app
const getDetourSettings = async () => {
  try {
    const response = await fetch(`${API_URL}/ride-matching/detour-settings`);
    const result = await response.json();
    console.log('Detour settings fetched:', result);
    return result.data;
  } catch (error) {
    console.error('Failed to fetch detour settings:', error);
    return null;
  }
};

// Get current detour distance for a specific driver
const getCurrentDetourDistance = async (driverId) => {
  try {
    const response = await fetch(`${API_URL}/ride-matching/current-detour/${driverId}`);
    const result = await response.json();
    console.log('Current detour distance for driver:', result);
    return result.data;
  } catch (error) {
    console.error('Failed to get current detour distance:', error);
    return null;
  }
};

// Request manual detour expansion for a driver
const requestDetourExpansion = async (driverId, currentDetour, expansionCount) => {
  try {
    const response = await fetch(`${API_URL}/ride-matching/expand-detour/${driverId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentDetour: currentDetour,
        expansionCount: expansionCount
      })
    });
    
    const result = await response.json();
    console.log('Detour expansion requested:', result);
    return result;
  } catch (error) {
    console.error('Failed to request detour expansion:', error);
    return null;
  }
};

// CALL THIS WHEN:
// - Driver creates a new trip and needs to know current detour limits
// - Driver app starts or refreshes and needs to load detour settings
// - Driver app needs to check if auto-expansion should trigger

// Example in driver trip creation:
const createDriverTrip = async (driverId, route) => {
  // ... existing trip creation logic
  
  // GET CURRENT DETOUR SETTINGS
  const detourSettings = await getDetourSettings();
  const currentDetour = detourSettings.default_detour_distance;
  
  // Use detour distance in passenger matching logic
  const passengers = await findPassengersWithinDetour(driverId, currentDetour);
  
  // ... rest of trip creation logic
};

// Example in passenger matching logic:
const matchPassengers = async (driverId, detourLimit) => {
  // ... existing passenger matching logic using detourLimit
  // Only show passengers whose pickup adds <= detourLimit to driver's route
};

// Example in driver app auto-expansion check:
const checkAutoExpansion = async (driverId) => {
  const currentDetourData = await getCurrentDetourDistance(driverId);
  
  if (currentDetourData.autoExpansionEnabled && 
      currentDetourData.expansionCount < currentDetourData.maxDetour) {
    // Time-based auto-expansion logic
    const waitTime = calculateWaitTime(currentDetourData.tripStartTime);
    const nextExpansionTime = (currentDetourData.expansionCount + 1) * currentDetourData.expansionTimeLimit;
    
    if (waitTime >= nextExpansionTime) {
      // Request expansion
      await requestDetourExpansion(
        driverId, 
        currentDetourData.currentDetour, 
        currentDetourData.expansionCount
      );
      
      // Update local state
      updateLocalDetourLimit(currentDetourData.newDetour);
      
      // Refresh passenger search with new detour limit
      refreshPassengerSearch();
    }
  }
};

// ===========================================
// 8. IMPORT STATEMENTS
// ===========================================

// Add to your existing imports:
import { API_URL } from './config';
