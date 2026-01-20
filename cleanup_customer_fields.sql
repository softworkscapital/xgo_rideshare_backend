-- Clean Up Customer Details Table
-- Drop old incorrect rating fields and keep only correct ones

-- Drop old incorrect rating fields (ratings given to drivers - WRONG)
ALTER TABLE customer_details 
DROP COLUMN IF EXISTS private_total_ratings_given,
DROP COLUMN IF EXISTS private_average_rating_given,
DROP COLUMN IF EXISTS rideshare_total_ratings_given,
DROP COLUMN IF EXISTS rideshare_average_rating_given;

-- Also drop rideshare driver fields from customer table (should be in driver_details)
ALTER TABLE customer_details 
DROP COLUMN IF EXISTS rideshare_as_driver_trips,
DROP COLUMN IF EXISTS rideshare_driver_completed_trips,
DROP COLUMN IF EXISTS rideshare_driver_cancelled_trips,
DROP COLUMN IF EXISTS rideshare_driver_earnings,
DROP COLUMN IF EXISTS rideshare_driver_average_earnings,
DROP COLUMN IF EXISTS rideshare_driver_last_trip_date,
DROP COLUMN IF EXISTS rideshare_driver_created_shared_ride_requests;

-- Verify the clean schema
DESCRIBE customer_details;
