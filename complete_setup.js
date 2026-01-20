#!/usr/bin/env node

/**
 * Complete Customer Statistics Setup
 * This script adds status-based fields and backfills historical data
 * 
 * Usage: node complete_setup.js
 */

const pool = require('./cruds/poolfile');
const fs = require('fs');
const path = require('path');

// SQL statements for status-based fields
const statusBasedSQL = `
-- PRIVATE RIDE STATUS-BASED FIELDS (using actual database statuses)
ALTER TABLE customer_details 
ADD COLUMN IF NOT EXISTS private_completed_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_trip_ended_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_cancelled_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_new_order_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_pending_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_just_in_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_counter_offer_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_waiting_payment_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_in_transit_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_total_spend DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS private_last_trip_date DATETIME NULL,
ADD COLUMN IF NOT EXISTS private_total_ratings_given INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS private_average_rating_given DECIMAL(3,2) DEFAULT 0.00;

-- RIDESHARE STATUS-BASED FIELDS (using actual database statuses)
ALTER TABLE customer_details 
ADD COLUMN IF NOT EXISTS rideshare_completed_requests INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_cancelled_requests INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_created_shared_ride_requests INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_total_spend DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rideshare_last_trip_date DATETIME NULL,
ADD COLUMN IF NOT EXISTS rideshare_total_ratings_given INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_average_rating_given DECIMAL(3,2) DEFAULT 0.00;

-- RIDESHARE DRIVER STATUS-BASED FIELDS (using actual database statuses)
ALTER TABLE customer_details 
ADD COLUMN IF NOT EXISTS rideshare_driver_created_shared_ride_requests INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_driver_completed_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_driver_cancelled_trips INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rideshare_driver_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rideshare_driver_last_trip_date DATETIME NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_private_stats ON customer_details(customerid, private_completed_trips, private_total_spend);
CREATE INDEX IF NOT EXISTS idx_customer_rideshare_stats ON customer_details(customerid, rideshare_completed_requests, rideshare_total_spend);
CREATE INDEX IF NOT EXISTS idx_customer_driver_stats ON customer_details(customerid, rideshare_driver_completed_trips, rideshare_driver_earnings);
`;

// Helper function to promisify pool queries
const queryPromise = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// Step 1: Execute SQL to add fields
async function addStatusBasedFields() {
  console.log("🔧 Adding status-based fields to customer_details table...");
  
  return new Promise((resolve, reject) => {
    const statements = statusBasedSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let executedCount = 0;
    
    const executeNext = () => {
      if (executedCount >= statements.length) {
        console.log("✅ All status-based fields added successfully!");
        resolve();
        return;
      }
      
      const statement = statements[executedCount];
      if (statement.trim()) {
        pool.query(statement, (error, results) => {
          if (error) {
            console.error(`❌ Error executing statement ${executedCount + 1}:`, error.message);
          } else {
            console.log(`✅ Executed statement ${executedCount + 1}/${statements.length}`);
          }
          executedCount++;
          executeNext();
        });
      } else {
        executedCount++;
        executeNext();
      }
    };
    
    executeNext();
  });
}

// Step 2: Backfill historical data
async function backfillStatusBasedData() {
  console.log("🔄 Starting status-based data backfill...");
  
  try {
    // Get all customers
    const customers = await queryPromise(
      "SELECT customerid FROM customer_details"
    );
    
    console.log(`📊 Found ${customers.length} customers to process`);
    
    let processedCount = 0;
    let errorCount = 0;
    
    for (const customer of customers) {
      try {
        const customerId = customer.customerid;
        
        // Update customer with status-based data
        await queryPromise(`
          UPDATE customer_details SET 
            -- Private Ride Status Counts
            private_completed_trips = (SELECT COUNT(*) FROM trip WHERE cust_id = ? AND status = 'Completed'),
            private_trip_ended_trips = (SELECT COUNT(*) FROM trip WHERE cust_id = ? AND status = 'Trip Ended'),
            private_cancelled_trips = (SELECT COUNT(*) FROM trip WHERE cust_id = ? AND status = 'Cancelled'),
            private_new_order_trips = (SELECT COUNT(*) FROM trip WHERE cust_id = ? AND status = 'New Order'),
            private_pending_trips = (SELECT COUNT(*) FROM trip WHERE cust_id = ? AND status = 'Pending'),
            private_just_in_trips = (SELECT COUNT(*) FROM trip WHERE cust_id = ? AND status = 'Just In'),
            private_counter_offer_trips = (SELECT COUNT(*) FROM trip WHERE cust_id = ? AND status = 'Counter Offer'),
            private_waiting_payment_trips = (SELECT COUNT(*) FROM trip WHERE cust_id = ? AND status = 'Waiting Payment'),
            private_in_transit_trips = (SELECT COUNT(*) FROM trip WHERE cust_id = ? AND status = 'In-Transit'),
            
            -- Private Ride Financials
            private_total_spend = (SELECT COALESCE(SUM(delivery_cost_proposed), 0) FROM trip WHERE cust_id = ? AND status IN ('Completed', 'Trip Ended')),
            private_last_trip_date = (SELECT MAX(request_start_datetime) FROM trip WHERE cust_id = ? AND status IN ('Completed', 'Trip Ended')),
            private_total_ratings_given = (SELECT COUNT(*) FROM trip WHERE cust_id = ? AND driver_stars > 0),
            private_average_rating_given = (SELECT COALESCE(AVG(driver_stars), 0) FROM trip WHERE cust_id = ? AND driver_stars > 0),
            
            -- Rideshare Passenger Status Counts
            rideshare_completed_requests = (SELECT COUNT(*) FROM rideshare_requests WHERE passenger_id = ? AND status = 'Completed'),
            rideshare_cancelled_requests = (SELECT COUNT(*) FROM rideshare_requests WHERE passenger_id = ? AND status = 'Cancelled'),
            rideshare_created_shared_ride_requests = (SELECT COUNT(*) FROM rideshare_requests WHERE passenger_id = ? AND status = 'Created Shared Ride Request'),
            
            -- Rideshare Passenger Financials
            rideshare_total_spend = (SELECT COALESCE(SUM(offer_amount), 0) FROM rideshare_requests WHERE passenger_id = ? AND status = 'Completed'),
            rideshare_last_trip_date = (SELECT MAX(created_at) FROM rideshare_requests WHERE passenger_id = ? AND status = 'Completed'),
            
            -- Rideshare Driver Status Counts
            rideshare_driver_created_shared_ride_requests = (SELECT COUNT(*) FROM rideshare_trips WHERE driver_id = ? AND status = 'Created Shared Ride Request'),
            rideshare_driver_completed_trips = (SELECT COUNT(*) FROM rideshare_trips WHERE driver_id = ? AND status = 'Completed'),
            rideshare_driver_cancelled_trips = (SELECT COUNT(*) FROM rideshare_trips WHERE driver_id = ? AND status = 'Cancelled'),
            
            -- Rideshare Driver Financials
            rideshare_driver_earnings = (SELECT COALESCE(SUM(revenue), 0) FROM rideshare_trips WHERE driver_id = ? AND status = 'Completed'),
            rideshare_driver_last_trip_date = (SELECT MAX(created_at) FROM rideshare_trips WHERE driver_id = ? AND status = 'Completed')
          WHERE customerid = ?
        `, [customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId]);
        
        console.log(`✅ Updated customer ${customerId}`);
        processedCount++;
        
      } catch (customerError) {
        console.error(`❌ Error processing customer ${customer.customerid}:`, customerError.message);
        errorCount++;
      }
    }
    
    console.log(`\n📈 Backfill Summary:`);
    console.log(`✅ Successfully processed: ${processedCount} customers`);
    console.log(`❌ Errors: ${errorCount} customers`);
    
  } catch (error) {
    console.error("💥 Backfill failed:", error);
    throw error;
  }
}

// Main execution function
async function runCompleteSetup() {
  console.log("🚀 Starting Complete Customer Statistics Setup");
  console.log("================================================");
  
  try {
    // Step 1: Add status-based fields
    await addStatusBasedFields();
    
    // Step 2: Backfill historical data
    await backfillStatusBasedData();
    
    console.log("\n🎉 Complete Customer Statistics Setup Finished!");
    console.log("💡 Customer details table now has status-based tracking");
    console.log("📊 Historical data has been backfilled from trip tables");
    console.log("🔍 You can now track exact status values for analytics");
    
  } catch (error) {
    console.error("\n💥 Setup failed:", error.message);
    process.exit(1);
  }
}

// Run the complete setup
runCompleteSetup();
