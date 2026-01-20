-- Create Firebase Push Notifications Tables

-- User devices table to store FCM tokens
CREATE TABLE IF NOT EXISTS user_devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  device_token TEXT NOT NULL,
  device_type ENUM('android', 'ios', 'web') DEFAULT 'android',
  platform VARCHAR(20) DEFAULT 'unknown',
  app_version VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_device_token (device_token(255)),
  INDEX idx_is_active (is_active),
  UNIQUE KEY unique_user_device (user_id, device_token(255))
);

-- Notifications table to track all sent notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notification_id VARCHAR(100) NOT NULL UNIQUE,
  user_id VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'general',
  data JSON,
  status ENUM('sent', 'delivered', 'read', 'failed') DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_notification_id (notification_id),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status),
  INDEX idx_type (type)
);

-- Notification preferences table for user settings
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL UNIQUE,
  ride_requests BOOLEAN DEFAULT TRUE,
  counter_offers BOOLEAN DEFAULT TRUE,
  ride_accepted BOOLEAN DEFAULT TRUE,
  driver_updates BOOLEAN DEFAULT TRUE,
  messages BOOLEAN DEFAULT TRUE,
  payments BOOLEAN DEFAULT TRUE,
  promotions BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);

-- Extend rideshare table to include ratings and feedback
ALTER TABLE rideshare 
ADD COLUMN IF NOT EXISTS passenger_rating DECIMAL(3,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS passenger_feedback TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS driver_rating DECIMAL(3,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS driver_feedback TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS feedback_date TIMESTAMP NULL DEFAULT NULL;

-- Insert sample notification preferences for existing users
INSERT IGNORE INTO notification_preferences (user_id) 
SELECT DISTINCT customerid FROM customer_details 
UNION 
SELECT DISTINCT driver_id FROM driver_details;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rideshare_feedback ON rideshare(feedback_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_id, type);
CREATE INDEX IF NOT EXISTS idx_user_devices_active ON user_devices(user_id, is_active);
