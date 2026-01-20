const express = require("express");
const RideShareRouter = express.Router();
const RideShareDb = require("../cruds/rideshare");
const notificationTriggers = require("../services/notificationTriggers");

// Helper functions
const logRouteError = (route, req, error, context = {}) => {
  console.error(`❌ ${route} error:`, {
    message: error?.message,
    code: error?.code,
    errno: error?.errno,
    sqlMessage: error?.sqlMessage,
    sqlState: error?.sqlState,
    sql: error?.sql,
    body: req.body,
    params: req.params,
    query: req.query,
    ...context
  });
};

const sendError = (res, req, errorInfo, originalError) => {
  const status = errorInfo.status || 500;
  return res.status(status).json({
    ...errorInfo,
    timestamp: new Date().toISOString(),
    route: errorInfo.route,
    originalError: originalError?.message
  });
};

const calculateDetour = (origin, destination, pickup, dropoff) => {
  // Simplified detour calculation - in real implementation, use proper distance calculation
  return {
    detour_distance: 5, // km
    detour_time: 10 // minutes
  };
};

// Routes
RideShareRouter.get("/trips", async (req, res) => {
  try {
    const { limit } = req.query;
    let trips;
    
    if (limit) {
      trips = await RideShareDb.getAllTripsWithLimit(parseInt(limit));
    } else {
      trips = await RideShareDb.getAllTrips();
    }
    
    res.json(trips);
  } catch (e) {
    console.error("GET /rideshare/trips failed:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

RideShareRouter.get("/closest_20_requests_near_me", async (req, res) => {
  try {
    const { pickup_lat, pickup_lng } = req.query;
    
    if (!pickup_lat || !pickup_lng) {
      return res.status(400).json({ 
        error: "Missing required parameters: pickup_lat and pickup_lng" 
      });
    }

    const lat = parseFloat(pickup_lat);
    const lng = parseFloat(pickup_lng);

    const results = await RideShareDb.getClosestRequests(lat, lng, 20);
    res.json(results);
  } catch (e) {
    console.error("closest_20_requests_near_me failed:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

RideShareRouter.get("/trips/driver/:driver_id", async (req, res) => {
  try {
    res.json(await RideShareDb.getTripsByDriverId(req.params.driver_id));
  } catch (e) {
    logRouteError("GET /rideshare/trips/driver/:driver_id", req, e);
    return sendError(
      res,
      req,
      { status: 500, message: "Failed to fetch trips for driver", route: "GET /rideshare/trips/driver/:driver_id" },
      e
    );
  }
});

RideShareRouter.get("/trips/status/:status", async (req, res) => {
  try {
    res.json(await RideShareDb.getTripsByStatus(req.params.status));
  } catch (e) {
    logRouteError("GET /rideshare/trips/status/:status", req, e);
    return sendError(
      res,
      req,
      { status: 500, message: "Failed to fetch trips by status", route: "GET /rideshare/trips/status/:status" },
      e
    );
  }
});

RideShareRouter.put("/trips/:rideshare_id/seats", async (req, res) => {
  try {
    res.json(
      await RideShareDb.updateTripSeats(
        req.params.rideshare_id,
        req.body.available_seats
      )
    );
  } catch (e) {
    logRouteError("PUT /rideshare/trips/:rideshare_id/seats", req, e);
    return sendError(
      res,
      req,
      { status: 500, message: "Failed to update trip seats", route: "PUT /rideshare/trips/:rideshare_id/seats" },
      e
    );
  }
});

RideShareRouter.put("/trips/:rideshare_id/:status", async (req, res) => {
  try {
    res.json(
      await RideShareDb.updateTripStatus(
        req.params.rideshare_id,
        req.body.status
      )
    );
  } catch (e) {
    logRouteError("PUT /rideshare/trips/:rideshare_id/:status", req, e);
    return sendError(
      res,
      req,
      { status: 500, message: "Failed to update trip status", route: "PUT /rideshare/trips/:rideshare_id/:status" },
      e
    );
  }
});

RideShareRouter.put("/trips/:rideshare_id", async (req, res) => {
  try {
    const allowedFields = ["available_seats", "status", "agreed_fare"];
    const invalid = Object.keys(req.body).filter(
      (k) => !allowedFields.includes(k)
    );

    if (invalid.length) {
      return res.status(400).json({ message: "Invalid fields", invalid, status: 400 });
    }

    const result = await RideShareDb.updateTrip(req.params.rideshare_id, req.body);

    const nextStatus = String(req.body?.status || "").trim().toLowerCase();
    if (nextStatus === "completed") {
      try {
        await RideShareDb.updateRequestsByTripStatus(req.params.rideshare_id, "Completed");
      } catch (e2) {
        logRouteError("PUT /rideshare/trips/:rideshare_id (cascade requests)", req, e2, {
          rideshare_id: req.params.rideshare_id,
        });
        // Do not fail the trip update if request cascade fails.
      }
    }

    res.json(result);
  } catch (e) {
    logRouteError("PUT /rideshare/trips/:rideshare_id", req, e);
    return sendError(
      res,
      req,
      { status: 500, message: "Failed to update trip", route: "PUT /rideshare/trips/:rideshare_id" },
      e
    );
  }
});

RideShareRouter.put("/trips/:rideshare_id/cancel", async (req, res) => {
  try {
    res.json(
      await RideShareDb.cancelTrip(
        req.params.rideshare_id,
        req.body.driver_id
      )
    );
  } catch (e) {
    if (e?.code === "TRIP_NOT_FOUND") {
      return sendError(
        res,
        req,
        { status: 404, message: "Trip not found", route: "PUT /rideshare/trips/:rideshare_id/cancel" },
        e,
        { code: e.code }
      );
    }
    if (e?.code === "NOT_TRIP_OWNER") {
      return sendError(
        res,
        req,
        { status: 403, message: "Not trip owner", route: "PUT /rideshare/trips/:rideshare_id/cancel" },
        e,
        { code: e.code }
      );
    }
    if (e?.code === "TRIP_HAS_PASSENGERS") {
      return sendError(
        res,
        req,
        { status: 409, message: "Trip has passengers", route: "PUT /rideshare/trips/:rideshare_id/cancel" },
        e,
        { code: e.code }
      );
    }

    logRouteError("PUT /rideshare/trips/:rideshare_id/cancel", req, e);
    return sendError(
      res,
      req,
      { status: 500, message: "Failed to cancel trip", route: "PUT /rideshare/trips/:rideshare_id/cancel" },
      e
    );
  }
});

RideShareRouter.delete("/trips/:rideshare_id", async (req, res) => {
  try {
    res.json(await RideShareDb.deleteTrip(req.params.rideshare_id));
  } catch (e) {
    logRouteError("DELETE /rideshare/trips/:rideshare_id", req, e);
    return sendError(
      res,
      req,
      { status: 500, message: "Failed to delete trip", route: "DELETE /rideshare/trips/:rideshare_id" },
      e
    );
  }
});

// Rideshare Requests
RideShareRouter.post("/requests", async (req, res) => {
  try {
    const data = req.body;

    if (!data.detour_distance || !data.detour_time) {
      const trip = await RideShareDb.getTripById(data.rideshare_id);
      if (trip) {
        const d = calculateDetour(
          { lat: trip.origin_lat, lng: trip.origin_lng },
          { lat: trip.destination_lat, lng: trip.destination_lng },
          { lat: data.pickup_lat, lng: data.pickup_lng },
          { lat: data.dropoff_lat, lng: data.dropoff_lng }
        );
        data.detour_distance = d.detour_distance;
        data.detour_time = d.detour_time;
      }
    }

    const result = await RideShareDb.createRequest(data);

    // 📱 NOTIFICATION INTEGRATION: Rideshare Request Created
    if (result && result.insertId) {
      try {
        // Notify nearby drivers about the rideshare request
        await notificationTriggers.notifyNearbyDriversRideshare(
          {
            lat: data.pickup_lat,
            lng: data.pickup_lng
          },
          data.customer_id,
          data.customer_name || 'Customer',
          'rideshare'
        );

        console.log(`📱 Notified nearby drivers about rideshare request ${result.insertId} to ${data.destination}`);

        // Schedule no-match suggestion after 5 minutes
        await notificationTriggers.scheduleSmartNotification(
          data.customer_id,
          'no_match_suggestion',
          {
            currentOffer: data.offer_amount || 0,
            suggestedOffer: Math.ceil((data.offer_amount || 0) * 1.1) // 10% increase
          },
          300 // 5 minutes
        );

      } catch (notificationError) {
        console.error('❌ Error sending rideshare request notification:', notificationError);
        // Don't fail the request creation if notification fails
      }
    }

    res.json(result);
  } catch (e) {
    logRouteError("POST /rideshare/requests", req, e);
    return sendError(res, req, { status: 500, message: "Failed to create request", route: "POST /rideshare/requests" }, e);
  }
});

RideShareRouter.get("/requests/trip/:rideshare_id", async (req, res) => {
  try {
    res.json(await RideShareDb.getRequestsByTrip(req.params.rideshare_id));
  } catch (e) {
    logRouteError("GET /rideshare/requests/trip/:rideshare_id", req, e);
    return sendError(
      res,
      req,
      { status: 500, message: "Failed to fetch requests for trip", route: "GET /rideshare/requests/trip/:rideshare_id" },
      e
    );
  }
});

RideShareRouter.get("/requests/passenger/:passenger_id", async (req, res) => {
  try {
    res.json(
      await RideShareDb.getRequestsByPassengerId(req.params.passenger_id)
    );
  } catch (e) {
    logRouteError("GET /rideshare/requests/passenger/:passenger_id", req, e);
    return sendError(
      res,
      req,
      { status: 500, message: "Failed to fetch requests for passenger", route: "GET /rideshare/requests/passenger/:passenger_id" },
      e
    );
  }
});

RideShareRouter.get("/requests/:request_id", async (req, res) => {
  try {
    const row = await RideShareDb.getRequestById(req.params.request_id);
    if (!row) return res.status(404).json({ message: "Request not found", status: 404 });
    res.json(row);
  } catch (e) {
    logRouteError("GET /rideshare/requests/:request_id", req, e);
    return sendError(
      res,
      req,
      { status: 500, message: "Failed to fetch request", route: "GET /rideshare/requests/:request_id" },
      e
    );
  }
});

RideShareRouter.put("/requests/:request_id", async (req, res) => {
  try {
    res.json(
      await RideShareDb.updateRequest(req.params.request_id, req.body)
    );
  } catch (e) {
    logRouteError("PUT /rideshare/requests/:request_id", req, e);
    return sendError(
      res,
      req,
      { status: 500, message: "Failed to update request", route: "PUT /rideshare/requests/:request_id" },
      e
    );
  }
});

// ========================
// ADDITIONAL ENDPOINTS FOR ANALYTICS
// ========================

// Get all rideshare trips (for analytics)
RideShareRouter.get("/", async (req, res) => {
  try {
    const { limit } = req.query;
    let trips;
    
    if (limit) {
      trips = await RideShareDb.getAllTripsWithLimit(parseInt(limit));
    } else {
      trips = await RideShareDb.getAllTrips();
    }
    
    res.json(trips);
  } catch (e) {
    console.error("GET /rideshare/ failed:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all rideshare requests (for analytics)
RideShareRouter.get("/requests/all", async (req, res) => {
  try {
    const pool = require("../cruds/poolfile");
    const query = 'SELECT * FROM rideshare_requests ORDER BY request_id DESC';
    
    pool.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching all rideshare requests:', err);
        return res.status(500).json({ error: 'Failed to fetch rideshare requests' });
      }
      res.json(results);
    });
  } catch (error) {
    console.error('Error fetching rideshare requests:', error);
    res.status(500).json({ error: 'Failed to fetch rideshare requests' });
  }
});

// Get rideshare analytics summary
RideShareRouter.get("/analytics/summary", async (req, res) => {
  try {
    const pool = require("../cruds/poolfile");
    
    // Get rideshare trips summary
    const tripsQuery = `
      SELECT 
        COUNT(*) as total_trips,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_trips,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_trips,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_trips,
        SUM(total_seats) as total_seats,
        SUM(total_seats - available_seats) as occupied_seats,
        AVG(fare_estimate) as avg_fare_estimate
      FROM rideshare_trips
    `;
    
    // Get rideshare requests summary
    const requestsQuery = `
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as accepted_requests,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_requests,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_requests
      FROM rideshare_requests
    `;
    
    pool.query(tripsQuery, (err, tripsResults) => {
      if (err) {
        console.error('Error fetching rideshare trips analytics:', err);
        return res.status(500).json({ error: 'Failed to fetch rideshare analytics' });
      }
      
      pool.query(requestsQuery, (err, requestsResults) => {
        if (err) {
          console.error('Error fetching rideshare requests analytics:', err);
          return res.status(500).json({ error: 'Failed to fetch rideshare analytics' });
        }
        
        const tripsData = tripsResults[0] || {};
        const requestsData = requestsResults[0] || {};
        
        // Calculate derived metrics
        const occupancyRate = tripsData.total_seats > 0 ? 
          (tripsData.occupied_seats / tripsData.total_seats) * 100 : 0;
        
        const analytics = {
          trips: {
            total: tripsData.total_trips || 0,
            active: tripsData.active_trips || 0,
            completed: tripsData.completed_trips || 0,
            cancelled: tripsData.cancelled_trips || 0,
            totalSeats: tripsData.total_seats || 0,
            occupiedSeats: tripsData.occupied_seats || 0,
            occupancyRate: occupancyRate.toFixed(2),
            avgFareEstimate: parseFloat(tripsData.avg_fare_estimate || 0).toFixed(2)
          },
          requests: {
            total: requestsData.total_requests || 0,
            accepted: requestsData.accepted_requests || 0,
            pending: requestsData.pending_requests || 0,
            completed: requestsData.completed_requests || 0,
            avgResponseTime: 0 // Field doesn't exist in database
          }
        };
        
        res.json(analytics);
      });
    });
  } catch (error) {
    console.error('Error fetching rideshare analytics:', error);
    res.status(500).json({ error: 'Failed to fetch rideshare analytics' });
  }
});

module.exports = RideShareRouter;
