-- ===================================================
-- FINAL CORRECT FIX FOR RIDESHARE_REQUESTS TABLE
-- ===================================================
-- Restores all missing fields from old table structure
-- Maintains backwards compatibility with existing data

-- STEP 1: Restore passenger_id to VARCHAR (backwards compatibility)
ALTER TABLE rideshare_requests 
MODIFY COLUMN passenger_id VARCHAR(20) NOT NULL COMMENT 'Can be integer (new) or string (old format)';

-- STEP 2: Add missing essential fields from old table
ALTER TABLE rideshare_requests 
ADD COLUMN IF NOT EXISTS offer_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Original offer amount from passenger',
ADD COLUMN IF NOT EXISTS accepted_amount DECIMAL(10,2) DEFAULT NULL COMMENT 'Amount accepted by driver',
ADD COLUMN IF NOT EXISTS seat_number INT(11) DEFAULT NULL COMMENT 'Seat number assignment',
ADD COLUMN IF NOT EXISTS customer_rating DECIMAL(3,2) DEFAULT NULL COMMENT 'Customer rating for driver (1-5)',
ADD COLUMN IF NOT EXISTS customer_feedback TEXT DEFAULT NULL COMMENT 'Customer feedback about driver',
ADD COLUMN IF NOT EXISTS driver_rating DECIMAL(3,2) DEFAULT NULL COMMENT 'Driver rating for customer (1-5)',
ADD COLUMN IF NOT EXISTS driver_feedback TEXT DEFAULT NULL COMMENT 'Driver feedback about customer',
ADD COLUMN IF NOT EXISTS feedback_date TIMESTAMP NULL DEFAULT NULL COMMENT 'When feedback was given',
ADD COLUMN IF NOT EXISTS feedback_by ENUM('customer','driver') DEFAULT NULL COMMENT 'Who gave the feedback',
ADD COLUMN IF NOT EXISTS customer_rates_driver DECIMAL(3,2) DEFAULT NULL COMMENT 'Customer rating for driver (1-5)',
ADD COLUMN IF NOT EXISTS customer_comment_for_driver TEXT DEFAULT NULL COMMENT 'Customer comment about driver',
ADD COLUMN IF NOT EXISTS driver_rates_customer DECIMAL(3,2) DEFAULT NULL COMMENT 'Driver rating for customer (1-5)',
ADD COLUMN IF NOT EXISTS driver_comment_for_customer TEXT DEFAULT NULL COMMENT 'Driver comment about customer',
ADD COLUMN IF NOT EXISTS customer_feedback_date TIMESTAMP NULL DEFAULT NULL COMMENT 'When customer gave feedback',
ADD COLUMN IF NOT EXISTS driver_feedback_date TIMESTAMP NULL DEFAULT NULL COMMENT 'When driver gave feedback';

-- STEP 3: Add passenger profile fields for display
ALTER TABLE rideshare_requests 
ADD COLUMN IF NOT EXISTS passenger_name VARCHAR(255) DEFAULT NULL COMMENT 'Passenger name from customer_details',
ADD COLUMN IF NOT EXISTS passenger_surname VARCHAR(255) DEFAULT NULL COMMENT 'Passenger surname from customer_details',
ADD COLUMN IF NOT EXISTS passenger_username VARCHAR(255) DEFAULT NULL COMMENT 'Passenger username from customer_details',
ADD COLUMN IF NOT EXISTS passenger_email VARCHAR(255) DEFAULT NULL COMMENT 'Passenger email from customer_details',
ADD COLUMN IF NOT EXISTS passenger_phone VARCHAR(50) DEFAULT NULL COMMENT 'Passenger phone from customer_details',
ADD COLUMN IF NOT EXISTS passenger_profile_pic VARCHAR(500) DEFAULT NULL COMMENT 'Passenger profile picture URL';

-- STEP 4: Fix data types to match old table exactly
ALTER TABLE rideshare_requests 
MODIFY COLUMN pickup_lat DECIMAL(10,7) NOT NULL,
MODIFY COLUMN pickup_lng DECIMAL(10,7) NOT NULL,
MODIFY COLUMN dropoff_lat DECIMAL(10,7) NOT NULL,
MODIFY COLUMN dropoff_lng DECIMAL(10,7) NOT NULL,
MODIFY COLUMN detour_distance DECIMAL(5,2) DEFAULT 2.50,
MODIFY COLUMN detour_time INT(11) DEFAULT 5;

-- STEP 5: Update status to use ENUM like old table
ALTER TABLE rideshare_requests 
MODIFY COLUMN status ENUM('Join Shared Ride Request','Negotiating','Accepted','In-Transit','Declined','Rejected','Cancelled','Passenger Completed','Completed') DEFAULT 'Join Shared Ride Request';

-- STEP 6: Update existing records with proper data
UPDATE rideshare_requests r 
SET 
    -- Copy fare_offer to offer_amount if offer_amount is 0
    r.offer_amount = CASE 
        WHEN r.offer_offer IS NOT NULL AND r.offer_amount = 0.00 THEN r.fare_offer
        ELSE COALESCE(r.offer_amount, 0.00)
    END,
    -- Set default accepted_amount
    r.accepted_amount = CASE 
        WHEN r.accepted_amount IS NULL AND r.status = 'Accepted' THEN r.fare_offer
        ELSE r.accepted_amount
    END,
    -- Set default seat_number
    r.seat_number = CASE 
        WHEN r.seat_number IS NULL THEN 1
        ELSE r.seat_number
    END
WHERE r.request_id IS NOT NULL;

-- STEP 7: Populate passenger profile data from customer_details
UPDATE rideshare_requests r 
SET 
    r.passenger_name = COALESCE(cd.name, ''),
    r.passenger_surname = COALESCE(cd.surname, ''),
    r.passenger_username = COALESCE(cd.username, ''),
    r.passenger_email = COALESCE(cd.email, ''),
    r.passenger_phone = COALESCE(cd.phone, ''),
    r.passenger_profile_pic = COALESCE(cd.profile_pic, '')
FROM customer_details cd 
WHERE (cd.customerid = r.passenger_id OR cd.customerid = CAST(r.passenger_id AS CHAR))
  AND r.passenger_id IS NOT NULL 
  AND r.passenger_id != '0'
  AND r.passenger_id != '';

-- STEP 8: Handle deprecated passenger_id = 0 cases
UPDATE rideshare_requests 
SET 
    r.passenger_name = 'Anonymous User',
    r.passenger_surname = '',
    r.passenger_username = CONCAT('Guest_', r.request_id),
    r.passenger_email = NULL,
    r.passenger_phone = NULL,
    r.passenger_profile_pic = NULL
WHERE r.passenger_id = '0' OR r.passenger_id IS NULL OR r.passenger_id = '';

-- STEP 9: Add proper indexes from old table
ALTER TABLE rideshare_requests 
ADD INDEX IF NOT EXISTS idx_rideshare_requests_customer_rating (customer_rating),
ADD INDEX IF NOT EXISTS idx_rideshare_requests_driver_rating (driver_rating),
ADD INDEX IF NOT EXISTS idx_rideshare_requests_feedback_date (feedback_date),
ADD INDEX IF NOT EXISTS idx_rideshare_requests_customer_rates_driver (customer_rates_driver),
ADD INDEX IF NOT EXISTS idx_rideshare_requests_driver_rates_customer (driver_rates_customer),
ADD INDEX IF NOT EXISTS idx_rideshare_requests_customer_feedback_date (customer_feedback_date),
ADD INDEX IF NOT EXISTS idx_rideshare_requests_driver_feedback_date (driver_feedback_date);

-- STEP 10: Create comprehensive view for driver trip list
CREATE OR REPLACE VIEW rideshare_requests_with_passenger_data AS
SELECT 
    r.*,
    -- Passenger display information
    CASE 
        WHEN r.passenger_id = '0' OR r.passenger_id IS NULL OR r.passenger_id = '' THEN 'Anonymous User'
        WHEN COALESCE(r.passenger_name, '') != '' THEN CONCAT(r.passenger_name, ' ', COALESCE(r.passenger_surname, ''))
        ELSE COALESCE(r.passenger_username, CONCAT('Passenger ', r.passenger_id))
    END as display_name,
    COALESCE(r.passenger_username, CONCAT('Passenger ', r.passenger_id)) as display_username,
    -- Rating priority: driver_rates_customer > passenger_rating > passenger_stars > 0
    COALESCE(r.driver_rates_customer, r.passenger_rating, r.passenger_stars, 0) as display_rating,
    COALESCE(r.passenger_profile_pic, '') as display_profile_pic,
    -- Financial information
    COALESCE(r.offer_amount, r.fare_offer, 0) as final_offer_amount,
    COALESCE(r.accepted_amount, r.fare_offer, 0) as final_accepted_amount,
    -- Status for driver view
    CASE 
        WHEN r.status IN ('Accepted', 'In-Transit', 'Joined') THEN 'Active'
        WHEN r.status = 'Negotiating' THEN 'Negotiating'
        ELSE r.status
    END as driver_status
FROM rideshare_requests r;

-- STEP 11: Verification
SELECT '=== FINAL FIX VERIFICATION ===' as info;

SELECT 
    'Table Structure Check' as check_type,
    COUNT(*) as total_requests
FROM rideshare_requests;

SELECT 
    'Passenger Names Populated' as check_type,
    COUNT(CASE WHEN passenger_name IS NOT NULL AND passenger_name != '' THEN 1 END) as count
FROM rideshare_requests;

SELECT 
    'Rating Fields Available' as check_type,
    COUNT(CASE WHEN driver_rates_customer IS NOT NULL OR customer_rates_driver IS NOT NULL THEN 1 END) as count
FROM rideshare_requests;

SELECT 
    'Sample Records' as info,
    request_id,
    passenger_id,
    display_name,
    display_username,
    display_rating,
    final_offer_amount,
    status
FROM rideshare_requests_with_passenger_data 
ORDER BY request_id DESC 
LIMIT 3;

SELECT '=== FIX COMPLETED SUCCESSFULLY ===' as result,
       'All passenger profile and rating fields restored' as details;
