require("dotenv").config();
const pool = require("./poolfile");

let crudsObj = {};

crudsObj.postDriver = (
  driver_id,
  ecnumber,
  account_type,
  signed_on,
  username,
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
  plate,
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
  rating,
  credit_bar_rule_exception,
  membershipstatus,
  make,
  model,
  colour,
  vehicle_category,
  vehicle_year,
  type,
  defaultsubs,
  sendmail,
  sendsms,
  product_code,
  cost_price,
  selling_price,
  payment_style,
  profilePic,
  id_image,
  number_plate_image,
  vehicle_license_image,
  driver_license_image,
  vehicle_img1,
  vehicle_img2,
  vehicle_img3,
  number_of_passangers,
  delivery_volume,
  delivery_weight,
  driver_license_date
) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO driver_details (
                driver_id, ecnumber, account_type, signed_on, username, name, surname, idnumber, sex, dob,
                address, house_number_and_street_name, surbub, city, country, lat_cordinates, long_cordinates,
                phone, plate, email, password, employer, workindustry, workaddress, workphone, workphone2,
                nok1name, nok1surname, nok1relationship, nok1phone, nok2name, nok2surname, nok2relationship, nok2phone,
                rating, credit_bar_rule_exception, membershipstatus, make,model,colour,vehicle_category,vehicle_year,type, defaultsubs, sendmail, sendsms, product_code,
                cost_price, selling_price, payment_style, profilePic, id_image, number_plate_image,
                vehicle_license_image, driver_license_image, vehicle_img1, vehicle_img2, vehicle_img3, number_of_passangers, delivery_volume, delivery_weight, driver_license_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)`,
      [
        driver_id,
        ecnumber,
        account_type,
        signed_on,
        username,
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
        plate,
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
        rating,
        credit_bar_rule_exception,
        membershipstatus,
        make,
        model,
        colour,
        vehicle_category,
        vehicle_year,
        type,
        defaultsubs,
        sendmail,
        sendsms,
        product_code,
        cost_price,
        selling_price,
        payment_style,
        profilePic,
        id_image,
        number_plate_image,
        vehicle_license_image,
        driver_license_image,
        vehicle_img1,
        vehicle_img2,
        vehicle_img3,
        number_of_passangers,
        delivery_volume,
        delivery_weight,
        driver_license_date,
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

crudsObj.getDrivers = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM driver_details", (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

crudsObj.getDriverById = (driver_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM driver_details WHERE driver_id = ?",
      [driver_id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

crudsObj.getDriverByEmail = (driver_email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM driver_details WHERE email = ?",
      [driver_email],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

// Patch driver vehicle category
crudsObj.updateVehicleCategory = (driver_id, vehicle_category) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE driver_details SET vehicle_category = ? WHERE driver_id = ?",
      [vehicle_category, driver_id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

crudsObj.updateDriver = (driverid, updatedValues) => {
  const {
    driver_id,
    ecnumber,
    account_type,
    signed_on,
    username,
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
    plate,
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
    rating,
    credit_bar_rule_exception,
    membershipstatus,
    defaultsubs,
    sendmail,
    sendsms,
    product_code,
    cost_price,
    selling_price,
    payment_style,
    profilePic,
    id_image,
    number_plate_image,
    vehicle_license_image,
    driver_license_image,
  } = updatedValues;

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE driver_details SET 
                driver_id = ?,ecnumber = ?, account_type = ?, signed_on = ?, username = ?, name = ?, surname = ?, 
                idnumber = ?, sex = ?, dob = ?, address = ?, house_number_and_street_name = ?, 
                surbub = ?, city = ?, country = ?, lat_cordinates = ?, long_cordinates = ?, 
                phone = ?, plate = ?, email = ?, password = ?, employer = ?, 
                workindustry = ?, workaddress = ?, workphone = ?, workphone2 = ?, 
                nok1name = ?, nok1surname = ?, nok1relationship = ?, nok1phone = ?, 
                nok2name = ?, nok2surname = ?, nok2relationship = ?, nok2phone = ?, rating = ?, 
                credit_bar_rule_exception = ?, membershipstatus = ?, defaultsubs = ?, sendmail = ?, 
                sendsms = ?, product_code = ?, cost_price = ?, selling_price = ?, 
                payment_style = ?, profilePic = ?, id_image = ?, number_plate_image = ?, 
                vehicle_license_image = ?, driver_license_image = ?
            WHERE driver_id = ?`,
      [
        driver_id,
        ecnumber,
        account_type,
        signed_on,
        username,
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
        plate,
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
        rating,
        credit_bar_rule_exception,
        membershipstatus,
        defaultsubs,
        sendmail,
        sendsms,
        product_code,
        cost_price,
        selling_price,
        payment_style,
        profilePic,
        id_image,
        number_plate_image,
        vehicle_license_image,
        driver_license_image,
        driverid,
      ],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: "200", message: "Update successful" });
      }
    );
  });
};


crudsObj.updateDriverStatus = (driverid,status) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE driver_details SET 
                driving_status = ?, 
            WHERE driver_id = ?`,
      [
        status,
        driverid
      ],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: "200", message: "Update successful" });
      }
    );
  });
};

crudsObj.deleteDriver = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM driver_details WHERE driver_id = ?",
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

// New method for updating coordinates
crudsObj.updateDriverCoordinates = (
  driverid,
  lat_cordinates,
  long_cordinates
) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE driver_details SET 
                lat_cordinates = ?, long_cordinates = ?
            WHERE driver_id = ?`,
      [lat_cordinates, long_cordinates, driverid],
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

/////###################
crudsObj.updateDriverTripCount = (driverid) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT trips_completed FROM driver_details WHERE driver_id = ?`,
      [driverid],
      (err, result) => {
        if (err) {
          return reject(err);
        }

        if (result.length === 0) {
          return reject(new Error("Driver not found"));
        }

        const currentCount = result[0].trips_completed;
        const newCount = currentCount + 1;
        pool.query(
          `UPDATE driver_details SET trips_completed = ? WHERE driver_id = ?`,
          [newCount, driverid],
          (err, result) => {
            if (err) {
              return reject(err);
            }
            return resolve({
              status: "200",
              message: "Trip count updated successfully",
            });
          }
        );
      }
    );
  });
};

crudsObj.getDriverTripCount = (driverid) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT status FROM users WHERE driver_id = ?",
      [driverid],
      (err, userResults) => {
        if (err) {
          return reject(err);
        }

        if (userResults.length === 0) {
          return reject(new Error("Driver not found"));
        }

        const status = userResults[0].status;

        pool.query(
          "SELECT trips_completed FROM driver_details WHERE driver_id = ?",
          [driverid],
          (err, tripResults) => {
            if (err) {
              return reject(err);
            }
            if (tripResults.length === 0) {
              return reject(new Error("Trip details not found"));
            }

            return resolve({
              tripsCompleted: tripResults[0].trips_completed,
              status: status,
            });
          }
        );
      }
    );
  });
};

/////###########

crudsObj.getDriverByStatus = (status) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM driver_details WHERE membershipstatus = ?",
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
crudsObj.getVerifyDriver = (email, phone, idnumber) => {
  return new Promise((resolve, reject) => {
    if (!email && !phone && !idnumber) {
      return reject(
        new Error(
          "At least one parameter (email, phone, or idnumber) must be provided."
        )
      );
    }

    const query = `
      SELECT * FROM driver_details 
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

// Driver Crud update
crudsObj.updateDriverStatus = (driverid, updatedValues) => {
  const { membershipstatus } = updatedValues; // Only extract membershipstatus

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE driver_details SET 
          membershipstatus = ?
        WHERE driver_id = ?`,
      [membershipstatus, driverid], // Only pass the necessary parameters
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: "200", message: "Update successful" });
      }
    );
  });
};

//update account_type using driver_id on the driver_details table
crudsObj.updateDriverAccountType = (driver_id, updatedValues) => {
  const { account_category } = updatedValues; // Only extract membershipstatus

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE driver_details SET 
        account_category = ?
      WHERE driver_id = ?`,
      [account_category, driver_id], // Only pass the necessary parameters
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: "200", message: "Update successful" });
      }
    );
  });
};

module.exports = crudsObj;
