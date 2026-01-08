require("dotenv").config();
const pool = require("./poolfile");

let crudsObj = {};

crudsObj.postDriverAnalytic = (
    driver_id,
    waiting_otp
) => {
    return new Promise((resolve, reject) => {

        let waiting_verification = null;
        let verified = null;
        let online = null;
        let offline = null;
        let onboarding = null;
     
   

        pool.query(
            `INSERT INTO driver_analytics (
                driver_id,
                waiting_otp,
                waiting_verification,
                verified,
                online,
                offline,
                onboarding,
            	
            ) VALUES (?,?, ?, ?, ?, ?, ?)`,
            [
                driver_id,
                waiting_otp,
                waiting_verification, // waiting_verification
                verified,
                online, // online
                offline, // offline
                onboarding, // onboarding
                
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

crudsObj.getDriverAnalytics = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM driver_analytics", (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

crudsObj.getDriverAnalyticByDriverId = (driver_id) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM driver_analytics WHERE driver_id = ?', [driver_id], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

crudsObj.updateDriverAnalyticByWaitingOtp = (driver_id) => {
    return new Promise((resolve, reject) => {
        const currentTimestamp = new Date();
        const formattedTimestamp = currentTimestamp.toISOString().slice(0, 19).replace('T', ' ');
            pool.query(
            `UPDATE driver_analytics 
             SET waiting_otp = ? 
             WHERE driver_id = ?`,
            [formattedTimestamp, driver_id], 
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

crudsObj.updateDriverAnalyticByWaitingVerification = (driver_id) => {
    return new Promise((resolve, reject) => {
        const currentTimestamp = new Date();
        const formattedTimestamp = currentTimestamp.toISOString().slice(0, 19).replace('T', ' ');
            pool.query(
            `UPDATE driver_analytics 
             SET waiting_verification = ? 
             WHERE driver_id = ?`,
            [formattedTimestamp, driver_id], 
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

crudsObj.updateDriverAnalyticByVerified = (driver_id) => {
    return new Promise((resolve, reject) => {
        const currentTimestamp = new Date();
        const formattedTimestamp = currentTimestamp.toISOString().slice(0, 19).replace('T', ' ');
            pool.query(
            `UPDATE driver_analytics 
             SET verified = ? 
             WHERE driver_id = ?`,
            [formattedTimestamp, driver_id], 
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

crudsObj.updateDriverAnalyticByOnline = (driver_id) => {
    return new Promise((resolve, reject) => {
        const currentTimestamp = new Date();
        const formattedTimestamp = currentTimestamp.toISOString().slice(0, 19).replace('T', ' ');
            pool.query(
            `UPDATE driver_analytics 
             SET online = ? 
             WHERE driver_id = ?`,
            [formattedTimestamp, driver_id], 
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

crudsObj.updateDriverAnalyticByOffline = (driver_id) => {
    return new Promise((resolve, reject) => {
        const currentTimestamp = new Date();
        const formattedTimestamp = currentTimestamp.toISOString().slice(0, 19).replace('T', ' ');
            pool.query(
            `UPDATE driver_analytics 
             SET offline = ? 
             WHERE driver_id = ?`,
            [formattedTimestamp, driver_id], 
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

crudsObj.updateDriverAnalyticByOnboardingDuration= (driver_id) => {
    return new Promise((resolve, reject) => {
        const currentTimestamp = new Date();
        const formattedTimestamp = currentTimestamp.toISOString().slice(0, 19).replace('T', ' ');
            pool.query(
            `UPDATE driver_analytics 
             SET onboarding_duration= ? 
             WHERE driver_id = ?`,
            [formattedTimestamp, driver_id], 
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
crudsObj.deleteDriverAnalytic= (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM driver_analytics WHERE driver_analytic_id = ?",
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
