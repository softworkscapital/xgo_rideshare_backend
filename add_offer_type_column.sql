-- Add offer_type column to rideshare_negotiation_history table
-- This tracks who sent the offer (driver or passenger) for analytics without requiring joins

-- Add the offer_type column
ALTER TABLE rideshare_negotiation_history 
ADD COLUMN offer_type ENUM('driver', 'passenger') NOT NULL DEFAULT 'passenger'
AFTER passenger_id;

-- Update existing records based on driver_id and passenger_id
UPDATE rideshare_negotiation_history 
SET offer_type = CASE 
  WHEN driver_id IS NOT NULL AND passenger_id = 0 THEN 'driver'
  WHEN passenger_id IS NOT NULL AND passenger_id != 0 THEN 'passenger'
  ELSE 'passenger'
END;

-- Verify the update
SELECT id, request_id, driver_id, passenger_id, offer_type, offer_amount, status, created_at 
FROM rideshare_negotiation_history 
ORDER BY created_at DESC 
LIMIT 20;
