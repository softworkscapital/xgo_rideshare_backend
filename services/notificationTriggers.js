const firebaseNotificationService = require('./firebaseNotificationService');
const NotificationsCRUD = require('../cruds/notifications');

class NotificationTriggers {
  constructor() {
    this.radius = 2; // 2km radius for nearby notifications
  }

  // Find nearby drivers for private ride requests
  async notifyNearbyDriversPrivateRide(passengerLocation, passengerId, passengerName) {
    try {
      // Get all active drivers within 2km radius
      const nearbyDrivers = await NotificationsCRUD.getNearbyDrivers(
        passengerLocation.lat, 
        passengerLocation.lng, 
        this.radius, 
        passengerId
      );

      if (nearbyDrivers.length > 0) {
        // Send notification to each nearby driver
        const notificationData = {
          count: nearbyDrivers.length,
          passengerId: passengerId,
          passengerName: passengerName,
          location: passengerLocation
        };

        const driverIds = nearbyDrivers.map(driver => driver.driver_id);
        await firebaseNotificationService.sendBulkNotifications(
          driverIds,
          'private_ride_nearby',
          notificationData
        );

        console.log(`📱 Notified ${nearbyDrivers.length} nearby drivers about private ride request`);
        return nearbyDrivers.length;
      }

      return 0;
    } catch (error) {
      console.error('❌ Error notifying nearby drivers:', error);
      return 0;
    }
  }

  // Find nearby drivers for rideshare requests
  async notifyNearbyDriversRideshare(driverLocation, destination, passengerId, passengerName) {
    try {
      // Get all active drivers within 2km radius
      const nearbyDrivers = await NotificationsCRUD.getNearbyDrivers(
        driverLocation.lat, 
        driverLocation.lng, 
        this.radius, 
        passengerId
      );

      if (nearbyDrivers.length > 0) {
        // Send notification to each nearby driver
        const notificationData = {
          count: nearbyDrivers.length,
          destination: destination,
          passengerId: passengerId,
          passengerName: passengerName,
          location: driverLocation
        };

        const driverIds = nearbyDrivers.map(driver => driver.driver_id);
        await firebaseNotificationService.sendBulkNotifications(
          driverIds,
          'rideshare_nearby',
          notificationData
        );

        console.log(`📱 Notified ${nearbyDrivers.length} nearby drivers about rideshare request`);
        return nearbyDrivers.length;
      }

      return 0;
    } catch (error) {
      console.error('❌ Error notifying nearby drivers for rideshare:', error);
      return 0;
    }
  }

  // Trigger counter offer notification
  async triggerCounterOffer(receiverId, senderId, senderName, amount, rideType = 'private') {
    try {
      const notificationData = {
        senderId: senderId,
        senderName: senderName,
        amount: amount,
        rideType: rideType
      };

      await firebaseNotificationService.sendTemplateNotification(
        receiverId,
        'counter_offer_received',
        notificationData
      );

      console.log(`📱 Counter offer notification sent to ${receiverId}`);
    } catch (error) {
      console.error('❌ Error sending counter offer notification:', error);
    }
  }

  // Trigger offer declined notification
  async triggerOfferDeclined(passengerId, driverId, driverName) {
    try {
      const notificationData = {
        driverId: driverId,
        driverName: driverName
      };

      await firebaseNotificationService.sendTemplateNotification(
        passengerId,
        'offer_declined',
        notificationData
      );

      console.log(`📱 Offer declined notification sent to ${passengerId}`);
    } catch (error) {
      console.error('❌ Error sending offer declined notification:', error);
    }
  }

  // Trigger ride accepted notification
  async triggerRideAccepted(passengerId, driverId, driverName, rideType = 'private') {
    try {
      const notificationData = {
        driverId: driverId,
        driverName: driverName,
        rideType: rideType
      };

      await firebaseNotificationService.sendTemplateNotification(
        passengerId,
        rideType === 'rideshare' ? 'rideshare_accepted' : 'ride_accepted',
        notificationData
      );

      console.log(`📱 Ride accepted notification sent to ${passengerId}`);
    } catch (error) {
      console.error('❌ Error sending ride accepted notification:', error);
    }
  }

  // Trigger driver on way notification
  async triggerDriverOnWay(passengerId, driverId, driverName) {
    try {
      const notificationData = {
        driverId: driverId,
        driverName: driverName
      };

      await firebaseNotificationService.sendTemplateNotification(
        passengerId,
        'driver_on_way',
        notificationData
      );

      console.log(`📱 Driver on way notification sent to ${passengerId}`);
    } catch (error) {
      console.error('❌ Error sending driver on way notification:', error);
    }
  }

  // Trigger driver arrived notification
  async triggerDriverArrived(passengerId, driverId, driverName) {
    try {
      const notificationData = {
        driverId: driverId,
        driverName: driverName
      };

      await firebaseNotificationService.sendTemplateNotification(
        passengerId,
        'driver_arrived',
        notificationData
      );

      console.log(`📱 Driver arrived notification sent to ${passengerId}`);
    } catch (error) {
      console.error('❌ Error sending driver arrived notification:', error);
    }
  }

  // Trigger trip completed notification
  async triggerTripCompleted(userId, tripId, userType = 'passenger') {
    try {
      const notificationData = {
        tripId: tripId,
        userType: userType
      };

      await firebaseNotificationService.sendTemplateNotification(
        userId,
        'trip_completed',
        notificationData
      );

      console.log(`📱 Trip completed notification sent to ${userId}`);
    } catch (error) {
      console.error('❌ Error sending trip completed notification:', error);
    }
  }

  // Trigger payment received notification for drivers
  async triggerPaymentReceived(driverId, amount, tripId) {
    try {
      const notificationData = {
        amount: amount,
        tripId: tripId
      };

      await firebaseNotificationService.sendTemplateNotification(
        driverId,
        'payment_received',
        notificationData
      );

      console.log(`📱 Payment received notification sent to ${driverId}`);
    } catch (error) {
      console.error('❌ Error sending payment received notification:', error);
    }
  }

  // Trigger new message notification
  async triggerNewMessage(receiverId, senderId, senderName, message) {
    try {
      const notificationData = {
        senderId: senderId,
        senderName: senderName,
        message: message
      };

      await firebaseNotificationService.sendTemplateNotification(
        receiverId,
        'new_message',
        notificationData
      );

      console.log(`📱 New message notification sent to ${receiverId}`);
    } catch (error) {
      console.error('❌ Error sending new message notification:', error);
    }
  }

  // Handle trip status changes and trigger appropriate notifications
  async handleTripStatusChange(tripData, oldStatus, newStatus) {
    try {
      const { passenger_id, driver_id, trip_type } = tripData;

      // Get user names
      const [passenger, driver] = await Promise.all([
        NotificationsCRUD.getUserDetails(passenger_id, 'customer'),
        NotificationsCRUD.getUserDetails(driver_id, 'driver')
      ]);

      // Trigger notifications based on status change
      switch (newStatus) {
        case 'Accepted':
          if (driver) {
            await this.triggerRideAccepted(passenger_id, driver_id, driver.name, trip_type);
          }
          break;
        case 'On Way':
          if (driver) {
            await this.triggerDriverOnWay(passenger_id, driver_id, driver.name);
          }
          break;
        case 'Arrived':
          if (driver) {
            await this.triggerDriverArrived(passenger_id, driver_id, driver.name);
          }
          break;
        case 'Completed':
          await this.triggerTripCompleted(passenger_id, tripData.trip_id, 'passenger');
          await this.triggerTripCompleted(driver_id, tripData.trip_id, 'driver');
          break;
      }

      console.log(`📱 Trip status change handled: ${oldStatus} → ${newStatus}`);
    } catch (error) {
      console.error('❌ Error handling trip status change:', error);
    }
  }

  // Check user notification preferences
  async checkNotificationPreferences(userId, notificationType) {
    try {
      const preferences = await NotificationsCRUD.getNotificationPreferences(userId);
      
      if (!preferences) return true; // Default to true if no preferences set

      // Check specific preference
      switch (notificationType) {
        case 'ride_requests':
          return preferences.ride_requests;
        case 'counter_offers':
          return preferences.counter_offers;
        case 'ride_accepted':
          return preferences.ride_accepted;
        case 'driver_updates':
          return preferences.driver_updates;
        case 'messages':
          return preferences.messages;
        case 'payments':
          return preferences.payments;
        default:
          return true;
      }
    } catch (error) {
      console.error('❌ Error checking notification preferences:', error);
      return true; // Default to true on error
    }
  }

  // Enhanced notification triggers for match rate improvement
  
  // Trigger no-match suggestion after 5 minutes
  async triggerNoMatchSuggestion(passengerId, currentOffer, suggestedOffer) {
    try {
      const notificationData = {
        currentOffer: currentOffer,
        suggestedOffer: suggestedOffer,
        increasePercent: Math.round(((suggestedOffer - currentOffer) / currentOffer) * 100)
      };

      await firebaseNotificationService.sendTemplateNotification(
        passengerId,
        'no_match_suggestion',
        notificationData
      );

      console.log(`📱 No-match suggestion sent to ${passengerId}`);
    } catch (error) {
      console.error('❌ Error sending no-match suggestion:', error);
    }
  }

  // Trigger high demand alert
  async triggerHighDemandAlert(driverId, location, demandMultiplier) {
    try {
      const notificationData = {
        location: location,
        demandMultiplier: demandMultiplier,
        suggestedIncrease: Math.round((demandMultiplier - 1) * 100)
      };

      await firebaseNotificationService.sendTemplateNotification(
        driverId,
        'high_demand_alert',
        notificationData
      );

      console.log(`📱 High demand alert sent to ${driverId}`);
    } catch (error) {
      console.error('❌ Error sending high demand alert:', error);
    }
  }

  // Trigger quick match opportunity
  async triggerQuickMatchOpportunity(driverId, passengerId, passengerName, distance, estimatedEarnings) {
    try {
      const notificationData = {
        passengerId: passengerId,
        passengerName: passengerName,
        distance: distance,
        estimatedEarnings: estimatedEarnings,
        eta: Math.round(distance / 0.5) // Assuming 30 km/h average speed
      };

      await firebaseNotificationService.sendTemplateNotification(
        driverId,
        'quick_match_available',
        notificationData
      );

      console.log(`📱 Quick match opportunity sent to ${driverId}`);
    } catch (error) {
      console.error('❌ Error sending quick match opportunity:', error);
    }
  }

  // Trigger pre-trip reminder (5 minutes before pickup)
  async triggerPreTripReminder(passengerId, driverName, arrivalTime) {
    try {
      const notificationData = {
        driverName: driverName,
        arrivalTime: arrivalTime,
        minutesUntil: 5
      };

      await firebaseNotificationService.sendTemplateNotification(
        passengerId,
        'pre_trip_reminder',
        notificationData
      );

      console.log(`📱 Pre-trip reminder sent to ${passengerId}`);
    } catch (error) {
      console.error('❌ Error sending pre-trip reminder:', error);
    }
  }

  // Trigger driver delay notification
  async triggerDriverDelay(passengerId, driverName, delayMinutes) {
    try {
      const notificationData = {
        driverName: driverName,
        delayMinutes: delayMinutes,
        newEta: new Date(Date.now() + delayMinutes * 60000).toLocaleTimeString()
      };

      await firebaseNotificationService.sendTemplateNotification(
        passengerId,
        'driver_delay',
        notificationData
      );

      console.log(`📱 Driver delay notification sent to ${passengerId}`);
    } catch (error) {
      console.error('❌ Error sending driver delay notification:', error);
    }
  }

  // Trigger popular route alert for drivers
  async triggerPopularRouteAlert(driverId, origin, destination, potentialEarnings, requestCount) {
    try {
      const notificationData = {
        origin: origin,
        destination: destination,
        potentialEarnings: potentialEarnings,
        requestCount: requestCount
      };

      await firebaseNotificationService.sendTemplateNotification(
        driverId,
        'popular_route_alert',
        notificationData
      );

      console.log(`📱 Popular route alert sent to ${driverId}`);
    } catch (error) {
      console.error('❌ Error sending popular route alert:', error);
    }
  }

  // Trigger rideshare matched notification with passenger count
  async triggerRideshareMatched(passengerId, driverId, driverName, otherPassengers) {
    try {
      const notificationData = {
        driverId: driverId,
        driverName: driverName,
        otherPassengers: otherPassengers,
        totalPassengers: otherPassengers + 1
      };

      await firebaseNotificationService.sendTemplateNotification(
        passengerId,
        'rideshare_matched',
        notificationData
      );

      console.log(`📱 Rideshare matched notification sent to ${passengerId}`);
    } catch (error) {
      console.error('❌ Error sending rideshare matched notification:', error);
    }
  }

  // Enhanced nearby drivers with destination focus
  async notifyNearbyDriversWithDestination(driverLocation, destination, passengerId, passengerName, rideType = 'rideshare') {
    try {
      const nearbyDrivers = await NotificationsCRUD.getNearbyDrivers(
        driverLocation.lat, 
        driverLocation.lng, 
        this.radius, 
        passengerId
      );

      if (nearbyDrivers.length > 0) {
        const notificationData = {
          count: nearbyDrivers.length,
          destination: destination,
          passengerId: passengerId,
          passengerName: passengerName,
          location: driverLocation,
          rideType: rideType
        };

        const driverIds = nearbyDrivers.map(driver => driver.driver_id);
        await firebaseNotificationService.sendBulkNotifications(
          driverIds,
          rideType === 'rideshare' ? 'rideshare_nearby_with_destination' : 'private_ride_nearby',
          notificationData
        );

        console.log(`📱 Notified ${nearbyDrivers.length} nearby drivers about ${rideType} request to ${destination}`);
        return nearbyDrivers.length;
      }

      return 0;
    } catch (error) {
      console.error('❌ Error notifying nearby drivers with destination:', error);
      return 0;
    }
  }

  // Smart notification scheduler based on user behavior
  async scheduleSmartNotification(userId, notificationType, data, delay = 0) {
    try {
      // Check user preferences first
      const canSend = await this.checkNotificationPreferences(userId, notificationType);
      if (!canSend) {
        console.log(`📱 User ${userId} has disabled ${notificationType} notifications`);
        return false;
      }

      // Schedule notification with delay if specified
      if (delay > 0) {
        setTimeout(async () => {
          await this.sendNotificationByType(userId, notificationType, data);
        }, delay * 1000); // Convert to milliseconds
      } else {
        await this.sendNotificationByType(userId, notificationType, data);
      }

      return true;
    } catch (error) {
      console.error('❌ Error scheduling smart notification:', error);
      return false;
    }
  }

  // Send notification by type
  async sendNotificationByType(userId, notificationType, data) {
    try {
      switch (notificationType) {
        case 'no_match_suggestion':
          await this.triggerNoMatchSuggestion(userId, data.currentOffer, data.suggestedOffer);
          break;
        case 'high_demand_alert':
          await this.triggerHighDemandAlert(userId, data.location, data.demandMultiplier);
          break;
        case 'quick_match_available':
          await this.triggerQuickMatchOpportunity(userId, data.passengerId, data.passengerName, data.distance, data.estimatedEarnings);
          break;
        case 'pre_trip_reminder':
          await this.triggerPreTripReminder(userId, data.driverName, data.arrivalTime);
          break;
        case 'driver_delay':
          await this.triggerDriverDelay(userId, data.driverName, data.delayMinutes);
          break;
        case 'popular_route_alert':
          await this.triggerPopularRouteAlert(userId, data.origin, data.destination, data.potentialEarnings, data.requestCount);
          break;
        case 'rideshare_matched':
          await this.triggerRideshareMatched(userId, data.driverId, data.driverName, data.otherPassengers);
          break;
        default:
          console.log(`📱 Unknown notification type: ${notificationType}`);
      }
    } catch (error) {
      console.error('❌ Error sending notification by type:', error);
    }
  }
}

module.exports = new NotificationTriggers();