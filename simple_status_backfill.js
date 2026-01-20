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

// Simple Status-Based Customer Statistics Backfill Script
// This script calculates historical data using separate queries for each status

async function backfillStatusBasedData() {
  console.log("🔄 Starting simple status-based data backfill...");
  
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
        
        // Get private ride stats
        const privateStats = await queryPromise(`
          SELECT 
            COUNT(*) as total_trips,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'Trip Ended' THEN 1 ELSE 0 END) as trip_ended,
            SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
            SUM(CASE WHEN status = 'New Order' THEN 1 ELSE 0 END) as new_order,
            SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'Just In' THEN 1 ELSE 0 END) as just_in,
            SUM(CASE WHEN status = 'Counter Offer' THEN 1 ELSE 0 END) as counter_offer,
            SUM(CASE WHEN status = 'Waiting Payment' THEN 1 ELSE 0 END) as waiting_payment,
            SUM(CASE WHEN status = 'In-Transit' THEN 1 ELSE 0 END) as in_transit,
            SUM(CASE WHEN status IN ('Completed', 'Trip Ended') THEN delivery_cost_proposed ELSE 0 END) as total_spend,
            MAX(CASE WHEN status IN ('Completed', 'Trip Ended') THEN request_start_datetime END) as last_trip_date,
            SUM(CASE WHEN driver_stars > 0 THEN 1 ELSE 0 END) as total_ratings,
            AVG(CASE WHEN driver_stars > 0 THEN driver_stars END) as avg_rating
          FROM trip 
          WHERE cust_id = ?
        `, [customerId]);
        
        // Get rideshare passenger stats
        const rideshareStats = await queryPromise(`
          SELECT 
            COUNT(*) as total_requests,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
            SUM(CASE WHEN status = 'Created Shared Ride Request' THEN 1 ELSE 0 END) as created,
            SUM(CASE WHEN status = 'Completed' THEN COALESCE(offer_amount, 0) ELSE 0 END) as total_spend,
            MAX(CASE WHEN status = 'Completed' THEN created_at END) as last_trip_date
          FROM rideshare_requests 
          WHERE passenger_id = ?
        `, [customerId]);
        
        // Get rideshare driver stats
        const driverStats = await queryPromise(`
          SELECT 
            COUNT(*) as total_trips,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
            SUM(CASE WHEN status = 'Created Shared Ride Request' THEN 1 ELSE 0 END) as created,
            MAX(CASE WHEN status = 'Completed' THEN created_at END) as last_trip_date
          FROM rideshare_trips 
          WHERE driver_id = ?
        `, [customerId]);
        
        const private = privateStats[0];
        const rideshare = rideshareStats[0];
        const driver = driverStats[0];
        
        // Calculate averages
        const avgSpend = (private.completed + private.trip_ended) > 0 ? private.total_spend / (private.completed + private.trip_ended) : null;
        const avgRideshareSpend = rideshare.completed > 0 ? rideshare.total_spend / rideshare.completed : null;
        
        // Update customer with all stats
        await queryPromise(`
          UPDATE customer_details SET 
            private_completed_trips = ?,
            private_trip_ended_trips = ?,
            private_cancelled_trips = ?,
            private_new_order_trips = ?,
            private_pending_trips = ?,
            private_just_in_trips = ?,
            private_counter_offer_trips = ?,
            private_waiting_payment_trips = ?,
            private_in_transit_trips = ?,
            private_total_spend = ?,
            private_average_spend = ?,
            private_last_trip_date = ?,
            private_total_ratings_received = ?,
            private_average_rating_received = ?,
            
            rideshare_completed_requests = ?,
            rideshare_cancelled_requests = ?,
            rideshare_created_shared_ride_requests = ?,
            rideshare_total_spend = ?,
            rideshare_average_spend = ?,
            rideshare_last_trip_date = ?,
            rideshare_total_ratings_received = 0,
            rideshare_average_rating_received = 0
          WHERE customerid = ?
        `, [
          private.completed || 0,
          private.trip_ended || 0,
          private.cancelled || 0,
          private.new_order || 0,
          private.pending || 0,
          private.just_in || 0,
          private.counter_offer || 0,
          private.waiting_payment || 0,
          private.in_transit || 0,
          private.total_spend || 0,
          avgSpend,
          private.last_trip_date || null,
          private.total_ratings || 0,
          private.avg_rating || 0,
          
          rideshare.completed || 0,
          rideshare.cancelled || 0,
          rideshare.created || 0,
          rideshare.total_spend || 0,
          avgRideshareSpend,
          rideshare.last_trip_date || null,
          
          customerId
        ]);
        
        console.log(`✅ Updated customer ${customerId}:`);
        console.log(`   🚗 Private: ${private.completed} completed, ${private.trip_ended} trip ended, ${private.cancelled} cancelled`);
        console.log(`   💰 Private spend: $${private.total_spend}, Avg: $${avgSpend}`);
        console.log(`   🚌 Rideshare: ${rideshare.completed} completed, ${rideshare.cancelled} cancelled`);
        console.log(`   💰 Rideshare spend: $${rideshare.total_spend}, Avg: $${avgRideshareSpend}`);
        console.log(`   👨‍✈️  Driver: ${driver.completed} completed, ${driver.cancelled} cancelled`);
        
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
