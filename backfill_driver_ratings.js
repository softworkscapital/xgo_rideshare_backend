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

// Driver Rating Backfill Script
// This script calculates historical driver ratings and populates the new rating fields

async function backfillDriverRatings() {
  console.log("🔄 Starting driver ratings backfill...");
  
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
        
        // Get private trip ratings given by driver to customers
        const privateRatingsGiven = await queryPromise(`
          SELECT 
            COUNT(*) as total_ratings,
            AVG(customer_stars) as average_rating
          FROM trip 
          WHERE driver_id = ? AND customer_stars > 0
        `, [driverId]);
        
        // Get rideshare ratings given by driver to customers
        const rideshareRatingsGiven = await queryPromise(`
          SELECT 
            COUNT(*) as total_ratings,
            AVG(customer_stars) as average_rating
          FROM rideshare_trips 
          WHERE driver_id = ? AND customer_stars > 0
        `, [driverId]);
        
        // Get private trip ratings received by customers from driver
        const privateRatingsReceived = await queryPromise(`
          SELECT 
            COUNT(*) as total_ratings,
            AVG(driver_stars) as average_rating
          FROM trip 
          WHERE driver_id = ? AND driver_stars > 0
        `, [driverId]);
        
        // Get rideshare ratings received by customers from driver
        const rideshareRatingsReceived = await queryPromise(`
          SELECT 
            COUNT(*) as total_ratings,
            AVG(driver_stars) as average_rating
          FROM rideshare_requests 
          WHERE driver_id = ? AND driver_stars > 0
        `, [driverId]);
        
        // Update driver with ratings data
        await queryPromise(`
          UPDATE driver_details SET 
            -- Ratings given BY driver TO customers
            driver_private_ratings_given = ?,
            driver_private_average_rating_given = ?,
            driver_rideshare_ratings_given = ?,
            driver_rideshare_average_rating_given = ?,
            
            -- Ratings received BY customers FROM driver
            driver_private_ratings_received = ?,
            driver_private_average_rating_received = ?,
            driver_rideshare_ratings_received = ?,
            driver_rideshare_average_rating_received = ?
          WHERE driver_id = ?
        `, [
          privateRatingsGiven[0].total_ratings || 0,
          privateRatingsGiven[0].average_rating || 0,
          rideshareRatingsGiven[0].total_ratings || 0,
          rideshareRatingsGiven[0].average_rating || 0,
          
          privateRatingsReceived[0].total_ratings || 0,
          privateRatingsReceived[0].average_rating || 0,
          rideshareRatingsReceived[0].total_ratings || 0,
          rideshareRatingsReceived[0].average_rating || 0,
          
          driverId
        ]);
        
        console.log(`✅ Updated driver ${driverId}:`);
        console.log(`   🌟️ Private ratings given: ${privateRatingsGiven[0].total_ratings || 0} (avg: ${(privateRatingsGiven[0].average_rating || 0).toFixed(1)})`);
        console.log(`   🚌 Rideshare ratings given: ${rideshareRatingsGiven[0].total_ratings || 0} (avg: ${(rideshareRatingsGiven[0].average_rating || 0).toFixed(1)})`);
        console.log(`   ⭐ Private ratings received: ${privateRatingsReceived[0].total_ratings || 0} (avg: ${(privateRatingsReceived[0].average_rating || 0).toFixed(1)})`);
        console.log(`   🌟️ Rideshare ratings received: ${rideshareRatingsReceived[0].total_ratings || 0} (avg: ${(rideshareRatingsReceived[0].average_rating || 0).toFixed(1)})`);
        
        processedCount++;
        
      } catch (driverError) {
        console.error(`❌ Error processing driver ${driver.driver_id}:`, driverError.message);
        errorCount++;
      }
    }
    
    console.log(`\n📈 Driver Rating Backfill Summary:`);
    console.log(`✅ Successfully processed: ${processedCount} drivers`);
    console.log(`❌ Errors: ${errorCount} drivers`);
    
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
      console.log("💡 Driver details table now has correct rating tracking");
      console.log("📊 Historical driver ratings have been backfilled from trip tables");
      console.log("🔍 You can now track both driver and customer rating perspectives");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Driver rating backfill failed:", error);
      process.exit(1);
    });
}

module.exports = { backfillDriverRatings };
