const pool = require('./poolfile');

class NotificationsCRUD {
  // Register device token
  static registerDeviceToken(userId, deviceToken, deviceType = 'android', appVersion) {
    return new Promise((resolve, reject) => {
      // Validate inputs
      if (!userId || !deviceToken) {
        reject(new Error('Missing required fields: userId and deviceToken'));
        return;
      }

      console.log('Registering device token:', { userId, deviceToken: typeof deviceToken === 'string' ? deviceToken.substring(0, 20) + '...' : JSON.stringify(deviceToken).substring(0, 50) + '...', deviceType, appVersion });

      // Check if device token already exists
      const checkQuery = 'SELECT id FROM user_devices WHERE user_id = ? AND device_token = ?';
      
      pool.query(checkQuery, [userId, deviceToken], (checkError, checkResults) => {
        if (checkError) {
          console.error('Error checking existing device token:', checkError);
          console.error('Query:', checkQuery);
          console.error('Params:', [userId, typeof deviceToken === 'string' ? deviceToken.substring(0, 20) + '...' : JSON.stringify(deviceToken).substring(0, 20) + '...']);
          reject(checkError);
          return;
        }

        if (checkResults.length > 0) {
          // Update existing device token
          const updateQuery = `
            UPDATE user_devices 
            SET is_active = TRUE, device_type = ?, app_version = ?, updated_at = NOW(), last_used_at = NOW()
            WHERE user_id = ? AND device_token = ?
          `;
          
          pool.query(updateQuery, [deviceType, appVersion, userId, deviceToken], (updateError, result) => {
            if (updateError) {
              console.error('Error updating device token:', updateError);
              console.error('Query:', updateQuery);
              console.error('Params:', [deviceType, appVersion, userId, typeof deviceToken === 'string' ? deviceToken.substring(0, 20) + '...' : JSON.stringify(deviceToken).substring(0, 20) + '...']);
              reject(updateError);
              return;
            }
            console.log('Device token updated successfully for user:', userId);
            resolve({ action: 'updated', deviceId: checkResults[0].id });
          });
        } else {
          // Insert new device token
          const insertQuery = `
            INSERT INTO user_devices (user_id, device_token, device_type, app_version)
            VALUES (?, ?, ?, ?)
          `;
          
          pool.query(insertQuery, [userId, deviceToken, deviceType, appVersion], (insertError, result) => {
            if (insertError) {
              console.error('Error inserting device token:', insertError);
              console.error('Query:', insertQuery);
              console.error('Params:', [userId, typeof deviceToken === 'string' ? deviceToken.substring(0, 20) + '...' : JSON.stringify(deviceToken).substring(0, 20) + '...', deviceType, appVersion]);
              reject(insertError);
              return;
            }
            console.log('Device token registered successfully for user:', userId);
            resolve({ action: 'registered', deviceId: result.insertId });
          });
        }
      });
    });
  }

  // Unregister device token
  static unregisterDeviceToken(userId, deviceToken) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE user_devices SET is_active = FALSE WHERE user_id = ? AND device_token = ?';
      
      pool.query(query, [userId, deviceToken], (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ affectedRows: result.affectedRows });
      });
    });
  }

  // Get user device tokens
  static getUserDeviceTokens(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT device_token 
        FROM user_devices 
        WHERE user_id = ? AND is_active = TRUE
      `;
      
      pool.query(query, [userId], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        
        const tokens = results.map(row => row.device_token);
        resolve(tokens);
      });
    });
  }

  // Store notification
  static storeNotification(userId, notificationId, title, body, type, data, status = 'sent') {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO notifications (
          notification_id, user_id, title, body, type, data, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      pool.query(query, [
        notificationId,
        userId,
        title,
        body,
        type,
        data ? JSON.stringify(data) : null,
        status
      ], (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      });
    });
  }

  // Get notification history
  static getNotificationHistory(userId, limit = 50) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      
      pool.query(query, [userId, limit], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        
        // Parse JSON data for each notification
        const notifications = results.map(notif => ({
          ...notif,
          data: notif.data ? JSON.parse(notif.data) : {}
        }));
        
        resolve(notifications);
      });
    });
  }

  // Update notification preferences
  static updateNotificationPreferences(userId, preferences) {
    return new Promise((resolve, reject) => {
      const allowedFields = ['ride_requests', 'counter_offers', 'ride_accepted', 'driver_updates', 'messages', 'payments', 'promotions'];
      const updates = [];
      const values = [];

      // Build dynamic update query
      for (const [field, value] of Object.entries(preferences)) {
        if (allowedFields.includes(field)) {
          updates.push(`${field} = ?`);
          values.push(value);
        }
      }

      if (updates.length === 0) {
        reject(new Error('No valid preference fields provided'));
        return;
      }

      values.push(userId);

      const query = `
        INSERT INTO notification_preferences (user_id, ${allowedFields.join(', ')})
        VALUES (?, ${allowedFields.map(() => '?').join(', ')})
        ON DUPLICATE KEY UPDATE ${updates.join(', ')}
      `;

      // Prepare values for INSERT part
      const insertValues = [userId];
      allowedFields.forEach(field => {
        insertValues.push(preferences[field] !== undefined ? preferences[field] : true);
      });

      pool.query(query, [...insertValues, ...values], (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ affectedRows: result.affectedRows });
      });
    });
  }

  // Get notification preferences
  static getNotificationPreferences(userId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM notification_preferences WHERE user_id = ?';
      
      pool.query(query, [userId], (error, results) => {
        if (error) {
          reject(error);
          return;
        }

        if (results.length === 0) {
          // Return default preferences
          resolve({
            ride_requests: true,
            counter_offers: true,
            ride_accepted: true,
            driver_updates: true,
            messages: true,
            payments: true,
            promotions: false
          });
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  // Clean up invalid tokens
  static cleanupInvalidTokens(invalidTokens) {
    return new Promise((resolve, reject) => {
      if (invalidTokens.length === 0) {
        resolve({ cleaned: 0 });
        return;
      }

      const placeholders = invalidTokens.map(() => '?').join(',');
      const query = `
        UPDATE user_devices 
        SET is_active = FALSE 
        WHERE device_token IN (${placeholders})
      `;
      
      pool.query(query, invalidTokens, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ cleaned: result.affectedRows });
      });
    });
  }

  // Get nearby drivers
  static getNearbyDrivers(latitude, longitude, radius = 2, excludeUserId = null) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT d.driver_id, d.name, d.current_latitude, d.current_longitude, 
               ud.device_token
        FROM driver_details d
        LEFT JOIN user_devices ud ON d.driver_id = ud.user_id AND ud.is_active = TRUE
        WHERE d.is_online = TRUE 
        AND d.current_latitude IS NOT NULL 
        AND d.current_longitude IS NOT NULL
        ${excludeUserId ? 'AND d.driver_id != ?' : ''}
      `;
      
      const params = excludeUserId ? [excludeUserId] : [];
      
      pool.query(query, params, (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        
        // Filter by distance (Haversine formula)
        const R = 6371; // Earth's radius in km
        const nearbyDrivers = results.filter(driver => {
          if (!driver.current_latitude || !driver.current_longitude) return false;
          
          const dLat = (driver.current_latitude - latitude) * Math.PI / 180;
          const dLon = (driver.current_longitude - longitude) * Math.PI / 180;
          const a = 
            Math.sin(dLat / 2) ** 2 +
            Math.cos(latitude * Math.PI / 180) *
            Math.cos(driver.current_latitude * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          
          return distance <= radius;
        });
        
        resolve(nearbyDrivers);
      });
    });
  }

  // Get user details for notifications
  static getUserDetails(userId, userType = 'customer') {
    return new Promise((resolve, reject) => {
      let query;
      let idField;
      
      if (userType === 'driver') {
        query = 'SELECT driver_id as id, name FROM driver_details WHERE driver_id = ?';
        idField = 'driver_id';
      } else {
        query = 'SELECT customerid as id, name FROM customer_details WHERE customerid = ?';
        idField = 'customerid';
      }
      
      pool.query(query, [userId], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(results[0] || null);
      });
    });
  }

  // Mark notification as read
  static markNotificationAsRead(notificationId) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE notifications SET status = "read", read_at = NOW() WHERE notification_id = ?';
      
      pool.query(query, [notificationId], (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ affectedRows: result.affectedRows });
      });
    });
  }

  // Get unread notification count
  static getUnreadNotificationCount(userId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND status != "read"';
      
      pool.query(query, [userId], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(results[0].count);
      });
    });
  }
}

module.exports = NotificationsCRUD;
