-- Update negotiation status constraint to allow 'Counter Offer' status
-- This allows proper tracking of negotiation flow with offer_type field

-- First, drop the existing constraint
ALTER TABLE rideshare_negotiation_history 
DROP CONSTRAINT IF EXISTS chk_negotiation_status_valid;

-- Add the updated constraint with 'Counter Offer' included
ALTER TABLE rideshare_negotiation_history 
ADD CONSTRAINT chk_negotiation_status_valid 
CHECK (status IN (
  'Pending',           -- Current active offer waiting for response
  'Counter Offer',     -- Previous offer that was responded to
  'Viewed',            -- Offer has been viewed
  'Expired',           -- Pending offer that got no response in 5 minutes
  'Accepted',          -- Offer accepted
  'Rejected',          -- Offer rejected
  'Completed'          -- Negotiation completed
));

-- Verify the constraint was updated
SHOW CREATE TABLE rideshare_negotiation_history;

-- Note: Run add_offer_type_column.sql first to add the offer_type field
-- The offer_type field tracks who sent the offer (driver or passenger) for analytics
