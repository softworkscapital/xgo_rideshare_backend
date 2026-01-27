-- Test current state of rideshare_requests and customer_details
-- Run this to understand the current data situation

-- 1. Check current rideshare_requests structure
DESCRIBE rideshare_requests;

-- 2. Check current data in rideshare_requests
SELECT 
    request_id,
    passenger_id,
    status,
    created_at,
    pickup_name,
    dropoff_name,
    fare_offer
FROM rideshare_requests 
ORDER BY created_at DESC;

-- 3. Check customer_details structure
DESCRIBE customer_details;

-- 4. Check sample customer_details data
SELECT 
    customerid,
    name,
    surname,
    username,
    email,
    phone,
    profile_pic,
    rating,
    stars
FROM customer_details 
LIMIT 5;

-- 5. Check which passenger_ids from rideshare_requests exist in customer_details
SELECT 
    r.request_id,
    r.passenger_id,
    CASE 
        WHEN cd.customerid IS NOT NULL THEN 'Found'
        ELSE 'Missing'
    END as customer_status,
    cd.name,
    cd.username,
    cd.rating
FROM rideshare_requests r
LEFT JOIN customer_details cd ON (cd.customerid = r.passenger_id OR cd.customerid = CAST(r.passenger_id AS CHAR))
ORDER BY r.request_id;

-- 6. Count problematic records (passenger_id = 0 or NULL)
SELECT 
    COUNT(CASE WHEN passenger_id = '0' OR passenger_id IS NULL OR passenger_id = '' THEN 1 END) as anonymous_requests,
    COUNT(CASE WHEN passenger_id != '0' AND passenger_id IS NOT NULL AND passenger_id != '' THEN 1 END) as valid_requests,
    COUNT(*) as total_requests
FROM rideshare_requests;

-- 7. Test the API endpoint manually (run this in backend)
-- This would be: GET /customerdetails/{passenger_id}

-- 8. Check if there are any existing passenger profile fields
SHOW COLUMNS FROM rideshare_requests LIKE 'passenger_%';
