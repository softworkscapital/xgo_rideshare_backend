require("dotenv").config();
const pool = require("./poolfile");

let crudsObj = {};

crudsObj.postConfig = (
    application_config_id,
    control_item,
    value
) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `INSERT INTO application_configs (
                control_item,
                value
            ) VALUES (?, ?)`,
            [
                control_item,
                value
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

crudsObj.getConfigs = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM application_configs", (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

crudsObj.getConfigById = (application_config_id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT * FROM application_configs WHERE application_config_id = ?",
            [application_config_id],
            (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            }
        );
    });
};

crudsObj.updateConfig = (application_config_id, updatedValues) => {
    const {
        control_item,
        value
    } = updatedValues;

    console.log("Updating record with ID:", application_config_id);
    console.log("Updated values:", updatedValues);

    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE application_configs SET 
                control_item = ?,
                value = ?
            WHERE application_config_id = ?`,
            [
                control_item,
                value,
                application_config_id
            ],
            (err, result) => {
                if (err) {
                    console.error("Error updating member:", err);
                    return reject(err);
                }
                if (result.affectedRows === 0) {
                    return resolve({
                        status: "404",
                        message: "Customer admin chat not found or no changes made",
                    });
                }
                return resolve({ status: "200", message: "Update successful", result });
            }
        );
    });
};

crudsObj.deleteConfig = (id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "DELETE FROM application_configs WHERE application_config_id = ?",
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

// New method to get the most recent configuration by control item
crudsObj.getRecentConfigByControlItem = () => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT *
             FROM application_configs
             WHERE control_item = 'APK Version Name'
             ORDER BY date DESC
             LIMIT 1`,
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