-- Customer Details Status-Based Fields Addition
-- Run this in your MySQL database first
-- This adds status-based tracking fields for comprehensive analytics

-- PRIVATE RIDE STATUS-BASED FIELDS (using actual database statuses)
ALTER TABLE customer_details 
ADD COLUMN IF NOT EXISTS private_completed_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_trip_ended_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_cancelled_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_new_order_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_pending_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_just_in_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_counter_offer_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_waiting_payment_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_in_transit_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_total_spend DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS private_average_spend DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS private_last_trip_date DATETIME NULL,
ADD COLUMN IF NOT EXISTS private_total_ratings_given INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_average_rating_given DECIMAL(3,2) DEFAULT NULL;

-- RIDESHARE STATUS-BASED FIELDS (using actual database statuses)
ALTER TABLE customer_details 
ADD COLUMN IF NOT EXISTS rideshare_completed_requests INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_cancelled_requests INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_created_shared_ride_requests INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_total_spend DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rideshare_average_spend DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rideshare_last_trip_date DATETIME NULL,
ADD COLUMN IF NOT EXISTS rideshare_total_ratings_given INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_average_rating_given DECIMAL(3,2) DEFAULT NULL;

-- RIDESHARE DRIVER STATUS-BASED FIELDS (using actual database statuses)
ALTER TABLE customer_details 
ADD COLUMN IF NOT EXISTS rideshare_driver_created_shared_ride_requests INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_driver_completed_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_driver_cancelled_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_driver_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rideshare_driver_average_earnings DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rideshare_driver_last_trip_date DATETIME NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_private_stats ON customer_details(customerid, private_completed_trips, private_total_spend);
CREATE INDEX IF NOT EXISTS idx_customer_rideshare_stats ON customer_details(customerid, rideshare_completed_requests, rideshare_total_spend);
CREATE INDEX IF NOT EXISTS idx_customer_driver_stats ON customer_details(customerid, rideshare_driver_completed_trips, rideshare_driver_earnings);

-- Verify the fields were added
DESCRIBE customer_details;
