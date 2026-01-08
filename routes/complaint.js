const express = require('express');
const complaintRouter = express.Router();
const complaintDbOperations = require('../cruds/complaint');

complaintRouter.post('/', async (req, res, next) => {
    try {
        let postedValues = req.body;
        let customerid = postedValues.customerid;
        let driver_id = postedValues.driver_id;
        let trip_id = postedValues.trip_id;
        let complaint = postedValues.complaint;
        let time_issued_complaint = postedValues.time_issued_complaint;
        

        console.log(postedValues);

        let results = await complaintDbOperations.postComplaint(
            customerid,
            driver_id,
            trip_id,
            complaint,
            time_issued_complaint);
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
})



complaintRouter.get('/', async (req, res, next) => {
    try {
        let results = await complaintDbOperations.getComplaints();
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

complaintRouter.get('/:complaint_id', async (req, res, next) => {
    try {
        let complaint_id = req.params.complaint_id;
        let result = await complaintDbOperations.getComplaintById(complaint_id);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});



complaintRouter.put('/updateComplaint/:complaint_id', async (req, res, next) => {
    try {
        let complaint_id = req.params.complaint_id;
        let postedValues = req.body;

        let result = await complaintDbOperations.updateComplaint(complaint_id,postedValues);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});



complaintRouter.delete('/:complaint_id', async (req, res, next) => {
    try {
        let complaint_id = req.params.complaint_id;
        let result = await complaintDbOperations.deleteComplaint(complaint_id);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

module.exports = complaintRouter;