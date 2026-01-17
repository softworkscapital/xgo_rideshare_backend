const pushNotificationService = require('./pushNotificationService');

class NotificationTriggers {
  constructor() {
    this.notificationTemplates = {
      // Private ride notifications
      private_ride: {
        driver_nearby: {
          title: 'New Ride Request Nearby',
          body: 'There are {count} private ride requests within 2km of your location',
          type: 'private_ride_request'
        },
        counter_offer_received: {
          title: 'Counter Offer Received',
          body: 'Passenger has sent a counter offer for your ride request',
          type: 'counter_offer'
        },
        counter_offer_sent: {
          title: 'Counter Offer Sent',
          body: 'Driver has sent a counter offer for your ride request',
          type: 'counter_offer'
        },
        ride_accepted: {
          title: 'Ride Accepted!',
          body: 'Your ride has been accepted by a driver',
          type: 'ride_accepted'
        },
        driver_on_way: {
          title: 'Driver On The Way',
          body: 'Your driver is on the way to your pickup location',
          type: 'driver_on_way'
        },
        driver_arrived: {
          title: 'Driver Has Arrived',
          body: 'Your driver has arrived at your pickup location',
          type: 'driver_arrived'
        }
      },
      
      // Rideshare notifications
      rideshare: {
        driver_nearby: {
          title: 'Rideshare Requests Nearby',
          body: 'There are {count} rideshare requests within 2km going to {destination}',
          type: 'rideshare_request'
        },
        counter_offer_received: {
          title: 'Rideshare Counter Offer',
          body: 'Passenger has sent a counter offer for your rideshare',
          type: 'rideshare_counter_offer'
        },
        offer_rejected: {
          title: 'Offer Rejected',
          body: 'Driver has declined/rejected your offer',
          type: 'offer_rejected'
        },
        counter_offer_sent: {
          title: 'Rideshare Counter Offer',
          body: 'Driver has sent a counter offer for your rideshare request',
          type: 'rideshare_counter_offer'
        },
        request_accepted: {
          title: 'Rideshare Accepted!',
          body: 'Driver has accepted your request on the current offer',
          type: 'rideshare_accepted'
        },
        driver_on_way: {
          title: 'Rideshare Driver On The Way',
          body: 'Your rideshare driver is on the way to your pickup location',
          type: 'rideshare_driver_on_way'
        },
        driver_arrived: {
          title: 'Rideshare Driver Has Arrived',
          body: 'Your rideshare driver has arrived at your pickup location',
          type: 'rideshare_driver_arrived'
        }
      }
    };
  }

  // Trigger notification for private ride events
  async triggerPrivateRideNotification(event, data) {
    const template = this.notificationTemplates.private_ride[event];
    if (!template) {
      console.log(`No template found for private ride event: ${event}`);
      return false;
    }

    try {
      // Customize message with data
      const body = template.body.replace(/{(\w+)}/g, (match, key) => {
        return data[key] || match;
      });

      const notificationData = {
        title: template.title,
        body: body,
        type: template.type,
        data: {
          event,
          tripId: data.tripId,
          ...data
        }
      };

      // Send to appropriate recipients
      if (data.driverId) {
        await pushNotificationService.sendNotification(data.driverId, notificationData);
      }
      if (data.passengerId) {
        await pushNotificationService.sendNotification(data.passengerId, notificationData);
      }

      console.log(`Private ride notification sent: ${event}`);
      return true;
    } catch (error) {
      console.error(`Error sending private ride notification for ${event}:`, error);
      return false;
    }
  }

  // Trigger notification for rideshare events
  async triggerRideshareNotification(event, data) {
    const template = this.notificationTemplates.rideshare[event];
    if (!template) {
      console.log(`No template found for rideshare event: ${event}`);
      return false;
    }

    try {
      // Customize message with data
      const body = template.body.replace(/{(\w+)}/g, (match, key) => {
        return data[key] || match;
      });

      const notificationData = {
        title: template.title,
        body: body,
        type: template.type,
        data: {
          event,
          rideshareId: data.rideshareId,
          ...data
        }
      };

      // Send to appropriate recipients
      if (data.driverId) {
        await pushNotificationService.sendNotification(data.driverId, notificationData);
      }
      if (data.passengerId) {
        await pushNotificationService.sendNotification(data.passengerId, notificationData);
      }

      console.log(`Rideshare notification sent: ${event}`);
      return true;
    } catch (error) {
      console.error(`Error sending rideshare notification for ${event}:`, error);
      return false;
    }
  }

  // Find nearby drivers and send notifications
  async notifyNearbyDrivers(driverLocation, passengerLocation, rideType = 'private') {
    try {
      // This would typically use a geospatial query to find nearby drivers
      // For now, we'll use a placeholder implementation
      
      const nearbyDrivers = await this.findNearbyDrivers(driverLocation, 2); // 2km radius
      
      if (nearbyDrivers.length === 0) {
        console.log('No nearby drivers found');
        return [];
      }

      const event = rideType === 'private' ? 'driver_nearby' : 'driver_nearby';
      const template = this.notificationTemplates[rideType === 'private' ? 'private_ride' : 'rideshare'][event];

      const notificationData = {
        title: template.title,
        body: template.body.replace('{count}', nearbyDrivers.length),
        type: template.type,
        data: {
          driverLocation,
          passengerLocation,
          rideType,
          nearbyDriversCount: nearbyDrivers.length
        }
      };

      // Send notifications to all nearby drivers
      const results = await pushNotificationService.sendBulkNotifications(
        nearbyDrivers.map(driver => driver.driver_id),
        notificationData
      );

      console.log(`Sent ${rideType} notifications to ${nearbyDrivers.length} nearby drivers`);
      return results;
    } catch (error) {
      console.error('Error notifying nearby drivers:', error);
      return [];
    }
  }

  // Placeholder method to find nearby drivers (implement with actual geospatial query)
  async findNearbyDrivers(location, radiusKm) {
    // This would typically use a geospatial query with Haversine formula
    // For now, return empty array as placeholder
    return new Promise((resolve) => {
      // In production, you would query your database for drivers within radius
      // Example SQL: 
      // SELECT driver_id, lat, lng FROM driver_details 
      // WHERE (6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat)))) <= ?
      
      resolve([]); // Placeholder
    });
  }

  // Handle trip status changes
  async handleTripStatusChange(tripData, oldStatus, newStatus) {
    const isRideshare = !!tripData.rideshare_id;
    const rideType = isRideshare ? 'rideshare' : 'private';

    // Map status changes to notification events
    const statusEventMap = {
      private: {
        'Accepted': 'ride_accepted',
        'In-Transit': 'driver_on_way',
        'Arrived': 'driver_arrived'
      },
      rideshare: {
        'Accepted': 'request_accepted',
        'In-Transit': 'rideshare_driver_on_way',
        'Arrived': 'rideshare_driver_arrived'
      }
    };

    const event = statusEventMap[rideType][newStatus];
    if (!event) {
      return false;
    }

    const data = {
      driverId: tripData.driver_id,
      passengerId: tripData.cust_id,
      tripId: tripData.trip_id,
      rideshareId: tripData.rideshare_id
    };

    if (isRideshare) {
      return await this.triggerRideshareNotification(event, data);
    } else {
      return await this.triggerPrivateRideNotification(event, data);
    }
  }
}

// Singleton instance
const notificationTriggers = new NotificationTriggers();

module.exports = notificationTriggers;
