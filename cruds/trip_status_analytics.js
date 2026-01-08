
require("dotenv").config();
const pool = require("./poolfile");

let crudsObj = {};

crudsObj.postTripStatusAnalytic = (
    trip_id,
    new_order
) => {
    return new Promise((resolve, reject) => {
        let counter_offer = null;
        let intransit = null;
        let arrived_at_destination = null;
        let trip_ended = null;
        let estimated_duration = null;
        let actual_duration = null;

        pool.query(
            `INSERT INTO trip_status_analytics (
                trip_id,
                new_order,
                counter_offer,
                intransit,
                arrived_at_destination,
                trip_ended,
                estimated_duration,
                actual_duration
            ) VALUES (?, ?, ?, ?, ?, ?, ?,?)`,
            [
                trip_id,
                new_order,
                counter_offer,
                intransit,
                arrived_at_destination,
                trip_ended,
                estimated_duration,
                actual_duration,
            ],
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ status: "200", message: "saving successful", result });
            }
        );
    });
};

crudsObj.getTripStatusAnalytics = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM trip_status_analytics", (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

crudsObj.getTripStatusAnalyticByTripId = (trip_id) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM trip_status_analytics WHERE trip_id = ?', [trip_id], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

crudsObj.updateTripStatusAnalyticByNewOrder = (trip_id) => {
    return new Promise((resolve, reject) => {
        const currentTimestamp = new Date();
        const formattedTimestamp = currentTimestamp.toISOString().slice(0, 19).replace('T', ' ');
            pool.query(
            `UPDATE trip_status_analytics 
             SET new_order = ? 
             WHERE trip_id = ?`,
            [formattedTimestamp, trip_id], 
            (err, result) => {
                if (err) {
                    return reject({ status: "500", message: "Database error", error: err });
                }
                // Check if any row was affected
                if (result.affectedRows === 0) {
                    return resolve({ status: "404", message: "No records found to update" });
                }
                return resolve({ status: "200", message: "Update successful" });
            }
        );
    });
};

crudsObj.updateTripStatusAnalyticByCounterOffer= (trip_id) => {
    return new Promise((resolve, reject) => {
        const currentTimestamp = new Date();
        const formattedTimestamp = currentTimestamp.toISOString().slice(0, 19).replace('T', ' ');
            pool.query(
            `UPDATE trip_status_analytics 
             SET counter_offer = ? 
             WHERE trip_id = ?`,
            [formattedTimestamp, trip_id], 
            (err, result) => {
                if (err) {
                    return reject({ status: "500", message: "Database error", error: err });
                }
                // Check if any row was affected
                if (result.affectedRows === 0) {
                    return resolve({ status: "404", message: "No records found to update" });
                }
                return resolve({ status: "200", message: "Update successful" });
            }
        );
    });
};

crudsObj.updateTripStatusAnalyticByIntransit = (trip_id) => {
    return new Promise((resolve, reject) => {
        const currentTimestamp = new Date();
        const formattedTimestamp = currentTimestamp.toISOString().slice(0, 19).replace('T', ' ');
            pool.query(
            `UPDATE trip_status_analytics 
             SET intransit = ? 
             WHERE trip_id = ?`,
            [formattedTimestamp, trip_id], 
            (err, result) => {
                if (err) {
                    return reject({ status: "500", message: "Database error", error: err });
                }
                // Check if any row was affected
                if (result.affectedRows === 0) {
                    return resolve({ status: "404", message: "No records found to update" });
                }
                return resolve({ status: "200", message: "Update successful" });
            }
        );
    });
};

crudsObj.updateTripStatusAnalyticByArrivedAtDestination = (trip_id) => {
    return new Promise((resolve, reject) => {
        const currentTimestamp = new Date();
        const formattedTimestamp = currentTimestamp.toISOString().slice(0, 19).replace('T', ' ');
            pool.query(
            `UPDATE trip_status_analytics 
             SET arrived_at_destination = ? 
             WHERE trip_id = ?`,
            [formattedTimestamp, trip_id], 
            (err, result) => {
                if (err) {
                    return reject({ status: "500", message: "Database error", error: err });
                }
                // Check if any row was affected
                if (result.affectedRows === 0) {
                    return resolve({ status: "404", message: "No records found to update" });
                }
                return resolve({ status: "200", message: "Update successful" });
            }
        );
    });
};

crudsObj.updateTripStatusAnalyticByTripEnded = (trip_id) => {
    return new Promise((resolve, reject) => {
        const currentTimestamp = new Date();
        const formattedTimestamp = currentTimestamp.toISOString().slice(0, 19).replace('T', ' ');
            pool.query(
            `UPDATE trip_status_analytics 
             SET trip_ended = ? 
             WHERE trip_id = ?`,
            [formattedTimestamp, trip_id], 
            (err, result) => {
                if (err) {
                    return reject({ status: "500", message: "Database error", error: err });
                }
                // Check if any row was affected
                if (result.affectedRows === 0) {
                    return resolve({ status: "404", message: "No records found to update" });
                }
                return resolve({ status: "200", message: "Update successful" });
            }
        );
    });
};

crudsObj.updateTripStatusAnalyticByEstimatedDuration= (trip_id) => {
    return new Promise((resolve, reject) => {
        const currentTimestamp = new Date();
        const formattedTimestamp = currentTimestamp.toISOString().slice(0, 19).replace('T', ' ');
            pool.query(
            `UPDATE trip_status_analytics 
             SET estimated_duration= ? 
             WHERE trip_id = ?`,
            [formattedTimestamp, trip_id], 
            (err, result) => {
                if (err) {
                    return reject({ status: "500", message: "Database error", error: err });
                }
                // Check if any row was affected
                if (result.affectedRows === 0) {
                    return resolve({ status: "404", message: "No records found to update" });
                }
                return resolve({ status: "200", message: "Update successful" });
            }
        );
    });
};

crudsObj.updateTripStatusAnalyticByActualDuration= (trip_id) => {
    return new Promise((resolve, reject) => {
        const currentTimestamp = new Date();
        const formattedTimestamp = currentTimestamp.toISOString().slice(0, 19).replace('T', ' ');
            pool.query(
            `UPDATE trip_status_analytics 
             SET actual_duration= ? 
             WHERE trip_id = ?`,
            [formattedTimestamp, trip_id], 
            (err, result) => {
                if (err) {
                    return reject({ status: "500", message: "Database error", error: err });
                }
                // Check if any row was affected
                if (result.affectedRows === 0) {
                    return resolve({ status: "404", message: "No records found to update" });
                }
                return resolve({ status: "200", message: "Update successful" });
            }
        );
    });
};

crudsObj.deleteTripStatusAnalytic= (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM trip_status_analytics WHERE trip_status_analytic_id = ?",
      [id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

module.exports = crudsObj;
