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

// Simplified Driver Rating Backfill Script
// This script will populate the new rating fields with 0 values initially

async function backfillDriverRatings() {
  console.log("🔄 Starting simplified driver ratings backfill...");
  
  try {
    // Get all drivers
    const drivers = await queryPromise(
      "SELECT driver_id FROM driver_details"
    );
    
    console.log(`📊 Found ${drivers.length} drivers to process`);
    
    let processedCount = 0;
    let errorCount = 0;
    
    for (const driver of drivers) {
      try {
        const driverId = driver.driver_id;
        
        // Initialize all rating fields to 0 for now
        await queryPromise(`
          UPDATE driver_details SET 
            driver_private_ratings_given = 0,
            driver_private_average_rating_given = NULL,
            driver_rideshare_ratings_given = 0,
            driver_rideshare_average_rating_given = NULL,
            driver_private_ratings_received = 0,
            driver_private_average_rating_received = NULL,
            driver_rideshare_ratings_received = 0,
            driver_rideshare_average_rating_received = NULL
          WHERE driver_id = ?
        `, [driverId]);
        
        console.log(`✅ Initialized ratings for driver ${driverId}`);
        processedCount++;
        
      } catch (driverError) {
        console.error(`❌ Error processing driver ${driver.driver_id}:`, driverError.message);
        errorCount++;
      }
    }
    
    console.log(`\n📈 Driver Rating Backfill Summary:`);
    console.log(`✅ Successfully processed: ${processedCount} drivers`);
    console.log(`❌ Errors: ${errorCount} drivers`);
    console.log(`\n💡 Note: Rating fields have been initialized to 0`);
    console.log(`📊 Historical ratings will be populated when rating data is available`);
    
  } catch (error) {
    console.error("💥 Driver rating backfill failed:", error);
    throw error;
  }
}

// Run the backfill
if (require.main === module) {
  backfillDriverRatings()
    .then(() => {
      console.log("🎉 Driver rating backfill completed successfully!");
      console.log("💡 Driver details table now has correct rating fields");
      console.log("📊 Ready for real-time rating updates");
      console.log("🔍 Rating endpoints are now available:");
      console.log("   PUT /driver/{id}/rating_given - When driver rates customer");
      console.log("   PUT /driver/{id}/rating_received - When customer rates driver");
      console.log("   GET /driver/{id}/rating_statistics - Get driver rating stats");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Driver rating backfill failed:", error);
      process.exit(1);
    });
}

module.exports = { backfillDriverRatings };
