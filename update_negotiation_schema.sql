-- Add viewed_at timestamp to negotiations table
ALTER TABLE rideshare_negotiation_history 
ADD COLUMN viewed_at TIMESTAMP NULL DEFAULT NULL COMMENT 'When the driver viewed this bid';

-- Add index for expiration checks
CREATE INDEX idx_negotiation_viewed_at ON rideshare_negotiation_history(viewed_at);

-- Update existing records to have proper status
UPDATE rideshare_negotiation_history 
SET status = CASE 
  WHEN status = '' OR status IS NULL THEN 'Pending'
  ELSE status 
END;

-- Add constraint to prevent invalid statuses
ALTER TABLE rideshare_negotiation_history 
ADD CONSTRAINT chk_negotiation_status_valid 
CHECK (status IN ('Pending', 'Viewed', 'Expired', 'Accepted', 'Rejected', 'Completed'));
