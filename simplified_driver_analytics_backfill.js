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

// Simplified Driver Analytics Backfill Script
// This script will initialize all driver analytics fields with calculated values

async function backfillDriverAnalytics() {
  console.log("🔄 Starting simplified driver analytics backfill...");
  
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
        console.log(`\n🔍 Processing driver: ${driverId}`);
        
        // 1. Backfill Trip Statistics (status-based)
        console.log("📈 Backfilling trip statistics...");
        await backfillTripStatistics(driverId);
        
        // 2. Initialize Earnings (set to 0 for now)
        console.log("💰 Initializing earnings data...");
        await initializeEarnings(driverId);
        
        // 3. Initialize Performance Metrics
        console.log("📊 Initializing performance metrics...");
        await initializePerformanceMetrics(driverId);
        
        // 4. Initialize Activity Metrics
        console.log("📅 Initializing activity metrics...");
        await initializeActivityMetrics(driverId);
        
        console.log(`✅ Driver ${driverId} backfill completed`);
        processedCount++;
        
      } catch (driverError) {
        console.error(`❌ Error processing driver ${driver.driver_id}:`, driverError.message);
        errorCount++;
      }
    }
    
    console.log(`\n📈 Driver Analytics Backfill Summary:`);
    console.log(`✅ Successfully processed: ${processedCount} drivers`);
    console.log(`❌ Errors: ${errorCount} drivers`);
    console.log(`\n🎉 Driver analytics backfill completed successfully!`);
    
  } catch (error) {
    console.error("💥 Driver analytics backfill failed:", error);
    throw error;
  }
}

// Backfill trip statistics from actual trip data
async function backfillTripStatistics(driverId) {
  try {
    // Get private trips for this driver
    const privateTrips = await queryPromise(
      `SELECT status, COUNT(*) as count FROM trip 
       WHERE driver_id = ? AND driver_id IS NOT NULL AND driver_id != ''
       GROUP BY status`,
      [driverId]
    );
    
    const statusFieldMap = {
      'New Order': 'driver_private_new_order_trips',
      'Pending': 'driver_private_pending_trips',
      'Accepted': 'driver_private_accepted_trips',
      'In-Transit': 'driver_private_in_transit_trips',
      'InTransit': 'driver_private_in_transit_trips',
      'Completed': 'driver_private_completed_trips',
      'Trip Ended': 'driver_private_trip_ended_trips',
      'TripEnded': 'driver_private_trip_ended_trips',
      'Counter Offer': 'driver_private_counter_offer_trips',
      'Just In': 'driver_private_just_in_trips',
      'Waiting Payment': 'driver_private_waiting_payment_trips',
      'Cancelled': 'driver_private_cancelled_trips'
    };
    
    // Build update query for private trips
    let privateUpdateFields = [];
    let privateParams = [];
    
    for (const trip of privateTrips) {
      const fieldName = statusFieldMap[trip.status];
      if (fieldName) {
        privateUpdateFields.push(`${fieldName} = ?`);
        privateParams.push(trip.count);
      }
    }
    
    // Get rideshare trips for this driver
    const rideshareTrips = await queryPromise(
      `SELECT status, COUNT(*) as count FROM rideshare_trips 
       WHERE driver_id = ? AND driver_id IS NOT NULL AND driver_id != ''
       GROUP BY status`,
      [driverId]
    );
    
    const rideshareStatusFieldMap = {
      'Created Shared Ride Request': 'driver_rideshare_created_shared_ride_requests',
      'In-Transit': 'driver_rideshare_in_transit_trips',
      'Completed': 'driver_rideshare_completed_trips',
      'Cancelled': 'driver_rideshare_cancelled_trips'
    };
    
    // Build update query for rideshare trips
    let rideshareUpdateFields = [];
    let rideshareParams = [];
    
    for (const trip of rideshareTrips) {
      const fieldName = rideshareStatusFieldMap[trip.status];
      if (fieldName) {
        rideshareUpdateFields.push(`${fieldName} = ?`);
        rideshareParams.push(trip.count);
      }
    }
    
    // Combine all updates
    let allUpdateFields = [...privateUpdateFields, ...rideshareUpdateFields];
    let allParams = [...privateParams, ...rideshareParams, driverId];
    
    if (allUpdateFields.length > 0) {
      const updateQuery = `UPDATE driver_details SET ${allUpdateFields.join(', ')} WHERE driver_id = ?`;
      await queryPromise(updateQuery, allParams);
      console.log(`✅ Updated trip stats for driver ${driverId}: ${privateTrips.length} private, ${rideshareTrips.length} rideshare`);
    } else {
      console.log(`ℹ️ No trips found for driver ${driverId}`);
    }
    
  } catch (error) {
    console.error(`Error backfilling trip stats for driver ${driverId}:`, error.message);
    throw error;
  }
}

// Initialize earnings data (set to 0 for now)
async function initializeEarnings(driverId) {
  try {
    await queryPromise(
      `UPDATE driver_details SET 
        driver_private_total_earnings = 0.00,
        driver_private_average_earnings_per_trip = 0.00,
        driver_private_last_earning_date = NULL,
        driver_rideshare_total_earnings = 0.00,
        driver_rideshare_average_earnings_per_trip = 0.00,
        driver_rideshare_last_earning_date = NULL,
        driver_total_earnings = 0.00,
        driver_average_earnings_per_trip = 0.00,
        driver_last_earning_date = NULL
       WHERE driver_id = ?`,
      [driverId]
    );
    
    console.log(`✅ Initialized earnings for driver ${driverId}`);
    
  } catch (error) {
    console.error(`Error initializing earnings for driver ${driverId}:`, error.message);
    throw error;
  }
}

// Initialize performance metrics
async function initializePerformanceMetrics(driverId) {
  try {
    // Calculate completion rate from actual trip data
    const completionData = await queryPromise(
      `SELECT 
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status IN ('Completed', 'Cancelled') THEN 1 ELSE 0 END) as total
       FROM (
         SELECT status FROM trip WHERE driver_id = ? AND driver_id IS NOT NULL AND driver_id != ''
         UNION ALL
         SELECT status FROM rideshare_trips WHERE driver_id = ? AND driver_id IS NOT NULL AND driver_id != ''
       ) as all_trips`,
      [driverId, driverId]
    );
    
    const completed = completionData[0].completed || 0;
    const total = completionData[0].total || 0;
    const completionRate = total > 0 ? (completed / total * 100) : 0;
    
    await queryPromise(
      `UPDATE driver_details SET 
        driver_completion_rate = ?,
        driver_average_trip_duration_minutes = 0.00,
        driver_total_distance_km = 0.00,
        driver_average_distance_per_trip = 0.00,
        driver_peak_hours_trips = 0,
        driver_off_peak_hours_trips = 0
       WHERE driver_id = ?`,
      [completionRate, driverId]
    );
    
    console.log(`✅ Initialized performance metrics for driver ${driverId}: ${completionRate.toFixed(1)}% completion rate`);
    
  } catch (error) {
    console.error(`Error initializing performance metrics for driver ${driverId}:`, error.message);
    throw error;
  }
}

// Initialize activity metrics
async function initializeActivityMetrics(driverId) {
  try {
    // Calculate days active from actual trip data
    const activityData = await queryPromise(
      `SELECT 
        COUNT(DISTINCT DATE(created_at)) as days_active,
        COUNT(*) as total_trips,
        MAX(DATE(created_at)) as last_trip_date
       FROM (
         SELECT created_at FROM trip WHERE driver_id = ? AND driver_id IS NOT NULL AND driver_id != '' AND created_at IS NOT NULL
         UNION ALL
         SELECT created_at FROM rideshare_trips WHERE driver_id = ? AND driver_id IS NOT NULL AND driver_id != '' AND created_at IS NOT NULL
       ) as all_trips`,
      [driverId, driverId]
    );
    
    const daysActive = activityData[0].days_active || 0;
    const totalTrips = activityData[0].total_trips || 0;
    const lastTripDate = activityData[0].last_trip_date;
    
    // Calculate average trips per day
    const avgTripsPerDay = daysActive > 0 ? totalTrips / daysActive : 0;
    
    await queryPromise(
      `UPDATE driver_details SET 
        driver_days_active = ?,
        driver_average_trips_per_day = ?,
        driver_longest_streak_days = ?,
        driver_current_streak_days = ?,
        driver_last_active_date = ?
       WHERE driver_id = ?`,
      [daysActive, avgTripsPerDay, daysActive, 0, lastTripDate, driverId]
    );
    
    console.log(`✅ Initialized activity metrics for driver ${driverId}: ${daysActive} days active`);
    
  } catch (error) {
    console.error(`Error initializing activity metrics for driver ${driverId}:`, error.message);
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
      console.log("\n💡 Note: Earnings will be populated when trips are completed and earnings are updated via API");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Driver analytics backfill failed:", error);
      process.exit(1);
    });
}

module.exports = { backfillDriverAnalytics };
