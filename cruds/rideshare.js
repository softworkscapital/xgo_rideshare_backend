require("dotenv").config();
const pool = require("./poolfile");

let crudsObj = {};

/* ========================
   Helper Functions (Haversine)
======================== */
crudsObj.calculateDistance = (coord1, coord2) => {
  const R = 6371; // km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(coord1.lat * Math.PI / 180) *
      Math.cos(coord2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

crudsObj.calculateDetour = (tripOrigin, tripDestination, pickupLocation, dropoffLocation) => {
  const originalDistance = crudsObj.calculateDistance(tripOrigin, tripDestination);
  const detourDistance =
    crudsObj.calculateDistance(tripOrigin, pickupLocation) +
    crudsObj.calculateDistance(pickupLocation, dropoffLocation) +
    crudsObj.calculateDistance(dropoffLocation, tripDestination);
  const extraDistance = detourDistance - originalDistance;
  const extraTime = Math.round((extraDistance / 50) * 60); // minutes
  return { detour_distance: extraDistance.toFixed(2), detour_time: extraTime };
};

/* ========================
   Rideshare Trips
======================== */
crudsObj.createTrip = (tripData) =>
  new Promise((resolve, reject) => {
    const {
      driver_id,
      origin_lat,
      origin_lng,
      destination_lat,
      destination_lng,
      origin_name,
      destination_name,
      total_seats,
      available_seats,
      fare_estimate = "1.00",
      status = "Created Shared Ride Request",
    } = tripData;

    pool.query(
      `INSERT INTO rideshare_trips (
        driver_id, origin_lat, origin_lng, destination_lat, destination_lng,
        origin_name, destination_name, total_seats, available_seats, fare_estimate, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        driver_id,
        origin_lat,
        origin_lng,
        destination_lat,
        destination_lng,
        origin_name,
        destination_name,
        total_seats,
        available_seats,
        fare_estimate,
        status,
      ],
      (err, result) => {
        if (err) return reject(err);
        resolve({ status: 200, message: "Trip created", rideshare_id: result.insertId });
      }
    );
  });

crudsObj.getAllTrips = () =>
  new Promise((resolve, reject) => {
    pool.query("SELECT * FROM rideshare_trips ORDER BY rideshare_id DESC", (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

crudsObj.getAllTripsWithLimit = (limit) =>
  new Promise((resolve, reject) => {
    const sql = "SELECT * FROM rideshare_trips ORDER BY rideshare_id DESC LIMIT ?";
    pool.query(sql, [limit], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });


/* ========================
   GEO: Closest Requests
======================== */

crudsObj.getClosestRequests = (lat, lng, limit = 20) =>
  new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        request_id,
        rideshare_id,
        passenger_id,
        pickup_lat,
        pickup_lng,
        dropoff_lat,
        dropoff_lng,
        offer_amount,
        accepted_amount,
        status,
        seat_number,
        created_at,
        updated_at,
        fare_offer,
        (
          6371 * acos(
            cos(radians(?))
            * cos(radians(pickup_lat))
            * cos(radians(pickup_lng) - radians(?))
            + sin(radians(?))
            * sin(radians(pickup_lat))
          )
        ) AS distance_km
      FROM rideshare_requests
      ORDER BY distance_km
      LIMIT ?
    `;

    pool.query(sql, [lat, lng, lat, limit], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });


crudsObj.getTripById = (rideshare_id) =>
  new Promise((resolve, reject) => {
    pool.query("SELECT * FROM rideshare_trips WHERE rideshare_id = ?", [rideshare_id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });

crudsObj.getTripsByDriverId = (driver_id) =>
  new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM rideshare_trips WHERE driver_id = ? ORDER BY rideshare_id DESC",
      [driver_id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });

crudsObj.getTripsByStatus = (status) =>
  new Promise((resolve, reject) => {
    pool.query("SELECT * FROM rideshare_trips WHERE status = ? ORDER BY rideshare_id DESC", [status], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

crudsObj.updateTrip = (rideshare_id, updatedData) =>
  new Promise((resolve, reject) => {
    const { available_seats, status, agreed_fare } = updatedData;
    pool.query(
      `UPDATE rideshare_trips SET available_seats = ?, status = ?, agreed_fare = ? WHERE rideshare_id = ?`,
      [available_seats, status, agreed_fare, rideshare_id],
      (err) => {
        if (err) return reject(err);
        resolve({ status: 200, message: "Trip updated" });
      }
    );
  });

crudsObj.updateTripStatus = (rideshare_id, status) =>
  new Promise((resolve, reject) => {
    pool.query("UPDATE rideshare_trips SET status = ? WHERE rideshare_id = ?", [status, rideshare_id], (err) => {
      if (err) return reject(err);
      resolve({ status: 200, message: "Trip status updated" });
    });
  });

crudsObj.updateTripSeats = (rideshare_id, available_seats) =>
  new Promise((resolve, reject) => {
    pool.query("UPDATE rideshare_trips SET available_seats = ? WHERE rideshare_id = ?", [available_seats, rideshare_id], (err) => {
      if (err) return reject(err);
      resolve({ status: 200, message: "Trip seats updated" });
    });
  });

crudsObj.deleteTrip = (rideshare_id) =>
  new Promise((resolve, reject) => {
    pool.query("DELETE FROM rideshare_trips WHERE rideshare_id = ?", [rideshare_id], (err) => {
      if (err) return reject(err);
      resolve({ status: 200, message: "Trip deleted" });
    });
  });

/* ========================
   Rideshare Requests
======================== */
crudsObj.createRequest = (requestData) =>
  new Promise(async (resolve, reject) => {
    const {
      rideshare_id,
      passenger_id,
      pickup_lat,
      pickup_lng,
      dropoff_lat,
      dropoff_lng,
      pickup_name,
      dropoff_name,
      fare_offer,
      offer_amount,
      detour_distance,
      detour_time,
      status = "Join Shared Ride Request",
    } = requestData;

    // Use offer_amount if provided, otherwise fallback to fare_offer
    const finalOfferAmount = offer_amount || fare_offer || 0;

    const finalDetour = detour_distance && detour_time ? { detour_distance, detour_time } : await (() => {
      return new Promise(async (res) => {
        const trip = await crudsObj.getTripById(rideshare_id);
        if (!trip) return res({ detour_distance: 0, detour_time: 0 });
        res(crudsObj.calculateDetour(
          { lat: trip.origin_lat, lng: trip.origin_lng },
          { lat: trip.destination_lat, lng: trip.destination_lng },
          { lat: pickup_lat, lng: pickup_lng },
          { lat: dropoff_lat, lng: dropoff_lng }
        ));
      });
    })();

    pool.query(
      `INSERT INTO rideshare_requests (
        rideshare_id, passenger_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng,
        pickup_name, dropoff_name, offer_amount, fare_offer, detour_distance, detour_time, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rideshare_id,
        passenger_id,
        pickup_lat,
        pickup_lng,
        dropoff_lat,
        dropoff_lng,
        pickup_name || null,
        dropoff_name || null,
        finalOfferAmount,
        finalOfferAmount, // Store in both fields for backwards compatibility
        finalDetour.detour_distance,
        finalDetour.detour_time,
        status,
      ],
      (err, result) => {
        if (err) return reject(err);
        resolve({ status: 200, message: "Request created", request_id: result.insertId });
      }
    );
  });

crudsObj.getRequestsByTrip = (rideshare_id) =>
  new Promise((resolve, reject) => {
    pool.query("SELECT * FROM rideshare_requests WHERE rideshare_id = ?", [rideshare_id], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

 crudsObj.getRequestsByPassengerId = (passenger_id) =>
   new Promise((resolve, reject) => {
     pool.query(
       "SELECT * FROM rideshare_requests WHERE passenger_id = ? ORDER BY request_id DESC",
       [passenger_id],
       (err, results) => {
         if (err) return reject(err);
         resolve(results);
       }
     );
   });

crudsObj.getAllRequests = () =>
  new Promise((resolve, reject) => {
    pool.query("SELECT * FROM rideshare_requests ORDER BY request_id DESC", (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

crudsObj.getRequestById = (request_id) =>
  new Promise((resolve, reject) => {
    pool.query("SELECT * FROM rideshare_requests WHERE request_id = ?", [request_id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });

crudsObj.updateRequest = (request_id, updatedData) =>
  new Promise((resolve, reject) => {
    const { status, fare_offer } = updatedData;
    
    console.log(`[CRUD] updateRequest - ID: ${request_id}, Status: ${status}, Fare: ${fare_offer}`);
    
    pool.query(
      "UPDATE rideshare_requests SET status = ?, fare_offer = ? WHERE request_id = ?",
      [status, fare_offer, request_id],
      (err, result) => {
        if (err) {
          console.error(`[CRUD] updateRequest - Error:`, err);
          return reject(err);
        }
        
        console.log(`[CRUD] updateRequest - Success: ${result.affectedRows} rows affected`);
        
        resolve({ status: 200, message: "Request updated", affectedRows: result.affectedRows });
      }
    );
  });

crudsObj.updateRequestsByTripStatus = (rideshare_id, status) =>
  new Promise((resolve, reject) => {
    pool.query(
      "UPDATE rideshare_requests SET status = ? WHERE rideshare_id = ?",
      [status, rideshare_id],
      (err, result) => {
        if (err) return reject(err);
        resolve({ status: 200, message: "Trip requests updated", affectedRows: result?.affectedRows ?? 0 });
      }
    );
  });

/* ========================
   Negotiation History
======================== */
crudsObj.addNegotiation = (negotiationData) =>
  new Promise((resolve, reject) => {
    const { request_id, driver_id, passenger_id, offer_amount, status } = negotiationData;
    const offerNum = typeof offer_amount === "number" ? offer_amount : parseFloat(String(offer_amount));

    if (!Number.isFinite(offerNum)) {
      return reject(new Error("Invalid offer_amount"));
    }

    // Determine offer_type and set IDs accordingly
    // Only ONE of driver_id or passenger_id should be set per record
    let offerType, finalDriverId, finalPassengerId;
    
    if (driver_id != null && driver_id !== "") {
      // Driver sent this offer
      offerType = 'driver';
      finalDriverId = String(driver_id);
      finalPassengerId = null; // Passenger ID should be NULL for driver offers
    } else {
      // Passenger sent this offer
      offerType = 'passenger';
      finalDriverId = null; // Driver ID should be NULL for passenger offers
      finalPassengerId = passenger_id == null || passenger_id === "" ? null : String(passenger_id);
    }

    // First, mark any previous 'Pending' records as 'Counter Offer' 
    // This shows the previous offer was responded to
    pool.query(
      `UPDATE rideshare_negotiation_history 
       SET status = 'Counter Offer' 
       WHERE request_id = ? AND status = 'Pending'`,
      [request_id],
      (updateErr) => {
        if (updateErr) {
          console.error("Error updating previous pending offers:", updateErr);
          // Continue anyway - not critical
        }
        
        // Now insert the new negotiation record with 'Pending' status and offer_type
        pool.query(
          `INSERT INTO rideshare_negotiation_history
            (request_id, driver_id, passenger_id, offer_type, offer_amount, status)
           VALUES (?, ?, ?, ?, ?, 'Pending')`,
          [request_id, finalDriverId, finalPassengerId, offerType, offerNum],
          (err) => {
            if (err) return reject(err);
            resolve({ status: 200, message: "Negotiation logged" });
          }
        );
      }
    );
  });

// Add to rideshare.js cruds
crudsObj.markBidAsViewed = (request_id, driver_id) =>
  new Promise((resolve, reject) => {
    // Mark negotiation as viewed with timestamp
    pool.query(
      `UPDATE rideshare_negotiation_history 
       SET viewed_at = CURRENT_TIMESTAMP, status = 'Viewed'
       WHERE request_id = ? AND driver_id = ? AND status IN ('Pending', 'Active')`,
      [request_id, driver_id],
      (err) => {
        if (err) return reject(err);
        resolve({ status: 200, message: "Bid marked as viewed" });
      }
    );
  });

crudsObj.checkBidExpiration = (request_id) =>
  new Promise((resolve, reject) => {
    // Check if any viewed bids have expired (2 minutes)
    pool.query(
      `UPDATE rideshare_negotiation_history 
       SET status = 'Expired'
       WHERE request_id = ? 
       AND status = 'Viewed' 
       AND viewed_at < DATE_SUB(NOW(), INTERVAL 2 MINUTE)`,
      [request_id],
      (err) => {
        if (err) return reject(err);
        resolve({ status: 200, message: "Expired bids updated" });
      }
    );
  });

crudsObj.checkRequestExpiration = () =>
  new Promise((resolve, reject) => {
    // Auto-expire requests older than 15 minutes with no accepted bids
    pool.query(
      `UPDATE rideshare_requests r
       SET r.status = 'Expired'
       WHERE r.status IN ('Negotiating', 'Join Shared Ride Request')
       AND r.created_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE)
       AND NOT EXISTS (
         SELECT 1 FROM rideshare_requests r2 
         WHERE r2.rideshare_id = r.rideshare_id 
         AND r2.status = 'Accepted'
       )`,
      (err) => {
        if (err) return reject(err);
        resolve({ status: 200, message: "Old requests expired" });
      }
    );
  });

crudsObj.getNegotiationHistory = (request_id) =>
  new Promise((resolve, reject) => {
    const { isExpired } = require('../utils/timezone');
    
    pool.query(
      "SELECT * FROM rideshare_negotiation_history WHERE request_id = ? ORDER BY created_at ASC",
      [request_id],
      (err, results) => {
        if (err) return reject(err);
        
        // Auto-expire ONLY 'Pending' status records older than 5 minutes
        // 'Counter Offer' and other statuses do NOT expire
        results.forEach(item => {
          if (item.status === 'Pending' && item.created_at) {
            const entryExpired = isExpired(item.created_at, 5);
            
            if (entryExpired) {
              // Mark this pending offer as expired
              pool.query(
                "UPDATE rideshare_negotiation_history SET status = 'Expired' WHERE id = ?",
                [item.id],
                (updateErr) => {
                  if (updateErr) {
                    console.error("Error marking negotiation entry as expired:", updateErr);
                  }
                }
              );
              // Update the item in results array for immediate display
              item.status = 'Expired';
            }
          }
        });
        
        // Return all negotiation records for this request_id
        // Show complete negotiation timeline including expired offers
        resolve(results || []);
      }
    );
  });

/* ========================
   Cancel Trip with Ownership
======================== */
crudsObj.cancelTrip = (rideshare_id, driver_id) =>
  new Promise((resolve, reject) => {
    pool.query("SELECT driver_id, status FROM rideshare_trips WHERE rideshare_id = ?", [rideshare_id], (err, tripRows) => {
      if (err) return reject(err);
      if (!tripRows.length) return reject({ code: "TRIP_NOT_FOUND" });
      if (tripRows[0].driver_id !== driver_id) return reject({ code: "NOT_TRIP_OWNER" });
      if (tripRows[0].status === "Cancelled") return resolve({ status: 200, message: "Trip already cancelled" });

      pool.query(
        "SELECT request_id FROM rideshare_requests WHERE rideshare_id = ? AND status IN ('Accepted','Join Shared Ride Request') LIMIT 1",
        [rideshare_id],
        (err, requestRows) => {
          if (err) return reject(err);
          if (requestRows.length) return reject({ code: "TRIP_HAS_PASSENGERS" });

          pool.query("UPDATE rideshare_trips SET status = 'Cancelled' WHERE rideshare_id = ?", [rideshare_id], (err) => {
            if (err) return reject(err);
            resolve({ status: 200, message: "Trip cancelled successfully" });
          });
        }
      );
    });
  });

/* ========================
   Rideshare Midpoints
======================== */
crudsObj.addMidpoints = (rideshare_id, midpoints) =>
  new Promise((resolve, reject) => {
    const values = midpoints.map((m, i) => [rideshare_id, m.lat, m.lng, i + 1]);
    pool.query("INSERT INTO rideshare_midpoints (rideshare_id, lat, lng, sequence) VALUES ?", [values], (err) => {
      if (err) return reject(err);
      resolve({ status: 200, message: "Midpoints added" });
    });
  });

crudsObj.getMidpoints = (rideshare_id) =>
  new Promise((resolve, reject) => {
    pool.query("SELECT * FROM rideshare_midpoints WHERE rideshare_id = ? ORDER BY sequence ASC", [rideshare_id], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

/* ========================
   Fare Updates
======================== */
crudsObj.addFareUpdate = (fareData) =>
  new Promise((resolve, reject) => {
    const { rideshare_id, passenger_id, old_fare, new_fare } = fareData;
    pool.query("INSERT INTO rideshare_fare_updates (rideshare_id, passenger_id, old_fare, new_fare) VALUES (?, ?, ?, ?)", [rideshare_id, passenger_id, old_fare, new_fare], (err) => {
      if (err) return reject(err);
      resolve({ status: 200, message: "Fare update logged" });
    });
  });

crudsObj.getFareUpdates = (rideshare_id) =>
  new Promise((resolve, reject) => {
    pool.query("SELECT * FROM rideshare_fare_updates WHERE rideshare_id = ?", [rideshare_id], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

/* ========================
   Feedback Methods (matching trip table pattern)
======================== */

crudsObj.updateCustomerComment = (request_id, updatedValues) => {
  const { customer_comment_for_driver, customer_rates_driver, status } = updatedValues;

  return new Promise((resolve, reject) => {
    const customer_feedback_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    pool.query(
      `UPDATE rideshare_requests 
       SET customer_comment_for_driver = ?, customer_rates_driver = ?, customer_feedback_date = ?, status = ?
       WHERE request_id = ?`,
      [customer_comment_for_driver, customer_rates_driver, customer_feedback_date, status, request_id],
      (err, result) => {
        if (err) return reject(err);
        if (result.affectedRows === 0) {
          return reject(new Error('Rideshare request not found'));
        }
        resolve({
          status: 200,
          message: 'Customer feedback updated successfully',
          request_id: request_id,
          feedback: {
            customer_comment_for_driver,
            customer_rates_driver,
            customer_feedback_date,
            status
          }
        });
      }
    );
  });
};

crudsObj.updateDriverComment = (request_id, updatedValues) => {
  const { driver_comment_for_customer, driver_rates_customer, status } = updatedValues;

  return new Promise((resolve, reject) => {
    const driver_feedback_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    pool.query(
      `UPDATE rideshare_requests 
       SET driver_comment_for_customer = ?, driver_rates_customer = ?, driver_feedback_date = ?, status = ?
       WHERE request_id = ?`,
      [driver_comment_for_customer, driver_rates_customer, driver_feedback_date, status, request_id],
      (err, result) => {
        if (err) return reject(err);
        if (result.affectedRows === 0) {
          return reject(new Error('Rideshare request not found'));
        }
        resolve({
          status: 200,
          message: 'Driver feedback updated successfully',
          request_id: request_id,
          feedback: {
            driver_comment_for_customer,
            driver_rates_customer,
            driver_feedback_date,
            status
          }
        });
      }
    );
  });
};

crudsObj.getTripFeedback = (request_id) =>
  new Promise((resolve, reject) => {
    pool.query(
      `SELECT request_id, customer_comment_for_driver, driver_comment_for_customer, driver_rates_customer, customer_rates_driver, customer_feedback_date, driver_feedback_date
       FROM rideshare_requests 
       WHERE request_id = ?`,
      [request_id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      }
    );
  });

crudsObj.getAllFeedback = () =>
  new Promise((resolve, reject) => {
    pool.query(
      `SELECT rr.*, rd.driver_id, rd.origin_name, rd.destination_name, u.username, u.name as driver_name,
              cd.name as customer_name
       FROM rideshare_requests rr
       LEFT JOIN rideshare_trips rd ON rr.rideshare_id = rd.rideshare_id
       LEFT JOIN users u ON rd.driver_id = u.userid
       LEFT JOIN customer_details cd ON rr.customer_id = cd.customerid
       WHERE (rr.customer_rates_driver IS NOT NULL OR rr.driver_rates_customer IS NOT NULL)
       ORDER BY GREATEST(rr.customer_feedback_date, rr.driver_feedback_date) DESC`,
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });

crudsObj.getFeedbackStats = () =>
  new Promise((resolve, reject) => {
    pool.query(
      `SELECT 
        COUNT(*) as total_feedback,
        AVG(driver_rates_customer) as average_driver_rating,
        AVG(customer_rates_driver) as average_customer_rating,
        COUNT(CASE WHEN driver_rates_customer = 5 THEN 1 END) as driver_five_star,
        COUNT(CASE WHEN driver_rates_customer = 4 THEN 1 END) as driver_four_star,
        COUNT(CASE WHEN driver_rates_customer = 3 THEN 1 END) as driver_three_star,
        COUNT(CASE WHEN driver_rates_customer = 2 THEN 1 END) as driver_two_star,
        COUNT(CASE WHEN driver_rates_customer = 1 THEN 1 END) as driver_one_star,
        COUNT(CASE WHEN customer_rates_driver = 5 THEN 1 END) as customer_five_star,
        COUNT(CASE WHEN customer_rates_driver = 4 THEN 1 END) as customer_four_star,
        COUNT(CASE WHEN customer_rates_driver = 3 THEN 1 END) as customer_three_star,
        COUNT(CASE WHEN customer_rates_driver = 2 THEN 1 END) as customer_two_star,
        COUNT(CASE WHEN customer_rates_driver = 1 THEN 1 END) as customer_one_star
       FROM rideshare_requests 
       WHERE driver_rates_customer IS NOT NULL OR customer_rates_driver IS NOT NULL`,
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      }
    );
  });

/* ========================
   Billing Preference Methods for Rideshare
======================== */

crudsObj.calculateRideshareBillingWithPreference = (driverId, distance, account_category) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get driver's billing preference
      const usersDb = require('./users');
      const billingPreference = await usersDb.getBillingPreference(driverId);
      
      // Get tariffs based on distance and account category
      const tarrifsDb = require('./tarrifs');
      const tariffs = await tarrifsDb.getActiveTarrifByDistance(distance, account_category);
      
      if (tariffs.length === 0) {
        return reject(new Error('No tariff found for given distance and category'));
      }
      
      const tariff = tariffs[0];
      let billingAmount = 0;
      let billingType = billingPreference || 'percentage'; // Default to percentage
      let commissionAmount = 0;
      let driverEarnings = 0;
      
      if (billingType === 'percentage') {
        // Percentage-based billing: apply rate to base price
        billingAmount = tariff.lower_price_limit * (tariff.rate / 100);
        commissionAmount = billingAmount * 0.2; // 20% commission
        driverEarnings = billingAmount - commissionAmount;
      } else {
        // Daily-based billing: use fixed daily rate
        billingAmount = tariff.rate; // Assuming rate is daily amount
        commissionAmount = billingAmount * 0.15; // 15% commission for daily
        driverEarnings = billingAmount - commissionAmount;
      }
      
      resolve({
        billing_amount: billingAmount,
        billing_type: billingType,
        commission_amount: commissionAmount,
        driver_earnings: driverEarnings,
        tariff_used: tariff,
        calculation: {
          base_price: tariff.lower_price_limit,
          rate: tariff.rate,
          billing_preference: billingType,
          commission_rate: billingType === 'percentage' ? 0.2 : 0.15
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

crudsObj.updateRideshareBilling = (rideshareId, billingData) => {
  return new Promise((resolve, reject) => {
    const {
      billing_amount,
      billing_type,
      commission_amount,
      driver_earnings
    } = billingData;
    
    pool.query(
      `UPDATE rideshare_trips 
       SET billing_amount = ?, billing_type = ?, commission_amount = ?, driver_earnings = ?
       WHERE rideshare_id = ?`,
      [billing_amount, billing_type, commission_amount, driver_earnings, rideshareId],
      (err, result) => {
        if (err) return reject(err);
        if (result.affectedRows === 0) {
          return reject(new Error('Rideshare trip not found'));
        }
        resolve({
          status: 200,
          message: 'Rideshare billing updated successfully',
          rideshare_id: rideshareId,
          billing_data: billingData
        });
      }
    );
  });
};

crudsObj.getRideshareDriverEarnings = (driverId, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        rideshare_id,
        billing_amount,
        billing_type,
        commission_amount,
        driver_earnings,
        created_at,
        origin_name,
        destination_name
      FROM rideshare_trips 
      WHERE driver_id = ? 
      AND created_at BETWEEN ? AND ?
      AND status = 'Completed'
      ORDER BY created_at DESC
    `;
    
    pool.query(query, [driverId, startDate, endDate], (err, results) => {
      if (err) return reject(err);
      
      // Calculate totals
      const totals = results.reduce((acc, trip) => {
        acc.total_earnings += parseFloat(trip.driver_earnings || 0);
        acc.total_commission += parseFloat(trip.commission_amount || 0);
        acc.total_trips += 1;
        return acc;
      }, {
        total_earnings: 0,
        total_commission: 0,
        total_trips: 0
      });
      
      resolve({
        trips: results,
        totals: totals
      });
    });
  });
};

crudsObj.getRideshareBillingStats = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        billing_type,
        COUNT(*) as trip_count,
        SUM(billing_amount) as total_billing,
        SUM(commission_amount) as total_commission,
        SUM(driver_earnings) as total_earnings,
        AVG(billing_amount) as avg_billing_per_trip,
        AVG(driver_earnings) as avg_earnings_per_trip
      FROM rideshare_trips 
      WHERE billing_amount IS NOT NULL 
      AND status = 'Completed'
      GROUP BY billing_type
      ORDER BY trip_count DESC
    `;
    
    pool.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// NEW: Get all active rideshare requests (negotiated and expired)
crudsObj.getAllActiveRideshareRequests = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM rideshare_requests 
      WHERE status IN ('Join Shared Ride Request', 'Negotiating')
      ORDER BY created_at DESC
    `;
    
    pool.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// NEW: Control panel settings CRUD operations
crudsObj.getControlPanelSetting = (settingKey) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT setting_value, setting_type 
      FROM control_panel_settings 
      WHERE setting_key = ?
    `;
    
    pool.query(query, [settingKey], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) {
        return resolve(null); // Setting not found
      }
      resolve(results[0]);
    });
  });
};

crudsObj.updateControlPanelSetting = (settingKey, settingValue, settingType = 'string', description = null) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO control_panel_settings (setting_key, setting_value, setting_type, description) 
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      setting_value = VALUES(setting_value),
      updated_at = CURRENT_TIMESTAMP
    `;
    
    pool.query(query, [settingKey, settingValue, settingType, description], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

crudsObj.getAllControlPanelSettings = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT setting_key, setting_value, setting_type, description, updated_at
      FROM control_panel_settings 
      ORDER BY setting_key
    `;
    
    pool.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = crudsObj;
