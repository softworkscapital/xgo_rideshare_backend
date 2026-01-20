const express = require("express");
const router = express.Router();
const NotificationsCRUD = require("../cruds/notifications");
const firebaseNotificationService = require("../services/firebaseNotificationService");
const notificationTriggers = require("../services/notificationTriggers");

// Register device token for push notifications
router.post('/register-device', async (req, res) => {
  try {
    const { userId, deviceToken, deviceType = 'android', appVersion } = req.body;

    console.log('Device registration request:', { 
      userId, 
      deviceToken: deviceToken ? (typeof deviceToken === 'string' ? deviceToken.substring(0, 20) + '...' : JSON.stringify(deviceToken).substring(0, 50) + '...') : 'null', 
      deviceType, 
      appVersion 
    });

    if (!userId || !deviceToken) {
      console.error('Missing required fields:', { userId: !!userId, deviceToken: !!deviceToken });
      return res.status(400).json({
        status: 400,
        error: 'Missing required fields',
        message: 'userId and deviceToken are required'
      });
    }

    // Handle both old format (object) and new format (string)
    let actualToken = deviceToken;
    let actualDeviceType = deviceType;

    // If deviceToken is an object (old format), extract the actual token
    if (typeof deviceToken === 'object' && deviceToken.data) {
      console.log('🔧 Converting old token format to new format');
      actualToken = deviceToken.data;
      actualDeviceType = deviceToken.type || deviceType;
      console.log('✅ Token converted:', { actualToken: actualToken.substring(0, 20) + '...', actualDeviceType });
    }

    // Validate actualToken format
    if (typeof actualToken !== 'string') {
      console.error('Invalid actualToken type:', typeof actualToken);
      return res.status(400).json({
        status: 400,
        error: 'Invalid deviceToken format',
        message: 'deviceToken must be a string or object with data property'
      });
    }

    const result = await NotificationsCRUD.registerDeviceToken(userId, actualToken, actualDeviceType, appVersion);

    console.log('Device registration successful:', { userId, action: result.action });

    res.json({
      status: 200,
      message: 'Device token registered successfully',
      action: result.action,
      deviceId: result.deviceId
    });

  } catch (error) {
    console.error('Error in register-device endpoint:', error);
    
    // Send more detailed error information for debugging
    res.status(500).json({
      status: 500,
      error: 'Server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Unregister device token
router.post('/unregister-device', async (req, res) => {
  try {
    const { userId, deviceToken } = req.body;

    if (!userId || !deviceToken) {
      return res.status(400).json({
        status: 400,
        error: 'Missing required fields',
        message: 'userId and deviceToken are required'
      });
    }

    const result = await NotificationsCRUD.unregisterDeviceToken(userId, deviceToken);

    res.json({
      status: 200,
      message: 'Device token unregistered successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Error in unregister-device endpoint:', error);
    res.status(500).json({
      status: 500,
      error: 'Server error',
      message: error.message
    });
  }
});

// Get notification history for user
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const notifications = await firebaseNotificationService.getNotificationHistory(userId, parseInt(limit));

    res.json({
      status: 200,
      notifications: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error in notification history endpoint:', error);
    res.status(500).json({
      status: 500,
      error: 'Server error',
      message: error.message
    });
  }
});

// Update notification preferences
router.put('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;

    const result = await NotificationsCRUD.updateNotificationPreferences(userId, preferences);

    res.json({
      status: 200,
      message: 'Notification preferences updated successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Error in preferences endpoint:', error);
    res.status(500).json({
      status: 500,
      error: 'Server error',
      message: error.message
    });
  }
});

// Get notification preferences for user
router.get('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const preferences = await NotificationsCRUD.getNotificationPreferences(userId);

    res.json({
      status: 200,
      preferences: preferences
    });
  } catch (error) {
    console.error('Error in get preferences endpoint:', error);
    res.status(500).json({
      status: 500,
      error: 'Server error',
      message: error.message
    });
  }
});

// Test notification endpoint (for development)
router.post('/test', async (req, res) => {
  try {
    const { userId, title, body, type = 'test' } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        status: 400,
        error: 'Missing required fields',
        message: 'userId, title, and body are required'
      });
    }

    const result = await firebaseNotificationService.sendNotification(userId, {
      title,
      body,
      type,
      data: { test: true }
    });

    res.json({
      status: 200,
      message: 'Test notification sent',
      result
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      status: 500,
      error: 'Server error',
      message: error.message
    });
  }
});

// Trigger nearby drivers notification (for testing)
router.post('/notify-nearby-drivers', async (req, res) => {
  try {
    const { passengerLocation, passengerId, passengerName, rideType = 'private', destination } = req.body;

    if (!passengerLocation || !passengerId || !passengerName) {
      return res.status(400).json({
        status: 400,
        error: 'Missing required fields',
        message: 'passengerLocation, passengerId, and passengerName are required'
      });
    }

    let notifiedCount;
    if (rideType === 'rideshare') {
      notifiedCount = await notificationTriggers.notifyNearbyDriversRideshare(
        passengerLocation, destination, passengerId, passengerName
      );
    } else {
      notifiedCount = await notificationTriggers.notifyNearbyDriversPrivateRide(
        passengerLocation, passengerId, passengerName
      );
    }

    res.json({
      status: 200,
      message: `Notified ${notifiedCount} nearby drivers`,
      notifiedCount
    });
  } catch (error) {
    console.error('Error notifying nearby drivers:', error);
    res.status(500).json({
      status: 500,
      error: 'Server error',
      message: error.message
    });
  }
});

// Trigger counter offer notification
router.post('/counter-offer', async (req, res) => {
  try {
    const { receiverId, senderId, senderName, amount, rideType = 'private' } = req.body;

    if (!receiverId || !senderId || !senderName || !amount) {
      return res.status(400).json({
        status: 400,
        error: 'Missing required fields',
        message: 'receiverId, senderId, senderName, and amount are required'
      });
    }

    await notificationTriggers.triggerCounterOffer(receiverId, senderId, senderName, amount, rideType);

    res.json({
      status: 200,
      message: 'Counter offer notification sent'
    });
  } catch (error) {
    console.error('Error sending counter offer notification:', error);
    res.status(500).json({
      status: 500,
      error: 'Server error',
      message: error.message
    });
  }
});

// Trigger ride status change notification
router.post('/trip-status-change', async (req, res) => {
  try {
    const { tripData, oldStatus, newStatus } = req.body;

    if (!tripData || !oldStatus || !newStatus) {
      return res.status(400).json({
        status: 400,
        error: 'Missing required fields',
        message: 'tripData, oldStatus, and newStatus are required'
      });
    }

    await notificationTriggers.handleTripStatusChange(tripData, oldStatus, newStatus);

    res.json({
      status: 200,
      message: 'Trip status change notification sent'
    });
  } catch (error) {
    console.error('Error sending trip status change notification:', error);
    res.status(500).json({
      status: 500,
      error: 'Server error',
      message: error.message
    });
  }
});

module.exports = router;
