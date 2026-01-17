const express = require("express");
const router = express.Router();
const pool = require("../cruds/poolfile");

// 1. Customer Performance Summary API
router.get('/', (req, res) => {
  const { days = 7 } = req.query;
  
  // Get customer performance summary - show all available data
  const query = `
    SELECT 
      c.customerid as id,
      c.name,
      c.email,
      COALESCE(SUM(cp.total_spent), 0) as total_spent,
      COALESCE(SUM(cp.private_rides_count), 0) as private_rides_count,
      COALESCE(SUM(cp.shared_rides_count), 0) as shared_rides_count,
      COALESCE(SUM(cp.total_rides_count), 0) as total_rides_count,
      COALESCE(AVG(cp.average_cost_per_ride), 0) as average_cost_per_ride,
      MAX(cp.date) as last_ride_date
    FROM customer_details c
    LEFT JOIN customer_performance_analytics cp ON c.customerid = cp.customer_id
    GROUP BY c.customerid, c.name, c.email
    ORDER BY total_spent DESC
    LIMIT 20
  `;
  
  pool.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching customer performance:', error);
      return res.status(500).json({ 
        status: 500, 
        error: 'Internal server error',
        message: error.message 
      });
    }
    
    res.json({
      status: 200,
      customers: results,
      period: `${days} days`
    });
  });
});

// 2. Individual Customer Details API
router.get('/customer-details/:customerId', (req, res) => {
  const { customerId } = req.params;
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get customer basic info
  const customerQuery = 'SELECT customerid as id, name, email FROM customer_details WHERE customerid = ?';
  
  pool.query(customerQuery, [customerId], (error, customerInfo) => {
    if (error) {
      console.error('Error fetching customer info:', error);
      return res.status(500).json({ 
        status: 500, 
        error: 'Internal server error',
        message: error.message 
      });
    }
    
    if (customerInfo.length === 0) {
      return res.status(404).json({ 
        status: 404, 
        error: 'Customer not found' 
      });
    }
    
    // Get daily breakdown
    const dailyQuery = `
      SELECT 
        date,
        private_rides_cost,
        shared_rides_cost,
        total_spent as total_cost,
        private_rides_count,
        shared_rides_count,
        total_rides_count as rides_count
      FROM customer_performance_analytics
      WHERE customer_id = ? AND date >= ?
      ORDER BY date ASC
    `;
    
    pool.query(dailyQuery, [customerId, startDate.toISOString().split('T')[0]], (dailyError, dailyBreakdown) => {
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
          COALESCE(SUM(total_spent), 0) as total_spent,
          COALESCE(SUM(private_rides_count), 0) as private_rides_count,
          COALESCE(SUM(shared_rides_count), 0) as shared_rides_count,
          COALESCE(SUM(total_rides_count), 0) as total_rides_count,
          COALESCE(AVG(average_cost_per_ride), 0) as average_cost_per_ride
        FROM customer_performance_analytics
        WHERE customer_id = ?
      `;
      
      pool.query(summaryQuery, [customerId], (summaryError, summary) => {
        if (summaryError) {
          console.error('Error fetching summary:', summaryError);
          return res.status(500).json({ 
            status: 500, 
            error: 'Internal server error',
            message: summaryError.message 
          });
        }
        
        const customerData = {
          ...customerInfo[0],
          ...summary[0],
          daily_breakdown: dailyBreakdown.map(day => ({
            ...day,
            private_rides_cost: parseFloat(day.private_rides_cost || 0),
            shared_rides_cost: parseFloat(day.shared_rides_cost || 0),
            total_cost: parseFloat(day.total_cost || 0),
            private_rides_count: parseInt(day.private_rides_count || 0),
            shared_rides_count: parseInt(day.shared_rides_count || 0),
            rides_count: parseInt(day.rides_count || 0)
          })),
          total_spent: parseFloat(summary[0].total_spent || 0),
          private_rides_count: parseInt(summary[0].private_rides_count || 0),
          shared_rides_count: parseInt(summary[0].shared_rides_count || 0),
          total_rides_count: parseInt(summary[0].total_rides_count || 0),
          average_cost_per_ride: parseFloat(summary[0].average_cost_per_ride || 0)
        };
        
        res.json({
          status: 200,
          customer: customerData
        });
      });
    });
  });
});

// 3. Calculate Customer Performance (Run this daily)
router.post('/calculate-customer-performance', (req, res) => {
  const { date } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  console.log(`Calculating performance for date: ${targetDate}`);
  
  // Get all customers first
  const customersQuery = 'SELECT customerid FROM customer_details';
  
  pool.query(customersQuery, (error, customers) => {
    if (error) {
      console.error('Error fetching customers:', error);
      return res.status(500).json({ 
        status: 500, 
        error: 'Internal server error',
        message: error.message 
      });
    }
    
    console.log(`Found ${customers.length} customers to process`);
    
    let processedCount = 0;
    let completedCount = 0;
    
    // Process each customer
    customers.forEach((customer, index) => {
      // Get trips for this customer on the target date
      const tripsQuery = `
        SELECT 
          accepted_cost,
          'private' as trip_type,
          COUNT(*) as trip_count
        FROM trip 
        WHERE cust_id = ? AND order_start_datetime LIKE ? AND customer_status = 'Ended'
        GROUP BY accepted_cost
      `;
      
      pool.query(tripsQuery, [customer.customerid, `${targetDate}%`], (tripsError, trips) => {
        if (tripsError) {
          console.error(`Error processing customer ${customer.customerid}:`, tripsError);
        } else {
          console.log(`🔍 Debug: Customer ${customer.customerid}, Date ${targetDate}, Found ${trips.length} trips:`, trips);
          
          // All trips from trip table are private rides
          const privateRides = trips;
          const sharedRides = []; // No shared rides in trip table
          
          const privateRidesCost = privateRides.reduce((sum, t) => sum + (parseFloat(t.accepted_cost || 0) * t.trip_count), 0);
          const sharedRidesCost = 0; // No shared rides cost
          const totalSpent = privateRidesCost + sharedRidesCost;
          const totalRidesCount = trips.reduce((sum, t) => sum + t.trip_count, 0);
          const averageCost = totalRidesCount > 0 ? totalSpent / totalRidesCount : 0;
          
          console.log(`💰 Calculation for ${customer.customerid}: totalSpent=${totalSpent}, rides=${totalRidesCount}, avgCost=${averageCost}`);
          
          // Insert or update performance data
          const upsertQuery = `
            INSERT INTO customer_performance_analytics 
            (customer_id, date, total_spent, private_rides_count, shared_rides_count, 
             private_rides_cost, shared_rides_cost, total_rides_count, average_cost_per_ride)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            total_spent = VALUES(total_spent),
            private_rides_count = VALUES(private_rides_count),
            shared_rides_count = VALUES(shared_rides_count),
            private_rides_cost = VALUES(private_rides_cost),
            shared_rides_cost = VALUES(shared_rides_cost),
            total_rides_count = VALUES(total_rides_count),
            average_cost_per_ride = VALUES(average_cost_per_ride)
          `;
          
          pool.query(upsertQuery, [
            customer.customerid,
            targetDate,
            totalSpent,
            privateRides.length,
            sharedRides.length,
            privateRidesCost,
            sharedRidesCost,
            totalRidesCount,
            averageCost
          ], (upsertError) => {
            if (upsertError) {
              console.error(`Error upserting data for customer ${customer.customerid}:`, upsertError);
            } else {
              console.log(`✅ Successfully stored data for ${customer.customerid}: spent=${totalSpent}, rides=${totalRidesCount}`);
              processedCount++;
            }
            
            completedCount++;
            
            // Send response when all customers are processed
            if (completedCount === customers.length) {
              res.json({
                status: 200,
                message: `Customer performance calculated for ${processedCount} customers`,
                date: targetDate,
                processedCount
              });
            }
          });
        }
      });
    });
  });
});

// 4. Get sample customer data for testing
router.get('/sample-customer-data', (req, res) => {
  const query = 'SELECT customerid, name, email FROM customer_details LIMIT 5';
  
  pool.query(query, (error, customers) => {
    if (error) {
      console.error('Error fetching sample customers:', error);
      return res.status(500).json({ 
        status: 500, 
        error: 'Internal server error',
        message: error.message 
      });
    }
    
    res.json({
      status: 200,
      customers: customers
    });
  });
});

module.exports = router;
