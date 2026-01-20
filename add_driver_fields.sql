-- Driver Details Table Enhancement Script
-- Add fields for comprehensive private and rideshare trip tracking for drivers

-- Run this script first to add the new fields to driver_details table

-- Private Ride Statistics Fields (Driver as Driver)
ALTER TABLE driver_details 
ADD COLUMN IF NOT EXISTS private_trips_completed INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_trips_cancelled INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_total_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS private_average_earnings_per_trip DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS private_last_trip_date DATETIME NULL,
ADD COLUMN IF NOT EXISTS private_total_ratings_given INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_average_rating_given DECIMAL(3,2) DEFAULT 0.00;

-- Rideshare Driver Statistics Fields (Driver as Driver)
ALTER TABLE driver_details 
ADD COLUMN IF NOT EXISTS rideshare_driver_created_shared_ride_requests INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_driver_completed_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_driver_cancelled_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_driver_total_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rideshare_driver_average_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rideshare_driver_last_trip_date DATETIME NULL,
ADD COLUMN IF NOT EXISTS rideshare_driver_total_ratings_given INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_driver_average_rating_given DECIMAL(3,2) DEFAULT 0.00;

-- Rideshare Passenger Statistics Fields (Driver as Passenger)
ALTER TABLE driver_details 
ADD COLUMN IF NOT EXISTS rideshare_passenger_requests_made INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_passenger_completed_requests INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_passenger_cancelled_requests INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_passenger_total_spend DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rideshare_passenger_average_spend DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rideshare_passenger_last_trip_date DATETIME NULL,
ADD COLUMN IF NOT EXISTS rideshare_passenger_total_ratings_given INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_passenger_average_rating_given DECIMAL(3,2) DEFAULT 0.00;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_private_stats ON driver_details(driverid, private_trips_completed, private_total_earnings);
CREATE INDEX IF NOT EXISTS idx_driver_rideshare_driver_stats ON driver_details(driverid, rideshare_driver_completed_trips, rideshare_driver_total_earnings);
CREATE INDEX IF NOT EXISTS idx_driver_rideshare_passenger_stats ON driver_details(driverid, rideshare_passenger_completed_requests, rideshare_passenger_total_spend);

-- Verify the fields were added
DESCRIBE driver_details;
