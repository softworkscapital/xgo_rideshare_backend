const express = require('express');
const  WithdrawalRouter = express.Router();
const  WithdrawalsDbOperations = require('../cruds/application_withdrawals');

WithdrawalRouter.post('/', async (req, res, next) => {
    try {
        let postedValues = req.body;
        let {
            application_withdrawal_id,
            user_id,
            name,
            surname,
            phone,
            id_number,
            description,
            destination_bank_id,
            destination_bank_acc,
            destination_bank_name,
            destination_phone_number,
            date_time,
            currency,
            amount,
            ref
        } = postedValues;

        let results = await WithdrawalsDbOperations.postWithdrawal(
            application_withdrawal_id,
            user_id,
            name,
            surname,
            phone,
            id_number,
            description,
            destination_bank_id,
            destination_bank_acc,
            destination_bank_name,
            destination_phone_number,
            date_time,
            currency,
            amount,
            ref
        );
        res.json(results);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

WithdrawalRouter.get('/', async (req, res, next) => {
    try {
        let results = await  WithdrawalsDbOperations.getWithdrawals();
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

WithdrawalRouter.get('/:id', async (req, res, next) => {
    try {
        let application_withdrawal_id = req.params.id;
        let result = await WithdrawalsDbOperations.getWithdrawalById(application_withdrawal_id);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});



WithdrawalRouter.put('/:application_withdrawal_id', async (req, res) => {
    const application_withdrawal_id = req.params.application_withdrawal_id; // Ensure this matches the route
    const updatedValues = req.body;

    try {
        const result = await WithdrawalsDbOperations.updateWithdrawal(application_withdrawal_id, updatedValues);
        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Error updating withdrawal:", error);
        return res.status(500).json({
            status: "500",
            message: "Internal Server Error",
            error: error.message,
        });
    }
});


  WithdrawalRouter.delete('/:id', async (req, res, next) => {
    try {
        let id = req.params.id;
        let result = await  WithdrawalsDbOperations.deleteWithdrawal(id);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

module.exports = WithdrawalRouter;
