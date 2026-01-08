require("dotenv").config();
const pool = require("./poolfile");
const axios = require("axios");

let crudsObj = {};

// Existing CRUD methods...

// crudsObj.postUser = (user) => {
//   return new Promise((resolve, reject) => {
//     let User = user;
//     console.log("honai user:", User);

//     pool.query(
//       "INSERT INTO users(userid, username, password, role, email, notify, activesession, addproperty, editproperty, approverequests, delivery, status, employee_id, company_id, branch_id, sync_status, last_logged_account, driver_id, customerid, otp, signed_up_on, last_logged_in, last_activity_date_time, last_fin_activity_date_time, referral_code, reference_payment_status, referred_by, refered_by_me_count, customer_adoption_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//       [
//         user.userId,
//         user.username,
//         user.password,
//         user.role,
//         user.email,
//         user.notify,
//         user.activeSession,
//         user.addProperty,
//         user.editProperty,
//         user.approveRequests,
//         user.delivery,
//         user.status,
//         user.employeeId,
//         user.companyId,
//         user.branchId,
//         user.syncStatus,
//         user.last_logged_account,
//         user.driverId,
//         user.customerId,
//         user.otp,
//         user.signed_up_on,
//         user.last_logged_in,
//         user.last_activity_date_time,
//         user.last_fin_activity_date_time, 
//         user.referral_code, 
//         user.reference_payment_status,
//         user.referred_by,
//         user.refered_by_me_count,
//         user.customer_adoption_count
//       ],
//       (err, result) => {
//         if (err) {
//           return reject(err);
//         }
//         return resolve({
//           status: "200",
//           message: "Your account has been created successfully. Now verify your phone number via the OTP sent to your mobile.",
//         });
//       }
//     );
//   });
// };

crudsObj.postUser = (user) => {
  return new Promise((resolve, reject) => {
    let User = user;
    console.log("honai user:", User);

    // Start by inserting the new user
    pool.query(
      "INSERT INTO users(userid, username, password, role, email, notify, activesession, addproperty, editproperty, approverequests, delivery, status, employee_id, company_id, branch_id, sync_status, last_logged_account, driver_id, customerid, otp, signed_up_on, last_logged_in, last_activity_date_time, last_fin_activity_date_time, referral_code, reference_payment_status, referred_by, referred_by_me_count, customer_adoption_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        user.userId,
        user.username,
        user.password,
        user.role,
        user.email,
        user.notify,
        user.activeSession,
        user.addProperty,
        user.editProperty,
        user.approveRequests,
        user.delivery,
        user.status,
        user.employeeId,
        user.companyId,
        user.branchId,
        user.syncStatus,
        user.last_logged_account,
        user.driverId,
        user.customerId,
        user.otp,
        user.signed_up_on,
        user.last_logged_in,
        user.last_activity_date_time,
        user.last_fin_activity_date_time, 
        user.referral_code, 
        user.reference_payment_status,
        user.referred_by,
        user.referred_by_me_count,
        user.customer_adoption_type
      ],
      (err, result) => {
        if (err) {
          return reject(err);
        }

        // If user creation is successful, update the referred user's count
        const referredBy = user.referred_by; // Get the referred_by field from the user object
        if (referredBy) {
          pool.query(
            "SELECT referred_by_me_count FROM users WHERE userid = ?",
            [referredBy],
            (err, results) => {
              if (err) {
                return reject(err);
              }

              if (results.length > 0) {
                const oldCount = results[0].referred_by_me_count || 0; // Handle case where oldCount might be null
                const newCount = oldCount + 1;

                pool.query(
                  `UPDATE users SET 
                    referred_by_me_count = ?
                  WHERE userid = ?`,
                  [newCount, referredBy], 
                  (err, result) => {
                    if (err) {
                      return reject(err);
                    }
                    return resolve({
                      status: "200",
                      message: "Your account has been created successfully. Now verify your phone number via the OTP sent to your mobile.",
                    });
                  }
                );
              } else {
                // If referred user does not exist, resolve with a message
                return resolve({
                  status: "200",
                  message: "User created successfully, but referred user not found."
                });
              }
            }
          );
        } else {
          // If no referred_by, resolve with success message
          return resolve({
            status: "200",
            message: "Your account has been created successfully. Now verify your phone number via the OTP sent to your mobile.",
          });
        }
      }
    );
  });
};



crudsObj.getLastUser = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT userid FROM users ORDER BY userid DESC LIMIT 1;",
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

crudsObj.postUsernNew = (companyId, username, role, email, password) => {
  // console.log(password);
  return new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO users(username,role,email,password,client_profile_id) VALUES (?,?,?,?,?)",
      [username, role, email, password, companyId],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({ statu: "200", message: "saving successful" });
      }
    );
  });
};

crudsObj.postUser2 = (
  company_id,
  branch_id,
  username,
  password,
  role,
  category,
  email,
  notify,
  activesession,
  addproperty,
  editproperty,
  approverequests,
  delivery,
  status,
  employee_id,
  company_email,
  client_profile_id,
  user_phone,
  otp,
  signed_up_on,
  refered_by_me_count,
  customer_adoption_count
) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO users(company_id,branch_id,username,password,role,category,email,notify,activesession,addproperty,editproperty,approverequests,delivery,status,client_profile_id, OTP,signed_up_on, reffered_by_me_count, customer_adoption_type) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?, ?)",
      [
        company_id,
        branch_id,
        username,
        password,
        role,
        category,
        email,
        notify,
        activesession,
        addproperty,
        editproperty,
        approverequests,
        delivery,
        status,
        client_profile_id,
        otp,
        signed_up_on,
        refered_by_me_count,
        customer_adoption_count
      ],
      (err, result) => {
        if (err) {
          return reject(err);
        }

        // console.log(user_phone);
        // console.log(email);

        const originalUrl = `https://sms.vas.co.zw/client/api/sendmessage?apikey=e28bb49ae7204dfe&mobiles=${user_phone}&sms=Hi ${username}! Your Tell Them Message Service account has been activated, you can proceed to login. Your first time password is ${otp}&senderid=softworks`;
        //const originalUrl = `http://196.43.100.209:8901/teleoss/sendsms.jsp?user=Softwork&password=Soft@012&mobiles=${user_phone}&sms=Hi ${username}! Your Tell Them Message Service account has been activated, you can proceed to login. Your first time password is ${otp}&unicode=1&clientsmsid=10001&senderid=Softwork`;
        const response = axios.get(originalUrl);

        return resolve({ status: "200", message: "saving successful" });
      }
    );
  });
};


crudsObj.getUsers = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM users", (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};




// Updated getUsers function
crudsObj.getDriverInfo = (driver_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
          u.*,  -- Select all columns from users
          d.*,  -- Select all columns from driver_details
          v.*   -- Select all columns from vehicles
      FROM 
          users u
      LEFT JOIN 
          driver_details d ON u.driver_id = d.driver_id
      LEFT JOIN 
          vehicles v ON d.driver_id = v.driver_id
      WHERE 
          d.driver_id = ?;
    `;
    
    pool.query(query, [driver_id], (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results.length > 0 ? results[0] : null); // Return the first result or null if not found
    });
  });
};


crudsObj.updateDriverInfo = (driver_id, data) => {
  return new Promise((resolve, reject) => {
    const updates = [];
    const values = [];

    // Define valid fields for each table
    const userFields = [
      'userid', 'username', 'password', 'role', 'category', 'email', 
      'notify', 'activesession', 'addproperty', 'editproperty', 
      'approverequests', 'delivery', 'status', 'employee_id', 
      'company_id', 'branch_id', 'sync_status', 'last_logged_account', 
      'customerid', 'otp', 'signed_up_on', 'last_logged_in', 
      'last_activity_date_time', 'last_fin_activity_date_time', 
      'referral_code', 'reference_payment_status', 'referred_by', 
      'referred_by_me_count', 'customer_adoption_type'
    ];

    const driverFields = [
      'driver_id', 'ecnumber', 'account_type', 'signed_on', 
      'username', 'name', 'surname', 'idnumber', 'sex', 
      'dob', 'address', 'house_number_and_street_name', 
      'surbub', 'city', 'country', 'lat_cordinates', 
      'long_cordinates', 'phone', 'plate', 'vehicle_category', 
      'vehicle_year', 'make', 'model', 'type', 'colour', 
      'email', 'password', 'employer', 'workindustry', 
      'workaddress', 'workphone', 'workphone2', 'nok1name', 
      'nok1surname', 'nok1relationship', 'nok1phone', 
      'nok2name', 'nok2surname', 'nok2relationship', 
      'nok2phone', 'rating', 'credit_bar_rule_exception', 
      'membershipstatus', 'defaultsubs', 'sendmail', 
      'sendsms', 'product_code', 'cost_price', 
      'selling_price', 'payment_style', 'profilePic', 
      'id_image', 'number_plate_image', 'vehicle_license_image', 
      'driver_license_image', 'vehicle_img1', 'vehicle_img2', 
      'vehicle_img3', 'driver_license_date', 'number_of_passangers'
    ];

    const vehicleFields = [
      'vehicles_id', 'number_plate', 'driver_id', 
      'vehicle_make', 'vehicle_model', 'colour', 
      'vehicle_license_image', 'vehicle_image1', 
      'vehicle_image2', 'vehicle_image3', 'vehicle_category', 
      'vehicle_year', 'vehicle_count', 'vehicle_type'
    ];

    // Build the update query
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
        if (userFields.includes(key)) {
          updates.push(`u.${key} = ?`);
        } else if (driverFields.includes(key)) {
          updates.push(`d.${key} = ?`);
        } else if (vehicleFields.includes(key)) {
          updates.push(`v.${key} = ?`);
        } else {
          console.warn(`Field ${key} is not valid for update.`);
          continue; // Skip invalid fields
        }
        values.push(data[key]);
      }
    }

    if (updates.length === 0) {
      return resolve({ message: "No fields to update." });
    }

    // Construct query
    const query = `
      UPDATE users u
      LEFT JOIN driver_details d ON u.userid = d.driver_id
      LEFT JOIN vehicles v ON d.driver_id = v.driver_id
      SET ${updates.join(", ")}
      WHERE u.userid = ?;
    `;

    // Log the query and values
    console.log('Executing query:', query);
    console.log('With values:', [...values, driver_id]);

    // Add driver_id to values (assuming driver_id is the user ID for the WHERE clause)
    values.push(driver_id);

    pool.query(query, values, (err) => {
      if (err) {
        return reject(err);
      }
      resolve({ message: "Driver information updated successfully." });
    });
  });
};


crudsObj.getUserById = (userId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM users WHERE userid = ?",
      [userId],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};


//Get User By Reference Code
crudsObj.getUserByReferenceCode = (referenceCode) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM users WHERE referral_code = ?",
      [referenceCode],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};



crudsObj.getUserByCred = (email, password) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

//Get User By Email
crudsObj.getUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

crudsObj.getUserByOtp = (email, otp) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM users WHERE email = ? AND OTP = ?",
      [email, otp],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

//Update OTP status
crudsObj.updateOTPStatus = (id, otp) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE users SET OTP = ? = ? WHERE userid = ?",
      [otp, id],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: "200", message: "update successful" });
      }
    );
  });
};

// Update OTP
crudsObj.updateOTP = (userId, otp) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE users SET OTP = ? WHERE userid = ?",
      [otp, userId],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        if (result.affectedRows === 0) {
          return reject(new Error("No user found with this ID"));
        }
        return resolve({
          status: "200",
          message: "OTP updated successfully",
        });
      }
    );
  });
};


//Update OTP
crudsObj.updatePasswordStatus = (id, otp) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE users SET password = ? WHERE userid = ?",
      [otp, id],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: "200", message: "update successful" });
      }
    );
  });
};



//update user
crudsObj.updateUser = (userid, updatedValues) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE users SET 
        username = ?, 
        password = ?, 
        role = ?, 
        email = ?, 
        notify = ?, 
        activesession = ?, 
        addproperty = ?, 
        editproperty = ?, 
        approverequests = ?, 
        delivery = ?, 
        status = ?, 
        employee_id = ?, 
        company_id = ?, 
        branch_id = ?, 
        sync_status = ?, 
        last_logged_account = ?, 
        driver_id = ?, 
        customerid = ?, 
        otp = ?, 
        signed_up_on = ?, 
        last_logged_in = ?, 
        last_activity_date_time = ?, 
        last_fin_activity_date_time = ?, 
        referral_code = ?, 
        reference_payment_status = ?, 
        referred_by = ?
      WHERE userid = ?`;

    const values = [
      updatedValues.username,
      updatedValues.password,
      updatedValues.role,
      updatedValues.email,
      updatedValues.notify,
      updatedValues.activesession,
      updatedValues.addproperty,
      updatedValues.editproperty,
      updatedValues.approverequests,
      updatedValues.delivery,
      updatedValues.status,
      updatedValues.employee_id,
      updatedValues.company_id,
      updatedValues.branch_id,
      updatedValues.sync_status,
      updatedValues.last_logged_account,
      updatedValues.driver_id,
      updatedValues.customerid,
      updatedValues.otp,
      updatedValues.signed_up_on,
      updatedValues.last_logged_in,
      updatedValues.last_activity_date_time,
      updatedValues.last_fin_activity_date_time,
      updatedValues.referral_code,
      updatedValues.reference_payment_status,
      updatedValues.referred_by,
      userid
    ];

    pool.query(query, values, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({ status: "200", message: "Update successful" });
    });
  });
};


crudsObj.deleteUser = (id) => {
  return new Promise((resolve, reject) => {
    pool.query("DELETE FROM users WHERE userid = ?", [id], (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

//update usersstatus
crudsObj.updateUserStatus = (userid, updatedValues) => {
  const { status } = updatedValues; // Only extract membershipstatus

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE users SET 
        status = ?
      WHERE userid = ?`,
      [status, userid], // Only pass the necessary parameters
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: "200", message: "Update successful" });
      }
    );
  });
};



 

crudsObj.updateLastLoggedIn = (userid) => {
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 2); // Add 2 hours
  const formattedDate = currentDate
    .toISOString()
    .slice(0, 19)
    .replace("T", " "); // Format the date

  console.log("Updating last_logged_in to:", formattedDate, "for userid:", userid);

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE users SET last_logged_in = ? WHERE userid = ?`,
      [formattedDate, userid], // Correctly pass the parameters
      (err, result) => {
        if (err) {
          console.error("Error updating database:", err);
          return reject(err);
        }
        console.log(result);
        if (result.affectedRows === 0) {
          return resolve({ status: "404", message: "User not found" });
        }
        return resolve({ status: "200", message: "Update successful", result });
      }
    );
  });
};

crudsObj.updateLastActivityDateTime = (userid) => {

  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 2); // Add 2 hours
  const formattedDate = currentDate
    .toISOString()
    .slice(0, 19)
    .replace("T", " "); // Format the date
  console.log(formattedDate);
  const datefor = formattedDate;  // Only extract membershipstatus

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE users SET 
        last_activity_date_time = ?
      WHERE userid = ?`,
      [formattedDate,userid], // Only pass the necessary parameters
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: "200", message: "Update successful", result });
      }
    );
  });
};

module.exports = crudsObj;