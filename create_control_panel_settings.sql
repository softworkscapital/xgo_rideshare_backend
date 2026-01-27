-- ========================================
-- Control Panel Settings Database Setup
-- ========================================

-- Create the control panel settings table
CREATE TABLE control_panel_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50) DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key)
);

-- Insert default settings
INSERT INTO control_panel_settings (setting_key, setting_value, setting_type, description) 
VALUES ('nearby_requests_radius_km', '5.0', 'decimal', 'Radius in km for showing nearby passenger requests to drivers');

-- Additional optional settings (for future use)
INSERT INTO control_panel_settings (setting_key, setting_value, setting_type, description) 
VALUES 
('max_nearby_requests', '50', 'integer', 'Maximum number of nearby requests to show to a driver'),
('nearby_requests_enabled', 'true', 'boolean', 'Enable/disable nearby requests feature'),
('auto_refresh_interval', '30', 'integer', 'Auto-refresh interval for nearby requests in seconds');

-- Verify the table was created
SELECT * FROM control_panel_settings ORDER BY setting_key;
