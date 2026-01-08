require("dotenv").config();
const pool = require("./poolfile");

let crudsObj = {};
crudsObj.postCustomerAdminChat = (
  customer_driver_chat_id,
  date_chat,
  time_chat,
  trip_id,
  admin_id,
  driver_id,
  conversation_id,
  message,
  origin,
  message_type, // New parameter for message type
  media_url // New parameter for media URL
) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO customer_admin_chats (
        date_chat,
        time_chat,
        trip_id,
        admin_id,
        driver_id,
        conversation_id,
        message,
        origin,
        message_type,
        media_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        date_chat,
        time_chat,
        trip_id,
        admin_id,
        driver_id,
        conversation_id,
        message,
        origin,
        message_type, // Add to the parameters
        media_url, // Add to the parameters
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
crudsObj.getCustomerAdminChats = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM customer_admin_chats", (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};
crudsObj.getAdminChartsAndUser = () => {
  return new Promise((resolve, reject) => {
    const query = `
     SELECT u.userid, 
             MAX(c.date_chat) AS last_message_date, 
             MAX(c.time_chat) AS last_message_time, 
             MAX(c.message) AS last_message, 
             COALESCE(d.name, cu.name) AS user_name, 
             COALESCE(d.surname, cu.surname) AS user_surname,
             COALESCE(d.profilePic, cu.profilePic) AS profile,
             COALESCE(d.account_type, cu.account_type) AS account_type
      FROM customer_admin_chats c
      JOIN users u ON c.driver_id = u.userid
      LEFT JOIN driver_details d ON u.role = 'driver' AND u.userid = d.driver_id
      LEFT JOIN customer_details cu ON u.role = 'customer' AND u.userid = cu.customerid
      GROUP BY u.userid
      ORDER BY last_message_date DESC
    `;

    pool.query(query, (err, results) => {
      if (err) {
        console.error("Query error:", err);
        return reject(err);
      }
      console.log("Query results:", results); // Log the results object
      return resolve(results); // Return results directly
    });
  });
};
crudsObj.getCustomerAdminChatsByTripId = (trip_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM customer_admin_chats WHERE trip_id = ? ORDER BY customer_admin_chat_id DESC LIMIT 20",
      [trip_id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

crudsObj.getCustomerAdminChatByDriverId = (driver_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM customer_admin_chats WHERE driver_id = ?",
      [driver_id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: 200, data: results });
      }
    );
  });
};

crudsObj.updateCustomerAdminChat = (customer_admin_chat_id, updatedValues) => {
  const {
    date_chat,
    time_chat,
    trip_id,
    admin_id,
    driver_id,
    message,
    conversation_id,
    origin,
  } = updatedValues;

  console.log("Updating record with ID:", customer_admin_chat_id);
  console.log("Updated values:", updatedValues);

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE customer_admin_chats SET 
                date_chat =?,
                time_chat =?,
                trip_id =?,
                admin_id =?,
                driver_id =?,
                conversation_id =?,
                message =?,
                origin =?
            WHERE customer_admin_chat_id = ?`,
      [
        date_chat,
        time_chat,
        trip_id,
        admin_id,
        driver_id,
        conversation_id,
        message,
        origin,
        customer_admin_chat_id,
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

crudsObj.deleteCustomerAdminChat = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM customer_admin_chats WHERE customer_admin_chat_id = ?",
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
