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
      fare_offer,
      detour_distance,
      detour_time,
      status = "Join Shared Ride Request",
    } = requestData;

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
        fare_offer, detour_distance, detour_time, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rideshare_id,
        passenger_id,
        pickup_lat,
        pickup_lng,
        dropoff_lat,
        dropoff_lng,
        fare_offer,
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
    pool.query(
      "UPDATE rideshare_requests SET status = ?, fare_offer = ? WHERE request_id = ?",
      [status, fare_offer, request_id],
      (err) => {
        if (err) return reject(err);
        resolve({ status: 200, message: "Request updated" });
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
    const driverIdVal = driver_id == null || driver_id === "" ? null : String(driver_id);
    const passengerIdVal = passenger_id == null || passenger_id === "" ? null : String(passenger_id);
    const offerNum = typeof offer_amount === "number" ? offer_amount : parseFloat(String(offer_amount));

    if (!Number.isFinite(offerNum)) {
      return reject(new Error("Invalid offer_amount"));
    }

    pool.query(
      `INSERT INTO rideshare_negotiation_history
        (request_id, driver_id, passenger_id, offer_amount, status)
       VALUES (?, ?, ?, ?, ?)`,
      [request_id, driverIdVal, passengerIdVal, offerNum, status],
      (err) => {
        if (err) return reject(err);
        resolve({ status: 200, message: "Negotiation logged" });
      }
    );
  });

crudsObj.getNegotiationHistory = (request_id) =>
  new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM rideshare_negotiation_history WHERE request_id = ? ORDER BY created_at ASC",
      [request_id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
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

module.exports = crudsObj;
