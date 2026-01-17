const mysql = require('mysql');
const pool = require('./cruds/poolfile');

async function createNotificationsTable() {
  return new Promise((resolve, reject) => {
    console.log('Creating notifications table...');
    
    // Check if table already exists
    pool.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'notifications'
    `, (err, results) => {
      if (err) {
        console.error('❌ Error checking notifications table:', err);
        reject(err);
        return;
      }
      
      if (results.length > 0) {
        console.log('✅ Notifications table already exists');
        verifyTable();
        return;
      }
      
      // Create the notifications table
      const createTableSQL = `
        CREATE TABLE notifications (
          notification_id VARCHAR(50) PRIMARY KEY,
          user_id VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          body TEXT NOT NULL,
          type VARCHAR(50) NOT NULL,
          data JSON,
          is_read BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_type (type),
          INDEX idx_created_at (created_at),
          INDEX idx_is_read (is_read)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;
      
      pool.query(createTableSQL, (err, result) => {
        if (err) {
          console.error('❌ Error creating notifications table:', err);
          reject(err);
          return;
        }
        
        console.log('✅ Notifications table created successfully');
        verifyTable();
      });
    });
    
    function verifyTable() {
      // Verify table structure
      pool.query('DESCRIBE notifications', (err, results) => {
        if (err) {
          console.error('❌ Error verifying notifications table:', err);
          reject(err);
          return;
        }
        
        console.log('\n📋 Notifications Table Structure:');
        results.forEach(field => {
          console.log(`✅ ${field.Field}: ${field.Type} ${field.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${field.Key ? `KEY (${field.Key})` : ''} ${field.Default ? `DEFAULT ${field.Default}` : ''}`);
        });
        
        // Create user_devices table for device tokens
        createUserDevicesTable();
      });
    }
    
    function createUserDevicesTable() {
      console.log('\nCreating user_devices table...');
      
      // Check if table already exists
      pool.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'user_devices'
      `, (err, results) => {
        if (err) {
          console.error('❌ Error checking user_devices table:', err);
          reject(err);
          return;
        }
        
        if (results.length > 0) {
          console.log('✅ User_devices table already exists');
          verifyUserDevicesTable();
          return;
        }
        
        // Create the user_devices table
        const createTableSQL = `
          CREATE TABLE user_devices (
            device_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            device_token VARCHAR(255) NOT NULL,
            device_type VARCHAR(50) DEFAULT 'mobile',
            platform VARCHAR(20) DEFAULT 'unknown',
            app_version VARCHAR(50),
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_device_token (device_token),
            INDEX idx_is_active (is_active),
            UNIQUE KEY unique_user_device (user_id, device_token)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        pool.query(createTableSQL, (err, result) => {
          if (err) {
            console.error('❌ Error creating user_devices table:', err);
            reject(err);
            return;
          }
          
          console.log('✅ User_devices table created successfully');
          verifyUserDevicesTable();
        });
      });
    }
    
    function verifyUserDevicesTable() {
      // Verify table structure
      pool.query('DESCRIBE user_devices', (err, results) => {
        if (err) {
          console.error('❌ Error verifying user_devices table:', err);
          reject(err);
          return;
        }
        
        console.log('\n📋 User_Devices Table Structure:');
        results.forEach(field => {
          console.log(`✅ ${field.Field}: ${field.Type} ${field.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${field.Key ? `KEY (${field.Key})` : ''} ${field.Default ? `DEFAULT ${field.Default}` : ''}`);
        });
        
        console.log('\n🎉 All notification tables created successfully!');
        resolve({ success: true, message: 'Notification tables created successfully' });
        pool.end();
      });
    }
  });
}

createNotificationsTable().catch(console.error);
