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

// Basic Customer Statistics Backfill Script
// This script calculates historical data from private trips only and updates customer_details

async function backfillCustomerStatistics() {
  console.log("🔄 Starting basic customer statistics backfill (Private Rides Only)...");
  
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
        
        // Get PRIVATE RIDE historical data for this customer
        const privateTripData = await queryPromise(`
          SELECT 
            COUNT(*) as total_trips,
            SUM(CASE WHEN status IN ('Completed', 'Trip Ended', 'TripEnded') THEN 1 ELSE 0 END) as completed_trips,
            SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_trips,
            SUM(CASE WHEN status IN ('Completed', 'Trip Ended', 'TripEnded') THEN delivery_cost_proposed ELSE 0 END) as total_spend,
            AVG(CASE WHEN status IN ('Completed', 'Trip Ended', 'TripEnded') THEN delivery_cost_proposed END) as avg_spend,
            MAX(CASE WHEN status IN ('Completed', 'Trip Ended', 'TripEnded') THEN request_start_datetime END) as last_trip_date,
            SUM(CASE WHEN driver_stars > 0 THEN 1 ELSE 0 END) as total_ratings_given,
            AVG(CASE WHEN driver_stars > 0 THEN driver_stars END) as average_rating_given
          FROM trip 
          WHERE cust_id = ?
        `, [customerId]);
        
        const stats = privateTripData[0];
        
        if (stats.total_trips > 0) {
          // Update customer_details with basic statistics
          await queryPromise(`
            UPDATE customer_details SET 
              trips_completed = ?,
              trips_cancelled = ?,
              total_spend = ?,
              average_spend_per_trip = ?,
              last_trip_date = ?,
              total_ratings_given = ?,
              average_rating_given = ?,
              trips_requested = ?
            WHERE customerid = ?
          `, [
            stats.completed_trips || 0,
            stats.cancelled_trips || 0,
            stats.total_spend || 0,
            stats.avg_spend || 0,
            stats.last_trip_date || null,
            stats.total_ratings_given || 0,
            stats.average_rating_given || 0,
            stats.total_trips || 0,
            customerId
          ]);
          
          console.log(`✅ Updated customer ${customerId}:`);
          console.log(`   🚗 Private: ${stats.completed_trips} completed, ${stats.cancelled_trips} cancelled`);
          console.log(`   💰 Total spend: $${stats.total_spend}, Average: $${stats.avg_spend}`);
          console.log(`   ⭐ Ratings: ${stats.total_ratings_given} given, Avg: ${stats.average_rating_given}`);
          
          processedCount++;
        } else {
          console.log(`⚪ No trips found for customer ${customerId}`);
        }
        
      } catch (customerError) {
        console.error(`❌ Error processing customer ${customer.customerid}:`, customerError.message);
        errorCount++;
      }
    }
    
    console.log(`\n📈 Backfill Summary:`);
    console.log(`✅ Successfully processed: ${processedCount} customers`);
    console.log(`❌ Errors: ${errorCount} customers`);
    console.log(`🏁 Customer statistics backfill completed!`);
    
  } catch (error) {
    console.error("💥 Backfill failed:", error);
    process.exit(1);
  }
}

// Run the backfill
if (require.main === module) {
  backfillCustomerStatistics()
    .then(() => {
      console.log("🎉 Basic customer statistics backfill completed successfully!");
      console.log("💡 Customer details table has been updated with historical private trip data");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Backfill failed:", error);
      process.exit(1);
    });
}

module.exports = { backfillCustomerStatistics };
