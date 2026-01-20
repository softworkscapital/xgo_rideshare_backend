-- Driver Rating System Cleanup Script
-- Drop old incorrect rating fields and add correct driver rating fields

-- First, let's see what rating fields currently exist in driver_details
-- DESCRIBE driver_details;

-- Drop old incorrect rating fields (if they exist)
-- These might be incorrectly named or have wrong perspective
ALTER TABLE driver_details 
DROP COLUMN IF EXISTS ratings_given,
DROP COLUMN IF EXISTS average_rating,
DROP COLUMN IF EXISTS total_ratings,
DROP COLUMN IF EXISTS driver_ratings_given,
DROP COLUMN IF EXISTS driver_average_rating,
DROP COLUMN IF EXISTS driver_total_ratings;

-- Add correct driver rating fields with proper perspective

-- Driver ratings GIVEN TO customers (driver's perspective of customer performance)
ALTER TABLE driver_details 
ADD COLUMN IF NOT EXISTS driver_private_ratings_given INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS driver_private_average_rating_given DECIMAL(3,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS driver_rideshare_ratings_given INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS driver_rideshare_average_rating_given DECIMAL(3,2) DEFAULT NULL;

-- Driver ratings RECEIVED FROM customers (customer's perspective of driver performance)
ALTER TABLE driver_details 
ADD COLUMN IF NOT EXISTS driver_private_ratings_received INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS driver_private_average_rating_received DECIMAL(3,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS driver_rideshare_ratings_received INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS driver_rideshare_average_rating_received DECIMAL(3,2) DEFAULT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_private_ratings_given ON driver_details(driver_id, driver_private_ratings_given, driver_private_average_rating_given);
CREATE INDEX IF NOT EXISTS idx_driver_rideshare_ratings_given ON driver_details(driver_id, driver_rideshare_ratings_given, driver_rideshare_average_rating_given);
CREATE INDEX IF NOT EXISTS idx_driver_private_ratings_received ON driver_details(driver_id, driver_private_ratings_received, driver_private_average_rating_received);
CREATE INDEX IF NOT EXISTS idx_driver_rideshare_ratings_received ON driver_details(driver_id, driver_rideshare_ratings_received, driver_rideshare_average_rating_received);

-- Verify the fields were added correctly
DESCRIBE driver_details;

-- Show sample data to check current state
SELECT driver_id, 
       driver_private_ratings_given, driver_private_average_rating_given,
       driver_rideshare_ratings_given, driver_rideshare_average_rating_given,
       driver_private_ratings_received, driver_private_average_rating_received,
       driver_rideshare_ratings_received, driver_rideshare_average_rating_received
FROM driver_details 
LIMIT 5;
