const express = require('express');
const ChatRemsGasCommunityRouter = express.Router();
const ChatRemsGasCommunityDbOperations = require('../cruds/chat_rems_gas_community');

// POST: Create a new chat entry
ChatRemsGasCommunityRouter.post('/', async (req, res) => {
    try {
        const postedValues = req.body;
        const {
            date_chat,
            time_chat,
            admin_id,
            user_id,
            conversation_id,
            massage,
            origin,
            massage_type,
            media_url,
            application
        } = postedValues;

        const results = await ChatRemsGasCommunityDbOperations.postChatRemsGasCommunity(
            date_chat,
            time_chat,
            admin_id,
            user_id,
            conversation_id,
            massage,
            origin,
            massage_type,
            media_url,
            application
        );
        res.json(results);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

// GET: Retrieve all chat entries
ChatRemsGasCommunityRouter.get('/', async (req, res) => {
    try {
        const results = await ChatRemsGasCommunityDbOperations.getChatRemsGasCommunity();
        res.json(results);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

// GET: Retrieve chat entry by ID
ChatRemsGasCommunityRouter.get('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await ChatRemsGasCommunityDbOperations.getChatRemsGasCommunityById(id);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

// PUT: Update a chat entry
ChatRemsGasCommunityRouter.put('/:id', async (req, res) => {
    const id = req.params.id;
    const updatedValues = req.body;

    try {
        const result = await ChatRemsGasCommunityDbOperations.updateChatRemsGasCommunity(id, updatedValues);
        res.status(result.status).json(result);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

// DELETE: Delete a chat entry
ChatRemsGasCommunityRouter.delete('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await ChatRemsGasCommunityDbOperations.deleteChatRemsGasCommunity(id);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});
// GET: Retrieve all chat entries by application
ChatRemsGasCommunityRouter.get('/application/:application', async (req, res) => {
    const application = req.params.application;

    try {
        const results = await ChatRemsGasCommunityDbOperations.getChatRemsGasCommunityByApplication(application);
        res.json(results);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

// GET: Retrieve chat entries by user ID
ChatRemsGasCommunityRouter.get('/user/:user_id', async (req, res) => {
    const user_id = req.params.user_id;

    try {
        const results = await ChatRemsGasCommunityDbOperations.getChatRemsGasCommunityByUserId(user_id);
        res.json(results);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

module.exports = ChatRemsGasCommunityRouter;