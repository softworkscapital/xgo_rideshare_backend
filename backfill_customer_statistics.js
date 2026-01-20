require("dotenv").config();
const pool = require("./cruds/poolfile");
const CustomerDbOperations = require("./cruds/customer_details");

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

// Backfill Customer Trip Statistics Script
// This script calculates historical data from both private and rideshare trips and updates customer_details

async function backfillCustomerStatistics() {
  console.log("🔄 Starting customer statistics backfill (Private + Rideshare)...");
  
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
            COUNT(*) as private_total_trips,
            SUM(CASE WHEN status IN ('Completed', 'Trip Ended', 'TripEnded') THEN 1 ELSE 0 END) as private_completed_trips,
            SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as private_cancelled_trips,
            SUM(CASE WHEN status IN ('Completed', 'Trip Ended', 'TripEnded') THEN delivery_cost_proposed ELSE 0 END) as private_total_spend,
            AVG(CASE WHEN status IN ('Completed', 'Trip Ended', 'TripEnded') THEN delivery_cost_proposed END) as private_avg_spend,
            MAX(CASE WHEN status IN ('Completed', 'Trip Ended', 'TripEnded') THEN request_start_datetime END) as private_last_trip_date,
            SUM(CASE WHEN driver_stars > 0 THEN 1 ELSE 0 END) as private_total_ratings_given,
            AVG(CASE WHEN driver_stars > 0 THEN driver_stars END) as private_average_rating_given
          FROM trip 
          WHERE cust_id = ?
        `, [customerId]);
        
        // Get RIDESHARE historical data for this customer (as passenger) - simplified without ratings
        const rideshareData = await queryPromise(`
          SELECT 
            COUNT(*) as rideshare_total_requests,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as rideshare_completed_trips,
            SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as rideshare_cancelled_requests,
            SUM(CASE WHEN status = 'Completed' THEN COALESCE(offer_amount, 0) ELSE 0 END) as rideshare_total_spend,
            AVG(CASE WHEN status = 'Completed' THEN COALESCE(offer_amount, 0) END) as rideshare_avg_spend,
            MAX(CASE WHEN status = 'Completed' THEN created_at END) as rideshare_last_trip_date
          FROM rideshare_requests 
          WHERE passenger_id = ?
        `, [customerId]);
        
        // Get RIDESHARE data as driver (if customer is also a driver)
        const rideshareDriverData = await queryPromise(`
          SELECT 
            COUNT(*) as rideshare_as_driver_trips,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as rideshare_driver_completed_trips,
            SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as rideshare_driver_cancelled_trips,
            SUM(CASE WHEN status = 'Completed' THEN COALESCE(revenue, 0) ELSE 0 END) as rideshare_driver_earnings,
            AVG(CASE WHEN status = 'Completed' THEN COALESCE(revenue, 0) END) as rideshare_driver_avg_earnings,
            MAX(CASE WHEN status = 'Completed' THEN created_at END) as rideshare_driver_last_trip_date
          FROM rideshare_trips 
          WHERE driver_id = ?
        `, [customerId]);
        
        const privateStats = privateTripData[0];
        const rideshareStats = rideshareData[0];
        const rideshareDriverStats = rideshareDriverData[0];
        
        // Calculate combined totals
        const totalTrips = (privateStats.private_total_trips || 0) + (rideshareStats.rideshare_completed_trips || 0);
        const totalSpend = (privateStats.private_total_spend || 0) + (rideshareStats.rideshare_total_spend || 0);
        const totalCompleted = (privateStats.private_completed_trips || 0) + (rideshareStats.rideshare_completed_trips || 0);
        const totalCancelled = (privateStats.private_cancelled_trips || 0) + (rideshareStats.rideshare_cancelled_requests || 0);
        const totalRatings = (privateStats.private_total_ratings_given || 0);
        
        const avgRating = totalRatings > 0 ? privateStats.private_average_rating_given || 0 : 0;
        const avgSpend = totalCompleted > 0 ? totalSpend / totalCompleted : 0;
        
        // Determine most recent trip date
        const lastTripDate = [
          privateStats.private_last_trip_date,
          rideshareStats.rideshare_last_trip_date,
          rideshareDriverStats.rideshare_driver_last_trip_date
        ].filter(Boolean).sort().pop() || null;
        
        if (totalTrips > 0) {
          // Update customer_details with comprehensive statistics (simplified without rideshare ratings)
          await queryPromise(`
            UPDATE customer_details SET 
              -- Private Ride Stats
              private_trips_completed = ?,
              private_trips_cancelled = ?,
              private_total_spend = ?,
              private_average_spend_per_trip = ?,
              private_last_trip_date = ?,
              private_total_ratings_given = ?,
              private_average_rating_given = ?,
              
              -- Rideshare Passenger Stats
              rideshare_requests_made = ?,
              rideshare_requests_completed = ?,
              rideshare_requests_cancelled = ?,
              rideshare_total_spend = ?,
              rideshare_average_spend_per_trip = ?,
              rideshare_last_trip_date = ?,
              rideshare_total_ratings_given = 0,
              rideshare_average_rating_given = 0,
              
              -- Rideshare Driver Stats (if applicable)
              rideshare_as_driver_trips = ?,
              rideshare_driver_completed_trips = ?,
              rideshare_driver_cancelled_trips = ?,
              rideshare_driver_earnings = ?,
              rideshare_driver_average_earnings = ?,
              rideshare_driver_last_trip_date = ?,
              
              -- Combined Stats
              trips_completed = ?,
              trips_cancelled = ?,
              total_spend = ?,
              average_spend_per_trip = ?,
              last_trip_date = ?,
              total_ratings_given = ?,
              average_rating_given = ?,
              
              -- Overall counts
              trips_requested = ?
            WHERE customerid = ?
          `, [
            // Private Ride Stats
            privateStats.private_completed_trips || 0,
            privateStats.private_cancelled_trips || 0,
            privateStats.private_total_spend || 0,
            privateStats.private_avg_spend || 0,
            privateStats.private_last_trip_date || null,
            privateStats.private_total_ratings_given || 0,
            privateStats.private_average_rating_given || 0,
            
            // Rideshare Passenger Stats
            rideshareStats.rideshare_total_requests || 0,
            rideshareStats.rideshare_completed_trips || 0,
            rideshareStats.rideshare_cancelled_requests || 0,
            rideshareStats.rideshare_total_spend || 0,
            rideshareStats.rideshare_avg_spend || 0,
            rideshareStats.rideshare_last_trip_date || null,
            
            // Rideshare Driver Stats
            rideshareDriverStats.rideshare_as_driver_trips || 0,
            rideshareDriverStats.rideshare_driver_completed_trips || 0,
            rideshareDriverStats.rideshare_driver_cancelled_trips || 0,
            rideshareDriverStats.rideshare_driver_earnings || 0,
            rideshareDriverStats.rideshare_driver_avg_earnings || 0,
            rideshareDriverStats.rideshare_driver_last_trip_date || null,
            
            // Combined Stats
            totalCompleted,
            totalCancelled,
            totalSpend,
            avgSpend,
            lastTripDate,
            totalRatings,
            avgRating,
            
            // Overall counts
            totalTrips,
            
            customerId
          ]);
          
          console.log(`✅ Updated customer ${customerId}:`);
          console.log(`   🚗 Private: ${privateStats.private_completed_trips} completed, $${privateStats.private_total_spend} spend`);
          console.log(`   🚌 Rideshare: ${rideshareStats.rideshare_completed_trips} completed, $${rideshareStats.rideshare_total_spend} spend`);
          if (rideshareDriverStats.rideshare_as_driver_trips > 0) {
            console.log(`   👨‍✈️  As Driver: ${rideshareDriverStats.rideshare_driver_completed_trips} completed, $${rideshareDriverStats.rideshare_driver_earnings} earnings`);
          }
          console.log(`   📊 Combined: ${totalCompleted} completed, $${totalSpend} total spend`);
          
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
      console.log("🎉 Backfill completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Backfill failed:", error);
      process.exit(1);
    });
}

module.exports = { backfillCustomerStatistics };
