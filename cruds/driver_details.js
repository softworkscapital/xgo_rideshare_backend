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

// ===========================================
// COMPREHENSIVE DRIVER ANALYTICS CRUD OPERATIONS
// ===========================================

// Update driver private trip status
crudsObj.updateDriverPrivateTripStatus = (driverId, status, earnings = 0, distance = 0, duration = 0) => {
  return new Promise((resolve, reject) => {
    const statusFieldMap = {
      'New Order': 'driver_private_new_order_trips',
      'Pending': 'driver_private_pending_trips',
      'Accepted': 'driver_private_accepted_trips',
      'In-Transit': 'driver_private_in_transit_trips',
      'InTransit': 'driver_private_in_transit_trips',
      'Completed': 'driver_private_completed_trips',
      'Trip Ended': 'driver_private_trip_ended_trips',
      'TripEnded': 'driver_private_trip_ended_trips',
      'Counter Offer': 'driver_private_counter_offer_trips',
      'Just In': 'driver_private_just_in_trips',
      'Waiting Payment': 'driver_private_waiting_payment_trips',
      'Cancelled': 'driver_private_cancelled_trips'
    };

    const statusField = statusFieldMap[status];
    if (!statusField) {
      return reject({ status: 400, message: `Invalid private trip status: ${status}. Valid statuses: ${Object.keys(statusFieldMap).join(', ')}` });
    }

    // Update trip status and related metrics
    let updateQuery = `UPDATE driver_details SET ${statusField} = ${statusField} + 1`;
    let queryParams = [];

    if (status === 'Completed' && earnings > 0) {
      updateQuery += `, driver_private_total_earnings = driver_private_total_earnings + ?, driver_private_last_earning_date = NOW(), driver_last_earning_date = NOW()`;
      queryParams.push(earnings);
      
      // Update average earnings per trip
      updateQuery += `, driver_private_average_earnings_per_trip = (SELECT CASE WHEN (driver_private_completed_trips + 1) > 0 THEN (driver_private_total_earnings + ?) / (driver_private_completed_trips + 1) ELSE 0 END)`;
      queryParams.push(earnings);
    }

    if (distance > 0) {
      updateQuery += `, driver_total_distance_km = driver_total_distance_km + ?, driver_average_distance_per_trip = (SELECT CASE WHEN (driver_private_completed_trips + driver_rideshare_completed_trips + 1) > 0 THEN (driver_total_distance_km + ?) / (driver_private_completed_trips + driver_rideshare_completed_trips + 1) ELSE 0 END)`;
      queryParams.push(distance, distance);
    }

    if (duration > 0) {
      updateQuery += `, driver_average_trip_duration_minutes = (SELECT CASE WHEN (driver_private_completed_trips + driver_rideshare_completed_trips + 1) > 0 THEN (COALESCE(driver_average_trip_duration_minutes, 0) * (driver_private_completed_trips + driver_rideshare_completed_trips) + ?) / (driver_private_completed_trips + driver_rideshare_completed_trips + 1) ELSE ? END)`;
      queryParams.push(duration, duration);
    }

    updateQuery += `, driver_last_active_date = NOW() WHERE driver_id = ?`;
    queryParams.push(driverId);

    pool.query(updateQuery, queryParams, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({
        status: "200",
        message: `Driver private trip status updated: ${status}`,
        driver_id: driverId,
        status_updated: status,
        earnings_processed: earnings,
        distance_processed: distance
      });
    });
  });
};

// Update driver rideshare trip status
crudsObj.updateDriverRideshareTripStatus = (driverId, status, earnings = 0, distance = 0, duration = 0) => {
  return new Promise((resolve, reject) => {
    const statusFieldMap = {
      'Created Shared Ride Request': 'driver_rideshare_created_shared_ride_requests',
      'In-Transit': 'driver_rideshare_in_transit_trips',
      'Completed': 'driver_rideshare_completed_trips',
      'Cancelled': 'driver_rideshare_cancelled_trips'
    };

    const statusField = statusFieldMap[status];
    if (!statusField) {
      return reject({ status: 400, message: `Invalid rideshare trip status: ${status}. Valid statuses: ${Object.keys(statusFieldMap).join(', ')}` });
    }

    // Update trip status and related metrics
    let updateQuery = `UPDATE driver_details SET ${statusField} = ${statusField} + 1`;
    let queryParams = [];

    if (status === 'Completed' && earnings > 0) {
      updateQuery += `, driver_rideshare_total_earnings = driver_rideshare_total_earnings + ?, driver_rideshare_last_earning_date = NOW(), driver_last_earning_date = NOW()`;
      queryParams.push(earnings);
      
      // Update average earnings per trip
      updateQuery += `, driver_rideshare_average_earnings_per_trip = (SELECT CASE WHEN (driver_rideshare_completed_trips + 1) > 0 THEN (driver_rideshare_total_earnings + ?) / (driver_rideshare_completed_trips + 1) ELSE 0 END)`;
      queryParams.push(earnings);
    }

    if (distance > 0) {
      updateQuery += `, driver_total_distance_km = driver_total_distance_km + ?, driver_average_distance_per_trip = (SELECT CASE WHEN (driver_private_completed_trips + driver_rideshare_completed_trips + 1) > 0 THEN (driver_total_distance_km + ?) / (driver_private_completed_trips + driver_rideshare_completed_trips + 1) ELSE 0 END)`;
      queryParams.push(distance, distance);
    }

    if (duration > 0) {
      updateQuery += `, driver_average_trip_duration_minutes = (SELECT CASE WHEN (driver_private_completed_trips + driver_rideshare_completed_trips + 1) > 0 THEN (COALESCE(driver_average_trip_duration_minutes, 0) * (driver_private_completed_trips + driver_rideshare_completed_trips) + ?) / (driver_private_completed_trips + driver_rideshare_completed_trips + 1) ELSE ? END)`;
      queryParams.push(duration, duration);
    }

    updateQuery += `, driver_last_active_date = NOW() WHERE driver_id = ?`;
    queryParams.push(driverId);

    pool.query(updateQuery, queryParams, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({
        status: "200",
        message: `Driver rideshare trip status updated: ${status}`,
        driver_id: driverId,
        status_updated: status,
        earnings_processed: earnings,
        distance_processed: distance
      });
    });
  });
};

// Update driver earnings
crudsObj.updateDriverEarnings = (driverId, earnings, tripType) => {
  return new Promise((resolve, reject) => {
    if (!earnings || earnings <= 0) {
      return reject({ status: 400, message: "Invalid earnings amount. Must be greater than 0" });
    }

    let updateQuery, queryParams;

    if (tripType === 'private') {
      updateQuery = `UPDATE driver_details SET 
        driver_private_total_earnings = driver_private_total_earnings + ?,
        driver_private_last_earning_date = NOW(),
        driver_last_earning_date = NOW(),
        driver_total_earnings = driver_total_earnings + ?,
        driver_private_average_earnings_per_trip = (SELECT CASE WHEN driver_private_completed_trips > 0 THEN (driver_private_total_earnings + ?) / driver_private_completed_trips ELSE 0 END),
        driver_average_earnings_per_trip = (SELECT CASE WHEN (driver_private_completed_trips + driver_rideshare_completed_trips) > 0 THEN (driver_total_earnings + ?) / (driver_private_completed_trips + driver_rideshare_completed_trips) ELSE 0 END)
        WHERE driver_id = ?`;
      queryParams = [earnings, earnings, earnings, earnings, driverId];
    } else if (tripType === 'rideshare') {
      updateQuery = `UPDATE driver_details SET 
        driver_rideshare_total_earnings = driver_rideshare_total_earnings + ?,
        driver_rideshare_last_earning_date = NOW(),
        driver_last_earning_date = NOW(),
        driver_total_earnings = driver_total_earnings + ?,
        driver_rideshare_average_earnings_per_trip = (SELECT CASE WHEN driver_rideshare_completed_trips > 0 THEN (driver_rideshare_total_earnings + ?) / driver_rideshare_completed_trips ELSE 0 END),
        driver_average_earnings_per_trip = (SELECT CASE WHEN (driver_private_completed_trips + driver_rideshare_completed_trips) > 0 THEN (driver_total_earnings + ?) / (driver_private_completed_trips + driver_rideshare_completed_trips) ELSE 0 END)
        WHERE driver_id = ?`;
      queryParams = [earnings, earnings, earnings, earnings, driverId];
    } else {
      return reject({ status: 400, message: "Invalid trip type. Must be 'private' or 'rideshare'" });
    }

    pool.query(updateQuery, queryParams, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({
        status: "200",
        message: `Driver earnings updated for ${tripType} trip`,
        driver_id: driverId,
        trip_type: tripType,
        earnings_added: earnings
      });
    });
  });
};

// Update driver performance metrics
crudsObj.updateDriverPerformanceMetrics = (driverId, metrics) => {
  return new Promise((resolve, reject) => {
    const { completion_rate, average_trip_duration, total_distance, average_distance, peak_hours_trips, off_peak_hours_trips } = metrics;
    
    let updateQuery = 'UPDATE driver_details SET ';
    let updateFields = [];
    let queryParams = [];

    if (completion_rate !== undefined) {
      updateFields.push('driver_completion_rate = ?');
      queryParams.push(completion_rate);
    }

    if (average_trip_duration !== undefined) {
      updateFields.push('driver_average_trip_duration_minutes = ?');
      queryParams.push(average_trip_duration);
    }

    if (total_distance !== undefined) {
      updateFields.push('driver_total_distance_km = ?');
      queryParams.push(total_distance);
    }

    if (average_distance !== undefined) {
      updateFields.push('driver_average_distance_per_trip = ?');
      queryParams.push(average_distance);
    }

    if (peak_hours_trips !== undefined) {
      updateFields.push('driver_peak_hours_trips = ?');
      queryParams.push(peak_hours_trips);
    }

    if (off_peak_hours_trips !== undefined) {
      updateFields.push('driver_off_peak_hours_trips = ?');
      queryParams.push(off_peak_hours_trips);
    }

    if (updateFields.length === 0) {
      return reject(new Error("No valid metrics provided"));
    }

    updateQuery += updateFields.join(', ') + ' WHERE driver_id = ?';
    queryParams.push(driverId);

    pool.query(updateQuery, queryParams, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({
        status: "200",
        message: "Driver performance metrics updated",
        driver_id: driverId,
        metrics_updated: Object.keys(metrics)
      });
    });
  });
};

// Update driver activity metrics
crudsObj.updateDriverActivityMetrics = (driverId, metrics) => {
  return new Promise((resolve, reject) => {
    const { days_active, average_trips_per_day, longest_streak_days, current_streak_days } = metrics;
    
    let updateQuery = 'UPDATE driver_details SET ';
    let updateFields = [];
    let queryParams = [];

    if (days_active !== undefined) {
      updateFields.push('driver_days_active = ?');
      queryParams.push(days_active);
    }

    if (average_trips_per_day !== undefined) {
      updateFields.push('driver_average_trips_per_day = ?');
      queryParams.push(average_trips_per_day);
    }

    if (longest_streak_days !== undefined) {
      updateFields.push('driver_longest_streak_days = ?');
      queryParams.push(longest_streak_days);
    }

    if (current_streak_days !== undefined) {
      updateFields.push('driver_current_streak_days = ?');
      queryParams.push(current_streak_days);
    }

    updateFields.push('driver_last_active_date = NOW()');
    queryParams.push(driverId);

    updateQuery += updateFields.join(', ') + ' WHERE driver_id = ?';

    pool.query(updateQuery, queryParams, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({
        status: "200",
        message: "Driver activity metrics updated",
        driver_id: driverId,
        metrics_updated: Object.keys(metrics)
      });
    });
  });
};

// Get comprehensive driver statistics
crudsObj.getComprehensiveDriverStatistics = (driverId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT 
        -- Private Trip Statistics
        driver_private_new_order_trips,
        driver_private_pending_trips,
        driver_private_accepted_trips,
        driver_private_in_transit_trips,
        driver_private_completed_trips,
        driver_private_trip_ended_trips,
        driver_private_cancelled_trips,
        driver_private_counter_offer_trips,
        driver_private_just_in_trips,
        driver_private_waiting_payment_trips,
        
        -- Rideshare Statistics
        driver_rideshare_created_shared_ride_requests,
        driver_rideshare_in_transit_trips,
        driver_rideshare_completed_trips,
        driver_rideshare_cancelled_trips,
        
        -- Earnings Analytics
        driver_private_total_earnings,
        driver_private_average_earnings_per_trip,
        driver_private_last_earning_date,
        driver_rideshare_total_earnings,
        driver_rideshare_average_earnings_per_trip,
        driver_rideshare_last_earning_date,
        driver_total_earnings,
        driver_average_earnings_per_trip,
        driver_last_earning_date,
        
        -- Performance Metrics
        driver_completion_rate,
        driver_average_trip_duration_minutes,
        driver_total_distance_km,
        driver_average_distance_per_trip,
        driver_peak_hours_trips,
        driver_off_peak_hours_trips,
        
        -- Activity Metrics
        driver_days_active,
        driver_last_active_date,
        driver_average_trips_per_day,
        driver_longest_streak_days,
        driver_current_streak_days,
        
        -- Rating System
        driver_private_ratings_given,
        driver_private_average_rating_given,
        driver_rideshare_ratings_given,
        driver_rideshare_average_rating_given,
        driver_private_ratings_received,
        driver_private_average_rating_received,
        driver_rideshare_ratings_received,
        driver_rideshare_average_rating_received
      FROM driver_details 
      WHERE driver_id = ?`,
      [driverId],
      (err, result) => {
        if (err) {
          return reject(err);
        }

        if (result.length === 0) {
          return reject(new Error("Driver not found"));
        }

        const stats = result[0];
        
        // Calculate derived statistics
        const totalPrivateTrips = Object.keys(stats)
          .filter(key => key.startsWith('driver_private_') && key.endsWith('_trips'))
          .reduce((sum, key) => sum + (stats[key] || 0), 0);
        
        const totalRideshareTrips = Object.keys(stats)
          .filter(key => key.startsWith('driver_rideshare_') && key.endsWith('_trips'))
          .reduce((sum, key) => sum + (stats[key] || 0), 0);
        
        const totalTrips = totalPrivateTrips + totalRideshareTrips;

        return resolve({
          status: "200",
          message: "Comprehensive driver statistics retrieved successfully",
          driver_id: driverId,
          trip_statistics: {
            private: {
              total_trips: totalPrivateTrips,
              completed: stats.driver_private_completed_trips || 0,
              cancelled: stats.driver_private_cancelled_trips || 0,
              in_transit: stats.driver_private_in_transit_trips || 0,
              breakdown: {
                new_order: stats.driver_private_new_order_trips || 0,
                pending: stats.driver_private_pending_trips || 0,
                accepted: stats.driver_private_accepted_trips || 0,
                trip_ended: stats.driver_private_trip_ended_trips || 0,
                counter_offer: stats.driver_private_counter_offer_trips || 0,
                just_in: stats.driver_private_just_in_trips || 0,
                waiting_payment: stats.driver_private_waiting_payment_trips || 0
              }
            },
            rideshare: {
              total_trips: totalRideshareTrips,
              completed: stats.driver_rideshare_completed_trips || 0,
              cancelled: stats.driver_rideshare_cancelled_trips || 0,
              in_transit: stats.driver_rideshare_in_transit_trips || 0,
              breakdown: {
                created_shared_ride_requests: stats.driver_rideshare_created_shared_ride_requests || 0
              }
            },
            combined: {
              total_trips: totalTrips
            }
          },
          earnings: {
            private: {
              total_earnings: stats.driver_private_total_earnings || 0,
              average_per_trip: stats.driver_private_average_earnings_per_trip || 0,
              last_earning_date: stats.driver_private_last_earning_date
            },
            rideshare: {
              total_earnings: stats.driver_rideshare_total_earnings || 0,
              average_per_trip: stats.driver_rideshare_average_earnings_per_trip || 0,
              last_earning_date: stats.driver_rideshare_last_earning_date
            },
            combined: {
              total_earnings: stats.driver_total_earnings || 0,
              average_per_trip: stats.driver_average_earnings_per_trip || 0,
              last_earning_date: stats.driver_last_earning_date
            }
          },
          performance: {
            completion_rate: stats.driver_completion_rate,
            average_trip_duration_minutes: stats.driver_average_trip_duration_minutes,
            total_distance_km: stats.driver_total_distance_km || 0,
            average_distance_per_trip: stats.driver_average_distance_per_trip,
            peak_hours_trips: stats.driver_peak_hours_trips || 0,
            off_peak_hours_trips: stats.driver_off_peak_hours_trips || 0
          },
          activity: {
            days_active: stats.driver_days_active || 0,
            last_active_date: stats.driver_last_active_date,
            average_trips_per_day: stats.driver_average_trips_per_day,
            longest_streak_days: stats.driver_longest_streak_days || 0,
            current_streak_days: stats.driver_current_streak_days || 0
          },
          ratings: {
            given: {
              private: {
                total_given: stats.driver_private_ratings_given || 0,
                average_given: stats.driver_private_average_rating_given || 0
              },
              rideshare: {
                total_given: stats.driver_rideshare_ratings_given || 0,
                average_given: stats.driver_rideshare_average_rating_given || 0
              }
            },
            received: {
              private: {
                total_received: stats.driver_private_ratings_received || 0,
                average_received: stats.driver_private_average_rating_received || 0
              },
              rideshare: {
                total_received: stats.driver_rideshare_ratings_received || 0,
                average_received: stats.driver_rideshare_average_rating_received || 0
              }
            }
          }
        });
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
