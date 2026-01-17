require('dotenv').config();
const pool = require('./cruds/poolfile');

class PushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.fcmService = null;
  }

  // Initialize the push notification service
  async initialize() {
    try {
      // For now, we'll use a simple implementation
      // In production, you would integrate with Firebase Cloud Messaging (FCM)
      // or another push notification service like OneSignal
      
      console.log('Push notification service initialized');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize push notification service:', error);
      return false;
    }
  }

  // Send notification to specific user
  async sendNotification(userId, notificationData) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        title,
        body,
        type,
        data = {},
        priority = 'high'
      } = notificationData;

      // Get user's device tokens from database
      const deviceTokens = await this.getUserDeviceTokens(userId);
      
      if (deviceTokens.length === 0) {
        console.log(`No device tokens found for user ${userId}`);
        return { success: false, message: 'No device tokens found' };
      }

      // Log notification for debugging (in production, send to FCM/OneSignal)
      const notification = {
        to: deviceTokens,
        notification: {
          title,
          body,
          sound: 'default',
          priority
        },
        data: {
          type,
          userId,
          timestamp: new Date().toISOString(),
          ...data
        }
      };

      console.log('Sending push notification:', JSON.stringify(notification, null, 2));

      // Store notification in database for tracking
      await this.storeNotification(userId, notificationData);

      return { 
        success: true, 
        message: 'Notification sent successfully',
        notificationId: await this.generateNotificationId()
      };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send notification to multiple users
  async sendBulkNotifications(userIds, notificationData) {
    const results = [];
    for (const userId of userIds) {
      const result = await this.sendNotification(userId, notificationData);
      results.push({ userId, ...result });
    }
    return results;
  }

  // Get user's device tokens from database
  async getUserDeviceTokens(userId) {
    return new Promise((resolve, reject) => {
      // This would typically query a user_devices table
      // For now, we'll return empty array as placeholder
      pool.query(
        'SELECT device_token FROM user_devices WHERE user_id = ? AND is_active = 1',
        [userId],
        (err, results) => {
          if (err) {
            console.error('Error getting device tokens:', err);
            return resolve([]); // Return empty array on error
          }
          const tokens = results.map(row => row.device_token);
          resolve(tokens);
        }
      );
    });
  }

  // Store notification in database for tracking
  async storeNotification(userId, notificationData) {
    return new Promise((resolve, reject) => {
      const notificationId = this.generateNotificationId();
      
      pool.query(
        `INSERT INTO notifications (notification_id, user_id, title, body, type, data, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          notificationId,
          userId,
          notificationData.title,
          notificationData.body,
          notificationData.type || 'general',
          JSON.stringify(notificationData.data || {})
        ],
        (err, result) => {
          if (err) {
            console.error('Error storing notification:', err);
            return resolve(null);
          }
          resolve(notificationId);
        }
      );
    });
  }

  // Generate unique notification ID
  generateNotificationId() {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get notification history for user
  async getNotificationHistory(userId, limit = 50) {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT * FROM notifications 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userId, limit],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });
  }
}

// Singleton instance
const pushNotificationService = new PushNotificationService();

module.exports = pushNotificationService;
