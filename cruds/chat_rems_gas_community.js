require("dotenv").config();
const pool = require("./poolfile");

let crudsObj = {};

crudsObj.postChatRemsGasCommunity = (
    date_chat,
    time_chat,
    admin_id,
    user_id,
    conversation_id,
    massage,
    origin,
    massage_type,
    media_url,
    application
) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `INSERT INTO chat_rems_gas_community (
                date_chat,
                time_chat,
                admin_id,
                user_id,
                conversation_id,
                massage,
                origin,
                massage_type,
                media_url,
                application
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                date_chat,
                time_chat,
                admin_id,
                user_id,
                conversation_id,
                massage,
                origin,
                massage_type,
                media_url,
                application
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

crudsObj.getChatRemsGasCommunity = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM chat_rems_gas_community", (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

crudsObj.getChatRemsGasCommunityById = (id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT * FROM chat_rems_gas_community WHERE chat_rems_gas_community_id = ?",
            [id],
            (err, results) => {
                if (err) {
                    return reject(err);
                }
                if (results.length === 0) {
                    return resolve({ status: "404", message: "Chat not found" });
                }
                return resolve({ status: "200", data: results });
            }
        );
    });
};

crudsObj.updateChatRemsGasCommunity = (id, updatedValues) => {
    const {
        date_chat,
        time_chat,
        admin_id,
        user_id,
        conversation_id,
        massage,
        origin,
        massage_type,
        media_url,
        application
    } = updatedValues;

    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE chat_rems_gas_community SET 
                date_chat =?,
                time_chat =?,
                admin_id =?,
                user_id =?,
                conversation_id =?,
                massage =?,
                origin =?,
                massage_type =?,
                media_url =?,
                application =?
            WHERE chat_rems_gas_community_id = ?`,
            [
                date_chat,
                time_chat,
                admin_id,
                user_id,
                conversation_id,
                massage,
                origin,
                massage_type,
                media_url,
                application,
                id
            ],
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                if (result.affectedRows === 0) {
                    return resolve({
                        status: "404",
                        message: "Chat entry not found or no changes made",
                    });
                }
                return resolve({ status: "200", message: "Update successful", result });
            }
        );
    });
};

crudsObj.deleteChatRemsGasCommunity = (id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "DELETE FROM chat_rems_gas_community WHERE chat_rems_gas_community_id = ?",
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
// Get all chat entries by application
crudsObj.getChatRemsGasCommunityByApplication = (application) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT * FROM chat_rems_gas_community WHERE application = ?",
            [application],
            (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            }
        );
    });
};

// Get chat entries by user ID
crudsObj.getChatRemsGasCommunityByUserId = (user_id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT * FROM chat_rems_gas_community WHERE user_id = ?",
            [user_id],
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