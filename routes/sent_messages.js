const express = require('express');
const sentMessagesRouter = express.Router();
const sentMessagesDbOperations = require('../cruds/sent_messages');

// Placeholder for authenticateToken function
const authenticateToken = (req, res, next) => {
    // Implement your authentication logic here if needed
    next(); // Call next() to proceed to the route handler
};

sentMessagesRouter.post('/', async (req, res, next) => {
    try {
        let postedValues = req.body;
        let {
            client_profile_id,
            message_type,
            origin_phone,
            arr: dest_phone,
            date_sent,
            group_id,
            contact_grouping_id,
            msgbody,
            currency,
            exchange_rate,
            date,
            debit,
            credit,
            balance,
            description,
            vat,
            costIncl
        } = postedValues;

        let results = await sentMessagesDbOperations.postMessage(
            client_profile_id,
            message_type,
            origin_phone,
            dest_phone,
            date_sent,
            group_id,
            contact_grouping_id,
            msgbody,
            currency,
            exchange_rate,
            credit,
            debit,
            balance,
            description,
            vat,
            costIncl
        );
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

sentMessagesRouter.get('/', authenticateToken, async (req, res, next) => {
    try {
        let results = await sentMessagesDbOperations.getMessages();
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

// Uncomment to enable joint messages route
// sentMessagesRouter.get('/messages', async (req, res, next) => {
//     try {
//         let results = await sentMessagesDbOperations.getMessagesByClients();
//         res.json(results);
//     } catch (e) {
//         console.log(e);
//         res.sendStatus(500);
//     }
// });

sentMessagesRouter.get('/:id', authenticateToken, async (req, res, next) => {
    try {
        let id = req.params.id;
        let result = await sentMessagesDbOperations.getMessageById(id);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

// Uncomment to enable check messages by client ID route
// sentMessagesRouter.get('/messages/:id', async (req, res, next) => {
//     try {
//         let id = req.params.id;
//         let result = await sentMessagesDbOperations.getMessageByClientId(id);
//         res.json(result);
//     } catch (e) {
//         console.log(e);
//         res.sendStatus(500);
//     }
// });

sentMessagesRouter.get('/messages/:id', authenticateToken, async (req, res, next) => {
    try {
        let id = req.params.id;
        let result = await sentMessagesDbOperations.getMessageById(id);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

// Update message by ID
sentMessagesRouter.put('/:id', authenticateToken, async (req, res, next) => {
    try {
        let id = req.params.id;
        let updatedValues = req.body;
        let { name, clientid } = updatedValues;

        let result = await sentMessagesDbOperations.updateMessage(id, name, clientid);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

// Delete message by ID
sentMessagesRouter.delete('/:id', authenticateToken, async (req, res, next) => {
    try {
        let id = req.params.id;
        let result = await sentMessagesDbOperations.deleteMessage(id);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

module.exports = sentMessagesRouter;