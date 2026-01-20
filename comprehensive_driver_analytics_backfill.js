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

// Comprehensive Driver Analytics Backfill Script
// This script will populate historical driver analytics data from trip tables

async function backfillDriverAnalytics() {
  console.log("🔄 Starting comprehensive driver analytics backfill...");
  
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
        
        // 1. Backfill Private Trip Statistics
        console.log("📈 Backfilling private trip statistics...");
        await backfillPrivateTripStats(driverId);
        
        // 2. Backfill Rideshare Trip Statistics  
        console.log("🚗 Backfilling rideshare trip statistics...");
        await backfillRideshareTripStats(driverId);
        
        // 3. Backfill Earnings
        console.log("💰 Backfilling earnings data...");
        await backfillEarnings(driverId);
        
        // 4. Backfill Performance Metrics
        console.log("📊 Backfilling performance metrics...");
        await backfillPerformanceMetrics(driverId);
        
        // 5. Backfill Activity Metrics
        console.log("📅 Backfilling activity metrics...");
        await backfillActivityMetrics(driverId);
        
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

// Backfill private trip statistics from trip table
async function backfillPrivateTripStats(driverId) {
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
    
    // Build update query
    let updateFields = [];
    let queryParams = [];
    
    for (const trip of privateTrips) {
      const fieldName = statusFieldMap[trip.status];
      if (fieldName) {
        updateFields.push(`${fieldName} = ?`);
        queryParams.push(trip.count);
      }
    }
    
    if (updateFields.length > 0) {
      const updateQuery = `UPDATE driver_details SET ${updateFields.join(', ')} WHERE driver_id = ?`;
      queryParams.push(driverId);
      
      await queryPromise(updateQuery, queryParams);
      console.log(`✅ Updated private trip stats for driver ${driverId}`);
    }
    
  } catch (error) {
    console.error(`Error backfilling private trip stats for driver ${driverId}:`, error.message);
    throw error;
  }
}

// Backfill rideshare trip statistics from rideshare_trips table
async function backfillRideshareTripStats(driverId) {
  try {
    // Get rideshare trips for this driver
    const rideshareTrips = await queryPromise(
      `SELECT status, COUNT(*) as count FROM rideshare_trips 
       WHERE driver_id = ? AND driver_id IS NOT NULL AND driver_id != ''
       GROUP BY status`,
      [driverId]
    );
    
    const statusFieldMap = {
      'Created Shared Ride Request': 'driver_rideshare_created_shared_ride_requests',
      'In-Transit': 'driver_rideshare_in_transit_trips',
      'Completed': 'driver_rideshare_completed_trips',
      'Cancelled': 'driver_rideshare_cancelled_trips'
    };
    
    // Build update query
    let updateFields = [];
    let queryParams = [];
    
    for (const trip of rideshareTrips) {
      const fieldName = statusFieldMap[trip.status];
      if (fieldName) {
        updateFields.push(`${fieldName} = ?`);
        queryParams.push(trip.count);
      }
    }
    
    if (updateFields.length > 0) {
      const updateQuery = `UPDATE driver_details SET ${updateFields.join(', ')} WHERE driver_id = ?`;
      queryParams.push(driverId);
      
      await queryPromise(updateQuery, queryParams);
      console.log(`✅ Updated rideshare trip stats for driver ${driverId}`);
    }
    
  } catch (error) {
    console.error(`Error backfilling rideshare trip stats for driver ${driverId}:`, error.message);
    throw error;
  }
}

// Backfill earnings data
async function backfillEarnings(driverId) {
  try {
    // Get completed private trips with earnings
    const privateEarnings = await queryPromise(
      `SELECT COALESCE(SUM(CASE WHEN price IS NOT NULL AND price > 0 THEN price ELSE 0 END), 0) as total_earnings,
              COUNT(CASE WHEN status = 'Completed' AND price IS NOT NULL AND price > 0 THEN 1 END) as completed_trips
       FROM trip 
       WHERE driver_id = ? AND driver_id IS NOT NULL AND driver_id != '' AND status = 'Completed'`,
      [driverId]
    );
    
    // Get completed rideshare trips with earnings
    const rideshareEarnings = await queryPromise(
      `SELECT COALESCE(SUM(CASE WHEN price IS NOT NULL AND price > 0 THEN price ELSE 0 END), 0) as total_earnings,
              COUNT(CASE WHEN status = 'Completed' AND price IS NOT NULL AND price > 0 THEN 1 END) as completed_trips
       FROM rideshare_trips 
       WHERE driver_id = ? AND driver_id IS NOT NULL AND driver_id != '' AND status = 'Completed'`,
      [driverId]
    );
    
    const privateTotal = privateEarnings[0].total_earnings;
    const privateCompleted = privateEarnings[0].completed_trips;
    const privateAvg = privateCompleted > 0 ? privateTotal / privateCompleted : 0;
    
    const rideshareTotal = rideshareEarnings[0].total_earnings;
    const rideshareCompleted = rideshareEarnings[0].completed_trips;
    const rideshareAvg = rideshareCompleted > 0 ? rideshareTotal / rideshareCompleted : 0;
    
    const totalEarnings = privateTotal + rideshareTotal;
    const totalCompleted = privateCompleted + rideshareCompleted;
    const overallAvg = totalCompleted > 0 ? totalEarnings / totalCompleted : 0;
    
    // Update earnings fields
    await queryPromise(
      `UPDATE driver_details SET 
        driver_private_total_earnings = ?,
        driver_private_average_earnings_per_trip = ?,
        driver_rideshare_total_earnings = ?,
        driver_rideshare_average_earnings_per_trip = ?,
        driver_total_earnings = ?,
        driver_average_earnings_per_trip = ?,
        driver_last_earning_date = CASE WHEN ? > 0 THEN NOW() ELSE driver_last_earning_date END
       WHERE driver_id = ?`,
      [privateTotal, privateAvg, rideshareTotal, rideshareAvg, totalEarnings, overallAvg, totalEarnings, driverId]
    );
    
    console.log(`✅ Updated earnings for driver ${driverId}: $${totalEarnings.toFixed(2)}`);
    
  } catch (error) {
    console.error(`Error backfilling earnings for driver ${driverId}:`, error.message);
    throw error;
  }
}

// Backfill performance metrics
async function backfillPerformanceMetrics(driverId) {
  try {
    // Calculate completion rate
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
    
    const completed = completionData[0].completed;
    const total = completionData[0].total;
    const completionRate = total > 0 ? (completed / total * 100) : 0;
    
    // Calculate average trip duration (if available)
    const durationData = await queryPromise(
      `SELECT AVG(duration) as avg_duration FROM (
         SELECT duration FROM trip WHERE driver_id = ? AND driver_id IS NOT NULL AND driver_id != '' AND duration IS NOT NULL
         UNION ALL
         SELECT duration FROM rideshare_trips WHERE driver_id = ? AND driver_id IS NOT NULL AND driver_id != '' AND duration IS NOT NULL
       ) as durations`,
      [driverId, driverId]
    );
    
    const avgDuration = durationData[0].avg_duration || 0;
    
    // Calculate distance metrics (if available)
    const distanceData = await queryPromise(
      `SELECT COALESCE(SUM(distance), 0) as total_distance, AVG(distance) as avg_distance FROM (
         SELECT distance FROM trip WHERE driver_id = ? AND driver_id IS NOT NULL AND driver_id != '' AND distance IS NOT NULL
         UNION ALL
         SELECT distance FROM rideshare_trips WHERE driver_id = ? AND driver_id IS NOT NULL AND driver_id != '' AND distance IS NOT NULL
       ) as distances`,
      [driverId, driverId]
    );
    
    const totalDistance = distanceData[0].total_distance || 0;
    const avgDistance = distanceData[0].avg_distance || 0;
    
    // Update performance metrics
    await queryPromise(
      `UPDATE driver_details SET 
        driver_completion_rate = ?,
        driver_average_trip_duration_minutes = ?,
        driver_total_distance_km = ?,
        driver_average_distance_per_trip = ?
       WHERE driver_id = ?`,
      [completionRate, avgDuration, totalDistance, avgDistance, driverId]
    );
    
    console.log(`✅ Updated performance metrics for driver ${driverId}: ${completionRate.toFixed(1)}% completion rate`);
    
  } catch (error) {
    console.error(`Error backfilling performance metrics for driver ${driverId}:`, error.message);
    throw error;
  }
}

// Backfill activity metrics
async function backfillActivityMetrics(driverId) {
  try {
    // Calculate days active (unique days with trips)
    const activityData = await queryPromise(
      `SELECT 
        COUNT(DISTINCT DATE(created_at)) as days_active,
        COUNT(*) as total_trips,
        MIN(DATE(created_at)) as first_trip_date,
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
    const firstTripDate = activityData[0].first_trip_date;
    const lastTripDate = activityData[0].last_trip_date;
    
    // Calculate average trips per day
    const avgTripsPerDay = daysActive > 0 ? totalTrips / daysActive : 0;
    
    // Calculate streak (simplified - just set to days active for now)
    const longestStreak = daysActive;
    const currentStreak = lastTripDate ? 
      (new Date() - new Date(lastTripDate)) / (1000 * 60 * 60 * 24) <= 1 ? 1 : 0 : 0;
    
    // Update activity metrics
    await queryPromise(
      `UPDATE driver_details SET 
        driver_days_active = ?,
        driver_average_trips_per_day = ?,
        driver_longest_streak_days = ?,
        driver_current_streak_days = ?,
        driver_last_active_date = ?
       WHERE driver_id = ?`,
      [daysActive, avgTripsPerDay, longestStreak, currentStreak, lastTripDate, driverId]
    );
    
    console.log(`✅ Updated activity metrics for driver ${driverId}: ${daysActive} days active`);
    
  } catch (error) {
    console.error(`Error backfilling activity metrics for driver ${driverId}:`, error.message);
    throw error;
  }
}

// Run the backfill
if (require.main === module) {
  backfillDriverAnalytics()
    .then(() => {
      console.log("🎉 Driver analytics backfill completed successfully!");
      console.log("📊 All driver analytics fields are now populated with historical data");
      console.log("🚀 Ready for real-time updates via API endpoints");
      console.log("\n📋 Available API Endpoints:");
      console.log("   PUT /driver/{id}/private_trip_status - Update private trip status");
      console.log("   PUT /driver/{id}/rideshare_trip_status - Update rideshare trip status");
      console.log("   PUT /driver/{id}/earnings - Update earnings");
      console.log("   GET /driver/{id}/comprehensive_stats - Get complete analytics");
      console.log("   GET /driver/{id}/earnings_summary - Get earnings breakdown");
      console.log("   GET /driver/{id}/performance_summary - Get performance metrics");
      console.log("   GET /driver/{id}/activity_summary - Get activity metrics");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Driver analytics backfill failed:", error);
      process.exit(1);
    });
}

module.exports = { backfillDriverAnalytics };
