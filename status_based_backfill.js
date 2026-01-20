require("dotenv").config();
const pool = require("./cruds/poolfile");

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

// Status-Based Customer Statistics Backfill Script
// This script calculates historical data using actual status values and updates customer_details

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
            private_average_spend = CASE 
              WHEN ((SELECT COUNT(*) FROM trip WHERE cust_id = ? AND status IN ('Completed', 'Trip Ended')) > 0)
              THEN (SELECT COALESCE(SUM(delivery_cost_proposed), 0) FROM trip WHERE cust_id = ? AND status IN ('Completed', 'Trip Ended')) / (SELECT COUNT(*) FROM trip WHERE cust_id = ? AND status IN ('Completed', 'Trip Ended'))
              ELSE NULL 
            END,
            private_last_trip_date = (SELECT MAX(request_start_datetime) FROM trip WHERE cust_id = ? AND status IN ('Completed', 'Trip Ended')),
            private_total_ratings_given = (SELECT COUNT(*) FROM trip WHERE cust_id = ? AND driver_stars > 0),
            private_average_rating_given = (SELECT COALESCE(AVG(driver_stars), 0) FROM trip WHERE cust_id = ? AND driver_stars > 0),
            
            -- Rideshare Passenger Status Counts
            rideshare_completed_requests = (SELECT COUNT(*) FROM rideshare_requests WHERE passenger_id = ? AND status = 'Completed'),
            rideshare_cancelled_requests = (SELECT COUNT(*) FROM rideshare_requests WHERE passenger_id = ? AND status = 'Cancelled'),
            rideshare_created_shared_ride_requests = (SELECT COUNT(*) FROM rideshare_requests WHERE passenger_id = ? AND status = 'Created Shared Ride Request'),
            
            -- Rideshare Passenger Financials
            rideshare_total_spend = (SELECT COALESCE(SUM(offer_amount), 0) FROM rideshare_requests WHERE passenger_id = ? AND status = 'Completed'),
            rideshare_average_spend = CASE 
              WHEN ((SELECT COUNT(*) FROM rideshare_requests WHERE passenger_id = ? AND status = 'Completed') > 0)
              THEN (SELECT COALESCE(SUM(offer_amount), 0) FROM rideshare_requests WHERE passenger_id = ? AND status = 'Completed') / (SELECT COUNT(*) FROM rideshare_requests WHERE passenger_id = ? AND status = 'Completed')
              ELSE NULL 
            END,
            rideshare_last_trip_date = (SELECT MAX(created_at) FROM rideshare_requests WHERE passenger_id = ? AND status = 'Completed'),
            rideshare_total_ratings_given = 0,
            rideshare_average_rating_given = 0,
            
            -- Rideshare Driver Status Counts
            rideshare_driver_created_shared_ride_requests = (SELECT COUNT(*) FROM rideshare_trips WHERE driver_id = ? AND status = 'Created Shared Ride Request'),
            rideshare_driver_completed_trips = (SELECT COUNT(*) FROM rideshare_trips WHERE driver_id = ? AND status = 'Completed'),
            rideshare_driver_cancelled_trips = (SELECT COUNT(*) FROM rideshare_trips WHERE driver_id = ? AND status = 'Cancelled'),
            
            -- Rideshare Driver Financials
            rideshare_driver_earnings = 0,
            rideshare_driver_average_earnings = NULL,
            rideshare_driver_last_trip_date = (SELECT MAX(created_at) FROM rideshare_trips WHERE driver_id = ? AND status = 'Completed')
          WHERE customerid = ?
        `, [customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId, customerId]);
        
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

// Run the backfill
if (require.main === module) {
  backfillStatusBasedData()
    .then(() => {
      console.log("🎉 Status-based customer statistics backfill completed successfully!");
      console.log("💡 Customer details table now has status-based tracking");
      console.log("📊 Historical data has been backfilled from trip tables");
      console.log("🔍 You can now track exact status values for analytics");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Backfill failed:", error);
      process.exit(1);
    });
}

module.exports = { backfillStatusBasedData };
