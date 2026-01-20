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

// ===========================================
// CUSTOMER PERFORMANCE RATING CRUD OPERATIONS
// ===========================================

// Update customer performance rating (ratings received from drivers)
crudsObj.updateCustomerPerformanceRating = (customerId, rating, tripType) => {
  return new Promise((resolve, reject) => {
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return reject(new Error("Invalid rating. Must be between 1 and 5."));
    }

    // Validate trip type
    if (!tripType || !['private', 'rideshare'].includes(tripType)) {
      return reject(new Error("Invalid trip type. Must be 'private' or 'rideshare'."));
    }

    let ratingField, avgRatingField;
    
    if (tripType === 'private') {
      ratingField = 'private_total_ratings_received';
      avgRatingField = 'private_average_rating_received';
    } else {
      ratingField = 'rideshare_total_ratings_received';
      avgRatingField = 'rideshare_average_rating_received';
    }

    // Get current ratings
    pool.query(
      `SELECT ${ratingField}, ${avgRatingField} FROM customer_details WHERE customerid = ?`,
      [customerId],
      (err, result) => {
        if (err) {
          return reject(err);
        }

        if (result.length === 0) {
          return reject(new Error("Customer not found"));
        }

        const currentTotal = result[0][ratingField] || 0;
        const currentAvg = result[0][avgRatingField] || 0;
        
        const newTotal = currentTotal + 1;
        const newAvg = ((currentAvg * currentTotal) + rating) / newTotal;
        
        // Update with new rating
        pool.query(
          `UPDATE customer_details SET ${ratingField} = ?, ${avgRatingField} = ? WHERE customerid = ?`,
          [newTotal, newAvg, customerId],
          (err, updateResult) => {
            if (err) {
              return reject(err);
            }
            return resolve({
              status: "200",
              message: "Customer performance rating updated successfully",
              customer_id: customerId,
              trip_type: tripType,
              rating,
              new_total: newTotal,
              new_average: newAvg
            });
          }
        );
      }
    );
  });
};

// Get customer performance ratings
crudsObj.getCustomerPerformanceRatings = (customerId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT 
        private_total_ratings_received,
        private_average_rating_received,
        rideshare_total_ratings_received,
        rideshare_average_rating_received
      FROM customer_details 
      WHERE customerid = ?`,
      [customerId],
      (err, result) => {
        if (err) {
          return reject(err);
        }

        if (result.length === 0) {
          return reject(new Error("Customer not found"));
        }

        return resolve({
          status: "200",
          message: "Customer performance ratings retrieved successfully",
          customer_id: customerId,
          private_ratings: {
            total_received: result[0].private_total_ratings_received || 0,
            average_received: result[0].private_average_rating_received || 0
          },
          rideshare_ratings: {
            total_received: result[0].rideshare_total_ratings_received || 0,
            average_received: result[0].rideshare_average_rating_received || 0
          }
        });
      }
    );
  });
};

// Update customer private trip status
crudsObj.updateCustomerPrivateTripStatus = (customerId, status, tripRevenue = 0, rating = null) => {
  return new Promise((resolve, reject) => {
    // Validate status
    const validStatuses = ['New Order', 'Pending', 'Accepted', 'In-Transit', 'InTransit', 'Completed', 'Trip Ended', 'TripEnded', 'Counter Offer', 'Just In', 'Waiting Payment', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return reject(new Error("Invalid status"));
    }

    // Build dynamic update query based on status
    let updateFields = [];
    let updateValues = [];

    switch(status) {
      case 'Completed':
        updateFields.push('private_completed_trips = private_completed_trips + 1');
        updateValues.push(tripRevenue);
        if (tripRevenue > 0) {
          updateFields.push('private_total_spend = COALESCE(private_total_spend, 0) + ?');
          updateFields.push('private_average_spend = CASE WHEN (private_completed_trips + COALESCE(private_trip_ended_trips, 0) + 1) > 0 THEN (COALESCE(private_total_spend, 0) + ?) / (private_completed_trips + COALESCE(private_trip_ended_trips, 0) + 1) ELSE COALESCE(private_average_spend, NULL) END');
          updateValues.push(tripRevenue);
        }
        updateFields.push('private_last_trip_date = NOW()');
        break;
        
      case 'Trip Ended':
      case 'TripEnded':
        updateFields.push('private_trip_ended_trips = private_trip_ended_trips + 1');
        updateValues.push(tripRevenue);
        if (tripRevenue > 0) {
          updateFields.push('private_total_spend = COALESCE(private_total_spend, 0) + ?');
          updateFields.push('private_average_spend = CASE WHEN (private_completed_trips + private_trip_ended_trips + 1) > 0 THEN (COALESCE(private_total_spend, 0) + ?) / (private_completed_trips + private_trip_ended_trips + 1) ELSE COALESCE(private_average_spend, NULL) END');
          updateValues.push(tripRevenue);
        }
        updateFields.push('private_last_trip_date = NOW()');
        break;
        
      case 'Cancelled':
        updateFields.push('private_cancelled_trips = private_cancelled_trips + 1');
        break;
        
      case 'New Order':
        updateFields.push('private_new_order_trips = private_new_order_trips + 1');
        break;
        
      case 'Pending':
        updateFields.push('private_pending_trips = private_pending_trips + 1');
        break;
        
      case 'Just In':
        updateFields.push('private_just_in_trips = private_just_in_trips + 1');
        break;
        
      case 'Counter Offer':
        updateFields.push('private_counter_offer_trips = private_counter_offer_trips + 1');
        break;
        
      case 'Waiting Payment':
        updateFields.push('private_waiting_payment_trips = private_waiting_payment_trips + 1');
        break;
        
      case 'In-Transit':
      case 'InTransit':
        updateFields.push('private_in_transit_trips = private_in_transit_trips + 1');
        break;
    }

    // Add rating update if provided
    if (rating !== null && rating >= 1 && rating <= 5) {
      updateFields.push('private_total_ratings_received = private_total_ratings_received + 1');
      updateFields.push('private_average_rating_received = CASE WHEN private_total_ratings_received > 0 THEN ((COALESCE(private_average_rating_received, 0) * (private_total_ratings_received - 1)) + ?) / private_total_ratings_received ELSE ? END');
      updateValues.push(rating, rating);
    }

    updateValues.push(customerId);
    
    // Execute the update
    const updateSQL = `UPDATE customer_details SET ${updateFields.join(', ')} WHERE customerid = ?`;
    
    pool.query(updateSQL, updateValues, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({
        status: "200",
        message: "Customer private trip status updated successfully",
        customer_id: customerId,
        status,
        updated_fields: updateFields
      });
    });
  });
};

// Update customer rideshare request status
crudsObj.updateCustomerRideshareRequestStatus = (customerId, status, offerAmount = 0, rating = null) => {
  return new Promise((resolve, reject) => {
    // Validate status
    const validStatuses = ['Created Shared Ride Request', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return reject(new Error("Invalid status"));
    }

    // Build dynamic update query based on status
    let updateFields = [];
    let updateValues = [];

    switch(status) {
      case 'Completed':
        updateFields.push('rideshare_completed_requests = rideshare_completed_requests + 1');
        updateValues.push(offerAmount);
        if (offerAmount > 0) {
          updateFields.push('rideshare_total_spend = COALESCE(rideshare_total_spend, 0) + ?');
          updateFields.push('rideshare_average_spend = CASE WHEN rideshare_completed_requests > 0 THEN (COALESCE(rideshare_total_spend, 0) + ?) / rideshare_completed_requests ELSE COALESCE(rideshare_average_spend, NULL) END');
          updateValues.push(offerAmount);
        }
        updateFields.push('rideshare_last_trip_date = NOW()');
        break;
        
      case 'Cancelled':
        updateFields.push('rideshare_cancelled_requests = rideshare_cancelled_requests + 1');
        break;
        
      case 'Created Shared Ride Request':
        updateFields.push('rideshare_created_shared_ride_requests = rideshare_created_shared_ride_requests + 1');
        break;
    }

    // Add rating update if provided
    if (rating !== null && rating >= 1 && rating <= 5) {
      updateFields.push('rideshare_total_ratings_received = rideshare_total_ratings_received + 1');
      updateFields.push('rideshare_average_rating_received = CASE WHEN rideshare_total_ratings_received > 0 THEN ((COALESCE(rideshare_average_rating_received, 0) * (rideshare_total_ratings_received - 1)) + ?) / rideshare_total_ratings_received ELSE ? END');
      updateValues.push(rating, rating);
    }

    updateValues.push(customerId);
    
    // Execute the update
    const updateSQL = `UPDATE customer_details SET ${updateFields.join(', ')} WHERE customerid = ?`;
    
    pool.query(updateSQL, updateValues, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({
        status: "200",
        message: "Customer rideshare request status updated successfully",
        customer_id: customerId,
        status,
        updated_fields: updateFields
      });
    });
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

// NEW FUNCTIONS FOR COMPREHENSIVE CUSTOMER TRACKING

// Update customer completed trips count and revenue
crudsObj.updateCustomerCompletedTrips = (customerId, tripRevenue = 0) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT trips_completed, total_spend FROM customer_details WHERE customerid = ?`,
      [customerId],
      (err, result) => {
        if (err) {
          return reject(err);
        }

        if (result.length === 0) {
          return reject(new Error("Customer not found"));
        }

        const currentCompletedTrips = result[0].trips_completed || 0;
        const currentTotalSpend = parseFloat(result[0].total_spend) || 0;
        const newCompletedTrips = currentCompletedTrips + 1;
        const newTotalSpend = currentTotalSpend + parseFloat(tripRevenue);
        const newAverageSpend = newCompletedTrips > 0 ? newTotalSpend / newCompletedTrips : 0;

        pool.query(
          `UPDATE customer_details SET 
            trips_completed = ?, 
            total_spend = ?, 
            average_spend_per_trip = ?,
            last_trip_date = NOW()
           WHERE customerid = ?`,
          [newCompletedTrips, newTotalSpend, newAverageSpend, customerId],
          (err, result) => {
            if (err) {
              return reject(err);
            }
            return resolve({
              status: "200",
              message: "Customer completed trips updated successfully",
              data: {
                trips_completed: newCompletedTrips,
                total_spend: newTotalSpend,
                average_spend_per_trip: newAverageSpend
              }
            });
          }
        );
      }
    );
  });
};

// Update customer cancelled trips count
crudsObj.updateCustomerCancelledTrips = (customerId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT trips_cancelled FROM customer_details WHERE customerid = ?`,
      [customerId],
      (err, result) => {
        if (err) {
          return reject(err);
        }

        if (result.length === 0) {
          return reject(new Error("Customer not found"));
        }

        const currentCancelledTrips = result[0].trips_cancelled || 0;
        const newCancelledTrips = currentCancelledTrips + 1;

        pool.query(
          `UPDATE customer_details SET trips_cancelled = ? WHERE customerid = ?`,
          [newCancelledTrips, customerId],
          (err, result) => {
            if (err) {
              return reject(err);
            }
            return resolve({
              status: "200",
              message: "Customer cancelled trips updated successfully",
              trips_cancelled: newCancelledTrips
            });
          }
        );
      }
    );
  });
};

// Update customer rating given to driver
crudsObj.updateCustomerRatingGiven = (customerId, rating) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT total_ratings_given, average_rating_given FROM customer_details WHERE customerid = ?`,
      [customerId],
      (err, result) => {
        if (err) {
          return reject(err);
        }

        if (result.length === 0) {
          return reject(new Error("Customer not found"));
        }

        const currentTotalRatings = result[0].total_ratings_given || 0;
        const currentAverageRating = parseFloat(result[0].average_rating_given) || 0;
        const newTotalRatings = currentTotalRatings + 1;
        const newAverageRating = ((currentAverageRating * currentTotalRatings) + parseFloat(rating)) / newTotalRatings;

        pool.query(
          `UPDATE customer_details SET 
            total_ratings_given = ?, 
            average_rating_given = ?
           WHERE customerid = ?`,
          [newTotalRatings, newAverageRating, customerId],
          (err, result) => {
            if (err) {
              return reject(err);
            }
            return resolve({
              status: "200",
              message: "Customer rating updated successfully",
              total_ratings_given: newTotalRatings,
              average_rating_given: newAverageRating
            });
          }
        );
      }
    );
  });
};

// Get comprehensive customer trip statistics
crudsObj.getCustomerTripStatistics = (customerId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT 
        trips_requested,
        trips_completed,
        trips_cancelled,
        total_spend,
        average_spend_per_trip,
        total_ratings_given,
        average_rating_given,
        last_trip_date,
        CASE 
          WHEN trips_requested > 0 THEN (trips_completed * 100.0 / trips_requested)
          ELSE 0
        END as completion_rate
       FROM customer_details WHERE customerid = ?`,
      [customerId],
      (err, result) => {
        if (err) {
          return reject(err);
        }

        if (result.length === 0) {
          return reject(new Error("Customer not found"));
        }

        return resolve(result[0]);
      }
    );
  });
};

module.exports = crudsObj;
