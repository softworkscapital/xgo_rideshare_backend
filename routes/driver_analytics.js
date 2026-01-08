const express = require("express");
const DriverAnalyticRouter = express.Router()
const DriverAnalyticsDbOperations = require("../cruds/driver_analytics");

DriverAnalyticRouter.post("/", async (req, res, next) => {
    try {
        let postedValues = req.body;
        let driver_id = postedValues.driver_id;
        let waiting_otp = postedValues.waiting_otp;


        if (!driver_id || !waiting_otp) {
            return res.status(400).json({ status: "400", message: "driver_id and waiting_otp are required" });
        }

        let results = await DriverAnalyticsDbOperations.postDriverAnalytic(
            driver_id,
            waiting_otp
        );

        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

DriverAnalyticRouter.get("/", async (req, res, next) => {
    try {
        let results = await DriverAnalyticsDbOperations.getDriverAnalytics();
        res.json(results);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

DriverAnalyticRouter.get("/getanalyticsby_driver_id/:driver_id", async (req, res, next) => {
    try {
        let driver_id = req.params.driver_id;

        if (!driver_id) {
            return res.status(400).json({ status: "400", message: "driver_id is required" });
        }

        let result = await DriverAnalyticsDbOperations.getDriverAnalyticByDriverId(driver_id);
        
        if (result.length === 0) {
            return res.status(404).json({ status: "404", message: "No analytics found for this driver_id" });
        }

        res.json(result);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

DriverAnalyticRouter.put("/update_driverstatus_datetime_analytics_waitingopt/:driver_id", async (req, res, next) => {
    try {
        const driver_id = req.params.driver_id;
        const result = await DriverAnalyticsDbOperations.updateDriverAnalyticByWaitingOtp(driver_id);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});


DriverAnalyticRouter.put("/update_driverstatus_datetime_analytics_waitingverification/:driver_id", async (req, res, next) => {
    try {
        const driver_id = req.params.driver_id;
        const result = await DriverAnalyticsDbOperations.updateDriverAnalyticByWaitingVerification(driver_id);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});


DriverAnalyticRouter.put("/update_driverstatus_datetime_analytics_verified/:driver_id", async (req, res, next) => {
    try {
        const driver_id = req.params.driver_id;
        const result = await DriverAnalyticsDbOperations.updateDriverAnalyticByVerified(driver_id);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});


DriverAnalyticRouter.put("/update_driverstatus_datetime_analytics_online/:driver_id", async (req, res, next) => {
    try {
        const driver_id = req.params.driver_id;
        const result = await DriverAnalyticsDbOperations.updateDriverAnalyticByOnline(driver_id);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});


DriverAnalyticRouter.put("/update_driverstatus_datetime_analytics_offline/:driver_id", async (req, res, next) => {
    try {
        const driver_id = req.params.driver_id;
        const result = await DriverAnalyticsDbOperations.updateDriverAnalyticByOffline(driver_id);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});


DriverAnalyticRouter.put("/update_driverstatus_datetime_analytics_onboardingduration/:driver_id", async (req, res, next) => {
    try {
        const driver_id = req.params.driver_id;
        const result = await DriverAnalyticsDbOperations.updateDriverAnalyticByOnboardingDuration(driver_id);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});

DriverAnalyticRouter.delete("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    let result = await DriverAnalyticsDbOperations.deleteDriverAnalytic(id);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = DriverAnalyticRouter;
