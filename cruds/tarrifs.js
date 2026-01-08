require("dotenv").config();
const pool = require("./poolfile");

let crudsObj = {};

crudsObj.postTarrif= (
    tarrif_id,
    billing_type,
    rate,
    lower_bound,
    upper_bound,
    lower_price_limit,
    upper_price_limit,
    distance_unit_of_measure,
    account_category,
    status	


) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO tarrifs (
        billing_type,
        rate,
        lower_bound,
        upper_bound,
        lower_price_limit,
        upper_price_limit,
        distance_unit_of_measure,
        account_category,
        status	
              ) VALUES (?, ?, ?, ?,?,?,?,?,?)`,
      [
       
        billing_type,
        rate,
        lower_bound,
        upper_bound,
        lower_price_limit,
        upper_price_limit,
        distance_unit_of_measure,
        account_category,
        status	
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

crudsObj.getTarrifs = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM tarrifs", (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

crudsObj.getActiveTarrifByDistance = (givenDistance, account_category) => {
  return new Promise((resolve, reject) => {
      const query = `
          SELECT * FROM tarrifs 
          WHERE lower_bound < ? 
          AND upper_bound >= ? 
          AND status = 'active' 
          AND account_category = ? 
          ORDER BY upper_bound DESC 
          LIMIT 1
      `;
      
      pool.query(query, [givenDistance, givenDistance, account_category], (err, results) => {
          if (err) {
              return reject(err);
          }
          return resolve(results);
      });
  });
};


crudsObj.updateTarrif = (tarrif_id, updatedValues) => {
    const {
        billing_type,
        rate,
        lower_bound,
        upper_bound,
        lower_price_limit,
        upper_price_limit,
        distance_unit_of_measure,
        account_category,
        status	
    } = updatedValues;

    // console.log("Updating record with ID:", customer_admin_chat_id);
    // console.log("Updated values:", updatedValues);

    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE tarrifs SET 
                billing_type =?,
                rate =?,
                lower_bound =?,
                upper_bound =?,
                lower_price_limit = ?,
                upper_price_limit = ?,
                distance_unit_of_measure =?,
                account_category =?,
                status =?	
            WHERE tarrif_id = ?`,
            [
                billing_type,
                rate,
                lower_bound,
                upper_bound,
                lower_price_limit,
                upper_price_limit,
                distance_unit_of_measure,
                account_category,
                status	,
                tarrif_id,
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


crudsObj.deleteTarrif= (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM tarrifs WHERE tarrif_id = ?",
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
