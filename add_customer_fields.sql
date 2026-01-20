-- Customer Details Table Enhancement Script
-- Add fields for comprehensive private and rideshare trip tracking

-- Run this script first to add the new fields to customer_details table

-- Private Ride Statistics Fields
ALTER TABLE customer_details 
ADD COLUMN IF NOT EXISTS private_trips_completed INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_trips_cancelled INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_total_spend DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS private_average_spend_per_trip DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS private_last_trip_date DATETIME NULL,
ADD COLUMN IF NOT EXISTS private_total_ratings_given INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_average_rating_given DECIMAL(3,2) DEFAULT 0.00;

-- Rideshare Passenger Statistics Fields
ALTER TABLE customer_details 
ADD COLUMN IF NOT EXISTS rideshare_requests_made INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_requests_completed INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_requests_cancelled INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_total_spend DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rideshare_average_spend_per_trip DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rideshare_last_trip_date DATETIME NULL,
ADD COLUMN IF NOT EXISTS rideshare_total_ratings_given INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_average_rating_given DECIMAL(3,2) DEFAULT 0.00;

-- Rideshare Driver Statistics Fields (for customers who are also drivers)
ALTER TABLE customer_details 
ADD COLUMN IF NOT EXISTS rideshare_as_driver_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_driver_completed_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_driver_cancelled_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_driver_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rideshare_driver_average_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rideshare_driver_last_trip_date DATETIME NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_private_stats ON customer_details(customerid, private_trips_completed, private_total_spend);
CREATE INDEX IF NOT EXISTS idx_customer_rideshare_stats ON customer_details(customerid, rideshare_requests_completed, rideshare_total_spend);
CREATE INDEX IF NOT EXISTS idx_customer_driver_stats ON customer_details(customerid, rideshare_as_driver_trips, rideshare_driver_earnings);

-- Verify the fields were added
DESCRIBE customer_details;
