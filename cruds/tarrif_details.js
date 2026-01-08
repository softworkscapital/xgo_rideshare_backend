require("dotenv").config();
const pool = require("./poolfile");

let tarrifDetailsObj = {};

tarrifDetailsObj.postTarrifDetail = (tarrif_name, tarrif_description, created_by) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO tarrif_details (tarrif_name, tarrif_description, datetime_created, created_by) VALUES (?, ?, NOW(), ?)`,
      [tarrif_name, tarrif_description, created_by],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: "200", message: "Tarrif detail saved successfully", result });
      }
    );
  });
};

tarrifDetailsObj.getTarrifDetails = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM tarrif_details", (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

tarrifDetailsObj.getTarrifDetailById = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM tarrif_details WHERE tarrif_details_id = ?",
      [id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        if (results.length === 0) {
          return resolve(null); // No results found
        }
        return resolve(results[0]); // Return the first result
      }
    );
  });
};

tarrifDetailsObj.updateTarrifDetail = (tarrif_details_id, updatedValues) => {
  const { tarrif_name, tarrif_description, created_by } = updatedValues;

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE tarrif_details SET 
        tarrif_name = ?, 
        tarrif_description = ?, 
        created_by = ? 
      WHERE tarrif_details_id = ?`,
      [tarrif_name, tarrif_description, created_by, tarrif_details_id],
      (err, result) => {
        if (err) {
          console.error("Error updating tarrif detail:", err);
          return reject(err);
        }
        if (result.affectedRows === 0) {
          return resolve({
            status: "404",
            message: "Tarrif detail not found or no changes made",
          });
        }
        return resolve({ status: "200", message: "Update successful", result });
      }
    );
  });
};

tarrifDetailsObj.deleteTarrifDetail = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM tarrif_details WHERE tarrif_details_id = ?",
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

module.exports = tarrifDetailsObj;