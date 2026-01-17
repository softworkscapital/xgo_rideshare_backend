const express = require("express");
const router = express.Router();
const pool = require("../cruds/poolfile");

// 1. Drivers Earnings Summary API (matches dashboard expectation)
router.get('/', (req, res) => {
  const { days = 7 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get driver earnings summary using actual trip table data
  // Note: Most trips have empty driver_id, so we'll show all drivers but earnings will be 0
  const query = `
    SELECT 
      d.driver_id as id,
      d.name,
      d.email,
      0 as total_earnings,
      0 as total_fares,
      0 as total_commissions,
      0 as trip_count,
      NULL as last_earning_date
    FROM driver_details d
    WHERE d.driver_id IS NOT NULL AND d.driver_id != ''
    GROUP BY d.driver_id, d.name, d.email
    ORDER BY d.name ASC
    LIMIT 20
  `;
  
  pool.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching driver earnings:', error);
      return res.status(500).json({ 
        status: 500, 
        error: 'Internal server error',
        message: error.message 
      });
    }
    
    res.json({
      status: 200,
      drivers: results,
      period: `${days} days`
    });
  });
});

// 2. Individual Driver Details API
router.get('/:driverId', (req, res) => {
  const { driverId } = req.params;
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get driver basic info
  const driverQuery = 'SELECT driver_id as id, name, email FROM driver_details WHERE driver_id = ?';
  
  pool.query(driverQuery, [driverId], (error, driverInfo) => {
    if (error) {
      console.error('Error fetching driver info:', error);
      return res.status(500).json({ 
        status: 500, 
        error: 'Internal server error',
        message: error.message 
      });
    }
    
    if (driverInfo.length === 0) {
      return res.status(404).json({ 
        status: 404, 
        error: 'Driver not found' 
      });
    }
    
    // Get daily breakdown
    const dailyQuery = `
      SELECT 
        date,
        total_fares,
        total_commissions,
        total_earnings,
        trip_count
      FROM driver_earnings_analytics
      WHERE driver_id = ? AND date >= ?
      ORDER BY date ASC
    `;
    
    pool.query(dailyQuery, [driverId, startDate.toISOString().split('T')[0]], (dailyError, dailyBreakdown) => {
      if (dailyError) {
        console.error('Error fetching daily breakdown:', dailyError);
        return res.status(500).json({ 
          status: 500, 
          error: 'Internal server error',
          message: dailyError.message 
        });
      }
      
      // Get summary statistics
      const summaryQuery = `
        SELECT 
          COALESCE(SUM(total_earnings), 0) as total_earnings,
          COALESCE(SUM(total_fares), 0) as total_fares,
          COALESCE(SUM(total_commissions), 0) as total_commissions,
          COALESCE(SUM(trip_count), 0) as trip_count
        FROM driver_earnings_analytics
        WHERE driver_id = ? AND date >= ?
      `;
      
      pool.query(summaryQuery, [driverId, startDate.toISOString().split('T')[0]], (summaryError, summary) => {
        if (summaryError) {
          console.error('Error fetching summary:', summaryError);
          return res.status(500).json({ 
            status: 500, 
            error: 'Internal server error',
            message: summaryError.message 
          });
        }
        
        const driverData = {
          ...driverInfo[0],
          ...summary[0],
          daily_breakdown: dailyBreakdown.map(day => ({
            ...day,
            total_fares: parseFloat(day.total_fares || 0),
            total_commissions: parseFloat(day.total_commissions || 0),
            total_earnings: parseFloat(day.total_earnings || 0),
            trip_count: parseInt(day.trip_count || 0)
          })),
          total_earnings: parseFloat(summary[0].total_earnings || 0),
          total_fares: parseFloat(summary[0].total_fares || 0),
          total_commissions: parseFloat(summary[0].total_commissions || 0),
          trip_count: parseInt(summary[0].trip_count || 0)
        };
        
        res.json({
          status: 200,
          driver: driverData
        });
      });
    });
  });
});

// 3. Get sample driver data for testing
router.get('/sample-driver-data', (req, res) => {
  const query = 'SELECT driver_id, name, email FROM driver_details LIMIT 5';
  
  pool.query(query, (error, drivers) => {
    if (error) {
      console.error('Error fetching sample drivers:', error);
      return res.status(500).json({ 
        status: 500, 
        error: 'Internal server error',
        message: error.message 
      });
    }
    
    res.json({
      status: 200,
      drivers: drivers
    });
  });
});

module.exports = router;
