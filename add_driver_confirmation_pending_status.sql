-- Add 'Driver Confirmation Pending' status to rideshare_requests table constraint
-- This status is used when passenger accepts driver's counter offer and waits for driver confirmation

-- First, find the current constraint name
SELECT CONSTRAINT_NAME 
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'u349406913_kwaunoda' 
  AND TABLE_NAME = 'rideshare_requests' 
  AND CONSTRAINT_TYPE = 'CHECK'
  AND CONSTRAINT_NAME LIKE '%status%';

-- Drop the existing status constraint
ALTER TABLE rideshare_requests 
DROP CONSTRAINT IF EXISTS chk_status_valid;

-- Add the updated constraint with 'Driver Confirmation Pending' included
ALTER TABLE rideshare_requests 
ADD CONSTRAINT chk_status_valid 
CHECK (status IN (
  'Join Shared Ride Request',
  'Negotiating',
  'Driver Confirmation Pending',  -- NEW: Passenger accepted, waiting for driver
  'Accepted',
  'Rejected',
  'In-Transit',
  'Completed',
  'Cancelled',
  'Expired',
  'Joined'
));

-- Verify the constraint was updated
SHOW CREATE TABLE rideshare_requests;
