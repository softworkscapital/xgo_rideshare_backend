require('dotenv').config();
const admin = require('firebase-admin');
const NotificationsCRUD = require('../cruds/notifications');

class FirebaseNotificationService {
  constructor() {
    this.isInitialized = false;
    this.initializeFirebase();
  }

  // Initialize Firebase Admin SDK
  initializeFirebase() {
    try {
      // Check if Firebase is already initialized
      if (!admin.apps.length) {
        // Initialize Firebase with service account
        // You'll need to create a service account key file
        const serviceAccount = require('./firebase-service-account.json');
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID || 'xgo-ride-share'
        });
      }

      this.messaging = admin.messaging();
      this.isInitialized = true;
      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      console.log('💡 Make sure firebase-service-account.json exists in services folder');
    }
  }

  // Send notification to specific user
  async sendNotification(userId, notification) {
    try {
      if (!this.isInitialized) {
        throw new Error('Firebase not initialized');
      }

      // Get user's device tokens
      const tokens = await this.getUserDeviceTokens(userId);
      
      if (tokens.length === 0) {
        console.log(`⚠️ No device tokens found for user ${userId}`);
        return { success: false, message: 'No device tokens found' };
      }

      // Prepare notification payload for each token
      const messages = tokens.map(token => ({
        notification: {
          title: notification.title,
          body: notification.body,
          sound: 'default',
          badge: '1'
        },
        data: notification.data || {},
        token: token
      }));

      // Send notifications (using sendEach for multiple tokens)
      const response = await this.messaging.sendEach(messages);
      
      // Store notification in database (temporarily commented out for testing)
      // await this.storeNotification(userId, notification, response);

      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens = [];
        if (response.responses && response.responses.length > 0) {
          response.responses.forEach((result, index) => {
            if (!result.success) {
              invalidTokens.push(tokens[index]);
            }
          });
        }
        if (invalidTokens.length > 0) {
          await this.cleanupInvalidTokens(invalidTokens);
        }
      }

      console.log(`📱 Notification sent to ${userId}:`, {
        title,
        body,
        successCount: response.successCount,
        failureCount: response.failureCount
      });

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalCount: deviceTokens.length
      }

    } catch (error) {
      console.error('❌ Error sending to device tokens:', error);
      throw error;
    }
  }

  // Remove invalid device tokens
  async removeInvalidTokens(failedTokens) {
    try {
      for (const failed of failedTokens) {
        if (failed.error.code === 'messaging/registration-token-not-registered' ||
            failed.error.code === 'messaging/invalid-registration-token') {
          await NotificationsCRUD.unregisterDeviceToken(failed.token);
          console.log(`🗑️ Removed invalid token: ${failed.token.substring(0, 20)}...`);
        }
      }
    } catch (error) {
      console.error('❌ Error removing invalid tokens:', error);
    }
  }

  // Send custom notification (legacy method)
  async sendCustomNotification(userId, title, body, data = {}) {
    try {
      const notification = {
        title: title,
        body: body,
        sound: 'default',
        priority: 'normal',
        data: data
      };

      const deviceTokens = await NotificationsCRUD.getUserDeviceTokens(userId);
      
      if (deviceTokens.length === 0) {
        console.log(`⚠️ No device tokens found for user ${userId}`);
        return { success: false, message: 'No device tokens found' };
      }

      const results = await this.sendToDeviceTokens(deviceTokens, notification);
      
      // Store notification
      await NotificationsCRUD.storeNotification(userId, 'custom', { title, body, data }, notification);

      console.log(`📱 Custom notification sent to ${userId}`);
      return results;

    } catch (error) {
      console.error('❌ Error sending custom notification:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(userId, startDate, endDate) {
    try {
      const stats = await NotificationsCRUD.getNotificationStats(userId, startDate, endDate);
      return stats;
    } catch (error) {
      console.error('❌ Error getting notification stats:', error);
      throw error;
    }
  }

  // Test notification method
  async sendTestNotification(userId) {
    try {
      const templateData = {
        driverName: "Test Driver",
        amount: 25,
        eta: 5
      };

      return await this.sendTemplateNotification(userId, 'driver_on_way', templateData);
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      throw error;
    }
  }
}

module.exports = new FirebaseNotificationService();
