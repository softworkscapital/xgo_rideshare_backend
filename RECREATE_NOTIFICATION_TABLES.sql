-- ========================================
-- COMPLETE RECREATION OF FIREBASE NOTIFICATION TABLES
-- ========================================
-- This script will DROP and RECREATE all notification tables
-- Run this ONCE to completely reset the notification system

-- Step 1: Drop existing tables (if they exist)
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS user_devices;
DROP TABLE IF EXISTS notification_preferences;

-- Step 2: Create user_devices table
CREATE TABLE user_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    device_token TEXT NOT NULL,
    device_type VARCHAR(20) DEFAULT 'android',
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

-- Step 3: Create notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    data JSON,
    status ENUM('sent', 'delivered', 'read', 'failed') DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_type (type)
);

-- Step 4: Create notification_preferences table
CREATE TABLE notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    ride_requests BOOLEAN DEFAULT TRUE,
    counter_offers BOOLEAN DEFAULT TRUE,
    ride_accepted BOOLEAN DEFAULT TRUE,
    driver_updates BOOLEAN DEFAULT TRUE,
    messages BOOLEAN DEFAULT TRUE,
    payments BOOLEAN DEFAULT TRUE,
    promotions BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
);

-- Step 5: Verify tables were created successfully
SELECT 'user_devices table created successfully' as status, COUNT(*) as columns 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_devices'

UNION ALL

SELECT 'notifications table created successfully' as status, COUNT(*) as columns 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notifications'

UNION ALL

SELECT 'notification_preferences table created successfully' as status, COUNT(*) as columns 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notification_preferences'

UNION ALL

SELECT 'ALL NOTIFICATION TABLES RECREATED SUCCESSFULLY!' as status, 3 as total_tables;

-- Step 6: Show final table structures
SELECT '=== USER_DEVICES TABLE STRUCTURE ===' as info;
DESCRIBE user_devices;

SELECT '=== NOTIFICATIONS TABLE STRUCTURE ===' as info;
DESCRIBE notifications;

SELECT '=== NOTIFICATION_PREFERENCES TABLE STRUCTURE ===' as info;
DESCRIBE notification_preferences;

-- Step 7: Show available tables
SHOW TABLES LIKE '%notification%';
SHOW TABLES LIKE '%device%';
