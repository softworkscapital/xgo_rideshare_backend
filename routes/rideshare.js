const express = require("express");

const RideShareRouter = express.Router();

const RideShareDb = require("../cruds/rideshare");

const notificationTriggers = require("../services/notificationTriggers");

const batchNotificationTriggers = require("../services/batchNotificationTriggers");

const smsNotificationService = require("../services/smsNotificationService");

const pool = require("../cruds/poolfile");



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



// Simple detour calculation function

const calculateDetour = (origin, destination, pickup, dropoff) => {

  // Haversine distance calculation

  const haversineDistance = (lat1, lon1, lat2, lon2) => {

    const R = 6371; // Earth's radius in km

    const dLat = (lat2 - lat1) * Math.PI / 180;

    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +

              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *

              Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;

  };



  try {

    // Calculate original route distance

    const originalDistance = haversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);

    

    // Calculate detour route distance (origin -> pickup -> dropoff -> destination)

    const leg1 = haversineDistance(origin.lat, origin.lng, pickup.lat, pickup.lng);

    const leg2 = haversineDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);

    const leg3 = haversineDistance(dropoff.lat, dropoff.lng, destination.lat, destination.lng);

    const detourDistance = leg1 + leg2 + leg3;

    

    // Calculate detour time (assuming 40 km/h average speed)

    const avgSpeed = 40; // km/h

    const detourTime = (detourDistance / avgSpeed) * 60; // in minutes

    

    return {

      detour_distance: detourDistance - originalDistance,

      detour_time: detourTime

    };

  } catch (error) {

    console.error('Error in calculateDetour:', error);

    return {

      detour_distance: 0,

      detour_time: 0

    };

  }

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



// Haversine distance calculation

const haversineDistance = (lat1, lon1, lat2, lon2) => {

  const R = 6371; // Radius of Earth in km

  const dLat = (lat2 - lat1) * Math.PI / 180;

  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = 

    Math.sin(dLat/2) * Math.sin(dLat/2) +

    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 

    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in km

};



// Calculate detour with proper distance calculation

const calculateDetourWithWaypoints = (trip, passenger, maxDetourDistance) => {

  if (!trip || !passenger) {

    return {

      detourDistance: 0,

      detourTime: 0,

      isWithinDetourLimit: false,

    };

  }



  // Validate coordinates

  const hasValidCoords = (lat, lng) => {

    return lat != null && lng != null && 

           !isNaN(Number(lat)) && !isNaN(Number(lng)) &&

           Number(lat) >= -90 && Number(lat) <= 90 &&

           Number(lng) >= -180 && Number(lng) <= 180;

  };



  if (!hasValidCoords(trip.origin_lat, trip.origin_lng) ||

      !hasValidCoords(trip.destination_lat, trip.destination_lng) ||

      !hasValidCoords(passenger.pickup_lat, passenger.pickup_lng) ||

      !hasValidCoords(passenger.dropoff_lat, passenger.dropoff_lng)) {

    return {

      detourDistance: 0,

      detourTime: 0,

      isWithinDetourLimit: false,

    };

  }



  // Calculate distances

  const driverRouteDistance = haversineDistance(

    Number(trip.origin_lat), Number(trip.origin_lng),

    Number(trip.destination_lat), Number(trip.destination_lng)

  );



  const detourRouteDistance = 

    haversineDistance(Number(trip.origin_lat), Number(trip.origin_lng), 

                     Number(passenger.pickup_lat), Number(passenger.pickup_lng)) +

    haversineDistance(Number(passenger.pickup_lat), Number(passenger.pickup_lng), 

                     Number(passenger.dropoff_lat), Number(passenger.dropoff_lng)) +

    haversineDistance(Number(passenger.dropoff_lat), Number(passenger.dropoff_lng), 

                     Number(trip.destination_lat), Number(trip.destination_lng));



  const detourDistance = detourRouteDistance - driverRouteDistance;

  const avgSpeed = 40; // km/h

  const detourTime = (detourDistance / avgSpeed) * 60; // minutes

  const isWithinDetourLimit = detourDistance <= maxDetourDistance;



  return {

    detourDistance,

    detourTime,

    isWithinDetourLimit,

  };

};



// Get detour settings from database

const getDetourSettings = async () => {

  return new Promise((resolve, reject) => {

    const query = `

      SELECT * FROM ride_matching_settings 

      WHERE setting_type = 'detour_distance' 

      ORDER BY created_at DESC 

      LIMIT 1

    `;

    

    pool.query(query, (err, results) => {

      if (err) {

        console.error('Error fetching detour settings:', err);

        return reject(err);

      }

      

      let settings = {

        default_detour_distance: 20.0,

        min_detour_distance: 0.5,

        max_detour_distance: 50.0,

        detour_increment: 5.0,

        auto_detour_expansion: false,

        expansion_time_limit: 300,

        max_auto_expansions: 3

      };

      

      if (results.length > 0) {

        try {

          const dbSettings = JSON.parse(results[0].settings_json);

          settings = { ...settings, ...dbSettings };

        } catch (parseErr) {

          console.error('Error parsing detour settings:', parseErr);

        }

      }

      

      resolve(settings);

    });

  });

};



// Routes

// NEW: Ride matching endpoint with detour logic

RideShareRouter.post("/matching", async (req, res) => {

  try {

    const { 

      pickup_lat, 

      pickup_lng, 

      dropoff_lat, 

      dropoff_lng,

      passenger_id 

    } = req.body;



    // Validate required parameters

    if (!pickup_lat || !pickup_lng || !dropoff_lat || !dropoff_lng) {

      return res.status(400).json({ 

        success: false,

        error: "Missing required parameters: pickup_lat, pickup_lng, dropoff_lat, dropoff_lng" 

      });

    }



    // Validate coordinates

    const coords = [pickup_lat, pickup_lng, dropoff_lat, dropoff_lng];

    for (const coord of coords) {

      const num = parseFloat(coord);

      if (isNaN(num)) {

        return res.status(400).json({ 

          success: false,

          error: "Invalid coordinate format" 

        });

      }

    }



    // Get detour settings

    let detourSettings;

    try {

      detourSettings = await getDetourSettings();

      console.log('Using detour settings:', detourSettings);

    } catch (err) {

      console.error('Failed to fetch detour settings, using defaults:', err);

      detourSettings = {

        default_detour_distance: 20.0,

        min_detour_distance: 0.5,

        max_detour_distance: 50.0,

        detour_increment: 5.0,

        auto_detour_expansion: false,

        expansion_time_limit: 300,

        max_auto_expansions: 3

      };

    }



    // Get all available trips

    let allTrips;

    try {

      allTrips = await RideShareDb.getAllTrips();

    } catch (err) {

      console.error('Failed to fetch trips:', err);

      return res.status(500).json({

        success: false,

        error: 'Failed to fetch available trips'

      });

    }



    // Filter for trips with available seats

    const availableTrips = allTrips.filter(trip => {

      return trip && 

             Number(trip.available_seats) > 0 && 

             trip.status === 'Created Shared Ride Request';

    });



    // Calculate detour for each trip

    const passenger = {

      pickup_lat: parseFloat(pickup_lat),

      pickup_lng: parseFloat(pickup_lng),

      dropoff_lat: parseFloat(dropoff_lat),

      dropoff_lng: parseFloat(dropoff_lng)

    };



    const tripsWithDetour = availableTrips.map(trip => {

      const detourResult = calculateDetourWithWaypoints(trip, passenger, detourSettings.default_detour_distance);

      return {

        ...trip,

        detourDistance: detourResult.detourDistance,

        detourTime: detourResult.detourTime,

        isWithinDetourLimit: detourResult.isWithinDetourLimit

      };

    });



    // Filter trips within detour limit and sort by detour distance

    const matchingTrips = tripsWithDetour

      .filter(trip => trip.isWithinDetourLimit)

      .sort((a, b) => a.detourDistance - b.detourDistance)

      .slice(0, 10); // Limit to top 10 matches



    console.log(`Found ${matchingTrips.length} matching trips out of ${availableTrips.length} available trips`);



    res.json({

      success: true,

      data: {

        trips: matchingTrips,

        detourSettings: detourSettings,

        searchParams: {

          pickup: { lat: passenger.pickup_lat, lng: passenger.pickup_lng },

          dropoff: { lat: passenger.dropoff_lat, lng: passenger.dropoff_lng },

          maxDetourDistance: detourSettings.default_detour_distance

        },

        summary: {

          totalAvailableTrips: availableTrips.length,

          matchingTrips: matchingTrips.length,

          detourLimit: detourSettings.default_detour_distance

        }

      }

    });



  } catch (error) {

    console.error('Ride matching error:', error);

    res.status(500).json({

      success: false,

      error: 'Internal server error during ride matching'

    });

  }

});



// POST /rideshare/trips - Create new trip

RideShareRouter.post("/trips", async (req, res) => {

  try {

    const tripData = req.body;

    

    // Validate required fields

    const requiredFields = ['driver_id', 'origin_lat', 'origin_lng', 'destination_lat', 'destination_lng', 'total_seats'];

    const missingFields = requiredFields.filter(field => !tripData[field]);

    

    if (missingFields.length > 0) {

      return res.status(400).json({

        success: false,

        message: `Missing required fields: ${missingFields.join(', ')}`

      });

    }

    

    // Create the trip

    const newTrip = await RideShareDb.createTrip(tripData);

    

    console.log('New trip created:', newTrip);

    

    res.status(201).json({

      success: true,

      data: newTrip,

      message: 'Trip created successfully'

    });

  } catch (e) {

    console.error("POST /rideshare/trips failed:", e);

    res.status(500).json({ 

      success: false,

      error: "Internal server error",

      message: e.message 

    });

  }

});



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



// NEW: Driver matching endpoint with detour logic

RideShareRouter.get("/driver/matching", async (req, res) => {

  try {

    const { pickup_lat, pickup_lng, destination_lat, destination_lng } = req.query;

    

    // Validate required parameters

    if (!pickup_lat || !pickup_lng || !destination_lat || !destination_lng) {

      return res.status(400).json({ 

        success: false,

        error: "Missing required parameters: pickup_lat, pickup_lng, destination_lat, destination_lng" 

      });

    }



    // Validate coordinates

    const coords = [pickup_lat, pickup_lng, destination_lat, destination_lng];

    for (const coord of coords) {

      const num = parseFloat(coord);

      if (isNaN(num)) {

        return res.status(400).json({ 

          success: false,

          error: "Invalid coordinate format" 

        });

      }

    }



    // First, expire old pending requests (older than 30 minutes)

    const pool = require("../cruds/poolfile");

    const expireQuery = `

      UPDATE rideshare_requests 

      SET status = 'Expired', updated_at = NOW()

      WHERE status IN ('Join Shared Ride Request', 'Negotiating') 

      AND created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE)

    `;

    

    pool.query(expireQuery, (err, expireResult) => {

      if (err) {

        console.error('Error expiring old requests:', err);

      } else {

        console.log(`Expired ${expireResult.affectedRows} old pending requests`);

      }

    });



    // Get detour settings

    let detourSettings;

    try {

      detourSettings = await getDetourSettings();

      console.log('Driver matching using detour settings:', detourSettings);

    } catch (err) {

      console.error('Failed to fetch detour settings for driver matching, using defaults:', err);

      detourSettings = {

        default_detour_distance: 20.0,

        min_detour_distance: 0.5,

        max_detour_distance: 50.0,

        detour_increment: 5.0,

        auto_detour_expansion: false,

        expansion_time_limit: 300,

        max_auto_expansions: 3

      };

    }



    // Get all passenger requests

    let allRequests;

    try {

      allRequests = await RideShareDb.getAllRequests();

    } catch (err) {

      console.error('Failed to fetch passenger requests:', err);

      return res.status(500).json({

        success: false,

        error: 'Failed to fetch passenger requests'

      });

    }



    // Filter for active requests only (exclude expired)

    const activeRequests = allRequests.filter(request => {

      return request && 

             ['Join Shared Ride Request', 'Negotiating'].includes(request.status);

    });



    // Calculate detour for each request

    const driverTrip = {

      origin_lat: parseFloat(pickup_lat),

      origin_lng: parseFloat(pickup_lng),

      destination_lat: parseFloat(destination_lat),

      destination_lng: parseFloat(destination_lng)

    };



    const requestsWithDetour = activeRequests.map(request => {

      const passenger = {

        pickup_lat: parseFloat(request.pickup_lat),

        pickup_lng: parseFloat(request.pickup_lng),

        dropoff_lat: parseFloat(request.dropoff_lat),

        dropoff_lng: parseFloat(request.dropoff_lng)

      };



      const detourResult = calculateDetourWithWaypoints(driverTrip, passenger, detourSettings.default_detour_distance);

      

      // Calculate distance from driver to passenger pickup

      const distanceToPickup = haversineDistance(

        parseFloat(pickup_lat), parseFloat(pickup_lng),

        parseFloat(request.pickup_lat), parseFloat(request.pickup_lng)

      );



      return {

        ...request,

        detourDistance: detourResult.detourDistance,

        detourTime: detourResult.detourTime,

        isWithinDetourLimit: detourResult.isWithinDetourLimit,

        distanceToPickup: distanceToPickup

      };

    });



    // Filter requests within detour limit and sort by distance to pickup

    const matchingRequests = requestsWithDetour

      .filter(request => request.isWithinDetourLimit)

      .sort((a, b) => a.distanceToPickup - b.distanceToPickup)

      .slice(0, 20); // Limit to top 20 matches



    console.log(`Driver found ${matchingRequests.length} matching requests out of ${activeRequests.length} active requests`);



    // Create backward-compatible response

    // Old clients get array of requests, new clients can access enhanced data

    const response = matchingRequests;

    

    // Add enhanced data as non-enumerable properties for new clients

    response.data = {

      requests: matchingRequests,

      detourSettings: detourSettings,

      driverRoute: {

        pickup: { lat: parseFloat(pickup_lat), lng: parseFloat(pickup_lng) },

        destination: { lat: parseFloat(destination_lat), lng: parseFloat(destination_lng) }

      },

      stats: {

        totalRequests: allRequests.length,

        activeRequests: activeRequests.length,

        matchingRequests: matchingRequests.length,

        expiredCount: allRequests.length - activeRequests.length

      }

    };



    res.json(response);



  } catch (e) {

    console.error('Driver matching endpoint failed:', e);

    res.status(500).json({

      success: false,

      error: 'Internal server error'

    });

  }

});



// NEW: Nearby requests endpoint - shows all rideshare requests within radius of driver location

RideShareRouter.get("/nearby-requests", async (req, res) => {

  try {

    const { lat, lng, radius } = req.query;

    

    // Validate required parameters

    if (!lat || !lng) {

      return res.status(400).json({ 

        success: false,

        error: "Missing required parameters: lat, lng" 

      });

    }



    // Validate coordinates

    const driverLat = parseFloat(lat);

    const driverLng = parseFloat(lng);

    if (isNaN(driverLat) || isNaN(driverLng)) {

      return res.status(400).json({ 

        success: false,

        error: "Invalid coordinate format" 

      });

    }



    // Get radius from query params or use default (will be overridden by control panel setting)

    let queryRadius = parseFloat(radius) || 5; // Default 5km



    // Try to get radius from control panel setting

    try {

      const controlPanelResp = await fetch(`${process.env.API_URL || 'http://localhost:3011'}/control-panel/settings`);

      if (controlPanelResp.ok) {

        const settings = await controlPanelResp.json();

        const panelRadius = settings?.nearby_requests_radius_km;

        if (panelRadius && !isNaN(panelRadius)) {

          queryRadius = parseFloat(panelRadius);

        }

      }

    } catch (settingsError) {

      console.warn('Failed to fetch nearby radius from control panel, using default:', settingsError?.message);

    }



    console.log(`[Nearby Requests] Finding requests within ${queryRadius}km of (${driverLat}, ${driverLng})`);



    // Get all active passenger requests

    let allRequests;

    try {

      allRequests = await RideShareDb.getAllRequests();

    } catch (err) {

      console.error('Failed to fetch passenger requests:', err);

      return res.status(500).json({

        success: false,

        error: 'Failed to fetch passenger requests'

      });

    }



    // Filter for active requests only (exclude expired, cancelled, completed)

    const activeRequests = allRequests.filter(request => {

      return request && 

             ['Join Shared Ride Request', 'Negotiating'].includes(request.status) &&

             request.pickup_lat && request.pickup_lng;

    });



    // Calculate distance and filter by radius

    const nearbyRequests = activeRequests.filter(request => {

      const distance = calculateDistance(

        driverLat, driverLng,

        parseFloat(request.pickup_lat), parseFloat(request.pickup_lng)

      );

      return distance <= queryRadius;

    });



    // Add distance information to each request

    const requestsWithDistance = nearbyRequests.map(request => {

      const distance = calculateDistance(

        driverLat, driverLng,

        parseFloat(request.pickup_lat), parseFloat(request.pickup_lng)

      );

      

      return {

        ...request,

        distance_from_driver: distance,

        // Add formatted location names if available

        pickup_name: request.pickup_name || `${request.pickup_lat}, ${request.pickup_lng}`,

        dropoff_name: request.dropoff_name || `${request.dropoff_lat}, ${request.dropoff_lng}`

      };

    });



    // Sort by distance (closest first)

    requestsWithDistance.sort((a, b) => a.distance_from_driver - b.distance_from_driver);



    console.log(`[Nearby Requests] Found ${requestsWithDistance.length} requests within ${queryRadius}km`);



    res.json({

      success: true,

      data: {

        requests: requestsWithDistance,

        radius_used: queryRadius,

        driver_location: { lat: driverLat, lng: driverLng },

        stats: {

          total_requests: allRequests.length,

          active_requests: activeRequests.length,

          nearby_requests: requestsWithDistance.length

        }

      }

    });



  } catch (e) {

    console.error('Nearby requests endpoint failed:', e);

    res.status(500).json({

      success: false,

      error: 'Internal server error'

    });

  }

});



// Helper function to calculate distance between two points

function calculateDistance(lat1, lon1, lat2, lon2) {

  const R = 6371; // Earth's radius in km

  const dLat = (lat2 - lat1) * Math.PI / 180;

  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = 

    Math.sin(dLat/2) * Math.sin(dLat/2) +

    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 

    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in km

}



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



// Get individual trip by ID

RideShareRouter.get("/trips/:rideshare_id", async (req, res) => {

  try {

    const trip = await RideShareDb.getTripById(req.params.rideshare_id);

    if (!trip) {

      return res.status(404).json({ 

        message: "Trip not found", 

        status: 404,

        rideshare_id: req.params.rideshare_id

      });

    }

    res.json(trip);

  } catch (e) {

    logRouteError("GET /rideshare/trips/:rideshare_id", req, e);

    return sendError(

      res,

      req,

      { status: 500, message: "Failed to fetch trip", route: "GET /rideshare/trips/:rideshare_id" },

      e

    );

  }

});



// Get midpoints for a trip

RideShareRouter.get("/midpoints/:rideshare_id", async (req, res) => {

  try {

    const midpoints = await RideShareDb.getMidpoints(req.params.rideshare_id);

    res.json(Array.isArray(midpoints) ? midpoints : []);

  } catch (e) {

    logRouteError("GET /rideshare/midpoints/:rideshare_id", req, e);

    return sendError(

      res,

      req,

      { status: 500, message: "Failed to fetch midpoints", route: "GET /rideshare/midpoints/:rideshare_id" },

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

        // Use BATCH notification system to prevent spam

        await batchNotificationTriggers.scheduleBatchNotification({

          location: {

            lat: data.pickup_lat,

            lng: data.pickup_lng

          },

          destination: data.destination || 'Unknown',

          passengerId: data.customer_id,

          passengerName: data.customer_name || 'Customer'

        });



        console.log(`📱 Scheduled batch notification for rideshare request ${result.insertId} to ${data.destination}`);



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

    const requestId = req.params.request_id;

    const updateData = req.body;

    

    console.log(`[Backend] PUT /requests/${req.params.request_id} - Updating with data:`, updateData);

    

    const result = await RideShareDb.updateRequest(requestId, updateData);

    

    console.log(`[Backend] PUT /requests/${req.params.request_id} - Update result:`, result);

    

    res.json(result);

  } catch (e) {

    console.error(`[Backend] PUT /requests/${req.params.request_id} - Error:`, e);

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



// Update expired requests (called by frontend screens)

RideShareRouter.post("/cleanup-expired", async (req, res) => {

  try {

    const pool = require("../cruds/poolfile");

    

    // Expire requests older than 30 minutes

    const expireQuery = `

      UPDATE rideshare_requests 

      SET status = 'Expired', updated_at = NOW()

      WHERE status IN ('Join Shared Ride Request', 'Negotiating') 

      AND created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE)

    `;

    

    pool.query(expireQuery, (err, expireResult) => {

      if (err) {

        console.error('Error expiring old requests:', err);

        return res.status(500).json({ error: 'Failed to expire requests' });

      }

      

      console.log(`Expired ${expireResult.affectedRows} old pending requests`);

      res.json({ 

        success: true, 

        expiredCount: expireResult.affectedRows,

        message: `Expired ${expireResult.affectedRows} requests`

      });

    });

  } catch (error) {

    console.error('Error in cleanup-expired endpoint:', error);

    res.status(500).json({ error: 'Internal server error' });

  }

});



// Get all rideshare requests (for analytics)

RideShareRouter.get("/requests/all", async (req, res) => {

  try {

    const pool = require("../cruds/poolfile");

    

    // First, expire old pending requests (older than 30 minutes)

    const expireQuery = `

      UPDATE rideshare_requests 

      SET status = 'Expired', updated_at = NOW()

      WHERE status IN ('Join Shared Ride Request', 'Negotiating') 

      AND created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE)

    `;

    

    pool.query(expireQuery, (err, expireResult) => {

      if (err) {

        console.error('Error expiring old requests:', err);

      } else {

        console.log(`Expired ${expireResult.affectedRows} old pending requests`);

      }

      

      // Then fetch all requests

      const query = 'SELECT * FROM rideshare_requests ORDER BY request_id DESC';

      

      pool.query(query, (err, results) => {

        if (err) {

          console.error('Error fetching all rideshare requests:', err);

          return res.status(500).json({ error: 'Failed to fetch rideshare requests' });

        }

        res.json(results);

      });

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



// ========================

// Negotiations endpoints

// ========================



// Add negotiation entry

RideShareRouter.post("/negotiations", async (req, res) => {

  try {

    const negotiationData = req.body;

    const result = await RideShareDb.addNegotiation(negotiationData);

    res.json(result);

  } catch (error) {

    logRouteError("POST /negotiations", req, error);

    sendError(res, req, {

      status: 500,

      message: "Failed to add negotiation",

      route: "POST /negotiations"

    }, error);

  }

});



// Get negotiation history for request

RideShareRouter.get("/negotiations/:request_id", async (req, res) => {

  try {

    const { request_id } = req.params;

    console.log(`[Backend] GET /negotiations/${request_id} - Fetching history`);

    const history = await RideShareDb.getNegotiationHistory(request_id);

    console.log(`[Backend] GET /negotiations/${request_id} - Found ${history.length} records:`, history);

    res.json(history);

  } catch (error) {

    console.error(`[Backend] GET /negotiations/${request_id} - Error:`, error);

    logRouteError("GET /negotiations/:request_id", req, error);

    sendError(res, req, {

      status: 500,

      message: "Failed to fetch negotiation history",

      route: "GET /negotiations/:request_id"

    }, error);

  }

});



// NEW: Get all nearby rideshare requests (pure distance-based)

RideShareRouter.get("/nearby-requests", async (req, res) => {

  try {

    const { lat, lng, radius = 5, driverId } = req.query;

    

    // Validate required parameters

    if (!lat || !lng) {

      return res.status(400).json({

        success: false,

        message: "lat and lng parameters are required"

      });

    }

    

    // Get radius from control panel setting if not provided

    let queryRadius = parseFloat(radius);

    if (!radius) {

      try {

        const controlPanelResp = await fetch(`${process.env.API_URL || 'http://localhost:3011'}/control-panel/settings`);

        if (controlPanelResp.ok) {

          const settings = await controlPanelResp.json();

          const panelRadius = settings?.nearby_requests_radius_km;

          if (panelRadius && !isNaN(panelRadius)) {

            queryRadius = parseFloat(panelRadius);

          }

        }

      } catch (settingsError) {

        console.warn('Failed to fetch nearby radius from control panel, using default:', settingsError?.message);

      }

    }



    console.log(`[Nearby Requests] Finding requests within ${queryRadius}km of (${lat}, ${lng})`);



    // Get ALL active rideshare requests

    const allActiveRequests = await RideShareDb.getAllActiveRideshareRequests();

    

    // Filter by distance from driver's current location

    const nearbyRequests = allActiveRequests.filter(request => {

      // Exclude requests already assigned to current driver

      if (driverId && request.assigned_driver_id == driverId) {

        return false;

      }

      

      const distance = calculateDistance(

        parseFloat(lat), parseFloat(lng),

        parseFloat(request.pickup_lat), parseFloat(request.pickup_lng)

      );

      return distance <= queryRadius;

    });



    // Add distance information and sort by distance

    const requestsWithDistance = nearbyRequests.map(request => ({

      ...request,

      distance_from_driver: calculateDistance(

        parseFloat(lat), parseFloat(lng),

        parseFloat(request.pickup_lat), parseFloat(request.pickup_lng)

      )

    })).sort((a, b) => a.distance_from_driver - b.distance_from_driver);



    console.log(`[Nearby Requests] Found ${requestsWithDistance.length} requests within ${queryRadius}km`);



    res.json({

      success: true,

      data: requestsWithDistance,

      radius: queryRadius,

      center: { lat: parseFloat(lat), lng: parseFloat(lng) },

      stats: {

        total_active_requests: allActiveRequests.length,

        nearby_requests: requestsWithDistance.length,

        excluded_assigned: nearbyRequests.filter(r => r.assigned_driver_id).length

      }

    });



  } catch (error) {

    console.error('Nearby requests endpoint failed:', error);

    res.status(500).json({

      success: false,

      error: 'Internal server error'

    });

  }

});



// Mark bid as viewed (starts 2-minute timer)

RideShareRouter.post("/negotiations/:request_id/view", async (req, res) => {

  try {

    const { request_id } = req.params;

    const { driver_id } = req.body;

    

    const result = await RideShareDb.markBidAsViewed(request_id, driver_id);

    

    // Send push notification to passenger that driver is viewing their bid

    try {

      await notificationTriggers.sendPushNotification({

        type: 'driver_viewing_bid',

        request_id: request_id,

        driver_id: driver_id,

        message: 'Driver is viewing your bid'

      });

    } catch (notifError) {

      console.error('Failed to send push notification:', notifError);

    }

    

    res.json(result);

  } catch (error) {

    logRouteError("POST /negotiations/:request_id/view", req, error);

    res.status(500).json({

      status: 500,

      message: "Failed to mark bid as viewed",

      route: "POST /negotiations/:request_id/view"

    });

  }

});



// Check and update expired bids

RideShareRouter.post("/negotiations/:request_id/check-expiration", async (req, res) => {

  try {

    const { request_id } = req.params;

    

    const result = await RideShareDb.checkBidExpiration(request_id);

    

    // Send push notifications for expired bids

    try {

      await notificationTriggers.sendPushNotification({

        type: 'bid_expired',

        request_id: request_id,

        message: 'Bid has expired'

      });

    } catch (notifError) {

      console.error('Failed to send push notification:', notifError);

    }

    

    res.json(result);

  } catch (error) {

    logRouteError("POST /negotiations/:request_id/check-expiration", req, error);

    res.status(500).json({

      status: 500,

      message: "Failed to check bid expiration",

      route: "POST /negotiations/:request_id/check-expiration"

    });

  }

});



// Auto-expire old requests (run every 5 minutes)

RideShareRouter.post("/requests/auto-expire", async (req, res) => {

  try {

    const result = await RideShareDb.checkRequestExpiration();

    

    res.json(result);

  } catch (error) {

    logRouteError("POST /requests/auto-expire", req, error);

    res.status(500).json({

      status: 500,

      message: "Failed to auto-expire requests",

      route: "POST /requests/auto-expire"

    });

  }

});



// Test batch notifications (for development/testing)

RideShareRouter.post("/test-batch-notifications", async (req, res) => {

  try {

    console.log('🧪 Testing batch notification system...');

    

    // Simulate multiple passenger requests in the same area

    const testRequests = [

      {

        location: { lat: -1.2921, lng: 36.8219 },

        destination: 'Downtown',

        passengerId: 'test_passenger_1',

        passengerName: 'Test User 1'

      },

      {

        location: { lat: -1.2951, lng: 36.8259 },

        destination: 'Airport',

        passengerId: 'test_passenger_2',

        passengerName: 'Test User 2'

      },

      {

        location: { lat: -1.2981, lng: 36.8289 },

        destination: 'University',

        passengerId: 'test_passenger_3',

        passengerName: 'Test User 3'

      }

    ];



    const result = await batchNotificationTriggers.batchNotifyNearbyDriversRideshare(testRequests);

    

    console.log(`✅ Batch test completed: ${result} requests processed`);

    

    res.json({

      success: true,

      message: 'Batch notification test completed',

      requestsProcessed: result,

      sampleNotification: {

        title: '🚀 High Demand Area Alert!',

        body: '3 rideshare requests in Area (-1.3, 36.8). Top destinations: Downtown, Airport, University'

      }

    });

    

  } catch (error) {

    logRouteError("POST /test-batch-notifications", req, error);

    res.status(500).json({

      status: 500,

      message: "Failed to test batch notifications",

      route: "POST /test-batch-notifications"

    });

  }

});



// Test SMS notifications (for development/testing)

RideShareRouter.post("/test-sms-notifications", async (req, res) => {

  try {

    console.log('🧪 Testing SMS notification system...');

    

    const { phoneNumber, testType = 'template' } = req.body;

    

    if (!phoneNumber && testType === 'actual') {

      return res.status(400).json({

        success: false,

        message: 'Phone number required for actual SMS test'

      });

    }



    let result;

    

    switch (testType) {

      case 'template':

        // Test template formatting

        const batchData = {

          totalRequests: 14,

          areaName: 'Area (-1.3, 36.8)',

          destinations: ['Downtown', 'Airport', 'University'],

          driverName: 'Test Driver'

        };

        

        const smsTemplates = require('../services/smsTemplates');

        const message = smsTemplates.formatMessage('rideshare_batch_high_demand', batchData);

        

        result = {

          message: 'Template formatting test completed',

          sampleMessage: message,

          templateUsed: 'rideshare_batch_high_demand'

        };

        break;

        

      case 'validation':

        // Test phone number validation

        const testNumbers = [

          '+263770000000',

          '263770000000',

          '0770000000',

          'invalid'

        ];

        

        const validationResults = testNumbers.map(num => {

          const cleaned = smsNotificationService.cleanPhoneNumber(num);

          const isValid = smsNotificationService.validatePhoneNumber(cleaned);

          return { original: num, cleaned, valid: isValid };

        });

        

        result = {

          message: 'Phone number validation test completed',

          results: validationResults

        };

        break;

        

      case 'actual':

        // Test actual SMS sending (use with caution!)

        const testMessage = '🧪 XGO Test SMS\n\nThis is a test message from the XGO system.\n\n- XGO Team';

        

        const smsResult = await smsNotificationService.sendSMS(phoneNumber, testMessage);

        

        result = {

          message: 'Actual SMS test completed',

          phoneNumber: phoneNumber,

          success: smsResult,

          messageSent: testMessage

        };

        break;

        

      default:

        throw new Error('Invalid test type. Use: template, validation, or actual');

    }

    

    console.log(`✅ SMS test completed: ${testType}`);

    

    res.json({

      success: true,

      testType,

      ...result

    });

    

  } catch (error) {

    logRouteError("POST /test-sms-notifications", req, error);

    res.status(500).json({

      status: 500,

      message: "Failed to test SMS notifications",

      route: "POST /test-sms-notifications"

    });

  }

});



module.exports = RideShareRouter;

