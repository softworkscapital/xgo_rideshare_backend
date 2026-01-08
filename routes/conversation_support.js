const express = require('express');
const ConversationSupportRouter = express.Router();
const ConversationSupportsDbOperations = require('../cruds/conversation_support');

ConversationSupportRouter.post('/', async (req, res, next) => {
    try {
        let postedValues = req.body;
        let {
            customer_id,
            customer_name,
            phone1,
            phone2,
            email,
            surname,
            company,
            product,
            conversation_stage,
            person_assigned,
            expiry_date_time,
            priority_level,
            created_at,
            estimation_duration,
            description,
            chat_id,
            department
        } = postedValues;

        let results = await ConversationSupportsDbOperations.postConversationSupport(
            customer_id,
            customer_name,
            phone1,
            phone2,
            email,
            surname,
            company,
            product,
            conversation_stage,
            person_assigned,
            expiry_date_time,
            priority_level,
            created_at,
            estimation_duration,
            description,
            chat_id,
            department
        );
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

ConversationSupportRouter.get('/', async (req, res, next) => {
    try {
        let results = await ConversationSupportsDbOperations.getConversationSupports();
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

ConversationSupportRouter.put('/:conversation_support_id', async (req, res) => {
    const conversation_support_id = req.params.conversation_support_id; // Ensure this matches the route
    const updatedValues = req.body;

    try {
        const result = await ConversationSupportsDbOperations.updateConversationSupport(conversation_support_id, updatedValues);
        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Error updating conversation support:", error);
        return res.status(500).json({
            status: "500",
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

ConversationSupportRouter.delete('/:id', async (req, res, next) => {
    try {
        let id = req.params.id;
        let result = await ConversationSupportsDbOperations.deleteConversationSupport(id);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});
ConversationSupportRouter.get('/id/:id', async (req, res, next) => {
    try {
        let id = req.params.id;
        let result = await ConversationSupportsDbOperations.getConversationById(id);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

// New GET route to retrieve conversations by conversation_stage
ConversationSupportRouter.get('/by-stage', async (req, res, next) => {
    const stage = req.query.stage; // Expecting a query parameter called "stage"
    if (!stage) {
        return res.status(400).json({ error: "Stage parameter is required" });
    }

    try {
        let results = await ConversationSupportsDbOperations.getConversationsByStage(stage);
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});
ConversationSupportRouter.get('/by-user', async (req, res, next) => {
    const stage = req.query.stage;
    const user = req.query.user// Expecting a query parameter called "stage"
    if (!stage) {
        return res.status(400).json({ error: "Stage parameter is required" });
    }

    try {
        let results = await ConversationSupportsDbOperations.getConverByUserAndStage(stage,user);
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

ConversationSupportRouter.put('/stage/:conversation_support_id', async (req, res) => {
    const conversation_support_id = req.params.conversation_support_id;
    const newStage = req.body.stage; // Expecting the new stage in the request body

    if (!newStage) {
        return res.status(400).json({ error: "New stage is required" });
    }

    try {
        const result = await ConversationSupportsDbOperations.updateConversationStage(conversation_support_id, newStage);
        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Error updating conversation stage:", error);
        return res.status(500).json({
            status: "500",
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

module.exports = ConversationSupportRouter;