require("dotenv").config();
const pool = require("./poolfile");

let crudsObj = {};
crudsObj.postStatistic = (application_statistic_id) => {
  let datefor = "";
  let kms_billed = "";
  let customers_count = "";
  let drivers_count = "";
  let trips_count = "";
  let trips_per_customer = "";
  let billed_amount_usd = "";
  let average_trip_rate_usd = "";
  let mode_rate_usd = "";
  let average_billed = "";
  let new_customer_count = "";
  let new_drivers_count = "";
  let complaints_count = "";
  let total_rating_count = "";
  let ave_rating_count = "";
  let driver_open_balance = "";
  let driver_top_up = "";
  let driver_billed_charges = "";
  let driver_withdrawals = "";
  let driver_escrow = "";
  let driver_promo = "";
  let driver_deductions = "";
  let driver_additions = "";
  let driver_close_balance = "";
  let customer_open_balance = "";
  let customer_to_up = "";
  let customer_billed_charges = "";
  let customer_withdrawals = "";
  let customer_escrow = "";
  let customer_promo = "";
  let customer_deduction = "";
  let customer_additions = "";
  let customer_close_balance = "";
  let company_open_balance = "";
  let company_income_from_charges = "";
  let company_promotions = "";
  let company_withdraws_out = "";
  let company_close_balance = "";

  return new Promise((resolve, reject) => {
    // Creating current day and populating datefor
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 2); // Add 2 hours
    const formattedDate = currentDate
      .toISOString()
      .slice(0, 19)
      .replace("T", " "); // Format the date
    console.log(formattedDate);
    datefor = formattedDate; // Assign to datefor

    // Calculating distance billed for the day
    pool.query(
      "SELECT SUM(distance) AS total_distance FROM trip",
      (err, results) => {
        if (err) {
          return reject(err);
        }
        console.log("Total Distance:", results); // Log the result
        kms_billed = results[0].total_distance || 0; // Default to 0 if no distance is found

        // Customer counts
        pool.query(
          "SELECT COUNT(customerid) AS total_customers FROM customer_details",
          (err, results) => {
            if (err) {
              return reject(err);
            }
            console.log("Total Customers:", results[0].total_customers);
            customers_count = results[0].total_customers;

            // Driver counts
            pool.query(
              "SELECT COUNT(driver_id) AS total_drivers FROM driver_details",
              (err, results) => {
                if (err) {
                  return reject(err);
                }
                console.log("Total Drivers:", results[0].total_drivers);
                drivers_count = results[0].total_drivers;

                // Trip counts
                pool.query(
                  "SELECT COUNT(trip_id) AS total_trips FROM trip",
                  (err, results) => {
                    if (err) {
                      return reject(err);
                    }
                    console.log("Total Trips:", results[0].total_trips);
                    trips_count = results[0].total_trips;

                    // Trips per customer
                    trips_per_customer =
                      customers_count > 0 ? trips_count / customers_count : 0;
                    console.log("Trips per Customer:", trips_per_customer);

                    // // Average rating
                    pool.query(
                      "SELECT AVG(customer_stars + driver_stars) AS total_average FROM trip",
                      (err, results) => {
                        if (err) {
                          return reject(err);
                        }
                        console.log(
                          "Average Rating:",
                          results[0].total_average
                        );
                        average_billed = results[0].total_average || 0;

                        // Average trip rate
                        pool.query(
                          "SELECT AVG(accepted_cost) AS total_average FROM trip",
                          (err, results) => {
                            if (err) {
                              return reject(err);
                            }
                            console.log(
                              "Total Average Accepted Cost:",
                              results[0].total_average
                            );
                            average_trip_rate_usd =
                              results[0].total_average || 0;

                            // Mode of accepted cost
                            // pool.query("SELECT MODE(accepted_cost) FROM trip GROUP BY accepted_cost ORDER BY COUNT(*) DESC LIMIT 1", (err, results) => {
                            //     if (err) {
                            //         return reject(err);
                            //     }
                            //     mode_rate_usd = results[0] ? results[0].accepted_cost : 0;

                            // New customer count
                            pool.query(
                              "SELECT COUNT(customerid) AS total_count FROM customer_details",
                              (err, results) => {
                                if (err) {
                                  return reject(err);
                                }
                                new_customer_count =
                                  results[0].total_count || 0;

                                // New drivers count
                                pool.query(
                                  "SELECT COUNT(driver_id) AS total_count FROM driver_details",
                                  (err, results) => {
                                    if (err) {
                                      return reject(err);
                                    }
                                    new_drivers_count =
                                      results[0].total_count || 0;

                                    // Complaints count
                                    pool.query(
                                      "SELECT COUNT(conversation_support_id) AS total_count FROM conversation_support",
                                      (err, results) => {
                                        if (err) {
                                          return reject(err);
                                        }
                                        complaints_count =
                                          results[0].total_count || 0;

                                        // Total rating count
                                        pool.query(
                                          "SELECT SUM(customer_stars + driver_stars) AS total_sum FROM trip",
                                          (err, results) => {
                                            if (err) {
                                              return reject(err);
                                            }
                                            total_rating_count =
                                              results[0].total_sum || 0;

                                            const date_today = new Date()
                                              .toISOString()
                                              .slice(0, 10); // Format: YYYY-MM-DD
                                            const date_one_day_ago = new Date();
                                            date_one_day_ago.setDate(
                                              date_one_day_ago.getDate() - 1
                                            );
                                            const date_two_days_ago =
                                              new Date();
                                            date_two_days_ago.setDate(
                                              date_two_days_ago.getDate() - 2
                                            );
                                            const date_three_days_ago =
                                              new Date();
                                            date_three_days_ago.setDate(
                                              date_three_days_ago.getDate() - 3
                                            );
                                            const date_seven_days_ago =
                                              new Date();
                                            date_seven_days_ago.setDate(
                                              date_seven_days_ago.getDate() - 7
                                            );
                                            const date_fourteen_days_ago =
                                              new Date();
                                            date_fourteen_days_ago.setDate(
                                              date_fourteen_days_ago.getDate() -
                                                14
                                            );
                                            const date_thirty_days_ago =
                                              new Date();
                                            date_thirty_days_ago.setDate(
                                              date_thirty_days_ago.getDate() -
                                                30
                                            );

                                            //   let signed_up_today, users_logged_in_today, users_logged_in_one_day_ago;
                                            //   let users_logged_in_two_days_ago, users_logged_in_three_days_ago;
                                            //   let users_logged_in_seven_days_ago, users_logged_in_fourteen_days_ago;
                                            //   let users_logged_in_thirty_days_ago, average;

                                            // New customers today count
                                            pool.query(
                                              "SELECT COUNT(signed_up_on) AS signed_up_today FROM users WHERE signed_up_on = ?",
                                              [date_today],
                                              (err, results) => {
                                                if (err) {
                                                  return reject(err);
                                                }
                                                const signed_up_today =
                                                  results[0].signed_up_today ||
                                                  0;

                                                // New customers logged in today
                                                pool.query(
                                                  "SELECT COUNT(last_logged_in) AS users_logged_in_today FROM users WHERE last_logged_in >= ? AND last_logged_in < ?",
                                                  [
                                                    date_today,
                                                    new Date()
                                                      .toISOString()
                                                      .slice(0, 10) +
                                                      " 23:59:59",
                                                  ],
                                                  (err, results) => {
                                                    if (err) {
                                                      return reject(err);
                                                    }
                                                    const users_logged_in_today =
                                                      results[0]
                                                        .users_logged_in_today ||
                                                      0;

                                                    // Last logged in one day ago
                                                    pool.query(
                                                      "SELECT COUNT(last_logged_in) AS users_logged_in_one_day_ago FROM users WHERE last_logged_in >= ? AND last_logged_in < ?",
                                                      [
                                                        date_one_day_ago
                                                          .toISOString()
                                                          .slice(0, 10),
                                                        date_today,
                                                      ],
                                                      (err, results) => {
                                                        if (err) {
                                                          return reject(err);
                                                        }
                                                        const users_logged_in_one_day_ago =
                                                          results[0]
                                                            .users_logged_in_one_day_ago ||
                                                          0;

                                                        // Last logged in two days ago
                                                        pool.query(
                                                          "SELECT COUNT(last_logged_in) AS users_logged_in_two_days_ago FROM users WHERE last_logged_in >= ? AND last_logged_in < ?",
                                                          [
                                                            date_two_days_ago
                                                              .toISOString()
                                                              .slice(0, 10),
                                                            date_one_day_ago
                                                              .toISOString()
                                                              .slice(0, 10),
                                                          ],
                                                          (err, results) => {
                                                            if (err) {
                                                              return reject(
                                                                err
                                                              );
                                                            }
                                                            const users_logged_in_two_days_ago =
                                                              results[0]
                                                                .users_logged_in_two_days_ago ||
                                                              0;

                                                            // Last logged in three days ago
                                                            pool.query(
                                                              "SELECT COUNT(last_logged_in) AS users_logged_in_three_days_ago FROM users WHERE last_logged_in >= ? AND last_logged_in < ?",
                                                              [
                                                                date_three_days_ago
                                                                  .toISOString()
                                                                  .slice(0, 10),
                                                                date_two_days_ago
                                                                  .toISOString()
                                                                  .slice(0, 10),
                                                              ],
                                                              (
                                                                err,
                                                                results
                                                              ) => {
                                                                if (err) {
                                                                  return reject(
                                                                    err
                                                                  );
                                                                }
                                                                const users_logged_in_three_days_ago =
                                                                  results[0]
                                                                    .users_logged_in_three_days_ago ||
                                                                  0;

                                                                // Last logged in seven days ago
                                                                pool.query(
                                                                  "SELECT COUNT(last_logged_in) AS users_logged_in_seven_days_ago FROM users WHERE last_logged_in >= ? AND last_logged_in < ?",
                                                                  [
                                                                    date_seven_days_ago
                                                                      .toISOString()
                                                                      .slice(
                                                                        0,
                                                                        10
                                                                      ),
                                                                    date_three_days_ago
                                                                      .toISOString()
                                                                      .slice(
                                                                        0,
                                                                        10
                                                                      ),
                                                                  ],
                                                                  (
                                                                    err,
                                                                    results
                                                                  ) => {
                                                                    if (err) {
                                                                      return reject(
                                                                        err
                                                                      );
                                                                    }
                                                                    const users_logged_in_seven_days_ago =
                                                                      results[0]
                                                                        .users_logged_in_seven_days_ago ||
                                                                      0;

                                                                    // Last logged in fourteen days ago
                                                                    pool.query(
                                                                      "SELECT COUNT(last_logged_in) AS users_logged_in_fourteen_days_ago FROM users WHERE last_logged_in >= ? AND last_logged_in < ?",
                                                                      [
                                                                        date_fourteen_days_ago
                                                                          .toISOString()
                                                                          .slice(
                                                                            0,
                                                                            10
                                                                          ),
                                                                        date_seven_days_ago
                                                                          .toISOString()
                                                                          .slice(
                                                                            0,
                                                                            10
                                                                          ),
                                                                      ],
                                                                      (
                                                                        err,
                                                                        results
                                                                      ) => {
                                                                        if (
                                                                          err
                                                                        ) {
                                                                          return reject(
                                                                            err
                                                                          );
                                                                        }
                                                                        const users_logged_in_fourteen_days_ago =
                                                                          results[0]
                                                                            .users_logged_in_fourteen_days_ago ||
                                                                          0;

                                                                        // Last logged in thirty days ago
                                                                        pool.query(
                                                                          "SELECT COUNT(last_logged_in) AS users_logged_in_thirty_days_ago FROM users WHERE last_logged_in >= ? AND last_logged_in < ?",
                                                                          [
                                                                            date_thirty_days_ago
                                                                              .toISOString()
                                                                              .slice(
                                                                                0,
                                                                                10
                                                                              ),
                                                                            date_fourteen_days_ago
                                                                              .toISOString()
                                                                              .slice(
                                                                                0,
                                                                                10
                                                                              ),
                                                                          ],
                                                                          (
                                                                            err,
                                                                            results
                                                                          ) => {
                                                                            if (
                                                                              err
                                                                            ) {
                                                                              return reject(
                                                                                err
                                                                              );
                                                                            }
                                                                            const users_logged_in_thirty_days_ago =
                                                                              results[0]
                                                                                .users_logged_in_thirty_days_ago ||
                                                                              0;

                                                                            // Average last activity
                                                                            const last_activity_date_time =
                                                                              "0000-00-00 00:00:00"; // You might want to change this logic
                                                                            pool.query(
                                                                              "SELECT AVG(TIMESTAMPDIFF(DAY, last_logged_in, NOW())) AS average_last_activity FROM users WHERE last_logged_in >= ?",
                                                                              [
                                                                                date_thirty_days_ago
                                                                                  .toISOString()
                                                                                  .slice(
                                                                                    0,
                                                                                    10
                                                                                  ),
                                                                              ],
                                                                              (
                                                                                err,
                                                                                results
                                                                              ) => {
                                                                                if (
                                                                                  err
                                                                                ) {
                                                                                  return reject(
                                                                                    err
                                                                                  );
                                                                                }
                                                                                const average_engagement_time =
                                                                                  results[0]
                                                                                    .average_last_activity ||
                                                                                  0;

                                                                                console.log(
                                                                                  {
                                                                                    signed_up_today,
                                                                                    users_logged_in_today,
                                                                                    users_logged_in_one_day_ago,
                                                                                    users_logged_in_two_days_ago,
                                                                                    users_logged_in_three_days_ago,
                                                                                    users_logged_in_seven_days_ago,
                                                                                    users_logged_in_fourteen_days_ago,
                                                                                    users_logged_in_thirty_days_ago,
                                                                                    average_engagement_time:
                                                                                      average_engagement_time,
                                                                                  }
                                                                                );

                                                                                const queries =
                                                                                  [
                                                                                    "SELECT main_wallet_total_balance FROM top_up WHERE folio = 'MW' ORDER BY top_up_id DESC LIMIT 1",
                                                                                    "SELECT main_wallet_balance FROM top_up WHERE folio = 'MW' ORDER BY top_up_id DESC LIMIT 1",
                                                                                    "SELECT revenue_wallet_total_balance FROM top_up WHERE folio = 'RW' ORDER BY top_up_id DESC LIMIT 1",
                                                                                    "SELECT vendor_wallet_total_balance FROM top_up WHERE folio = 'VW' ORDER BY top_up_id DESC LIMIT 1",
                                                                                    "SELECT escrow_total_balance FROM top_up WHERE folio = 'EW' ORDER BY top_up_id DESC LIMIT 1",
                                                                                  ];

                                                                                pool.query(
                                                                                  "SELECT user_wallet_total_balance FROM top_up WHERE folio = 'UW' ORDER BY top_up_id DESC LIMIT 1",
                                                                                  (
                                                                                    err,
                                                                                    results
                                                                                  ) => {
                                                                                    if (
                                                                                      err
                                                                                    ) {
                                                                                      return reject(
                                                                                        err
                                                                                      );
                                                                                    }
                                                                                    user_wallet_total_balance =
                                                                                      results[0]
                                                                                        .user_wallet_total_balance ||
                                                                                      0;

                                                                                    pool.query(
                                                                                      "SELECT user_wallet_total_balance FROM top_up WHERE folio = 'UW' ORDER BY top_up_id DESC LIMIT 1",
                                                                                      (
                                                                                        err,
                                                                                        result
                                                                                      ) => {
                                                                                        if (
                                                                                          err
                                                                                        ) {
                                                                                          console.error(
                                                                                            "Error executing user_wallet_total_balance query:",
                                                                                            err
                                                                                          );
                                                                                          results.user_wallet_total_balance = 0; // Default to 0 in case of error
                                                                                        } else {
                                                                                          user_wallet_total_balance =
                                                                                            result[0]
                                                                                              .user_wallet_total_balance ||
                                                                                            0;
                                                                                        }

                                                                                        pool.query(
                                                                                          "SELECT main_wallet_total_balance FROM top_up WHERE folio = 'MW' ORDER BY top_up_id DESC LIMIT 1",
                                                                                          (
                                                                                            err,
                                                                                            result
                                                                                          ) => {
                                                                                            if (
                                                                                              err
                                                                                            ) {
                                                                                              console.error(
                                                                                                "Error executing main_wallet_total_balance query:",
                                                                                                err
                                                                                              );
                                                                                              main_wallet_total_balance = 0;
                                                                                            } else {
                                                                                              main_wallet_total_balance =
                                                                                                result[0]
                                                                                                  ? result[0]
                                                                                                      .main_wallet_total_balance
                                                                                                  : 0;
                                                                                            }

                                                                                            pool.query(
                                                                                              "SELECT revenue_wallet_total_balance FROM top_up WHERE folio = 'RW' ORDER BY top_up_id DESC LIMIT 1",
                                                                                              (
                                                                                                err,
                                                                                                result
                                                                                              ) => {
                                                                                                if (
                                                                                                  err
                                                                                                ) {
                                                                                                  console.error(
                                                                                                    "Error executing revenue_wallet_total_balance query:",
                                                                                                    err
                                                                                                  );
                                                                                                  revenue_wallet_total_balance = 0;
                                                                                                } else {
                                                                                                  revenue_wallet_total_balance =
                                                                                                    result[0]
                                                                                                      ? result[0]
                                                                                                          .revenue_wallet_total_balance
                                                                                                      : 0;
                                                                                                }

                                                                                                pool.query(
                                                                                                  "SELECT vendor_wallet_total_balance FROM top_up WHERE folio = 'VW' ORDER BY top_up_id DESC LIMIT 1",
                                                                                                  (
                                                                                                    err,
                                                                                                    result
                                                                                                  ) => {
                                                                                                    if (
                                                                                                      err
                                                                                                    ) {
                                                                                                      console.error(
                                                                                                        "Error executing vendor_wallet_total_balance query:",
                                                                                                        err
                                                                                                      );
                                                                                                      vendor_wallet_total_balance = 0;
                                                                                                    } else {
                                                                                                      vendor_wallet_total_balance =
                                                                                                        result[0]
                                                                                                          ? result[0]
                                                                                                              .vendor_wallet_total_balance
                                                                                                          : 0;
                                                                                                    }

                                                                                                    pool.query(
                                                                                                      "SELECT escrow_total_balance FROM top_up WHERE folio = 'EW' ORDER BY top_up_id DESC LIMIT 1",
                                                                                                      (
                                                                                                        err,
                                                                                                        result
                                                                                                      ) => {
                                                                                                        if (
                                                                                                          err
                                                                                                        ) {
                                                                                                          console.error(
                                                                                                            "Error executing escrow_total_balance query:",
                                                                                                            err
                                                                                                          );
                                                                                                          escrow_total_balance = 0;
                                                                                                        } else {
                                                                                                          escrow_total_balance =
                                                                                                            result[0]
                                                                                                              ? result[0]
                                                                                                                  .escrow_total_balance
                                                                                                              : 0;
                                                                                                        }

                                                                                                        // Average rating count
                                                                                                        pool.query(
                                                                                                          "SELECT  AVG(customer_stars + driver_stars) AS average_rating FROM trip",
                                                                                                          (
                                                                                                            err,
                                                                                                            results
                                                                                                          ) => {
                                                                                                            if (
                                                                                                              err
                                                                                                            ) {
                                                                                                              return reject(
                                                                                                                err
                                                                                                              );
                                                                                                            }
                                                                                                            ave_rating_count =
                                                                                                              results[0]
                                                                                                                .average_rating ||
                                                                                                              0;

                                                                                                            // getting total commisions today
                                                                                                            pool.query(
                                                                                                              `
                                                    SELECT 
                                                      (SELECT SUM(user_wallet_credit) FROM top_up WHERE trxn_code='CM') AS sum_commission_uw,
                                                      (SELECT SUM(vendor_wallet_credit) FROM top_up WHERE trxn_code='CM') AS sum_commission_vw,

                                                      (SELECT SUM(user_wallet_debit) FROM top_up WHERE trxn_code='PM') AS sum_promotion_uw,
                                                      (SELECT SUM(vendor_wallet_debit) FROM top_up WHERE trxn_code='PM') AS sum_promotion_vw,

                                                      (SELECT SUM(user_wallet_debit) FROM top_up WHERE trxn_code='TU') AS sum_top_up_uw,
                                                      (SELECT SUM(vendor_wallet_debit) FROM top_up WHERE trxn_code='TU') AS sum_top_up_vw,

                                                      (SELECT SUM(user_wallet_credit) FROM top_up WHERE trxn_code='WD') AS sum_withdrawal_uw,
                                                      (SELECT SUM(vendor_wallet_credit) FROM top_up WHERE trxn_code='WD') AS sum_withdrawal_vw,

                                                      (SELECT SUM(user_wallet_credit) FROM top_up WHERE trxn_code='MP') AS sum_mischief_penalty_uw, 
                                                      (SELECT SUM(vendor_wallet_credit) FROM top_up WHERE trxn_code='MP') AS sum_mischief_penalty_vw 


                                                  `,
                                                                                                              (
                                                                                                                err,
                                                                                                                results
                                                                                                              ) => {
                                                                                                                if (
                                                                                                                  err
                                                                                                                ) {
                                                                                                                  return reject(
                                                                                                                    err
                                                                                                                  );
                                                                                                                }

                                                                                                                sum_commission_uw =
                                                                                                                  results[0]
                                                                                                                    .sum_commission_uw ||
                                                                                                                  0;
                                                                                                                sum_commission_vw =
                                                                                                                  results[0]
                                                                                                                    .sum_commission_vw ||
                                                                                                                  0;
                                                                                                                sum_promotion_uw =
                                                                                                                  results[0]
                                                                                                                    .sum_promotion_uw ||
                                                                                                                  0;
                                                                                                                sum_promotion_vw =
                                                                                                                  results[0]
                                                                                                                    .sum_promotion_vw ||
                                                                                                                  0;
                                                                                                                sum_top_up_uw =
                                                                                                                  results[0]
                                                                                                                    .sum_top_up_uw ||
                                                                                                                  0;
                                                                                                                (sum_top_up_vw =
                                                                                                                  results[0]
                                                                                                                    .sum_top_up_vw ||
                                                                                                                  0),
                                                                                                                  (sum_withdrawal_uw =
                                                                                                                    results[0]
                                                                                                                      .sum_withdrawal_uw ||
                                                                                                                    0);
                                                                                                                sum_withdrawal_vw =
                                                                                                                  results[0]
                                                                                                                    .sum_withdrawal_vw ||
                                                                                                                  0;
                                                                                                                sum_mischief_penalty_uw =
                                                                                                                  results[0]
                                                                                                                    .sum_mischief_penalty_uw ||
                                                                                                                  0;
                                                                                                                sum_mischief_penalty_vw =
                                                                                                                  results[0]
                                                                                                                    .sum_mischief_penalty_vw ||
                                                                                                                  0;

                                                                                                                // Driver open balance

                                                                                                                // pool.query(`
                                                                                                                // SELECT SUM(latest_balances.balance) AS total_user_balances
                                                                                                                // FROM (
                                                                                                                // SELECT user_id, balance
                                                                                                                // FROM top_up
                                                                                                                // WHERE client_profile_id IN (SELECT user_id FROM users)
                                                                                                                // ORDER BY top_up_id DESC
                                                                                                                // ) AS latest_balances
                                                                                                                // GROUP BY latest_balances.user_id
                                                                                                                // `, (err, results) => {
                                                                                                                // if (err) {
                                                                                                                // return reject(err);
                                                                                                                // }
                                                                                                                // total_user_balances = results[0].total_user_balances || 0;
                                                                                                                // console.log("ppppp",total_user_balances );

                                                                                                                // Proceed with the insert query
                                                                                                                pool.query(
                                                                                                                  `INSERT INTO application_statistics (
                                                                datefor,
                                                                kms_billed,
                                                                customers_count,
                                                                drivers_count,
                                                                trips_count,
                                                                trips_per_customer,
                                                                billed_amount_usd,
                                                                average_trip_rate_usd,
                                                                mode_rate_usd,
                                                                average_billed,
                                                                new_customer_count,
                                                                new_drivers_count,
                                                                complaints_count,
                                                                total_rating_count,
                                                                ave_rating_count,
                                                                driver_open_balance,
                                                                driver_top_up,
                                                                driver_billed_charges,
                                                                driver_withdrawals,
                                                                driver_escrow,
                                                                driver_promo,
                                                                driver_deductions,
                                                                driver_additions,
                                                                driver_close_balance,
                                                                customer_open_balance,
                                                                customer_to_up,
                                                                customer_billed_charges,
                                                                customer_withdrawals,
                                                                customer_escrow,
                                                                customer_promo,
                                                                customer_deduction,
                                                                customer_additions,
                                                                customer_close_balance,
                                                                company_open_balance,
                                                                company_income_from_charges,
                                                                company_promotions,
                                                                company_withdraws_out,
                                                                company_close_balance,
                                                                sum_commission_uw,
                                                                sum_commission_vw,
                                                                sum_promotion_uw,
                                                                sum_promotion_vw,
                                                                sum_top_up_uw,
                                                                sum_top_up_vw,
                                                                sum_withdrawal_uw,
                                                                sum_withdrawal_vw,
                                                                sum_mischief_penalty_uw,
                                                                sum_mischief_penalty_vw,
                                                                signed_up_today,
                                                                users_logged_in_today,
                                                                users_logged_in_one_day_ago,
                                                                users_logged_in_two_days_ago,
                                                                users_logged_in_three_days_ago,
                                                                users_logged_in_seven_days_ago,
                                                                users_logged_in_fourteen_days_ago,
                                                                users_logged_in_thirty_days_ago,
                                                                average_engagement_time
                                                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                                                                                                  [
                                                                                                                    datefor,
                                                                                                                    kms_billed,
                                                                                                                    customers_count,
                                                                                                                    drivers_count,
                                                                                                                    trips_count,
                                                                                                                    trips_per_customer,
                                                                                                                    billed_amount_usd,
                                                                                                                    average_trip_rate_usd,
                                                                                                                    mode_rate_usd,
                                                                                                                    average_billed,
                                                                                                                    new_customer_count,
                                                                                                                    new_drivers_count,
                                                                                                                    complaints_count,
                                                                                                                    total_rating_count,
                                                                                                                    ave_rating_count,
                                                                                                                    driver_open_balance,
                                                                                                                    driver_top_up,
                                                                                                                    driver_billed_charges,
                                                                                                                    driver_withdrawals,
                                                                                                                    driver_escrow,
                                                                                                                    driver_promo,
                                                                                                                    driver_deductions,
                                                                                                                    driver_additions,
                                                                                                                    driver_close_balance,
                                                                                                                    customer_open_balance,
                                                                                                                    customer_to_up,
                                                                                                                    customer_billed_charges,
                                                                                                                    customer_withdrawals,
                                                                                                                    customer_escrow,
                                                                                                                    customer_promo,
                                                                                                                    customer_deduction,
                                                                                                                    customer_additions,
                                                                                                                    customer_close_balance,
                                                                                                                    company_open_balance,
                                                                                                                    company_income_from_charges,
                                                                                                                    company_promotions,
                                                                                                                    company_withdraws_out,
                                                                                                                    company_close_balance,
                                                                                                                    sum_commission_uw,
                                                                                                                    sum_commission_vw,
                                                                                                                    sum_promotion_uw,
                                                                                                                    sum_promotion_vw,
                                                                                                                    sum_top_up_uw,
                                                                                                                    sum_top_up_vw,
                                                                                                                    sum_withdrawal_uw,
                                                                                                                    sum_withdrawal_vw,
                                                                                                                    sum_mischief_penalty_uw,
                                                                                                                    sum_mischief_penalty_vw,
                                                                                                                    signed_up_today, // Add the new fields here
                                                                                                                    users_logged_in_today,
                                                                                                                    users_logged_in_one_day_ago,
                                                                                                                    users_logged_in_two_days_ago,
                                                                                                                    users_logged_in_three_days_ago,
                                                                                                                    users_logged_in_seven_days_ago,
                                                                                                                    users_logged_in_fourteen_days_ago,
                                                                                                                    users_logged_in_thirty_days_ago,
                                                                                                                    average_engagement_time, // Add the new fields here
                                                                                                                  ],
                                                                                                                  (
                                                                                                                    err,
                                                                                                                    result
                                                                                                                  ) => {
                                                                                                                    if (
                                                                                                                      err
                                                                                                                    ) {
                                                                                                                      return reject(
                                                                                                                        err
                                                                                                                      );
                                                                                                                    }

                                                                                                                    // Assuming you want to return the inserted data
                                                                                                                    const insertedData =
                                                                                                                      {
                                                                                                                        id: result.insertId, // Get the ID of the newly inserted row
                                                                                                                        // Include other fields that were inserted
                                                                                                                        datefor,
                                                                                                                        kms_billed,
                                                                                                                        customers_count,
                                                                                                                        drivers_count,
                                                                                                                        trips_count,
                                                                                                                        trips_per_customer,
                                                                                                                        billed_amount_usd,
                                                                                                                        average_trip_rate_usd,
                                                                                                                        mode_rate_usd,
                                                                                                                        average_billed,
                                                                                                                        new_customer_count,
                                                                                                                        new_drivers_count,
                                                                                                                        complaints_count,
                                                                                                                        total_rating_count,
                                                                                                                        ave_rating_count,
                                                                                                                        driver_open_balance,
                                                                                                                        driver_top_up,
                                                                                                                        driver_billed_charges,
                                                                                                                        driver_withdrawals,
                                                                                                                        driver_escrow,
                                                                                                                        driver_promo,
                                                                                                                        driver_deductions,
                                                                                                                        driver_additions,
                                                                                                                        driver_close_balance,
                                                                                                                        customer_open_balance,
                                                                                                                        customer_to_up,
                                                                                                                        customer_billed_charges,
                                                                                                                        customer_withdrawals,
                                                                                                                        customer_escrow,
                                                                                                                        customer_promo,
                                                                                                                        customer_deduction,
                                                                                                                        customer_additions,
                                                                                                                        customer_close_balance,
                                                                                                                        company_open_balance,
                                                                                                                        company_income_from_charges,
                                                                                                                        company_promotions,
                                                                                                                        company_withdraws_out,
                                                                                                                        company_close_balance,
                                                                                                                        sum_commission_uw,
                                                                                                                        sum_commission_vw,
                                                                                                                        sum_promotion_uw,
                                                                                                                        sum_promotion_vw,
                                                                                                                        sum_top_up_uw,
                                                                                                                        sum_top_up_vw,
                                                                                                                        sum_withdrawal_uw,
                                                                                                                        sum_withdrawal_vw,
                                                                                                                        sum_mischief_penalty_uw,
                                                                                                                        sum_mischief_penalty_vw,
                                                                                                                        signed_up_today,
                                                                                                                        users_logged_in_today,
                                                                                                                        users_logged_in_one_day_ago,
                                                                                                                        users_logged_in_two_days_ago,
                                                                                                                        users_logged_in_three_days_ago,
                                                                                                                        users_logged_in_seven_days_ago,
                                                                                                                        users_logged_in_fourteen_days_ago,
                                                                                                                        users_logged_in_thirty_days_ago,
                                                                                                                        average_engagement_time,
                                                                                                                      };

                                                                                                                    return resolve(
                                                                                                                      {
                                                                                                                        status: 200,
                                                                                                                        message:
                                                                                                                          "Saving successful",
                                                                                                                        data: insertedData,
                                                                                                                      }
                                                                                                                    );
                                                                                                                  }
                                                                                                                );
                                                                                                              }
                                                                                                            );
                                                                                                          }
                                                                                                        );
                                                                                                      }
                                                                                                    );
                                                                                                  }
                                                                                                );
                                                                                              }
                                                                                            );
                                                                                          }
                                                                                        );
                                                                                      }
                                                                                    );
                                                                                  }
                                                                                );
                                                                              }
                                                                            );
                                                                          }
                                                                        );
                                                                      }
                                                                    );
                                                                  }
                                                                );
                                                              }
                                                            );
                                                          }
                                                        );
                                                      }
                                                    );
                                                  }
                                                );
                                              }
                                            );
                                          }
                                        );
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};

crudsObj.getStatistics = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM application_statistics ORDER BY application_statistic_id DESC LIMIT 1 ",
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

crudsObj.getStatisticsByDateRange = (datefrom, dateto) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM application_statistics WHERE datefor BETWEEN ? AND ?",
      [datefrom, dateto],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

crudsObj.getStatisticById = (application_statistic_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM application_statistics WHERE application_statistic_id  = ? ",
      [application_statistic_id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

crudsObj.updateStatistic = (application_statistic_id, updatedValues) => {
  const {
    datefor,
    kms_billed,
    customers_count,
    drivers_count,
    trips_count,
    trips_per_customer,
    billed_amount_usd,
    average_trip_rate_usd,
    mode_rate_usd,
    average_billed,
    new_customer_count,
    new_drivers_count,
    complaints_count,
    total_rating_count,
    ave_rating_count,
    driver_open_balance,
    driver_top_up,
    driver_billed_charges,
    driver_withdrawals,
    driver_escrow,
    driver_promo,
    driver_deductions,
    driver_additions,
    driver_close_balance,
    customer_open_balance,
    customer_to_up,
    customer_billed_charges,
    customer_withdrawals,
    customer_escrow,
    customer_promo,
    customer_deduction,
    customer_additions,
    customer_close_balance,
    company_open_balance,
    company_income_from_charges,
    company_promotions,
    company_withdraws_out,
    company_close_balance,
  } = updatedValues;

  console.log("Updating record with ID:", application_statistic_id);
  console.log("Updated values:", updatedValues);

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE application_statistics SET 
              datefor =?,
              kms_billed =?,
              customers_count =?,
              drivers_count =?,
              trips_count =?,
              trips_per_customer =?,
              billed_amount_usd =?,
              average_trip_rate_usd =?,
              mode_rate_usd =?,
              average_billed =?,
              new_customer_count =?,
              new_drivers_count =?,
              complaints_count =?,
              total_rating_count =?,
              ave_rating_count =?,
              driver_open_balance =?,
              driver_top_up =?,
              driver_billed_charges =?,
              driver_withdrawals =?,
              driver_escrow =?,
              driver_promo =?,
              driver_deductions =?,
              driver_additions =?,
              driver_close_balance =?,
              customer_open_balance =?,
              customer_to_up =?,
              customer_billed_charges =?,
              customer_withdrawals =?,
              customer_escrow =?,
              customer_promo =?,
              customer_deduction =?,
              customer_additions =?,
              customer_close_balance =?,
              company_open_balance =?,
              company_income_from_charges =?,
              company_promotions =?,
              company_withdraws_out =?,
              company_close_balance =?
          WHERE application_statistic_id = ?`,
      [
        datefor,
        kms_billed,
        customers_count,
        drivers_count,
        trips_count,
        trips_per_customer,
        billed_amount_usd,
        average_trip_rate_usd,
        mode_rate_usd,
        average_billed,
        new_customer_count,
        new_drivers_count,
        complaints_count,
        total_rating_count,
        ave_rating_count,
        driver_open_balance,
        driver_top_up,
        driver_billed_charges,
        driver_withdrawals,
        driver_escrow,
        driver_promo,
        driver_deductions,
        driver_additions,
        driver_close_balance,
        customer_open_balance,
        customer_to_up,
        customer_billed_charges,
        customer_withdrawals,
        customer_escrow,
        customer_promo,
        customer_deduction,
        customer_additions,
        customer_close_balance,
        company_open_balance,
        company_income_from_charges,
        company_promotions,
        company_withdraws_out,
        company_close_balance,
        application_statistic_id, // Ensure this is passed as last parameter
      ],
      (err, result) => {
        if (err) {
          console.error("Error updating statistic:", err);
          return reject(err);
        }
        if (result.affectedRows === 0) {
          return resolve({
            status: "404",
            message: "Statistic not found or no changes made",
          });
        }
        return resolve({ status: 200, message: "Update successful", result });
      }
    );
  });
};

crudsObj.deleteStatistic = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM application_statistics WHERE application_statistic_id  = ?",
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
