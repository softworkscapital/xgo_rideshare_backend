-- Add Correct Customer Rating Fields (Ratings Received FROM Drivers)
-- Run this to add the correct rating fields for customer performance tracking

-- Add correct private ride rating fields (ratings received from drivers)
ALTER TABLE customer_details 
ADD COLUMN IF NOT EXISTS private_total_ratings_received INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_average_rating_received DECIMAL(3,2) DEFAULT NULL;

-- Add correct rideshare rating fields (ratings received from drivers)
ALTER TABLE customer_details 
ADD COLUMN IF NOT EXISTS rideshare_total_ratings_received INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_average_rating_received DECIMAL(3,2) DEFAULT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_private_ratings ON customer_details(customerid, private_total_ratings_received, private_average_rating_received);
CREATE INDEX IF NOT EXISTS idx_customer_rideshare_ratings ON customer_details(customerid, rideshare_total_ratings_received, rideshare_average_rating_received);

-- Verify the fields were added
DESCRIBE customer_details;
