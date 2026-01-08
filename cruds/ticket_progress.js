require("dotenv").config();
const pool = require("./poolfile");

let ticketProgressObj = {};

ticketProgressObj.postTicketProgress = (
  ticket_id,
  assigned_user_id,
  action_notes,
  received_at_date_time,
  left_at_date_time,
  status,
  pinned_images_url
) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO ticket_progress (ticket_id, assigned_user_id, action_notes, received_at_date_time, left_at_date_time, status, pinned_images_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        ticket_id,
        assigned_user_id,
        action_notes,
        received_at_date_time,
        left_at_date_time,
        status,
        pinned_images_url,
      ],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({
          status: "200",
          message: "Ticket progress saved successfully",
          ticket_progress_id: result.insertId,
        });
      }
    );
  });
};

ticketProgressObj.getTicketProgress = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM ticket_progress", (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

ticketProgressObj.getTicketProgressById = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM ticket_progress WHERE ticket_progress_id = ?",
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

ticketProgressObj.updateTicketProgress = (
  ticket_progress_id,
  updatedValues
) => {
  const {
    ticket_id,
    assigned_user_id,
    action_notes,
    received_at_date_time,
    left_at_date_time,
    status,
    pinned_images_url,
  } = updatedValues;

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE ticket_progress SET 
        ticket_id = ?, 
        assigned_user_id = ?, 
        action_notes = ?, 
        received_at_date_time = ?, 
        left_at_date_time = ?, 
        status = ?, 
        pinned_images_url = ? 
      WHERE ticket_progress_id = ?`,
      [
        ticket_id,
        assigned_user_id,
        action_notes,
        received_at_date_time,
        left_at_date_time,
        status,
        pinned_images_url,
        ticket_progress_id,
      ],
      (err, result) => {
        if (err) {
          console.error("Error updating ticket progress:", err);
          return reject(err);
        }
        if (result.affectedRows === 0) {
          return resolve({
            status: "404",
            message: "Ticket progress not found or no changes made",
          });
        }
        return resolve({ status: "200", message: "Update successful", result });
      }
    );
  });
};

ticketProgressObj.deleteTicketProgress = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM ticket_progress WHERE ticket_progress_id = ?",
      [id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        if (results.affectedRows === 0) {
          return resolve({
            status: "404",
            message: "Ticket progress not found",
          });
        }
        return resolve({
          status: "200",
          message: "Ticket progress deleted successfully",
        });
      }
    );
  });
};

ticketProgressObj.getTicketProgressByTicketId = (ticket_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM ticket_progress WHERE ticket_id = ?",
      [ticket_id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results); // Return all progress entries for the specified ticket_id
      }
    );
  });
};

module.exports = ticketProgressObj;
