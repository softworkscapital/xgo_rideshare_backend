const express = require("express");
const TripStatusAnalyticRouter = express.Router()
const TripStatusAnalyticsDbOperations = require("../cruds/trip_status_analytics");

TripStatusAnalyticRouter.post("/", async (req, res, next) => {
    try {
        let postedValues = req.body;
        let trip_id = postedValues.trip_id;
        let new_order = postedValues.new_order;


        if (!trip_id || !new_order) {
            return res.status(400).json({ status: "400", message: "driver_id and waiting_otp are required" });
        }

        let results = await TripStatusAnalyticsDbOperations.postTripStatusAnalytic(
            trip_id,
            new_order
        );

        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

TripStatusAnalyticRouter.get("/", async (req, res, next) => {
    try {
        let results = await TripStatusAnalyticsDbOperations.getTripStatusAnalytics();
        res.json(results);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

TripStatusAnalyticRouter.get("/getanalyticsby_trip_id/:trip_id", async (req, res, next) => {
    try {
        let trip_id = req.params.trip_id;

        if (!trip_id) {
            return res.status(400).json({ status: "400", message: "driver_id is required" });
        }

        let result = await TripStatusAnalyticsDbOperations.getTripStatusAnalyticByTripId(trip_id);
        
        if (result.length === 0) {
            return res.status(404).json({ status: "404", message: "No analytics found for this driver_id" });
        }

        res.json(result);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

TripStatusAnalyticRouter.put("/update_driverstatus_datetime_analytics_neworder/:trip_id", async (req, res, next) => {
    try {
        const trip_id = req.params.trip_id;
        const result = await TripStatusAnalyticsDbOperations.updateTripStatusAnalyticByNewOrder(trip_id);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});


TripStatusAnalyticRouter.put("/update_driverstatus_datetime_analytics_counteroffer/:trip_id", async (req, res, next) => {
    try {
        const trip_id = req.params.trip_id;
        const result = await TripStatusAnalyticsDbOperations.updateTripStatusAnalyticByCounterOffer(trip_id);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});


TripStatusAnalyticRouter.put("/update_driverstatus_datetime_analytics_intransit/:trip_id", async (req, res, next) => {
    try {
        const trip_id = req.params.trip_id;
        const result = await TripStatusAnalyticsDbOperations.updateTripStatusAnalyticByIntransit(trip_id);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});


TripStatusAnalyticRouter.put("/update_driverstatus_datetime_analytics_arrivedatdestination/:trip_id", async (req, res, next) => {
    try {
        const trip_id = req.params.trip_id;
        const result = await TripStatusAnalyticsDbOperations.updateTripStatusAnalyticByArrivedAtDestination(trip_id);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});


TripStatusAnalyticRouter.put("/update_driverstatus_datetime_analytics_tripended/:trip_id", async (req, res, next) => {
    try {
        const trip_id = req.params.trip_id;
        const result = await TripStatusAnalyticsDbOperations.updateTripStatusAnalyticByTripEnded(trip_id);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});


TripStatusAnalyticRouter.put("/update_driverstatus_datetime_analytics_estimatedduration/:trip_id", async (req, res, next) => {
    try {
        const trip_id = req.params.trip_id;
        const result = await TripStatusAnalyticsDbOperations.updateTripStatusAnalyticByEstimatedDuration(trip_id);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});


TripStatusAnalyticRouter.put("/update_driverstatus_datetime_analytics_actualduration/:trip_id", async (req, res, next) => {
    try {
        const trip_id = req.params.trip_id;
        const result = await TripStatusAnalyticsDbOperations.updateTripStatusAnalyticByActualDuration(trip_id);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});

TripStatusAnalyticRouter.delete("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    let result = await TripStatusAnalyticsDbOperations.deleteTripStatusAnalytic(id);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = TripStatusAnalyticRouter;
