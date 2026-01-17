// Add this to the commissionSettings.js CRUD file

// Get all drivers earnings summary (for admin panel)
crudsObj.getAllDriversEarningsSummary = (days = 7) => {
  return new Promise((resolve, reject) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get all drivers from users table with driver role
    const driversQuery = `
      SELECT u.id, u.name, u.email, u.phone
      FROM users u
      WHERE u.role = 'driver' OR u.user_type = 'driver'
      ORDER BY u.name
    `;
    
    pool.query(driversQuery, (err, drivers) => {
      if (err) {
        return reject(err);
      }
      
      // Get earnings for each driver
      const earningsPromises = drivers.map(driver => {
        return new Promise((resolveDriver, rejectDriver) => {
          // Get rideshare earnings
          const rideshareQuery = `
            SELECT 
              COUNT(*) as trip_count,
              SUM(billing_amount) as total_fares,
              SUM(commission_amount) as total_commissions,
              SUM(driver_earnings) as total_earnings,
              commission_type_used
            FROM rideshare_trips 
            WHERE vendor_id = ? 
            AND created_at >= ?
            AND status = 'Completed'
            GROUP BY commission_type_used
          `;
          
          // Get private trip earnings
          const tripQuery = `
            SELECT 
              COUNT(*) as trip_count,
              SUM(billing_amount) as total_fares,
              SUM(commission_calculated) as total_commissions,
              SUM(driver_earnings) as total_earnings,
              commission_type_used
            FROM trip 
            WHERE driver_id = ? 
            AND order_end_datetime >= ?
            AND status = 'Completed'
            GROUP BY commission_type_used
          `;
          
          pool.query(rideshareQuery, [driver.id, startDate], (err1, rideshareResults) => {
            if (err1) {
              return rejectDriver(err1);
            }
            
            pool.query(tripQuery, [driver.id, startDate], (err2, tripResults) => {
              if (err2) {
                return rejectDriver(err2);
              }
              
              // Combine results
              const allResults = [...rideshareResults, ...tripResults];
              
              // Calculate totals
              const summary = allResults.reduce((acc, record) => {
                acc.total_trips += record.trip_count || 0;
                acc.total_fares += parseFloat(record.total_fares || 0);
                acc.total_commissions += parseFloat(record.total_commissions || 0);
                acc.total_earnings += parseFloat(record.total_earnings || 0);
                return acc;
              }, {
                total_trips: 0,
                total_fares: 0,
                total_commissions: 0,
                total_earnings: 0
              });
              
              // Get driver's commission preference
              const preferenceQuery = `
                SELECT billing_preference 
                FROM users 
                WHERE id = ?
              `;
              
              pool.query(preferenceQuery, [driver.id], (err3, prefResults) => {
                if (err3) {
                  return rejectDriver(err3);
                }
                
                resolveDriver({
                  ...driver,
                  ...summary,
                  commission_preference: prefResults[0]?.billing_preference || 'percentage'
                });
              });
            });
          });
        });
      });
      
      // Wait for all driver earnings to be calculated
      Promise.all(earningsPromises)
        .then(results => {
          resolve({
            status: 200,
            drivers: results,
            total_drivers: results.length,
            period_days: days
          });
        })
        .catch(error => {
          reject(error);
        });
    });
  });
};

// Get driver performance analytics
crudsObj.getDriverPerformanceAnalytics = (days = 30) => {
  return new Promise((resolve, reject) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const query = `
      SELECT 
        u.id as driver_id,
        u.name as driver_name,
        u.email as driver_email,
        COUNT(rt.id) as rideshare_trips,
        COUNT(t.id) as private_trips,
        COALESCE(SUM(rt.billing_amount), 0) + COALESCE(SUM(t.billing_amount), 0) as total_fares,
        COALESCE(SUM(rt.commission_amount), 0) + COALESCE(SUM(t.commission_calculated), 0) as total_commissions,
        COALESCE(SUM(rt.driver_earnings), 0) + COALESCE(SUM(t.driver_earnings), 0) as total_earnings,
        AVG(rt.billing_amount) as avg_rideshare_fare,
        AVG(t.billing_amount) as avg_private_fare,
        u.billing_preference
      FROM users u
      LEFT JOIN rideshare_trips rt ON u.id = rt.vendor_id 
        AND rt.created_at >= ? 
        AND rt.status = 'Completed'
      LEFT JOIN trip t ON u.id = t.driver_id 
        AND t.order_end_datetime >= ? 
        AND t.status = 'Completed'
      WHERE u.role = 'driver' OR u.user_type = 'driver'
      GROUP BY u.id, u.name, u.email, u.billing_preference
      HAVING total_fares > 0
      ORDER BY total_earnings DESC
      LIMIT 50
    `;
    
    pool.query(query, [startDate, startDate], (err, results) => {
      if (err) {
        return reject(err);
      }
      
      // Calculate additional metrics
      const analytics = results.map(driver => ({
        ...driver,
        total_trips: (driver.rideshare_trips || 0) + (driver.private_trips || 0),
        avg_commission_rate: driver.total_fares > 0 ? (driver.total_commissions / driver.total_fares) * 100 : 0,
        avg_earnings_per_trip: driver.total_trips > 0 ? driver.total_earnings / driver.total_trips : 0,
        commission_efficiency: driver.total_fares > 0 ? ((driver.total_earnings / driver.total_fares) * 100) : 0
      }));
      
      resolve({
        status: 200,
        analytics: analytics,
        period_days: days,
        total_active_drivers: analytics.length
      });
    });
  });
};

// Get commission type distribution
crudsObj.getCommissionTypeDistribution = (days = 30) => {
  return new Promise((resolve, reject) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const query = `
      SELECT 
        commission_type_used,
        COUNT(*) as trip_count,
        SUM(billing_amount) as total_fares,
        SUM(commission_amount) as total_commissions,
        SUM(driver_earnings) as total_earnings,
        AVG(billing_amount) as avg_fare
      FROM (
        SELECT commission_type_used, billing_amount, commission_amount, driver_earnings
        FROM rideshare_trips 
        WHERE created_at >= ? AND status = 'Completed'
        UNION ALL
        SELECT commission_type_used, billing_amount, commission_calculated as commission_amount, driver_earnings
        FROM trip 
        WHERE order_end_datetime >= ? AND status = 'Completed'
      ) combined_trips
      WHERE commission_type_used IS NOT NULL
      GROUP BY commission_type_used
      ORDER BY total_earnings DESC
    `;
    
    pool.query(query, [startDate, startDate], (err, results) => {
      if (err) {
        return reject(err);
      }
      
      resolve({
        status: 200,
        distribution: results,
        period_days: days
      });
    });
  });
};

// Export these functions to be added to the main commissionSettings.js file
module.exports = {
  getAllDriversEarningsSummary: crudsObj.getAllDriversEarningsSummary,
  getDriverPerformanceAnalytics: crudsObj.getDriverPerformanceAnalytics,
  getCommissionTypeDistribution: crudsObj.getCommissionTypeDistribution
};
