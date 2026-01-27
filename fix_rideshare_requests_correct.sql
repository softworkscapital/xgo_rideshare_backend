-- ===================================================
-- CORRECT FIX FOR RIDESHARE_REQUESTS PASSENGER PROFILE ISSUE
-- ===================================================
-- This addresses the root cause: passenger_id = 0 and missing passenger data

-- STEP 1: Add passenger profile fields to rideshare_requests table
ALTER TABLE rideshare_requests 
ADD COLUMN IF NOT EXISTS passenger_name VARCHAR(255) DEFAULT NULL COMMENT 'Passenger name from customer_details',
ADD COLUMN IF NOT EXISTS passenger_surname VARCHAR(255) DEFAULT NULL COMMENT 'Passenger surname from customer_details',
ADD COLUMN IF NOT EXISTS passenger_username VARCHAR(255) DEFAULT NULL COMMENT 'Passenger username from customer_details',
ADD COLUMN IF NOT EXISTS passenger_email VARCHAR(255) DEFAULT NULL COMMENT 'Passenger email from customer_details',
ADD COLUMN IF NOT EXISTS passenger_phone VARCHAR(50) DEFAULT NULL COMMENT 'Passenger phone from customer_details',
ADD COLUMN IF NOT EXISTS passenger_profile_pic VARCHAR(500) DEFAULT NULL COMMENT 'Passenger profile picture URL',
ADD COLUMN IF NOT EXISTS passenger_rating DECIMAL(3,2) DEFAULT NULL COMMENT 'Passenger rating from customer_details',
ADD COLUMN IF NOT EXISTS passenger_stars DECIMAL(3,2) DEFAULT NULL COMMENT 'Passenger stars from customer_details';

-- STEP 2: Update existing records - fetch passenger data for all valid passenger_ids
UPDATE rideshare_requests r 
SET 
    r.passenger_name = COALESCE(cd.name, ''),
    r.passenger_surname = COALESCE(cd.surname, ''),
    r.passenger_username = COALESCE(cd.username, ''),
    r.passenger_email = COALESCE(cd.email, ''),
    r.passenger_phone = COALESCE(cd.phone, ''),
    r.passenger_profile_pic = COALESCE(cd.profile_pic, ''),
    r.passenger_rating = cd.rating,
    r.passenger_stars = cd.stars
FROM customer_details cd 
WHERE (cd.customerid = r.passenger_id OR cd.customerid = CAST(r.passenger_id AS CHAR))
  AND r.passenger_id IS NOT NULL 
  AND r.passenger_id != '0'
  AND r.passenger_id != '';

-- STEP 3: Handle the deprecated customer_id = 0 cases with default anonymous data
UPDATE rideshare_requests 
SET 
    passenger_name = CASE 
        WHEN passenger_id = '0' OR passenger_id IS NULL OR passenger_id = '' THEN 'Anonymous User'
        ELSE COALESCE(passenger_name, 'Anonymous User')
    END,
    passenger_username = CASE 
        WHEN passenger_id = '0' OR passenger_id IS NULL OR passenger_id = '' THEN CONCAT('Guest_', request_id)
        ELSE COALESCE(passenger_username, CONCAT('Guest_', request_id))
    END,
    passenger_email = NULL,
    passenger_phone = NULL,
    passenger_profile_pic = NULL,
    passenger_rating = NULL,
    passenger_stars = NULL
WHERE passenger_id = '0' OR passenger_id IS NULL OR passenger_id = '';

-- STEP 4: Create a view for the driver trip list to easily access passenger data
CREATE OR REPLACE VIEW rideshare_requests_with_passenger_profiles AS
SELECT 
    r.*,
    -- Passenger display name logic
    CASE 
        WHEN r.passenger_id = '0' OR r.passenger_id IS NULL OR r.passenger_id = '' THEN 'Anonymous User'
        WHEN COALESCE(r.passenger_name, '') != '' THEN CONCAT(r.passenger_name, ' ', COALESCE(r.passenger_surname, ''))
        ELSE COALESCE(r.passenger_username, CONCAT('Passenger ', r.passenger_id))
    END as display_name,
    -- Passenger username fallback
    COALESCE(r.passenger_username, CONCAT('Passenger ', r.passenger_id)) as display_username,
    -- Passenger rating (use existing driver_rates_customer if available, then passenger_rating)
    COALESCE(r.driver_rates_customer, r.passenger_rating, r.passenger_stars, 0) as display_rating,
    -- Passenger profile picture
    COALESCE(r.passenger_profile_pic, '') as display_profile_pic,
    -- Status for driver view
    CASE 
        WHEN r.status IN ('Accepted', 'In-Transit', 'Joined') THEN 'Active'
        WHEN r.status = 'Negotiating' THEN 'Negotiating'
        ELSE r.status
    END as driver_status
FROM rideshare_requests r;

-- STEP 5: Verification - show the results
SELECT '=== VERIFICATION RESULTS ===' as info;

SELECT 
    'Total Requests' as metric,
    COUNT(*) as count
FROM rideshare_requests;

SELECT 
    'Requests with Passenger Names' as metric,
    COUNT(CASE WHEN passenger_name IS NOT NULL AND passenger_name != '' THEN 1 END) as count
FROM rideshare_requests;

SELECT 
    'Anonymous Requests (passenger_id = 0)' as metric,
    COUNT(CASE WHEN passenger_id = '0' THEN 1 END) as count
FROM rideshare_requests;

SELECT 
    'Sample Updated Records' as info,
    request_id,
    passenger_id,
    passenger_name,
    passenger_username,
    display_name,
    display_rating,
    display_profile_pic
FROM rideshare_requests_with_passenger_profiles 
ORDER BY request_id DESC 
LIMIT 5;

SELECT '=== FIX COMPLETED ===' as result,
       'Driver trip list should now show passenger profiles' as details;
