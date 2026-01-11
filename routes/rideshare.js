const express = require("express");
const RideShareRouter = express.Router();
const RideShareDb = require("../cruds/rideshare");

const sanitizeError = (e) => {
  if (!e) return null;
  return {
    name: e?.name,
    message: e?.message,
    code: e?.code,
    errno: e?.errno,
    sqlState: e?.sqlState,
    sqlMessage: e?.sqlMessage,
  };
};

const sendError = (res, req, { status = 500, message = "Internal Server Error", route = "" }, err, extra = {}) => {
  const payload = {
    message,
    route,
    status,
    params: req?.params,
    ...extra,
    error: sanitizeError(err),
  };
  return res.status(status).json(payload);
};

const logRouteError = (route, req, err, extra = {}) => {
  console.error(`[rideshare] ${route} failed`, {
    route,
    params: req?.params,
    query: req?.query,
    body: req?.body,
    error: sanitizeError(err),
    ...extra,
  });
};

/* ========================
   Helper Functions (Haversine)
======================== */
function getDistance(coord1, coord2) {
  const R = 6371;
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(coord1.lat * Math.PI / 180) *
      Math.cos(coord2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateDetour(tripOrigin, tripDestination, pickup, dropoff) {
  const original = getDistance(tripOrigin, tripDestination);
  const detour =
    getDistance(tripOrigin, pickup) +
    getDistance(pickup, dropoff) +
    getDistance(dropoff, tripDestination);
  const extra = detour - original;
  return {
    distance: extra.toFixed(2),
    time: Math.round((extra / 50) * 60),
  };
}

/* ========================
   Rideshare Trips (OLD)
======================== */
RideShareRouter.post("/trips", async (req, res) => {
  try {
    const tripData = req.body;

    const required = [
      "driver_id",
      "origin_lat",
      "origin_lng",
      "destination_lat",
      "destination_lng",
      "origin_name",
      "destination_name",
    ];

    const missing = required.filter((f) => !tripData[f]);
    if (missing.length) {
      return res.status(400).json({ message: "Missing fields", missing, status: 400 });
    }

    const result = await RideShareDb.createTrip(tripData);
    res.json(result);
  } catch (e) {
    logRouteError("POST /rideshare/trips", req, e);
    return sendError(res, req, { status: 500, message: "Failed to create trip", route: "POST /rideshare/trips" }, e);
  }
});

RideShareRouter.get("/trips", async (req, res) => {
  try {
    res.json(await RideShareDb.getAllTrips());
  } catch (e) {
    logRouteError("GET /rideshare/trips", req, e);
    return sendError(res, req, { status: 500, message: "Failed to fetch trips", route: "GET /rideshare/trips" }, e);
  }
});

RideShareRouter.get("/trips/:rideshare_id", async (req, res) => {
  try {
    const trip = await RideShareDb.getTripById(req.params.rideshare_id);
    if (!trip) return res.status(404).json({ message: "Trip not found", status: 404, route: "GET /rideshare/trips/:rideshare_id" });
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


/* ========================
   Closest 20 Requests
======================== */

RideShareRouter.get("/closest_20_requests_near_me", async (req, res) => {
  try {
    const { pickup_lat, pickup_lng } = req.query;

    if (
      pickup_lat == null ||
      pickup_lng == null ||
      isNaN(pickup_lat) ||
      isNaN(pickup_lng)
    ) {
      return res.status(400).json({
        error: "pickup_lat and pickup_lng are required and must be numbers",
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

/* ========================
   🔴 UPDATED Trip Update (agreed_fare)
======================== */
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

/* ========================
   Rideshare Requests (OLD)
======================== */
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
        data.detour_distance = d.distance;
        data.detour_time = d.time;
      }
    }

    res.json(await RideShareDb.createRequest(data));
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

/* ========================
   Negotiations (OLD)
======================== */
RideShareRouter.post("/negotiations", async (req, res) => {
  try {
    const { request_id, driver_id, passenger_id, offer_amount, status } = req.body || {};

    // If passenger_id wasn't supplied, derive it from the request record.
    let resolvedPassengerId = passenger_id;
    if (!resolvedPassengerId && request_id) {
      try {
        const reqRow = await RideShareDb.getRequestById(request_id);
        if (reqRow?.passenger_id) {
          resolvedPassengerId = reqRow.passenger_id;
        }
      } catch (e) {
        // ignore and continue; validation below will surface missing passenger_id
      }
    }

    const missing = [];
    if (!request_id) missing.push("request_id");
    if (!resolvedPassengerId) missing.push("passenger_id");
    if (offer_amount == null || offer_amount === "") missing.push("offer_amount");
    if (!status) missing.push("status");

    if (missing.length) {
      return res.status(400).json({ message: "Missing fields", missing, body: req.body });
    }

    const payload = {
      request_id,
      // driver_id can be null for some flows; keep it as-is if provided
      driver_id: driver_id ?? null,
      passenger_id: resolvedPassengerId,
      offer_amount,
      status,
    };

    res.json(await RideShareDb.addNegotiation(payload));
  } catch (e) {
    console.error("POST /rideshare/negotiations failed", {
      message: e?.message,
      code: e?.code,
      errno: e?.errno,
      sqlMessage: e?.sqlMessage,
      sqlState: e?.sqlState,
      sql: e?.sql,
      body: req.body,
    });

    res.status(500).json({
      message: "Internal Server Error",
      error: e?.message,
      code: e?.code,
      sqlMessage: e?.sqlMessage,
    });
  }
});

RideShareRouter.get("/negotiations/:request_id", async (req, res) => {
  try {
    res.json(
      await RideShareDb.getNegotiationHistory(req.params.request_id)
    );
  } catch (e) {
    logRouteError("GET /rideshare/negotiations/:request_id", req, e);
    return sendError(
      res,
      req,
      { status: 500, message: "Failed to fetch negotiation history", route: "GET /rideshare/negotiations/:request_id" },
      e
    );
  }
});

/* ========================
   Midpoints (OLD)
======================== */
RideShareRouter.post("/midpoints/:rideshare_id", async (req, res) => {
  try {
    res.json(
      await RideShareDb.addMidpoints(
        req.params.rideshare_id,
        req.body.midpoints
      )
    );
  } catch (e) {
    logRouteError("POST /rideshare/midpoints/:rideshare_id", req, e);
    return sendError(
      res,
      req,
      { status: 500, message: "Failed to add midpoints", route: "POST /rideshare/midpoints/:rideshare_id" },
      e
    );
  }
});

RideShareRouter.get("/midpoints/:rideshare_id", async (req, res) => {
  try {
    res.json(await RideShareDb.getMidpoints(req.params.rideshare_id));
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

/* ========================
   🆕 Fare Updates (NEW)
======================== */
RideShareRouter.post("/fare-updates", async (req, res) => {
  try {
    const required = ["rideshare_id", "passenger_id", "old_fare", "new_fare"];
    const missing = required.filter((f) => !req.body[f]);

    if (missing.length) {
      return res.status(400).json({ message: "Missing fields", missing, status: 400 });
    }

    res.json(await RideShareDb.addFareUpdate(req.body));
  } catch (e) {
    logRouteError("POST /rideshare/fare-updates", req, e);
    return sendError(
      res,
      req,
      { status: 500, message: "Failed to add fare update", route: "POST /rideshare/fare-updates" },
      e
    );
  }
});

module.exports = RideShareRouter;
