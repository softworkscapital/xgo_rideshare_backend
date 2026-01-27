-- Add constraint to prevent empty status in rideshare_requests
ALTER TABLE rideshare_requests 
ADD CONSTRAINT chk_status_not_empty 
CHECK (status IS NOT NULL AND status != '' AND status != ' ');

-- Update any existing empty/null status records to 'Expired'
UPDATE rideshare_requests 
SET status = 'Expired' 
WHERE status IS NULL OR status = '' OR status = ' ';

-- Add constraint to prevent empty status in rideshare_negotiation_history
ALTER TABLE rideshare_negotiation_history 
ADD CONSTRAINT chk_negotiation_status_not_empty 
CHECK (status IS NOT NULL AND status != '' AND status != ' ');
