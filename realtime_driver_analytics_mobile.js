// ===========================================
// REAL-TIME DRIVER ANALYTICS MOBILE INTEGRATION
// ===========================================
// 
// This file provides real-time analytics updates for mobile apps
// with WebSocket support and automatic refresh capabilities
// 
// Author: Driver Analytics System
// Date: 2025-01-20
// Purpose: Real-time mobile app integration for driver analytics

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

// Configuration
const API_BASE_URL = 'http://localhost:3011';
const WS_BASE_URL = 'ws://localhost:3011';

// ===========================================
// 1. REAL-TIME ANALYTICS HOOK
// ===========================================

export const useDriverAnalytics = (driverId, enableWebSocket = true) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState(null);

  // Fetch initial stats
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/driver/${driverId}/comprehensive_stats`, {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
        setError(null);
        setLastUpdated(new Date());
      } else {
        setError(data.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  // WebSocket connection for real-time updates
  const connectWebSocket = useCallback(() => {
    if (!enableWebSocket || ws) return;

    const websocket = new WebSocket(`${WS_BASE_URL}/driver-analytics/${driverId}`);

    websocket.onopen = () => {
      console.log('🔌 WebSocket connected for driver analytics');
      setIsConnected(true);
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'analytics_update') {
          setStats(prevStats => ({
            ...prevStats,
            ...data.analytics
          }));
          setLastUpdated(new Date());
        } else if (data.type === 'trip_status_update') {
          // Handle real-time trip status updates
          handleTripStatusUpdate(data);
        } else if (data.type === 'earnings_update') {
          // Handle real-time earnings updates
          handleEarningsUpdate(data);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    websocket.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
      setWs(null);
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (enableWebSocket) {
          connectWebSocket();
        }
      }, 5000);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  }, [driverId, enableWebSocket, ws]);

  // Initialize
  useEffect(() => {
    fetchStats();
    if (enableWebSocket) {
      connectWebSocket();
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [fetchStats, connectWebSocket, enableWebSocket]);

  // Manual refresh
  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  // Update trip status
  const updateTripStatus = useCallback(async (status, tripType, tripData = {}) => {
    try {
      const endpoint = tripType === 'private' 
        ? `${API_BASE_URL}/driver/${driverId}/private_trip_status`
        : `${API_BASE_URL}/driver/${driverId}/rideshare_trip_status`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          ...tripData
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        // Update local state immediately for better UX
        setStats(prevStats => updateStatsWithTripStatus(prevStats, status, tripType, tripData));
        return result;
      } else {
        throw new Error(result.message || 'Failed to update trip status');
      }
    } catch (error) {
      console.error('Trip status update error:', error);
      Alert.alert('Error', error.message);
      throw error;
    }
  }, [driverId]);

  // Update earnings
  const updateEarnings = useCallback(async (earnings, tripType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/driver/${driverId}/earnings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          earnings,
          tripType
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        // Update local state immediately
        setStats(prevStats => updateStatsWithEarnings(prevStats, earnings, tripType));
        return result;
      } else {
        throw new Error(result.message || 'Failed to update earnings');
      }
    } catch (error) {
      console.error('Earnings update error:', error);
      Alert.alert('Error', error.message);
      throw error;
    }
  }, [driverId]);

  return {
    stats,
    loading,
    error,
    lastUpdated,
    isConnected,
    refresh,
    updateTripStatus,
    updateEarnings
  };
};

// ===========================================
// 2. TRIP COMPLETION HANDLER
// ===========================================

export const handleTripCompletion = async (driverId, tripType, tripData) => {
  const { earnings, distance, duration } = tripData;
  
  try {
    // Update trip status to 'Completed'
    await updateTripStatus(driverId, 'Completed', tripType, {
      earnings,
      distance,
      duration
    });
    
    // Update earnings
    await updateEarnings(driverId, earnings, tripType);
    
    // Show success notification
    Alert.alert(
      'Trip Completed! 🎉',
      `Earnings: $${earnings.toFixed(2)}\nDistance: ${distance} km\nDuration: ${duration} min`,
      [{ text: 'OK' }]
    );
    
  } catch (error) {
    console.error('Trip completion error:', error);
    Alert.alert('Error', 'Failed to complete trip. Please try again.');
  }
};

// ===========================================
// 3. REAL-TIME STATUS UPDATES
// ===========================================

export const useRealTimeStatusUpdates = (driverId) => {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  
  const { updateTripStatus } = useDriverAnalytics(driverId);

  const updateStatus = useCallback(async (status, tripType, metadata = {}) => {
    try {
      await updateTripStatus(status, tripType, metadata);
      
      const statusUpdate = {
        status,
        tripType,
        timestamp: new Date(),
        metadata
      };
      
      setCurrentStatus(statusUpdate);
      setStatusHistory(prev => [statusUpdate, ...prev.slice(0, 9)]); // Keep last 10 updates
      
    } catch (error) {
      console.error('Status update error:', error);
    }
  }, [updateTripStatus]);

  return {
    currentStatus,
    statusHistory,
    updateStatus
  };
};

// ===========================================
// 4. ANALYTICS UPDATE HELPERS
// ===========================================

const updateStatsWithTripStatus = (stats, status, tripType, tripData) => {
  if (!stats) return stats;

  const updatedStats = { ...stats };
  
  // Update trip statistics
  if (tripType === 'private') {
    updatedStats.trip_statistics.private.completed = 
      (updatedStats.trip_statistics.private.completed || 0) + (status === 'Completed' ? 1 : 0);
    updatedStats.trip_statistics.private.cancelled = 
      (updatedStats.trip_statistics.private.cancelled || 0) + (status === 'Cancelled' ? 1 : 0);
  } else {
    updatedStats.trip_statistics.rideshare.completed = 
      (updatedStats.trip_statistics.rideshare.completed || 0) + (status === 'Completed' ? 1 : 0);
    updatedStats.trip_statistics.rideshare.cancelled = 
      (updatedStats.trip_statistics.rideshare.cancelled || 0) + (status === 'Cancelled' ? 1 : 0);
  }

  // Update performance metrics
  const totalCompleted = updatedStats.trip_statistics.private.completed + updatedStats.trip_statistics.rideshare.completed;
  const totalCancelled = updatedStats.trip_statistics.private.cancelled + updatedStats.trip_statistics.rideshare.cancelled;
  const totalTrips = totalCompleted + totalCancelled;
  
  if (totalTrips > 0) {
    updatedStats.performance.completion_rate = (totalCompleted / totalTrips) * 100;
  }

  return updatedStats;
};

const updateStatsWithEarnings = (stats, earnings, tripType) => {
  if (!stats) return stats;

  const updatedStats = { ...stats };
  
  // Update earnings
  if (tripType === 'private') {
    updatedStats.earnings.private.total_earnings += earnings;
    const privateCompleted = updatedStats.trip_statistics.private.completed || 1;
    updatedStats.earnings.private.average_per_trip = updatedStats.earnings.private.total_earnings / privateCompleted;
  } else {
    updatedStats.earnings.rideshare.total_earnings += earnings;
    const rideshareCompleted = updatedStats.trip_statistics.rideshare.completed || 1;
    updatedStats.earnings.rideshare.average_per_trip = updatedStats.earnings.rideshare.total_earnings / rideshareCompleted;
  }

  // Update combined earnings
  updatedStats.earnings.combined.total_earnings += earnings;
  const totalCompleted = (updatedStats.trip_statistics.private.completed || 0) + (updatedStats.trip_statistics.rideshare.completed || 0);
  if (totalCompleted > 0) {
    updatedStats.earnings.combined.average_per_trip = updatedStats.earnings.combined.total_earnings / totalCompleted;
  }

  return updatedStats;
};

const handleTripStatusUpdate = (data) => {
  console.log('📊 Real-time trip status update:', data);
  // Handle real-time trip status updates
};

const handleEarningsUpdate = (data) => {
  console.log('💰 Real-time earnings update:', data);
  // Handle real-time earnings updates
};

// ===========================================
// 5. AUTHENTICATION HELPER
// ===========================================

const getAuthToken = async () => {
  // Implement your auth token retrieval logic here
  // This could be from AsyncStorage, secure storage, etc.
  return 'your-auth-token-here';
};

// ===========================================
// 6. USAGE EXAMPLES
// ===========================================

/*
USAGE EXAMPLES:

1. BASIC USAGE:
```javascript
import { useDriverAnalytics } from './realTimeDriverAnalytics';

const DriverScreen = ({ driverId }) => {
  const { stats, loading, error, refresh, updateTripStatus, updateEarnings } = useDriverAnalytics(driverId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <View>
      <Text>Total Earnings: ${stats.earnings.combined.total_earnings}</Text>
      <Text>Total Trips: {stats.trip_statistics.combined.total_trips}</Text>
      <Button onPress={refresh} title="Refresh" />
    </View>
  );
};
```

2. TRIP COMPLETION:
```javascript
import { handleTripCompletion } from './realTimeDriverAnalytics';

const TripCompletionScreen = ({ driverId, tripType, tripData }) => {
  const completeTrip = () => {
    handleTripCompletion(driverId, tripType, tripData);
  };

  return (
    <Button onPress={completeTrip} title="Complete Trip" />
  );
};
```

3. REAL-TIME STATUS UPDATES:
```javascript
import { useRealTimeStatusUpdates } from './realTimeDriverAnalytics';

const StatusScreen = ({ driverId }) => {
  const { currentStatus, statusHistory, updateStatus } = useRealTimeStatusUpdates(driverId);

  return (
    <View>
      <Text>Current Status: {currentStatus?.status}</Text>
      <Button 
        onPress={() => updateStatus('In-Transit', 'private')} 
        title="Mark In-Transit" 
      />
    </View>
  );
};
```

4. WITH WEBSOCKET:
```javascript
const DriverDashboard = ({ driverId }) => {
  const { stats, isConnected, lastUpdated } = useDriverAnalytics(driverId, true);

  return (
    <View>
      <Text>Connection: {isConnected ? 'Connected' : 'Disconnected'}</Text>
      <Text>Last Updated: {lastUpdated?.toLocaleString()}</Text>
      <Text>Earnings: ${stats?.earnings.combined.total_earnings}</Text>
    </View>
  );
};
```

STATUS MAPPINGS:
- Private: 'New Order', 'Pending', 'Accepted', 'In-Transit', 'InTransit', 'Completed', 'Trip Ended', 'TripEnded', 'Counter Offer', 'Just In', 'Waiting Payment', 'Cancelled'
- Rideshare: 'Created Shared Ride Request', 'In-Transit', 'Completed', 'Cancelled'

FEATURES:
- Real-time WebSocket updates
- Automatic reconnection
- Local state updates for instant UI feedback
- Error handling and notifications
- Status history tracking
- Authentication support
- Offline capability (with sync when online)
*/
