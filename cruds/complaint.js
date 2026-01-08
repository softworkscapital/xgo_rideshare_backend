require('dotenv').config();
const pool = require('./poolfile');

let crudsObj = {};

crudsObj.postComplaint = (
    customer_id,
    driver_id,
    trip_id,
    complaint,
    time_issued_complaint,
) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `INSERT INTO complaint (
                customer_id, driver_id, trip_id, complaint, time_issued_complaint
            ) VALUES ( ?, ?, ?, ?, ?)`,
            [
                customer_id,
                driver_id,
                trip_id,
                complaint,
                time_issued_complaint,
            ],
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ status: '200', message: 'saving successful' });
            }
        );
    });
};

crudsObj.getComplaints = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM complaint', (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

crudsObj.getComplaintById = (complaint_id) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM complaint WHERE complaint_id = ?', [complaint_id], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

crudsObj.updateComplaint = (complaint_id, updatedValues) => {
    const {
        customer_id,
        driver_id,
        trip_id,
        complaint,
        time_issued_complaint,
    } = updatedValues;

    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE complaint SET  
                customer_id = ?, driver_id = ?, trip_id = ?, complaint = ?, time_issued_complaint = ?
            WHERE complaint_id = ?`,
            [
                customer_id,
                driver_id,
                trip_id,
                complaint,
                time_issued_complaint,
                complaint_id, 
            ],
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ status: '200', message: 'update successful' });
            }
        );
    });
};

crudsObj.deleteComplaint = (complaint_id) => {
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM complaint WHERE complaint_id = ?', [complaint_id], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

module.exports = crudsObj;
