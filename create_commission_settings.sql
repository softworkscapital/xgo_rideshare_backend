-- Create commission_settings table
CREATE TABLE IF NOT EXISTS commission_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  percentage_commission_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  daily_flat_figure_commission DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  daily_promotion_active BOOLEAN DEFAULT FALSE,
  promotion_start_date DATETIME NULL,
  promotion_end_date DATETIME NULL,
  lock_to_percentage BOOLEAN DEFAULT FALSE,
  auto_switch_percentage BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO commission_settings (
  percentage_commission_rate,
  daily_flat_figure_commission,
  daily_promotion_active,
  promotion_start_date,
  promotion_end_date,
  lock_to_percentage,
  auto_switch_percentage
) VALUES (
  20.00,
  5.00,
  FALSE,
  NULL,
  NULL,
  FALSE,
  TRUE
) ON DUPLICATE KEY UPDATE id = id;

-- Create commission_notifications table
CREATE TABLE IF NOT EXISTS commission_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  notification_type ENUM('promo_start', 'promo_ending', 'promo_ended', 'force_switch') NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_notification_type (notification_type),
  INDEX idx_is_read (is_read)
);

-- Add commission tracking columns to rideshare_trips
ALTER TABLE rideshare_trips 
ADD COLUMN IF NOT EXISTS commission_type_used ENUM('percentage', 'daily_flat_rate') NULL,
ADD COLUMN IF NOT EXISTS commission_rate_applied DECIMAL(10,2) NULL,
ADD COLUMN IF NOT EXISTS commission_calculation_method TEXT NULL,
ADD COLUMN IF NOT EXISTS commission_settings_id INT NULL,
ADD COLUMN IF NOT EXISTS promotion_active_at_time BOOLEAN NULL;

-- Add commission tracking columns to trip table
ALTER TABLE trip 
ADD COLUMN IF NOT EXISTS commission_type_used ENUM('percentage', 'daily_flat_rate') NULL,
ADD COLUMN IF NOT EXISTS commission_rate_applied DECIMAL(10,2) NULL,
ADD COLUMN IF NOT EXISTS commission_calculation_method TEXT NULL,
ADD COLUMN IF NOT EXISTS commission_settings_id INT NULL,
ADD COLUMN IF NOT EXISTS promotion_active_at_time BOOLEAN NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_rideshare_commission_type ON rideshare_trips(commission_type_used);
CREATE INDEX IF NOT EXISTS idx_trip_commission_type ON trip(commission_type_used);
CREATE INDEX IF NOT EXISTS idx_rideshare_commission_date ON rideshare_trips(created_at);
CREATE INDEX IF NOT EXISTS idx_trip_commission_date ON trip(order_end_datetime);
