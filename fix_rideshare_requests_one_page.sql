-- ===================================================
-- FIX RIDESHARE_REQUESTS TABLE - ONE PAGE SQL
-- ===================================================
-- Run this entire script to fix passenger profile display issues
-- Addresses customer ID deprecation and restores passenger data

-- STEP 1: Add missing passenger profile fields (if they don't exist)
ALTER TABLE rideshare_requests 
ADD COLUMN IF NOT EXISTS passenger_name VARCHAR(255) DEFAULT NULL COMMENT 'Passenger name from customer_details',
ADD COLUMN IF NOT EXISTS passenger_surname VARCHAR(255) DEFAULT NULL COMMENT 'Passenger surname from customer_details', 
ADD COLUMN IF NOT EXISTS passenger_username VARCHAR(255) DEFAULT NULL COMMENT 'Passenger username from customer_details',
ADD COLUMN IF NOT EXISTS passenger_email VARCHAR(255) DEFAULT NULL COMMENT 'Passenger email from customer_details',
ADD COLUMN IF NOT EXISTS passenger_phone VARCHAR(50) DEFAULT NULL COMMENT 'Passenger phone from customer_details',
ADD COLUMN IF NOT EXISTS passenger_profile_pic VARCHAR(500) DEFAULT NULL COMMENT 'Passenger profile picture URL',
ADD COLUMN IF NOT EXISTS customerid VARCHAR(50) DEFAULT NULL COMMENT 'Original customer ID for backwards compatibility';

-- STEP 2: Ensure passenger_id supports both formats
ALTER TABLE rideshare_requests 
MODIFY COLUMN passenger_id VARCHAR(50) DEFAULT NULL COMMENT 'Can be integer (new) or string (old format)';

-- STEP 3: Add performance indexes
ALTER TABLE rideshare_requests 
ADD INDEX IF NOT EXISTS idx_passenger_name (passenger_name),
ADD INDEX IF NOT EXISTS idx_passenger_username (passenger_username),
ADD INDEX IF NOT EXISTS idx_customerid (customerid);

-- STEP 4: Update existing records with passenger data from customer_details
UPDATE rideshare_requests r 
SET 
    r.passenger_name = COALESCE(cd.name, ''),
    r.passenger_surname = COALESCE(cd.surname, ''),
    r.passenger_username = COALESCE(cd.username, ''),
    r.passenger_email = COALESCE(cd.email, ''),
    r.passenger_phone = COALESCE(cd.phone, ''),
    r.passenger_profile_pic = COALESCE(cd.profile_pic, ''),
    r.customerid = r.passenger_id
FROM customer_details cd 
WHERE (cd.customerid = r.passenger_id OR cd.customerid = CAST(r.passenger_id AS CHAR))
  AND r.passenger_id IS NOT NULL 
  AND r.passenger_id != '0'
  AND r.passenger_id != '';

-- STEP 5: Fix deprecated customer_id = 0 records
UPDATE rideshare_requests 
SET 
    passenger_name = 'Anonymous',
    passenger_username = CONCAT('Guest_', request_id),
    passenger_email = NULL,
    passenger_phone = NULL,
    passenger_profile_pic = NULL,
    customerid = '0'
WHERE passenger_id = '0' OR passenger_id IS NULL OR passenger_id = '';

-- STEP 6: Create view for easy passenger data access
CREATE OR REPLACE VIEW rideshare_requests_with_passenger_info AS
SELECT 
    r.*,
    CASE 
        WHEN r.passenger_id = '0' OR r.passenger_id IS NULL OR r.passenger_id = '' THEN 'Anonymous'
        WHEN COALESCE(r.passenger_name, '') != '' THEN CONCAT(r.passenger_name, ' ', COALESCE(r.passenger_surname, ''))
        ELSE COALESCE(r.passenger_username, CONCAT('Passenger ', r.passenger_id))
    END as display_name,
    COALESCE(r.passenger_username, CONCAT('Passenger ', r.passenger_id)) as display_username,
    COALESCE(r.driver_rates_customer, 0) as display_rating,
    COALESCE(r.passenger_profile_pic, '') as display_profile_pic
FROM rideshare_requests r;

-- STEP 7: Verify the fix - show updated records
SELECT 
    'FIX VERIFICATION' as status,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN passenger_name != '' AND passenger_name IS NOT NULL THEN 1 END) as with_passenger_names,
    COUNT(CASE WHEN passenger_id = '0' THEN 1 END) as anonymous_requests
FROM rideshare_requests;

-- STEP 8: Show sample updated records
SELECT 
    request_id,
    passenger_id,
    passenger_name,
    passenger_username,
    display_name,
    display_rating,
    display_profile_pic
FROM rideshare_requests_with_passenger_info 
ORDER BY request_id DESC 
LIMIT 5;

-- ===================================================
-- COMPLETION MESSAGE
-- ===================================================
SELECT 'RIDESHARE_REQUESTS TABLE FIXED SUCCESSFULLY!' as result,
       'Passenger profiles should now display in driver trip list' as details;
