-- Create table for ride-matching settings
-- This table stores detour distance and other ride-matching configuration

CREATE TABLE IF NOT EXISTS ride_matching_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_type VARCHAR(50) NOT NULL COMMENT 'Type of setting (detour_distance, etc.)',
    settings_json JSON NOT NULL COMMENT 'Settings data in JSON format',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_setting_type (setting_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ride-matching configuration settings';

-- Add detour expansion columns to trips table if they don't exist
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS detour_expansion_count INT DEFAULT 0 COMMENT 'Number of times detour distance has been expanded',
ADD COLUMN IF NOT EXISTS current_detour_distance DECIMAL(5,2) DEFAULT 3.0 COMMENT 'Current detour distance limit for this trip';

-- Insert default detour distance settings
INSERT INTO ride_matching_settings (setting_type, settings_json) 
VALUES ('detour_distance', JSON_OBJECT(
    'default_detour_distance', 20.0,
    'min_detour_distance', 0.5,
    'max_detour_distance', 50.0,
    'detour_increment', 5.0,
    'auto_detour_expansion', false,
    'expansion_time_limit', 300,
    'max_auto_expansions', 3
))
ON DUPLICATE KEY UPDATE 
settings_json = VALUES(settings_json),
updated_at = NOW();
