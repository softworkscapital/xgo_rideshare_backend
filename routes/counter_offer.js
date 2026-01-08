const express = require('express');
const  CounterOfferRouter = express.Router();
const  CounterOffersDbOperations = require('../cruds/counter_offer');

CounterOfferRouter.post('/', async (req, res, next) => {
    try {
        let postedValues = req.body;
        let {
            counter_offer_id,
            customerid,
            driver_id,
            trip_id,
            date_time,
            offer_value,
            counter_offer_value,
            currency,
            status	
            } = postedValues;

            let results = await  CounterOffersDbOperations.postCounterOffer(
                counter_offer_id,
                customerid,
                driver_id,
                trip_id,
                date_time,
                offer_value,
                counter_offer_value,
                currency,
                status	
        );
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

CounterOfferRouter.get('/', async (req, res, next) => {
    try {
        let results = await  CounterOffersDbOperations.getCounterOffers();
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});


CounterOfferRouter.get('/customerid/status/:customerid/:status', async (req, res, next) => {
    let customerid = req.params.customerid; // Correctly retrieve customerid
    let status = req.params.status; // Correctly retrieve status

    // Validate input parameters
    if (!customerid || !status) {
        return res.status(400).json({ error: 'customerId and status are required' });
    }

    try {
        let results = await CounterOffersDbOperations.getCounterOffers(customerid, status);
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});


CounterOfferRouter.get('/:id', async (req, res, next) => {
    try {
        let counter_offer_id = req.params.id;
        let result = await  CounterOffersDbOperations.getCounterOfferById(counter_offer_id);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});


CounterOfferRouter.put('/:counter_offer_id', async (req, res) => {
    const counter_offer_id = req.params.counter_offer_id; // Ensure this matches the route
    const updatedValues = req.body;

    try {
        const result = await CounterOffersDbOperations.updateCounterOffer(counter_offer_id, updatedValues);
        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Error updating customer admin chat:", error);
        return res.status(500).json({
            status: "500",
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

CounterOfferRouter.put('/:counter_offer_id/status', async (req, res) => {
    const counter_offer_id = req.params.counter_offer_id; // Ensure this matches the route
    const { status } = req.body; // Extract only the status from the request body

    // Validate that status is provided
    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    try {
        const result = await CounterOffersDbOperations.updateCounterOfferStatus(counter_offer_id, status);
        // console.log(result.status);
        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Error updating counter offer status:", error);
        return res.status(500).json({
            status: "500",
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

CounterOfferRouter.put('/:driver_id/:oldStatus/status', async (req, res) => {
    const oldstatus = req.params.oldStatus;
    const driver_id = req.params.driver_id; // Ensure this matches the route
    const { status } = req.body; // Extract only the status from the request body

    // Validate that status is provided
    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    try {
        const result = await CounterOffersDbOperations.updateCounterOfferStatusOfTrips(driver_id, status, oldstatus);
        // console.log(result.status);
        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Error updating counter offer status:", error);
        return res.status(500).json({
            status: "500",
            message: "Internal Server Error",
            error: error.message,
        });
    }
});


  CounterOfferRouter.delete('/:id', async (req, res, next) => {
    try {
        let id = req.params.id;
        let result = await  CounterOffersDbOperations.deleteCounterOffer(id);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

module.exports = CounterOfferRouter;
