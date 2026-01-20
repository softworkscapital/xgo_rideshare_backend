// Real-time Customer Status Update Endpoints
// Add these to your existing customer_details routes file

// Update customer private ride status
CustomerRouter.put("/:id/private_trip_status", async (req, res, next) => {
  try {
    let customer_id = req.params.id;
    const { status, tripRevenue = 0, rating = null } = req.body;

    // Validate status
    const validStatuses = ['New Order', 'Pending', 'Accepted', 'In-Transit', 'In-Transit', 'Completed', 'Trip Ended', 'TripEnded', 'Counter Offer', 'Just In', 'Waiting Payment', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status", validStatuses });
    }

    // Build dynamic update query based on status
    let updateFields = [];
    let updateValues = [];

    switch(status) {
      case 'Completed':
        updateFields.push('private_completed_trips = private_completed_trips + 1');
        updateValues.push(customer_id);
        if (tripRevenue > 0) {
          updateFields.push('private_total_spend = COALESCE(private_total_spend, 0) + ?');
          updateFields.push('private_average_spend = CASE WHEN (private_completed_trips + COALESCE(private_trip_ended_trips, 0) + 1) > 0 THEN (COALESCE(private_total_spend, 0) + ?) / (private_completed_trips + COALESCE(private_trip_ended_trips, 0) + 1) ELSE COALESCE(private_average_spend, NULL) END');
          updateValues.push(tripRevenue, customer_id);
        }
        updateFields.push('private_last_trip_date = NOW()');
        updateValues.push(customer_id);
        break;
        
      case 'Trip Ended':
      case 'TripEnded':
        updateFields.push('private_trip_ended_trips = private_trip_ended_trips + 1');
        updateValues.push(customer_id);
        if (tripRevenue > 0) {
          updateFields.push('private_total_spend = COALESCE(private_total_spend, 0) + ?');
          updateFields.push('private_average_spend = CASE WHEN (private_completed_trips + private_trip_ended_trips + 1) > 0 THEN (COALESCE(private_total_spend, 0) + ?) / (private_completed_trips + private_trip_ended_trips + 1) ELSE COALESCE(private_average_spend, NULL) END');
          updateValues.push(tripRevenue, customer_id);
        }
        updateFields.push('private_last_trip_date = NOW()');
        updateValues.push(customer_id);
        break;
        
      case 'Cancelled':
        updateFields.push('private_cancelled_trips = private_cancelled_trips + 1');
        updateValues.push(customer_id);
        break;
        
      case 'New Order':
        updateFields.push('private_new_order_trips = private_new_order_trips + 1');
        updateValues.push(customer_id);
        break;
        
      case 'Pending':
        updateFields.push('private_pending_trips = private_pending_trips + 1');
        updateValues.push(customer_id);
        break;
        
      case 'Just In':
        updateFields.push('private_just_in_trips = private_just_in_trips + 1');
        updateValues.push(customer_id);
        break;
        
      case 'Counter Offer':
        updateFields.push('private_counter_offer_trips = private_counter_offer_trips + 1');
        updateValues.push(customer_id);
        break;
        
      case 'Waiting Payment':
        updateFields.push('private_waiting_payment_trips = private_waiting_payment_trips + 1');
        updateValues.push(customer_id);
        break;
        
      case 'In-Transit':
      case 'InTransit':
        updateFields.push('private_in_transit_trips = private_in_transit_trips + 1');
        updateValues.push(customer_id);
        break;
    }

    // Add rating update if provided
    if (rating !== null && rating >= 1 && rating <= 5) {
      const currentTotal = await queryPromise("SELECT COALESCE(private_total_ratings_given, 0) FROM customer_details WHERE customerid = ?", [customer_id]);
      const currentAvg = await queryPromise("SELECT COALESCE(private_average_rating_given, 0) FROM customer_details WHERE customerid = ?", [customer_id]);
      
      const newTotal = currentTotal[0]['COALESCE(private_total_ratings_given, 0)'] + 1;
      const newAvg = ((currentAvg[0]['COALESCE(private_average_rating_given, 0)'] * currentTotal[0]['COALESCE(private_total_ratings_given, 0)']) + rating) / newTotal;
      
      updateFields.push('private_total_ratings_given = ?');
      updateFields.push('private_average_rating_given = ?');
      updateValues.push(newTotal, newAvg, customer_id);
    }

    // Execute the update
    const updateSQL = `UPDATE customer_details SET ${updateFields.join(', ')} WHERE customerid = ?`;
    
    const result = await queryPromise(updateSQL, updateValues);
    
    res.json({
      status: "200",
      message: "Customer private trip status updated successfully",
      customer_id,
      status,
      updated_fields: updateFields
    });
    
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Failed to update customer private trip status", message: e.message });
  }
});

// Update customer rideshare request status
CustomerRouter.put("/:id/rideshare_request_status", async (req, res, next) => {
  try {
    let customer_id = req.params.id;
    const { status, offerAmount = 0, rating = null } = req.body;

    // Validate status
    const validStatuses = ['Created Shared Ride Request', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status", validStatuses });
    }

    // Build dynamic update query based on status
    let updateFields = [];
    let updateValues = [];

    switch(status) {
      case 'Completed':
        updateFields.push('rideshare_completed_requests = rideshare_completed_requests + 1');
        updateValues.push(customer_id);
        if (offerAmount > 0) {
          updateFields.push('rideshare_total_spend = COALESCE(rideshare_total_spend, 0) + ?');
          updateFields.push('rideshare_average_spend = CASE WHEN rideshare_completed_requests > 0 THEN (COALESCE(rideshare_total_spend, 0) + ?) / rideshare_completed_requests ELSE COALESCE(rideshare_average_spend, NULL) END');
          updateValues.push(offerAmount, customer_id);
        }
        updateFields.push('rideshare_last_trip_date = NOW()');
        updateValues.push(customer_id);
        break;
        
      case 'Cancelled':
        updateFields.push('rideshare_cancelled_requests = rideshare_cancelled_requests + 1');
        updateValues.push(customer_id);
        break;
        
      case 'Created Shared Ride Request':
        updateFields.push('rideshare_created_shared_ride_requests = rideshare_created_shared_ride_requests + 1');
        updateValues.push(customer_id);
        break;
    }

    // Add rating update if provided
    if (rating !== null && rating >= 1 && rating <= 5) {
      const currentTotal = await queryPromise("SELECT COALESCE(rideshare_total_ratings_given, 0) FROM customer_details WHERE customerid = ?", [customer_id]);
      const currentAvg = await queryPromise("SELECT COALESCE(rideshare_average_rating_given, 0) FROM customer_details WHERE customerid = ?", [customer_id]);
      
      const newTotal = currentTotal[0]['COALESCE(rideshare_total_ratings_given, 0)'] + 1;
      const newAvg = ((currentAvg[0]['COALESCE(rideshare_average_rating_given, 0)'] * currentTotal[0]['COALESCE(rideshare_total_ratings_given, 0)']) + rating) / newTotal;
      
      updateFields.push('rideshare_total_ratings_given = ?');
      updateFields.push('rideshare_average_rating_given = ?');
      updateValues.push(newTotal, newAvg, customer_id);
    }

    // Execute the update
    const updateSQL = `UPDATE customer_details SET ${updateFields.join(', ')} WHERE customerid = ?`;
    
    const result = await queryPromise(updateSQL, updateValues);
    
    res.json({
      status: "200",
      message: "Customer rideshare request status updated successfully",
      customer_id,
      status,
      updated_fields: updateFields
    });
    
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Failed to update customer rideshare request status", message: e.message });
  }
});

// Update customer rideshare driver status
CustomerRouter.put("/:id/rideshare_driver_status", async (req, res, next) => {
  try {
    let customer_id = req.params.id;
    const { status, revenue = 0 } = req.body;

    // Validate status
    const validStatuses = ['Created Shared Ride Request', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status", validStatuses });
    }

    // Build dynamic update query based on status
    let updateFields = [];
    let updateValues = [];

    switch(status) {
      case 'Completed':
        updateFields.push('rideshare_driver_completed_trips = rideshare_driver_completed_trips + 1');
        updateValues.push(customer_id);
        if (revenue > 0) {
          updateFields.push('rideshare_driver_earnings = COALESCE(rideshare_driver_earnings, 0) + ?');
          updateFields.push('rideshare_driver_average_earnings = CASE WHEN rideshare_driver_completed_trips > 0 THEN (COALESCE(rideshare_driver_earnings, 0) + ?) / rideshare_driver_completed_trips ELSE COALESCE(rideshare_driver_average_earnings, NULL) END');
          updateValues.push(revenue, customer_id);
        }
        updateFields.push('rideshare_driver_last_trip_date = NOW()');
        updateValues.push(customer_id);
        break;
        
      case 'Cancelled':
        updateFields.push('rideshare_driver_cancelled_trips = rideshare_driver_cancelled_trips + 1');
        updateValues.push(customer_id);
        break;
        
      case 'Created Shared Ride Request':
        updateFields.push('rideshare_driver_created_shared_ride_requests = rideshare_driver_created_shared_ride_requests + 1');
        updateValues.push(customer_id);
        break;
    }

    // Execute the update
    const updateSQL = `UPDATE customer_details SET ${updateFields.join(', ')} WHERE customerid = ?`;
    
    const result = await queryPromise(updateSQL, updateValues);
    
    res.json({
      status: "200",
      message: "Customer rideshare driver status updated successfully",
      customer_id,
      status,
      updated_fields: updateFields
    });
    
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Failed to update customer rideshare driver status", message: e.message });
  }
});

// Helper function for queryPromise (add this to your file)
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
