const express = require('express');
const  ConfigRouter = express.Router();
const  ConfigsDbOperations = require('../cruds/application_configs');

ConfigRouter.post('/', async (req, res, next) => {
    try {
        let postedValues = req.body;
        let {
            application_config_id,
            control_item,
            value	
            } = postedValues;

            let results = await  ConfigsDbOperations.postConfig(
                application_config_id,
                control_item,
                value	
        );
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

ConfigRouter.get('/recent', async (req, res, next) => {
    try {
        let results = await  ConfigsDbOperations.getRecentConfigByControlItem();
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

ConfigRouter.get('/', async (req, res, next) => {
    try {
        let results = await  ConfigsDbOperations.getConfigs();
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});
ConfigRouter.get('/:id', async (req, res, next) => {
    try {
        let application_config_id = req.params.id;
        let result = await ConfigsDbOperations.getConfigById(application_config_id);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});



ConfigRouter.put('/:application_config_id', async (req, res) => {
    const application_config_id = req.params.application_config_id; // Ensure this matches the route
    const updatedValues = req.body;

    try {
        const result = await ConfigsDbOperations.updateConfig(application_config_id, updatedValues);
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


  ConfigRouter.delete('/:id', async (req, res, next) => {
    try {
        let id = req.params.id;
        let result = await  ConfigsDbOperations.deleteConfig(id);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});



// ConfigRouter.get('/recent-apk-version', async (req, res, next) => {
//     try {
//         let result = await ConfigsDbOperations.getRecentConfigByControlItem();
//         res.json(result);
//     } catch (e) {
//         console.log(e);
//         res.sendStatus(500);
//     }
// });

module.exports = ConfigRouter;
