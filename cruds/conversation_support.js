require("dotenv").config();
const pool = require("./poolfile");

let crudsObj = {};

crudsObj.postConversationSupport = (
    customer_id,
    customer_name,
    phone1,
    phone2,
    email,
    surname,
    company,
    product,
    conversation_stage,
    person_assigned,
    expiry_date_time,
    priority_level,
    created_at,
    estimation_duration,
    description,
    chat_id,
    department
) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `INSERT INTO tickets (
                customer_id,
                customer_name,
                phone1,
                phone2,
                email,
                surname,
                company,
                product,
                conversation_stage,
                person_assigned,
                expiry_date_time,
                priority_level,
                created_at,
                estimation_duration,
                description,
                chat_id,
                department
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customer_id,
                customer_name,
                phone1,
                phone2,
                email,
                surname,
                company,
                product,
                conversation_stage,
                person_assigned,
                expiry_date_time,
                priority_level,
                created_at,
                estimation_duration,
                description,
                chat_id,
                department
            ],
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ status: "200", message: "Saving successful", result });
            }
        );
    });
};
crudsObj.getConversationsByStage = (stage) => {
    return new Promise((resolve, reject) => {
        // Use parameterized query to prevent SQL injection
        pool.query("SELECT * FROM tickets WHERE conversation_stage = ?", [stage], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};
crudsObj.getConverByUserAndStage = (stage, user) => {
    return new Promise((resolve, reject) => {
        // Use parameterized query to prevent SQL injection
        pool.query("SELECT * FROM tickets WHERE conversation_stage = ? AND person_assigned = ? ", [stage, user], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};
crudsObj.getConversationById = (conversation_support_id) => {
    return new Promise((resolve, reject) => {
        // Use parameterized query to prevent SQL injection
        pool.query("SELECT * FROM tickets WHERE conversation_support_id = ?", [conversation_support_id], (err, results) => {
            if (err) {
                return reject(err);
            }
            if (results.length === 0) {
                return resolve({
                    status: "404",
                    message: "Conversation support record not found",
                });
            }
            return resolve(results[0]); // Return the first record found
        });
    });
};
crudsObj.getConversationSupports = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM tickets", (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

crudsObj.updateConversationSupport = (conversation_support_id, updatedValues) => {
    const {
        customer_id,
        customer_name,
        phone1,
        phone2,
        email,
        surname,
        company,
        product,
        conversation_stage,
        person_assigned,
        expiry_date_time,
        priority_level,
        created_at,
        estimation_duration,
        description,
        chat_id,
        department
    } = updatedValues;

    console.log("Updating record with ID:", conversation_support_id);
    console.log("Updated values:", updatedValues);

    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE tickets SET 
                customer_id = ?,
                customer_name = ?,
                phone1 = ?,
                phone2 = ?,
                email = ?,
                surname = ?,
                company = ?,
                product = ?,
                conversation_stage = ?,
                person_assigned = ?,
                expiry_date_time = ?,
                priority_level = ?,
                created_at = ?,
                estimation_duration = ?,
                description = ?,
                chat_id = ?,
                department = ?
            WHERE conversation_support_id = ?`,
            [
                customer_id,
                customer_name,
                phone1,
                phone2,
                email,
                surname,
                company,
                product,
                conversation_stage,
                person_assigned,
                expiry_date_time,
                priority_level,
                created_at,
                estimation_duration,
                description,
                chat_id,
                department,
                conversation_support_id
            ],
            (err, result) => {
                if (err) {
                    console.error("Error updating record:", err);
                    return reject(err);
                }
                if (result.affectedRows === 0) {
                    return resolve({
                        status: "404",
                        message: "Conversation support record not found or no changes made",
                    });
                }
                return resolve({ status: "200", message: "Update successful", result });
            }
        );
    });
};

crudsObj.deleteConversationSupport = (id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "DELETE FROM tickets WHERE conversation_support_id = ?",
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
crudsObj.updateConversationStage = (conversation_support_id, newStage) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE tickets SET conversation_stage = ? WHERE conversation_support_id = ?`,
            [newStage, conversation_support_id],
            (err, result) => {
                if (err) {
                    console.error("Error updating conversation stage:", err);
                    return reject(err);
                }
                if (result.affectedRows === 0) {
                    return resolve({
                        status: "404",
                        message: "Conversation support record not found or no changes made",
                    });
                }
                return resolve({ status: "200", message: "Conversation stage updated successfully", result });
            }
        );
    });
};

module.exports = crudsObj;