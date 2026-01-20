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

// Minimal Driver Analytics Backfill Script
// This script will initialize all driver analytics fields to 0

async function backfillDriverAnalytics() {
  console.log("🔄 Starting minimal driver analytics backfill...");
  
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
        console.log(`\n🔍 Initializing driver: ${driverId}`);
        
        // Initialize all analytics fields to 0
        await queryPromise(
          `UPDATE driver_details SET 
            -- Private Trip Statistics
            driver_private_new_order_trips = 0,
            driver_private_pending_trips = 0,
            driver_private_accepted_trips = 0,
            driver_private_in_transit_trips = 0,
            driver_private_completed_trips = 0,
            driver_private_trip_ended_trips = 0,
            driver_private_cancelled_trips = 0,
            driver_private_counter_offer_trips = 0,
            driver_private_just_in_trips = 0,
            driver_private_waiting_payment_trips = 0,
            
            -- Rideshare Statistics
            driver_rideshare_created_shared_ride_requests = 0,
            driver_rideshare_in_transit_trips = 0,
            driver_rideshare_completed_trips = 0,
            driver_rideshare_cancelled_trips = 0,
            
            -- Earnings Analytics
            driver_private_total_earnings = 0.00,
            driver_private_average_earnings_per_trip = 0.00,
            driver_private_last_earning_date = NULL,
            driver_rideshare_total_earnings = 0.00,
            driver_rideshare_average_earnings_per_trip = 0.00,
            driver_rideshare_last_earning_date = NULL,
            driver_total_earnings = 0.00,
            driver_average_earnings_per_trip = 0.00,
            driver_last_earning_date = NULL,
            
            -- Performance Metrics
            driver_completion_rate = 0.00,
            driver_average_trip_duration_minutes = 0.00,
            driver_total_distance_km = 0.00,
            driver_average_distance_per_trip = 0.00,
            driver_peak_hours_trips = 0,
            driver_off_peak_hours_trips = 0,
            
            -- Activity Metrics
            driver_days_active = 0,
            driver_last_active_date = NULL,
            driver_average_trips_per_day = 0.00,
            driver_longest_streak_days = 0,
            driver_current_streak_days = 0
           WHERE driver_id = ?`,
          [driverId]
        );
        
        console.log(`✅ Driver ${driverId} initialized successfully`);
        processedCount++;
        
      } catch (driverError) {
        console.error(`❌ Error processing driver ${driver.driver_id}:`, driverError.message);
        errorCount++;
      }
    }
    
    console.log(`\n📈 Driver Analytics Backfill Summary:`);
    console.log(`✅ Successfully processed: ${processedCount} drivers`);
    console.log(`❌ Errors: ${errorCount} drivers`);
    console.log(`\n🎉 Driver analytics initialization completed successfully!`);
    console.log(`📊 All driver analytics fields are now initialized to 0`);
    console.log(`🚀 Ready for real-time updates via API endpoints`);
    
  } catch (error) {
    console.error("💥 Driver analytics backfill failed:", error);
    throw error;
  }
}

// Run the backfill
if (require.main === module) {
  backfillDriverAnalytics()
    .then(() => {
      console.log("🎉 Driver analytics backfill completed successfully!");
      console.log("📊 All driver analytics fields are now initialized");
      console.log("💰 Earnings set to 0 - will be updated via real-time API calls");
      console.log("🚀 Ready for real-time updates via API endpoints");
      console.log("\n📋 Available API Endpoints:");
      console.log("   PUT /driver/{id}/private_trip_status - Update private trip status");
      console.log("   PUT /driver/{id}/rideshare_trip_status - Update rideshare trip status");
      console.log("   PUT /driver/{id}/earnings - Update earnings");
      console.log("   GET /driver/{id}/comprehensive_stats - Get complete analytics");
      console.log("   GET /driver/{id}/earnings_summary - Get earnings breakdown");
      console.log("   GET /driver/{id}/performance_summary - Get performance metrics");
      console.log("   GET /driver/{id}/activity_summary - Get activity metrics");
      console.log("\n💡 Note: Analytics will be populated when trips are completed and updated via API");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Driver analytics backfill failed:", error);
      process.exit(1);
    });
}

module.exports = { backfillDriverAnalytics };
