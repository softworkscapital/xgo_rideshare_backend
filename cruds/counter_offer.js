require('dotenv').config();
const pool = require('./poolfile');

let crudsObj = {};

crudsObj.postCounterOffer = (
    counter_offer_id,
    customerid,
    driver_id,
    trip_id,
    date_time,
    offer_value,
    counter_offer_value,
    currency,
    status	
) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `INSERT INTO counter_offer (
                customerid,
                driver_id,
                trip_id,
                date_time,
                offer_value,
                counter_offer_value,
                currency,
                status	
            ) VALUES ( ?, ?, ?, ?, ?, ?, ?,?)`,
            [
                customerid,
                driver_id,
                trip_id,
                date_time,
                offer_value,
                counter_offer_value,
                currency,
                status	
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

crudsObj.getCounterOffers = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM counter_offer', (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};


crudsObj.getCounterOffers = (customerid, status) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM counter_offer WHERE customerid = ? AND status = ?';
        pool.query(query, [customerid, status], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

crudsObj.getCounterOfferById = (counter_offer_id) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM counter_offer WHERE counter_offer_id = ?', [counter_offer_id], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

crudsObj.updateCounterOffer = (counter_offer_id, updatedValues) => {
    const {
        customerid,
        driver_id,
        trip_id,
        date_time,
        offer_value,
        counter_offer_value,
        currency,
        status	
    } = updatedValues;

    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE counter_offer SET  
                customerid =?,
                driver_id =?,
                trip_id =?,
                date_time =?,
                offer_value =?,
                counter_offer_value =?,
                currency =?,
                status	=?
            WHERE counter_offer_id = ?`,
            [
                customerid,
                driver_id,
                trip_id,
                date_time,
                offer_value,
                counter_offer_value,
                currency,
                status	,
                counter_offer_id, // Include counter_offer_id here
            ],
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ status: 200 , message: 'update successful' });
            }
        );
    });
};


crudsObj.updateCounterOfferStatus = (counter_offer_id, status) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE counter_offer SET  
                status = ?
            WHERE counter_offer_id = ?`,
            [status, counter_offer_id],
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                if (result.affectedRows === 0) {
                    return resolve({ status: 404, message: 'Counter offer not found' });
                }
                return resolve({ status: 200 , message: 'Update successful' });
            }
        );
    });
};

crudsObj.updateCounterOfferStatusOfTrips = (driver_id, status, oldstatus) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE counter_offer SET  
                status = ?
            WHERE driver_id = ? AND status = ?`,
            [status, driver_id, oldstatus],
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                if (result.affectedRows === 0) {
                    return resolve({ status: 404 , message: 'No counter offers found for this driver' });
                }
                return resolve({ status: 200 , message: `${result.affectedRows} updates successful` });
            }
        );
    });
};

crudsObj.deleteCounterOffer = (counter_offer_id) => {
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM counter_offer WHERE counter_offer_id = ?', [counter_offer_id], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

module.exports = crudsObj;
