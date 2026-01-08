require("dotenv").config();
const pool = require("./poolfile");

let crudsObj = {};

// crudsObj.postCustomer = (
//     customerid,
//     ecnumber,
//     account_type,
//     account_category,
//     signed_on,
//     name,
//     surname,
//     idnumber,
//     sex,
//     dob,
//     address,
//     house_number_and_street_name,
//     surbub, // Corrected spelling
//     city,
//     country,
//     lat_coordinates, // Corrected spelling
//     long_coordinates, // Corrected spelling
//     phone,
//     username,
//     email,
//     password,
//     employer,
//     workindustry,
//     workaddress,
//     workphone,
//     workphone2,
//     nok1name,
//     nok1surname,
//     nok1relationship,
//     nok1phone,
//     nok2name,
//     nok2surname,
//     nok2relationship,
//     nok2phone,
//     creditstanding,
//     credit_bar_rule_exception, // Added missing field
//     membershipstatus,
//     defaultsubs,
//     sendmail,
//     sendsms,
//     product_code,
//     cost_price,
//     selling_price,
//     payment_style,
//     bp_number,
//     vat_number,
//     profilePic // The URL of the uploaded image
// ) => {
//     return new Promise((resolve, reject) => {
//         pool.query(
//             `INSERT INTO customer_details (
//                 customerid, ecnumber, account_type, account_category, signed_on, name, surname, idnumber, sex, dob,
//                 address, house_number_and_street_name, 	surbub, city, country, lat_coordinates, long_coordinates,
//                 phone, username, email, password, employer, workindustry, workaddress, workphone, workphone2,
//                 nok1name, nok1surname, nok1relationship, nok1phone, nok2name, nok2surname, nok2relationship, nok2phone,
//                 creditstanding, credit_bar_rule_rule_exception, membershipstatus, defaultsubs, sendmail, sendsms,
//                 product_code, cost_price, selling_price, payment_style, bp_number, vat_number, profilePic
//             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//             [
//                 customerid,
//                 ecnumber,
//                 account_type,
//                 account_category,
//                 signed_on,
//                 name,
//                 surname,
//                 idnumber,
//                 sex,
//                 dob,
//                 address,
//                 house_number_and_street_name,
//                 surbub, // Updated to the correct spelling
//                 city,
//                 country,
//                 lat_coordinates, // Updated to the correct spelling
//                 long_coordinates, // Updated to the correct spelling
//                 phone,
//                 username,
//                 email,
//                 password,
//                 employer,
//                 workindustry,
//                 workaddress,
//                 workphone,
//                 workphone2,
//                 nok1name,
//                 nok1surname,
//                 nok1relationship,
//                 nok1phone,
//                 nok2name,
//                 nok2surname,
//                 nok2relationship,
//                 nok2phone,
//                 creditstanding,
//                 credit_bar_rule_exception, // Added missing field to values
//                 membershipstatus,
//                 defaultsubs,
//                 sendmail,
//                 sendsms,
//                 product_code,
//                 cost_price,
//                 selling_price,
//                 payment_style,
//                 bp_number,
//                 vat_number,
//                 profilePic // Include profilePic in the VALUES
//             ],
//             (err, result) => {
//                 if (err) {
//                     return reject(err);
//                 }
//                 return resolve({ status: '200', message: 'saving successful', result });
//             }
//         );
//     });
// };

crudsObj.postCustomer = (
  customerid,
  ecnumber,
  account_type,
  account_category,
  signed_on,
  name,
  surname,
  idnumber,
  sex,
  dob,
  address,
  house_number_and_street_name,
  surbub, // Corrected spelling from 'surbub'
  city,
  country,
  lat_cordinates, // Corrected spelling from 'lat_cordinates'
  long_cordinates, // Corrected spelling from 'long_cordinates'
  phone,
  username,
  email,
  password,
  employer,
  workindustry,
  workaddress,
  workphone,
  workphone2,
  nok1name,
  nok1surname,
  nok1relationship,
  nok1phone,
  nok2name,
  nok2surname,
  nok2relationship,
  nok2phone,
  creditstanding,
  credit_bar_rule_exception,
  membershipstatus,
  defaultsubs,
  sendmail,
  sendsms,
  product_code,
  cost_price,
  selling_price,
  payment_style,
  bp_number,
  vat_number,
  profilePic,
  id_image,
) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO customer_details (
                customerid, 
                ecnumber, 
                account_type,
                account_category,
                signed_on,
                name,
                surname,
                idnumber,
                sex,
                dob,
                address,
                house_number_and_street_name,
                surbub, 
                city,
                country,
                lat_cordinates, 
                long_cordinates,
                phone,
                username,
                email,
                password,
                employer,
                workindustry,
                workaddress,
                workphone,
                workphone2,
                nok1name,
                nok1surname,
                nok1relationship,
                nok1phone,
                nok2name,
                nok2surname,
                nok2relationship,
                nok2phone,
                creditstanding,
                credit_bar_rule_exception,
                membershipstatus,
                defaultsubs,
                sendmail,
                sendsms,
                product_code,
                cost_price,
                selling_price,
                payment_style,
                bp_number,
                vat_number,
                   profilePic,
                   id_image
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)`,
      [
        customerid,
        ecnumber, // Added ecnumber to the values
        account_type,
        account_category,
        signed_on,
        name,
        surname,
        idnumber,
        sex,
        dob,
        address,
        house_number_and_street_name,
        surbub, // Corrected spelling
        city,
        country,
        lat_cordinates, // Corrected spelling
        long_cordinates, // Corrected spelling
        phone,
        username,
        email,
        password,
        employer,
        workindustry,
        workaddress,
        workphone,
        workphone2,
        nok1name,
        nok1surname,
        nok1relationship,
        nok1phone,
        nok2name,
        nok2surname,
        nok2relationship,
        nok2phone,
        creditstanding,
        credit_bar_rule_exception,
        membershipstatus,
        defaultsubs,
        sendmail,
        sendsms,
        product_code,
        cost_price,
        selling_price,
        payment_style,
        bp_number,
        vat_number,
        profilePic,
        id_image,
      ],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({
          status: "200",
          message:
            "Your account has been created successfully, Now verify your phone number via the OTP sent to your mobile",
        });
      }
    );
  });
};

crudsObj.getCustomers = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM customer_details", (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

crudsObj.getCustomerById = (customer_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM customer_details WHERE customerid = ?",
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

crudsObj.getCustomerByEmail = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM customer_details WHERE email = ?",
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

crudsObj.updateCustomer = (customer_id, updatedValues) => {
  const {
    ecnumber,
    accountType,
    account_category,
    signed_on,
    name,
    surname,
    idnumber,
    sex,
    dob,
    address,
    house_number_and_street_name,
    surbub,
    city,
    country,
    lat_cordinates,
    long_cordinates,
    phone,
    username,
    email,
    password,
    employer,
    workindustry,
    workaddress,
    workphone,
    workphone2,
    nok1name,
    nok1surname,
    nok1relationship,
    nok1phone,
    nok2name,
    nok2surname,
    nok2relationship,
    nok2phone,
    creditstanding,
    membershipstatus,
    defaultsubs,
    sendmail,
    sendsms,
    product_code,
    cost_price,
    selling_price,
    payment_style,
    bp_number,
    vat_number,
    profilePic,
  } = updatedValues;

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE customer_details SET 
                ecnumber = ?, account_type = ?, account_category = ?, signed_on = ?, name = ?, surname = ?, 
                idnumber = ?, sex = ?, dob = ?, address = ?, house_number_and_street_name = ?, 
                surbub = ?, city = ?, country = ?, lat_cordinates = ?, long_cordinates = ?, 
                phone = ?, username = ?, email = ?, password = ?, employer = ?, 
                workindustry = ?, workaddress = ?, workphone = ?, workphone2 = ?, 
                nok1name = ?, nok1surname = ?, nok1relationship = ?, nok1phone = ?, 
                nok2name = ?, nok2surname = ?, nok2relationship = ?, nok2phone = ?, 
                creditstanding = ?, membershipstatus = ?, defaultsubs = ?, sendmail = ?, 
                sendsms = ?, product_code = ?, cost_price = ?, selling_price = ?, 
                payment_style = ?, bp_number = ?, vat_number = ?, profilePic = ?
            WHERE customerid = ?`,
      [
        ecnumber,
        accountType,
        account_category,
        signed_on,
        name,
        surname,
        idnumber,
        sex,
        dob,
        address,
        house_number_and_street_name,
        surbub,
        city,
        country,
        lat_cordinates,
        long_cordinates,
        phone,
        username,
        email,
        password,
        employer,
        workindustry,
        workaddress,
        workphone,
        workphone2,
        nok1name,
        nok1surname,
        nok1relationship,
        nok1phone,
        nok2name,
        nok2surname,
        nok2relationship,
        nok2phone,
        creditstanding,
        membershipstatus,
        defaultsubs,
        sendmail,
        sendsms,
        product_code,
        cost_price,
        selling_price,
        payment_style,
        bp_number,
        vat_number,
        customer_id,
        profilePic,
      ],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: "200", message: "update successful" });
      }
    );
  });
};

crudsObj.deleteCustomer = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM customer_details WHERE customerid = ?",
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

//customer crud
crudsObj.getCustomerByStatus = (status) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM customer_details WHERE membershipstatus = ?",
      [status],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

//verification on login
crudsObj.getVerifyCustomer = (email, phone, idnumber) => {
  return new Promise((resolve, reject) => {
    if (!email && !phone && !idnumber) {
      return reject(
        new Error(
          "At least one parameter (email, phone, or idnumber) must be provided."
        )
      );
    }

    const query = `
      SELECT * FROM customer_details 
      WHERE email = ? OR phone = ? OR idnumber = ?
    `;

    pool.query(query, [email, phone, idnumber], (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return reject(err);
      }

      if (results.length === 0) {
        console.log("No driver found with the given details.");
      }

      return resolve(results);
    });
  });
};

// Customer CRUD
crudsObj.updateCustomerStatus = (customerid, updatedValues) => {
  const { membershipstatus } = updatedValues; // Extract membershipstatus

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE customer_details SET 
        membershipstatus = ?
      WHERE customerid = ?`,
      [membershipstatus, customerid], // Pass necessary parameters
      (err, result) => {
        if (err) {
          return reject(err);
        }

        // Log the result object for debugging
        console.log(result); // Log the result of the query

        return resolve({ status: "200", message: "Update successful", result });
      }
    );
  });
};

//customer crud
crudsObj.updateCustomerPhone = (customerid, updatedValues) => {
  const { phone } = updatedValues; // Only extract membershipstatus

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE customer_details SET 
          phone = ?
        WHERE customerid = ?`,
      [phone, customerid], // Only pass the necessary parameters
      (err, result) => {
        if (err) {
          return reject(err);
        }

        // Log the result object for debugging
        console.log(result); // Log the result of the query

        return resolve({ status: "200", message: "Update successful", result });
      }
    );
  });
};

///////////////////
crudsObj.updateCustomerTripCount = (customerId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT trips_requested FROM customer_details WHERE customerid = ?`,
      [customerId],
      (err, result) => {
        if (err) {
          return reject(err);
        }

        if (result.length === 0) {
          return reject(new Error("Customer not found"));
        }

        const currentCount = result[0].trips_requested; 
        const newCount = currentCount + 1; 
        pool.query(
          `UPDATE customer_details SET trips_requested = ? WHERE customerid = ?`,
          [newCount, customerId],
          (err, result) => {
            if (err) {
              return reject(err);
            }
            return resolve({
              status: "200",
              message: "Trip request count updated successfully",
            });
          }
        );
      }
    );
  });
};


crudsObj.getCustomerTripCount = (customerId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT status FROM users WHERE customerid = ?",
      [customerId],
      (err, userResults) => {
        if (err) {
          return reject(err);
        }

        if (userResults.length === 0) {
          return reject(new Error("Customer not found"));
        }

        const status = userResults[0].status;

        pool.query(
          "SELECT trips_requested FROM customer_details WHERE customerid = ?",
          [customerId],
          (err, tripResults) => {
            if (err) {
              return reject(err);
            }

            if (tripResults.length === 0) {
              return reject(new Error("Trip details not found"));
            }

            const tripsRequested = tripResults[0].trips_requested;

            return resolve({
              tripsRequested: tripsRequested,
              status: status,
            });
          }
        );
      }
    );
  });
};
///////////

crudsObj.updateCustomerAccountType = (customerid, updatedValues) => {
  const { account_category } = updatedValues; // Only extract membershipstatus

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE customer_details SET 
          account_category = ?
        WHERE customerid = ?`,
      [account_category, customerid], // Only pass the necessary parameters
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: "200", message: "Update successful" });
      }
    );
  });
};
crudsObj.updateCustomerCoordinates = (
  customerid,
  lat_cordinates,
  long_cordinates
) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE customer_details SET 
                  lat_cordinates = ?, long_cordinates = ?
              WHERE customerid = ?`,
      [lat_cordinates, long_cordinates, customerid],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({
          status: "200",
          message: "Coordinates updated successfully",
        });
      }
    );
  });
};

module.exports = crudsObj;
