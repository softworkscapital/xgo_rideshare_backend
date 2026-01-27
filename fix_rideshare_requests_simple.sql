-- Simple fix for rideshare_requests table to restore passenger profile functionality
-- This addresses the customer ID deprecation issue and ensures backwards compatibility

-- Step 1: Add back essential passenger information fields
ALTER TABLE rideshare_requests 
ADD COLUMN passenger_name VARCHAR(255) DEFAULT NULL COMMENT 'Passenger name from customer_details',
ADD COLUMN passenger_surname VARCHAR(255) DEFAULT NULL COMMENT 'Passenger surname from customer_details', 
ADD COLUMN passenger_username VARCHAR(255) DEFAULT NULL COMMENT 'Passenger username from customer_details',
ADD COLUMN passenger_email VARCHAR(255) DEFAULT NULL COMMENT 'Passenger email from customer_details',
ADD COLUMN passenger_phone VARCHAR(50) DEFAULT NULL COMMENT 'Passenger phone from customer_details',
ADD COLUMN passenger_profile_pic VARCHAR(500) DEFAULT NULL COMMENT 'Passenger profile picture URL',
ADD COLUMN passenger_rating DECIMAL(3,2) DEFAULT NULL COMMENT 'Passenger rating (1-5)',
ADD COLUMN passenger_stars DECIMAL(3,2) DEFAULT NULL COMMENT 'Passenger stars (alternative rating field)',
ADD COLUMN customerid VARCHAR(50) DEFAULT NULL COMMENT 'Original customer ID for backwards compatibility';

-- Step 2: Change passenger_id back to VARCHAR to support both old and new formats
ALTER TABLE rideshare_requests 
MODIFY COLUMN passenger_id VARCHAR(50) DEFAULT NULL COMMENT 'Can be integer (new) or string (old format)';

-- Step 3: Add indexes for performance
ALTER TABLE rideshare_requests 
ADD INDEX idx_passenger_name (passenger_name),
ADD INDEX idx_passenger_username (passenger_username),
ADD INDEX idx_customerid (customerid),
ADD INDEX idx_passenger_rating (passenger_rating);

-- Step 4: Update existing records - populate passenger data from customer_details
UPDATE rideshare_requests r 
SET 
    r.passenger_name = COALESCE(cd.name, ''),
    r.passenger_surname = COALESCE(cd.surname, ''),
    r.passenger_username = COALESCE(cd.username, ''),
    r.passenger_email = COALESCE(cd.email, ''),
    r.passenger_phone = COALESCE(cd.phone, ''),
    r.passenger_profile_pic = COALESCE(cd.profile_pic, ''),
    r.passenger_rating = cd.rating,
    r.passenger_stars = cd.stars,
    r.customerid = r.passenger_id
FROM customer_details cd 
WHERE (cd.customerid = r.passenger_id OR cd.customerid = CAST(r.passenger_id AS CHAR))
  AND r.passenger_id IS NOT NULL 
  AND r.passenger_id != '0';

-- Step 5: Handle the deprecated customer ID = 0 cases
-- Update records with passenger_id = 0 to use a default anonymous profile
UPDATE rideshare_requests 
SET 
    passenger_name = 'Anonymous',
    passenger_username = CONCAT('Guest_', request_id),
    passenger_email = NULL,
    passenger_phone = NULL,
    passenger_profile_pic = NULL,
    passenger_rating = NULL,
    passenger_stars = NULL,
    customerid = '0'
WHERE passenger_id = '0' OR passenger_id IS NULL OR passenger_id = '';

-- Step 6: Create a view for easy access to passenger data
CREATE OR REPLACE VIEW rideshare_requests_with_passenger_info AS
SELECT 
    r.*,
    CASE 
        WHEN r.passenger_id = '0' OR r.passenger_id IS NULL OR r.passenger_id = '' THEN 'Anonymous'
        WHEN COALESCE(r.passenger_name, '') != '' THEN CONCAT(r.passenger_name, ' ', COALESCE(r.passenger_surname, ''))
        ELSE COALESCE(r.passenger_username, CONCAT('Passenger ', r.passenger_id))
    END as display_name,
    COALESCE(r.passenger_username, CONCAT('Passenger ', r.passenger_id)) as display_username,
    COALESCE(r.passenger_rating, r.passenger_stars, 0) as display_rating,
    COALESCE(r.passenger_profile_pic, '') as display_profile_pic
FROM rideshare_requests r;

-- Step 7: Create a stored procedure to manually refresh passenger data when needed
DELIMITER //
CREATE PROCEDURE sync_passenger_data()
BEGIN
    -- Update all requests that have valid passenger_ids
    UPDATE rideshare_requests r 
    SET 
        r.passenger_name = COALESCE(cd.name, ''),
        r.passenger_surname = COALESCE(cd.surname, ''),
        r.passenger_username = COALESCE(cd.username, ''),
        r.passenger_email = COALESCE(cd.email, ''),
        r.passenger_phone = COALESCE(cd.phone, ''),
        r.passenger_profile_pic = COALESCE(cd.profile_pic, ''),
        r.passenger_rating = cd.rating,
        r.passenger_stars = cd.stars,
        r.customerid = r.passenger_id
    FROM customer_details cd 
    WHERE (cd.customerid = r.passenger_id OR cd.customerid = CAST(r.passenger_id AS CHAR))
      AND r.passenger_id IS NOT NULL 
      AND r.passenger_id != '0'
      AND r.passenger_id != '';
      
    -- Handle anonymous users
    UPDATE rideshare_requests 
    SET 
        passenger_name = 'Anonymous',
        passenger_username = CONCAT('Guest_', request_id),
        passenger_email = NULL,
        passenger_phone = NULL,
        passenger_profile_pic = NULL,
        passenger_rating = NULL,
        passenger_stars = NULL,
        customerid = '0'
    WHERE passenger_id = '0' OR passenger_id IS NULL OR passenger_id = '';
    
    SELECT 'Passenger data synchronization completed' as result;
END//
DELIMITER ;

-- Step 8: Add table comment
ALTER TABLE rideshare_requests COMMENT = 'Rideshare passenger requests with integrated passenger profile data for backwards compatibility';
