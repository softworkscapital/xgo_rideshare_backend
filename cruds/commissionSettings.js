require("dotenv").config();
const pool = require("./poolfile");

let crudsObj = {};

// Get commission settings
crudsObj.getCommissionSettings = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM commission_settings ORDER BY id DESC LIMIT 1",
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results[0] || null);
      }
    );
  });
};

// Update commission settings
crudsObj.updateCommissionSettings = (settingsData) => {
  return new Promise((resolve, reject) => {
    const {
      percentage_commission_rate,
      daily_flat_figure_commission,
      daily_promotion_active,
      promotion_start_date,
      promotion_end_date,
      lock_to_percentage,
      auto_switch_percentage
    } = settingsData;

    pool.query(
      `UPDATE commission_settings 
       SET percentage_commission_rate = ?,
           daily_flat_figure_commission = ?,
           daily_promotion_active = ?,
           promotion_start_date = ?,
           promotion_end_date = ?,
           lock_to_percentage = ?,
           auto_switch_percentage = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [
        percentage_commission_rate,
        daily_flat_figure_commission,
        daily_promotion_active,
        promotion_start_date,
        promotion_end_date,
        lock_to_percentage,
        auto_switch_percentage
      ],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({
          status: 200,
          message: "Commission settings updated successfully",
          affectedRows: result.affectedRows
        });
      }
    );
  });
};

// Check if promotion is currently active
crudsObj.isPromotionActive = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const settings = await crudsObj.getCommissionSettings();
      if (!settings) {
        return resolve(false);
      }

      const { getCurrentLocal } = require('../utils/timezone');
      const now = getCurrentLocal();
      const promotionActive = settings.daily_promotion_active && 
                             settings.promotion_start_date && 
                             settings.promotion_end_date &&
                             new Date(settings.promotion_start_date) <= now &&
                             new Date(settings.promotion_end_date) >= now;

      resolve(promotionActive);
    } catch (error) {
      reject(error);
    }
  });
};

// Check if user already paid daily commission today
crudsObj.checkDailyCommissionPaid = (userId) => {
  return new Promise((resolve, reject) => {
    const { getCurrentLocal } = require('../utils/timezone');
    const today = getCurrentLocal().toISOString().slice(0, 10);
    
    pool.query(
      `SELECT * FROM top_up 
       WHERE client_profile_id = ? 
       AND DATE(created_at) = ? 
       AND description LIKE '%daily commission%'
       AND folio = 'RW'
       LIMIT 1`,
      [userId, today],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results.length > 0);
      }
    );
  });
};

// Record daily commission payment
crudsObj.recordDailyCommission = (userId, commissionAmount, tripId = null) => {
  return new Promise((resolve, reject) => {
    const { getCurrentUTC, getCurrentLocal } = require('../utils/timezone');
    const description = `Daily flat rate commission - ${getCurrentLocal().toISOString().slice(0, 10)}`;
    const trxn_code = `DAILY_COMM_${Date.now()}`;
    
    pool.query(
      `INSERT INTO top_up (
        currency, exchange_rate, date, description, client_profile_id,
        trip_id, trxn_code, amount, user_wallet_debit, user_wallet_credit,
        user_wallet_balance, user_wallet_total_balance, main_wallet_debit,
        main_wallet_credit, main_wallet_balance, main_wallet_total_balance,
        revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance,
        revenue_wallet_total_balance, folio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'USD', 1, getCurrentUTC(), description, userId,
        tripId, trxn_code, commissionAmount, 0, commissionAmount,
        0, 0, 0, 0, 0, 0,
        commissionAmount, 0, 0, 0, 'RW'
      ],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve({
          status: 200,
          message: "Daily commission recorded successfully",
          commission_id: result.insertId
        });
      }
    );
  });
};

// Calculate commission based on settings and user preference
crudsObj.calculateCommission = async (userId, acceptedFare, userPreference = null) => {
  try {
    const settings = await crudsObj.getCommissionSettings();
    const promotionActive = await crudsObj.isPromotionActive();
    
    let billingPreference = 'percentage'; // default
    let commissionAmount = 0;
    let commissionType = 'percentage';
    let calculationMethod = '';
    
    // Determine billing preference
    if (settings.lock_to_percentage) {
      billingPreference = 'percentage';
    } else if (promotionActive && userPreference) {
      billingPreference = userPreference;
    } else {
      billingPreference = 'percentage';
    }
    
    // Calculate commission
    if (billingPreference === 'percentage') {
      commissionAmount = acceptedFare * (settings.percentage_commission_rate / 100);
      commissionType = 'percentage';
      calculationMethod = `${settings.percentage_commission_rate}% of ${acceptedFare} = ${commissionAmount}`;
    } else {
      // Daily flat rate
      const dailyPaid = await crudsObj.checkDailyCommissionPaid(userId);
      if (!dailyPaid) {
        commissionAmount = settings.daily_flat_figure_commission;
        commissionType = 'daily_flat_rate';
        calculationMethod = `Daily flat rate commission: ${settings.daily_flat_figure_commission}`;
        
        // Record the daily commission
        await crudsObj.recordDailyCommission(userId, commissionAmount);
      } else {
        commissionAmount = 0;
        commissionType = 'daily_flat_rate';
        calculationMethod = `Daily flat rate already paid today: 0`;
      }
    }
    
    const driverEarnings = acceptedFare - commissionAmount;
    
    return {
      commission_amount: commissionAmount,
      commission_type: commissionType,
      commission_rate_applied: billingPreference === 'percentage' ? 
        settings.percentage_commission_rate : settings.daily_flat_figure_commission,
      commission_calculation_method: calculationMethod,
      commission_settings_id: settings.id,
      promotion_active_at_time: promotionActive,
      driver_earnings: driverEarnings,
      billing_preference: billingPreference,
      accepted_fare: acceptedFare
    };
    
  } catch (error) {
    throw error;
  }
};

// Get driver earnings summary
crudsObj.getDriverEarningsSummary = (userId, days = 7) => {
  return new Promise((resolve, reject) => {
    const { getCurrentUTC } = require('../utils/timezone');
    const startDate = getCurrentUTC();
    startDate.setDate(startDate.getDate() - days);
    
    // Get rideshare earnings
    const rideshareQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as trip_count,
        SUM(billing_amount) as total_fares,
        SUM(commission_amount) as total_commissions,
        SUM(driver_earnings) as total_earnings,
        commission_type_used
      FROM rideshare_trips 
      WHERE vendor_id = ? 
      AND created_at >= ?
      AND status = 'Completed'
      GROUP BY DATE(created_at), commission_type_used
      ORDER BY date DESC
    `;
    
    // Get private trip earnings
    const tripQuery = `
      SELECT 
        DATE(order_end_datetime) as date,
        COUNT(*) as trip_count,
        SUM(billing_amount) as total_fares,
        SUM(commission_calculated) as total_commissions,
        SUM(driver_earnings) as total_earnings,
        commission_type_used
      FROM trip 
      WHERE driver_id = ? 
      AND order_end_datetime >= ?
      AND status = 'Completed'
      GROUP BY DATE(order_end_datetime), commission_type_used
      ORDER BY date DESC
    `;
    
    pool.query(rideshareQuery, [userId, startDate], (err1, rideshareResults) => {
      if (err1) return reject(err1);
      
      pool.query(tripQuery, [userId, startDate], (err2, tripResults) => {
        if (err2) return reject(err2);
        
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
          total_earnings: 0,
          daily_breakdown: allResults
        });
        
        resolve(summary);
      });
    });
  });
};

// Create commission notification
crudsObj.createCommissionNotification = (userId, notificationType, message) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO commission_notifications (user_id, notification_type, message) VALUES (?, ?, ?)",
      [userId, notificationType, message],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve({
          status: 200,
          message: "Commission notification created",
          notification_id: result.insertId
        });
      }
    );
  });
};

// Get user commission notifications
crudsObj.getUserCommissionNotifications = (userId, unreadOnly = false) => {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM commission_notifications WHERE user_id = ?";
    let params = [userId];
    
    if (unreadOnly) {
      query += " AND is_read = FALSE";
    }
    
    query += " ORDER BY created_at DESC LIMIT 20";
    
    pool.query(query, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

// Mark notification as read
crudsObj.markNotificationAsRead = (notificationId, userId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE commission_notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
      [notificationId, userId],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve({
          status: 200,
          message: "Notification marked as read",
          affectedRows: result.affectedRows
        });
      }
    );
  });
};

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

module.exports = crudsObj;
