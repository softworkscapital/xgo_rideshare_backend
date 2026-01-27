const firebaseNotificationService = require('./firebaseNotificationService');
const smsNotificationService = require('./smsNotificationService');
const NotificationsCRUD = require('../cruds/notifications');

class BatchNotificationTriggers {
  constructor() {
    this.radius = 2; // 2km radius for nearby notifications
    this.batchWindow = 30000; // 30 seconds batching window
    this.pendingBatches = new Map(); // driverId -> batch data
  }

  // NEW: Batch rideshare notifications by area
  async batchNotifyNearbyDriversRideshare(passengerRequests) {
    try {
      console.log(`📱 Processing batch notification for ${passengerRequests.length} rideshare requests`);

      // Group requests by general area (simplified geohashing)
      const requestsByArea = this.groupRequestsByArea(passengerRequests);
      
      for (const [areaKey, areaRequests] of requestsByArea) {
        console.log(`📍 Area ${areaKey}: ${areaRequests.length} requests`);
        
        // Get all active drivers within this area
        const nearbyDrivers = await this.getDriversInArea(areaRequests[0].location);
        
        if (nearbyDrivers.length > 0) {
          // Create batch notification data
          const notificationData = {
            totalRequests: areaRequests.length,
            destinations: [...new Set(areaRequests.map(r => r.destination))].slice(0, 3), // Top 3 destinations
            areaName: this.getAreaName(areaKey),
            requests: areaRequests.map(r => ({
              passengerId: r.passengerId,
              passengerName: r.passengerName,
              destination: r.destination
            }))
          };

          const driverIds = nearbyDrivers.map(driver => driver.driver_id);
          
          // Send ONE batch notification to all drivers in area
          await firebaseNotificationService.sendBulkNotifications(
            driverIds,
            'rideshare_batch_nearby',
            notificationData
          );

          // Also send SMS notifications for critical alerts
          if (areaRequests.length >= 10) { // Only SMS for high demand (10+ requests)
            const driverDetails = await this.getDriverDetails(driverIds);
            await smsNotificationService.sendBatchRideshareSMS(driverDetails, notificationData);
          }

          console.log(`📱 Sent batch notification to ${nearbyDrivers.length} drivers for ${areaRequests.length} requests in area ${areaKey}`);
          if (areaRequests.length >= 10) {
            console.log(`📱 Also sent SMS notifications due to high demand (${areaRequests.length} requests)`);
          }
        }
      }

      return passengerRequests.length;
    } catch (error) {
      console.error('❌ Error batching rideshare notifications:', error);
      return 0;
    }
  }

  // Group requests by area (simplified geohash)
  groupRequestsByArea(requests) {
    const areaGroups = new Map();
    
    requests.forEach(request => {
      const areaKey = this.getAreaKey(request.location);
      if (!areaGroups.has(areaKey)) {
        areaGroups.set(areaKey, []);
      }
      areaGroups.get(areaKey).push(request);
    });
    
    return areaGroups;
  }

  // Simple area key based on lat/lng (you can use proper geohashing library)
  getAreaKey(location) {
    const latGrid = Math.floor(location.lat * 10) / 10; // 0.1 degree precision
    const lngGrid = Math.floor(location.lng * 10) / 10; // 0.1 degree precision
    return `${latGrid},${lngGrid}`;
  }

  // Get drivers in specific area
  async getDriversInArea(centerLocation) {
    try {
      return await NotificationsCRUD.getNearbyDrivers(
        centerLocation.lat,
        centerLocation.lng,
        this.radius,
        null // No passenger exclusion for batching
      );
    } catch (error) {
      console.error('❌ Error getting drivers in area:', error);
      return [];
    }
  }

  // Get driver details including phone numbers for SMS
  async getDriverDetails(driverIds) {
    try {
      // This would need to be implemented in your driver CRUD
      // For now, return basic structure
      return driverIds.map(id => ({
        driver_id: id,
        phone_number: null, // Would come from database
        name: 'Driver' // Would come from database
      }));
    } catch (error) {
      console.error('❌ Error getting driver details:', error);
      return [];
    }
  }

  // Get human-readable area name
  getAreaName(areaKey) {
    const [lat, lng] = areaKey.split(',').map(Number);
    return `Area (${lat.toFixed(1)}, ${lng.toFixed(1)})`;
  }

  // Smart batching with time window
  async scheduleBatchNotification(requestData) {
    const areaKey = this.getAreaKey(requestData.location);
    
    if (!this.pendingBatches.has(areaKey)) {
      this.pendingBatches.set(areaKey, {
        requests: [],
        timer: null
      });
    }
    
    const batch = this.pendingBatches.get(areaKey);
    batch.requests.push(requestData);
    
    // Clear existing timer
    if (batch.timer) {
      clearTimeout(batch.timer);
    }
    
    // Set new timer to send batch
    batch.timer = setTimeout(async () => {
      console.log(`📱 Sending batch for area ${areaKey} with ${batch.requests.length} requests`);
      await this.batchNotifyNearbyDriversRideshare(batch.requests);
      this.pendingBatches.delete(areaKey);
    }, this.batchWindow);
  }

  // Legacy function for backward compatibility
  async notifyNearbyDriversRideshare(driverLocation, destination, passengerId, passengerName) {
    const requestData = {
      location: driverLocation,
      destination: destination,
      passengerId: passengerId,
      passengerName: passengerName
    };
    
    return this.scheduleBatchNotification(requestData);
  }
}

module.exports = new BatchNotificationTriggers();
