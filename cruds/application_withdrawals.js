require("dotenv").config();
const pool = require("./poolfile");

let crudsObj = {};

crudsObj.postWithdrawal = (
  application_withdrawal_id,
  user_id,
  name,
  surname,
  phone,
  id_number,
  description,
  destination_bank_id,
  destination_bank_acc,
  destination_bank_name,
  destination_phone_number,
  date_time,
  currency,
  amount,
  ref
) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO application_withdrawals (
        user_id,
        name,
        surname,
        phone,
        id_number,
        description,
        destination_bank_id,
        destination_bank_acc,
        destination_bank_name,
        destination_phone_number,
        date_time,
        currency,
        amount,
        ref
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        name,
        surname,
        phone,
        id_number,
        description,
        destination_bank_id,
        destination_bank_acc,
        destination_bank_name,
        destination_phone_number,
        date_time,
        currency,
        amount,
        ref,
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

crudsObj.getWithdrawals = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM application_withdrawals", (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

crudsObj.getWithdrawalById = (application_withdrawal_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM application_withdrawals WHERE application_withdrawal_id = ?",
      [application_withdrawal_id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

crudsObj.updateWithdrawal = (application_withdrawal_id, updatedValues) => {
  const {
    user_id,
    name,
    surname,
    phone,
    id_number,
    description,
    destination_bank_id,
    destination_bank_acc,
    destination_bank_name,
    destination_phone_number,
    date_time,
    currency,
    amount,
    ref,
  } = updatedValues;

  console.log("Updating record with ID:", application_withdrawal_id);
  console.log("Updated values:", updatedValues);

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE application_withdrawals SET 
        user_id = ?,
        name = ?,
        surname = ?,
        phone = ?,
        id_number = ?,
        description = ?,
        destination_bank_id = ?,
        destination_bank_acc = ?,
        destination_bank_name = ?,
        destination_phone_number = ?,
        date_time = ?,
        currency = ?,
        amount = ?,
        ref = ?
      WHERE application_withdrawal_id = ?`,
      [
        user_id,
        name,
        surname,
        phone,
        id_number,
        description,
        destination_bank_id,
        destination_bank_acc,
        destination_bank_name,
        destination_phone_number,
        date_time,
        currency,
        amount,
        ref,
        application_withdrawal_id // This should be included at the end
      ],
      (err, result) => {
        if (err) {
          console.error("Error updating withdrawal:", err);
          return reject(err);
        }
        if (result.affectedRows === 0) {
          return resolve({
            status: "404",
            message: "Withdrawal not found or no changes made",
          });
        }
        return resolve({ status: "200", message: "Update successful", result });
      }
    );
  });
};

crudsObj.deleteWithdrawal = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM application_withdrawals WHERE application_withdrawal_id = ?",
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
