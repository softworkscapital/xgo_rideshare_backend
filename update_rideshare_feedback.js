const pool = require('./cruds/poolfile');

console.log('🔧 Updating Rideshare Feedback Implementation');
console.log('==========================================\n');

// SQL commands to add the new feedback columns
const sqlCommands = `
-- Add consistent feedback columns to rideshare_requests table
ALTER TABLE rideshare_requests 
ADD COLUMN IF NOT EXISTS customer_rates_driver DECIMAL(3,2) DEFAULT NULL COMMENT 'Customer rating for driver (1-5)',
ADD COLUMN IF NOT EXISTS customer_comment_for_driver TEXT DEFAULT NULL COMMENT 'Customer comment about driver',
ADD COLUMN IF NOT EXISTS driver_rates_customer DECIMAL(3,2) DEFAULT NULL COMMENT 'Driver rating for customer (1-5)',
ADD COLUMN IF NOT EXISTS driver_comment_for_customer TEXT DEFAULT NULL COMMENT 'Driver comment about customer',
ADD COLUMN IF NOT EXISTS customer_feedback_date TIMESTAMP NULL DEFAULT NULL COMMENT 'When customer gave feedback',
ADD COLUMN IF NOT EXISTS driver_feedback_date TIMESTAMP NULL DEFAULT NULL COMMENT 'When driver gave feedback';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rideshare_requests_customer_rates_driver ON rideshare_requests(customer_rates_driver);
CREATE INDEX IF NOT EXISTS idx_rideshare_requests_driver_rates_customer ON rideshare_requests(driver_rates_customer);
CREATE INDEX IF NOT EXISTS idx_rideshare_requests_customer_feedback_date ON rideshare_requests(customer_feedback_date);
CREATE INDEX IF NOT EXISTS idx_rideshare_requests_driver_feedback_date ON rideshare_requests(driver_feedback_date);
`;

console.log('📋 SQL Commands to Execute:');
console.log(sqlCommands);
console.log('\n✅ Copy and run these SQL commands in your database');
console.log('\n🎯 New Field Names:');
console.log('  - customer_rates_driver (Customer rating for driver)');
console.log('  - customer_comment_for_driver (Customer comment about driver)');
console.log('  - driver_rates_customer (Driver rating for customer)');
console.log('  - driver_comment_for_customer (Driver comment about customer)');
console.log('  - customer_feedback_date (When customer gave feedback)');
console.log('  - driver_feedback_date (When driver gave feedback)');

console.log('\n📊 Example Usage:');
console.log('  Customer gives feedback:');
console.log('  UPDATE rideshare_requests');
console.log('  SET customer_rates_driver = 5.0,');
console.log('      customer_comment_for_driver = "Great driver!",');
console.log('      customer_feedback_date = NOW()');
console.log('  WHERE request_id = 123;');
console.log('');
console.log('  Driver gives feedback:');
console.log('  UPDATE rideshare_requests');
console.log('  SET driver_rates_customer = 4.5,');
console.log('      driver_comment_for_customer = "Good passenger",');
console.log('      driver_feedback_date = NOW()');
console.log('  WHERE request_id = 123;');

console.log('\n🚀 After running SQL, update the backend code to use new field names!');
