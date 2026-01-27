-- Fix existing negotiation records that have incorrect offer_type
-- Records with driver_id should be 'driver', records with passenger_id should be 'passenger'

-- Update records where driver_id is set but offer_type is wrong
UPDATE rideshare_negotiation_history 
SET offer_type = 'driver'
WHERE driver_id IS NOT NULL 
  AND driver_id != '' 
  AND (passenger_id IS NULL OR passenger_id = 0)
  AND offer_type != 'driver';

-- Update records where passenger_id is set but offer_type is wrong
UPDATE rideshare_negotiation_history 
SET offer_type = 'passenger'
WHERE (driver_id IS NULL OR driver_id = '') 
  AND passenger_id IS NOT NULL 
  AND passenger_id != 0
  AND offer_type != 'passenger';

-- Verify the fixes
SELECT id, request_id, driver_id, passenger_id, offer_type, offer_amount, status, created_at 
FROM rideshare_negotiation_history 
ORDER BY created_at DESC 
LIMIT 20;
