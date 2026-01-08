require("dotenv").config();
const pool = require("./poolfile");

let lastMileRoutingObj = {};

lastMileRoutingObj.postRouting = (group_name, closest_pick_up_branch_id, trip_id) => {
    console.log("Received data:", { group_name, closest_pick_up_branch_id, trip_id }); // Add this line
    return new Promise((resolve, reject) => {
      pool.query(
        `INSERT INTO routing_table_last_mile (group_name, closest_pick_up_branch_id, trip_id) VALUES (?, ?, ?)`,
        [group_name, closest_pick_up_branch_id, trip_id],
        (err, result) => {
          if (err) {
            console.error("Error inserting routing entry:", err);
            return reject(err);
          }
          return resolve({ status: "200", message: "Routing entry saved successfully", result });
        }
      );
    });
  };



lastMileRoutingObj.getRoutingEntries = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM routing_table_last_mile", (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

lastMileRoutingObj.getRoutingById = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM routing_table_last_mile WHERE routing_table_last_mile_id = ?",
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

lastMileRoutingObj.updateRouting = (routing_table_last_mile_id, updatedValues) => {
  const { group_name, closest_pick_up_branch_id, trip_id } = updatedValues;

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE routing_table_last_mile SET 
        group_name = ?, 
        closest_pick_up_branch_id = ?, 
        trip_id = ? 
      WHERE routing_table_last_mile_id = ?`,
      [group_name, closest_pick_up_branch_id, trip_id, routing_table_last_mile_id],
      (err, result) => {
        if (err) {
          console.error("Error updating routing entry:", err);
          return reject(err);
        }
        if (result.affectedRows === 0) {
          return resolve({
            status: "404",
            message: "Routing entry not found or no changes made",
          });
        }
        return resolve({ status: "200", message: "Update successful", result });
      }
    );
  });
};

lastMileRoutingObj.deleteRouting = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM routing_table_last_mile WHERE routing_table_last_mile_id = ?",
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

module.exports = lastMileRoutingObj;