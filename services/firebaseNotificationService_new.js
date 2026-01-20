require('dotenv').config();
const admin = require('firebase-admin');
const NotificationsCRUD = require('../cruds/notifications');
const { getNotificationTemplate } = require('./notificationTemplates');

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

  // Send notification using template
  async sendTemplateNotification(userId, templateType, templateData) {
    try {
      if (!this.isInitialized) {
        throw new Error('Firebase not initialized');
      }

      // Get user's device tokens
      const deviceTokens = await NotificationsCRUD.getUserDeviceTokens(userId);
      
      if (deviceTokens.length === 0) {
        console.log(`⚠️ No device tokens found for user ${userId}`);
        return { success: false, message: 'No device tokens found' };
      }

      // Get notification template
      const template = getNotificationTemplate(templateType, templateData);

      // Create notification payload
      const notification = {
        title: template.title,
        body: template.body,
        sound: 'default',
        priority: template.priority === 'high' ? 'high' : 'normal',
        data: template.data
      };

      // Send to all device tokens
      const results = await this.sendToDeviceTokens(deviceTokens, notification);
      
      // Store notification in database
      await NotificationsCRUD.storeNotification(userId, templateType, templateData, notification);

      console.log(`📱 Template notification sent to ${userId}: ${templateType}`);
      return results;

    } catch (error) {
      console.error('❌ Error sending template notification:', error);
      throw error;
    }
  }

  // Send bulk notifications using template
  async sendBulkNotifications(userIds, templateType, templateData) {
    try {
      if (!this.isInitialized) {
        throw new Error('Firebase not initialized');
      }

      const results = {
        successCount: 0,
        failureCount: 0,
        details: []
      };

      // Get notification template
      const template = getNotificationTemplate(templateType, templateData);

      // Create notification payload
      const notification = {
        title: template.title,
        body: template.body,
        sound: 'default',
        priority: template.priority === 'high' ? 'high' : 'normal',
        data: template.data
      };

      // Send to each user
      for (const userId of userIds) {
        try {
          const deviceTokens = await NotificationsCRUD.getUserDeviceTokens(userId);
          
          if (deviceTokens.length > 0) {
            const userResult = await this.sendToDeviceTokens(deviceTokens, notification);
            
            if (userResult.successCount > 0) {
              results.successCount++;
              
              // Store notification for each user
              await NotificationsCRUD.storeNotification(userId, templateType, templateData, notification);
            } else {
              results.failureCount++;
            }
            
            results.details.push({
              userId: userId,
              success: userResult.successCount > 0,
              deviceCount: deviceTokens.length
            });
          } else {
            results.failureCount++;
            results.details.push({
              userId: userId,
              success: false,
              deviceCount: 0,
              message: 'No device tokens found'
            });
          }
        } catch (error) {
          results.failureCount++;
          results.details.push({
            userId: userId,
            success: false,
            error: error.message
          });
        }
      }

      console.log(`📱 Bulk notification sent: ${results.successCount} success, ${results.failureCount} failures`);
      return results;

    } catch (error) {
      console.error('❌ Error sending bulk notifications:', error);
      throw error;
    }
  }

  // Send notification to multiple device tokens
  async sendToDeviceTokens(deviceTokens, notification) {
    try {
      const message = {
        notification: notification,
        data: notification.data || {},
        tokens: deviceTokens.map(token => token.device_token),
        android: {
          priority: notification.priority === 'high' ? 'high' : 'normal',
          notification: {
            sound: 'default',
            priority: notification.priority === 'high' ? 'high' : 'default',
            color: '#FFC000' // XGO brand color
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              priority: notification.priority === 'high' ? 'high' : 'normal',
              badge: 1
            }
          }
        }
      };

      // Send multicast message
      const response = await this.messaging.sendMulticast(message);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push({
              token: deviceTokens[idx].device_token,
              error: resp.error
            });
          }
        });
        
        // Remove invalid tokens
        await this.removeInvalidTokens(failedTokens);
      }

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalCount: deviceTokens.length
      };

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
      if (!this.isInitialized) {
        throw new Error('Firebase not initialized');
      }

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
