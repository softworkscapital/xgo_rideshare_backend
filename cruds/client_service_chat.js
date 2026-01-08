require("dotenv").config();
const pool = require("./poolfile");

let crudsObj = {};

// Create a new chat record
crudsObj.postChat = (customer_id, date_created, admin_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO client_service_chat (customer_id, date_created, admin_id) VALUES (?, ?, ?)`,
      [customer_id, date_created, admin_id],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({
          status: "200",
          message: "Chat record created successfully",
          client_service_chat_id: result.insertId, // Include the auto-increment ID
        });
      }
    );
  });
};
// Get all chat records
crudsObj.getChats = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM client_service_chat", (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

// Get a chat record by ID
crudsObj.getChatById = (client_service_chat_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM client_service_chat WHERE client_service_chat_id = ?",
      [client_service_chat_id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

// Get chats by admin_id
crudsObj.getChatsByAdminId = (admin_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM client_service_chat WHERE admin_id = ? ORDER BY date_created DESC",
      [admin_id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

// Update the admin ID for a chat record
crudsObj.assignAdmin = (client_service_chat_id, admin_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE client_service_chat SET 
            admin_id = ?
            WHERE client_service_chat_id = ?`,
      [admin_id, client_service_chat_id],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({
          status: "200",
          message: "Admin assigned successfully",
        });
      }
    );
  });
};

// Get chats by customer_id
crudsObj.getChatsByCustomerId = (customer_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM client_service_chat WHERE customer_id = ? ORDER BY client_service_chat_id DESC", 
      [customer_id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};
crudsObj.getNewChats = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM client_service_chat WHERE admin_id = 'UnAssigned'",
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

// Join
// crudsObj.getConversationsByAdminAndCustomer = (admin_id, customer_id) => {
//   return new Promise((resolve, reject) => {
//     pool.query(
//       `SELECT
//           csc.*,
//           cac.*,
//           t.*
//        FROM
//           client_service_chat AS csc
//        JOIN
//           customer_admin_chats AS cac ON (csc.admin_id COLLATE utf8mb4_unicode_ci = cac.admin_id COLLATE utf8mb4_unicode_ci AND csc.customer_id COLLATE utf8mb4_unicode_ci = cac.driver_id COLLATE utf8mb4_unicode_ci)
//        JOIN
//           tickets AS t ON (csc.customer_id COLLATE utf8mb4_unicode_ci = t.customer_id COLLATE utf8mb4_unicode_ci)
//        WHERE
//           csc.admin_id = ? AND
//           csc.customer_id = ?`,
//       [admin_id, customer_id],
//       (err, results) => {
//         if (err) {
//           return reject(err);
//         }
//         return resolve(results);
//       }
//     );
//   });
// };

// Update a chat record
crudsObj.updateChat = (client_service_chat_id, updatedValues) => {
  const { customer_id, date_created, admin_id } = updatedValues;

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE client_service_chat SET 
            customer_id = ?, 
            date_created = ?, 
            admin_id = ?
            WHERE client_service_chat_id = ?`,
      [customer_id, date_created, admin_id, client_service_chat_id],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: "200", message: "Update successful" });
      }
    );
  });
};

// Delete a chat record
crudsObj.deleteChat = (client_service_chat_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM client_service_chat WHERE client_service_chat_id = ?",
      [client_service_chat_id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};
crudsObj.getAllChatsByChatId = (client_service_chat_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT 
          csc.*, 
          cac.* 
       FROM 
          client_service_chat AS csc
       JOIN 
          customer_admin_chats AS cac ON csc.client_service_chat_id = cac.conversation_id
       WHERE 
          csc.client_service_chat_id = ?`,
      [client_service_chat_id],
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
