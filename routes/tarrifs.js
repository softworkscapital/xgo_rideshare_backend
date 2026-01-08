const express = require('express');
const  TarrifRouter = express.Router();
const TarrifsDbOperations = require('../cruds/tarrifs');

TarrifRouter.post('/', async (req, res, next) => {
    try {
        let postedValues = req.body;
        let {
            tarrif_id,
            billing_type,
            rate,
            lower_bound,
            upper_bound,
            lower_price_limit,
            upper_price_limit,
            distance_unit_of_measure,
            account_category,
            status	
            } = postedValues;

            let results = await  TarrifsDbOperations.postTarrif(
                tarrif_id,
                billing_type,
                rate,
                lower_bound,
                upper_bound,
                lower_price_limit,
                upper_price_limit,
                distance_unit_of_measure,
                account_category,
                status	
        );
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

TarrifRouter.get('/', async (req, res, next) => {
    try {
        let results = await  TarrifsDbOperations.getTarrifs();
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

TarrifRouter.get('/trip_tarrif_rate/:distance/:category', async (req, res, next) => {
    try {
        // Extract the given distance and account category from query parameters
        let givenDistance = parseFloat(req.params.distance); // Use req.query for GET requests
        let account_category = req.params.category; // Assuming this is a string

        console.log(givenDistance);
        console.log(account_category);

        // Validate the input for givenDistance
        if (isNaN(givenDistance)) {
            return res.status(400).json({ error: 'Invalid distance provided.' });
        }

        // Validate the input for account_category
        if (!account_category || typeof account_category !== 'string' || account_category.trim() === '') {
            return res.status(400).json({ error: 'Invalid account category provided.' });
        }

        
        // Call the function to get the active tariff
        const results = await TarrifsDbOperations.getActiveTarrifByDistance(givenDistance, account_category);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No active tariff found.' });
        }

        // Return the first result
        res.json(results[0]);
    } catch (err) {
        console.error('Error fetching tariff:', err);
        res.sendStatus(500);
    }
});
TarrifRouter.put('/:tarrif_id', async (req, res) => {
    const tarrif_id = req.params.tarrif_id; // Ensure this matches the route
    const updatedValues = req.body;

    try {
        const result = await TarrifsDbOperations.updateTarrif(tarrif_id, updatedValues);
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


TarrifRouter.delete('/:id', async (req, res, next) => {
    try {
        let id = req.params.id;
        let result = await  TarrifsDbOperations.deleteTarrif(id);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

module.exports = TarrifRouter;
