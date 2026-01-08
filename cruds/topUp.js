require("dotenv").config();

const pool = require("./poolfile");
let crudsObj = {};

//crud get TopUps all by top_up_id DESC
crudsObj.getTopUp = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM top_up ORDER BY top_up_id DESC",
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve({ results });
      }
    );
  });
};


// crud for getting all entity total balances
crudsObj.getAllEntityTotalBalances = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }

      connection.beginTransaction(err => {
        if (err) {
          connection.release();
          return reject(err);
        }

        const queries = [
          "SELECT user_wallet_total_balance FROM top_up WHERE folio = 'UW' ORDER BY top_up_id DESC LIMIT 1",
          "SELECT main_wallet_total_balance FROM top_up WHERE folio = 'MW' ORDER BY top_up_id DESC LIMIT 1",
          "SELECT main_wallet_balance FROM top_up WHERE folio = 'MW' ORDER BY top_up_id DESC LIMIT 1",
          "SELECT revenue_wallet_total_balance FROM top_up WHERE folio = 'RW' ORDER BY top_up_id DESC LIMIT 1",
          "SELECT vendor_wallet_total_balance FROM top_up WHERE folio = 'VW' ORDER BY top_up_id DESC LIMIT 1",
          "SELECT escrow_total_balance FROM top_up WHERE folio = 'EW' ORDER BY top_up_id DESC LIMIT 1"
        ];

        const queryPromises = queries.map(query =>
          new Promise((resolveQuery, rejectQuery) => {
            connection.query(query, (err, result) => {
              if (err) {
                return rejectQuery(err);
              }
              resolveQuery(result);
            });
          })
        );

        Promise.all(queryPromises)
          .then(results => {
            connection.commit(err => {
              connection.release();
              if (err) {
                return reject(err);
              }
              resolve(results);
            });
          })
          .catch(err => {
            connection.rollback(() => {
              connection.release();
              reject(err);
            });
          });
      });
    });
  });
};



// get user balance by folio and client profile id
crudsObj.getUserWalletBalance = (clientProfileId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT user_wallet_balance 
      FROM top_up 
      WHERE folio = 'UW' AND client_profile_id = ? 
      ORDER BY top_up_id DESC
    `;
    
    pool.query(query, [clientProfileId], (err, results) => {
      if (err) {
        return reject(err);
      }
      
      return resolve(results);
    });
  });
};

//vendor balance 
crudsObj.getVendorWalletBalance = (vendorId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT vendor_wallet_balance 
      FROM top_up 
      WHERE folio = 'VW' AND vendor_id = ? 
      ORDER BY top_up_id DESC
    `;
    
    pool.query(query, [vendorId], (err, results) => {
      if (err) {
        return reject(err);
      }
      
      return resolve(results);
    });
  });
};



//crud get wallet by folio, dateffrom, dateto and 
crudsObj.getReport = (dateFor, dateTo, folio) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * 
      FROM top_up 
      WHERE folio = ? AND (date >= ? AND date <= ?)
      ORDER BY top_up_id DESC
    `;
    
    pool.query(query, [folio, dateFor, dateTo], (err, results) => {
      if (err) {
        return reject(err);
      }
      // Check if results are found
      if (results.length === 0) {
        return resolve({ message: "No records found." }); // Providing a message for clarity
      }
      return resolve({ results });
    });
  });
};


//crud get wallet by folio, dateffrom, dateto and client profile id 
crudsObj.getReportByClientId = (dateFor, dateTo, folio , client_profile_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * 
      FROM top_up 
      WHERE folio = ? AND (date >= ? AND date <= ?) AND client_profile_id =?
      ORDER BY top_up_id DESC
    `;
    
    pool.query(query, [folio, dateFor, dateTo , client_profile_id], (err, results) => {
      if (err) {
        return reject(err);
      }
      // Check if results are found
      if (results.length === 0) {
        return resolve({ message: "No records found." }); // Providing a message for clarity
      }
      return resolve({ results });
    });
  });
};

// // ###############################################################

crudsObj.getWalletWithdrawFromRevenue = (
  withdrawalAmount,
  mainWalletId,
  RevenueWalletId,
  Currency,
  exchangeRate
  //####################################
) => {
  return new Promise((resolve, reject) => {
    let currency = "";
    let exchange_rate = "";
    let date = "";
    let description = "";
    let client_profile_id = "";
    let vendor_id = "";
    let payment_gateway_id = "";
    let main_wallet_id = "";
    let revenue_wallet_id = "";
    let amount = "";
    let trip_id = "";
    let trxn_code = "";
    let user_wallet_debit = "";
    let user_wallet_credit = "";
    let user_wallet_balance = "";
    let user_wallet_total_balance = "";
    let main_wallet_debit = "";
    let main_wallet_credit = "";
    let main_wallet_balance = "";
    let main_wallet_total_balance = "";
    let payment_gateway_charges_debit = "";
    let payment_gateway_charges_credit = "";
    let payment_gateway_charges_balance = "";
    let payment_gateway_charges_total_balance = "";
    let revenue_wallet_debit = "";
    let revenue_wallet_credit = "";
    let revenue_wallet_balance = "";
    let revenue_wallet_total_balance = "";
    let vendor_wallet_debit = "";
    let vendor_wallet_credit = "";
    let vendor_wallet_balance = "";
    let vendor_wallet_total_balance = "";
    let escrow_debit = "";
    let escrow_credit = "";
    let escrow_balance = "";
    let escrow_total_balance = "";
    let folio = "";

    // Create an object to hold the results
    const results = {};
    let OldMainWalletBalance, OldMainWalletTotalBalance, OldRevenueBalance, OldRevenueTotalBalance;

    // Query for the old main wallet balance
    pool.query(
      "SELECT main_wallet_balance FROM top_up WHERE main_wallet_id = ? ORDER BY top_up_id DESC LIMIT 1",
      [mainWalletId],
      (err, mainWalletResults) => {
        if (err) {
          return reject(err);
        }

        // Store the old main wallet balance
        OldMainWalletBalance = mainWalletResults[0]
          ? mainWalletResults[0].main_wallet_balance
          : null;

        // Query for the old total main wallet balance
        pool.query(
          "SELECT main_wallet_total_balance FROM top_up ORDER BY top_up_id DESC LIMIT 1",
          (err, totalMainWalletResults) => {
            if (err) {
              return reject(err);
            }

            // Store the old total main wallet balance
            OldMainWalletTotalBalance = totalMainWalletResults[0]
              ? totalMainWalletResults[0].main_wallet_total_balance
              : null;

            // Query for the old revenue balance
            pool.query(
              "SELECT revenue_wallet_balance FROM top_up WHERE revenue_wallet_id = ? ORDER BY top_up_id DESC LIMIT 1",
              [RevenueWalletId],
              (err, RevenueWalletResults) => {
                if (err) {
                  return reject(err);
                }

                // Store the old revenue balance
                OldRevenueBalance = RevenueWalletResults[0]
                  ? RevenueWalletResults[0].revenue_wallet_balance
                  : null;

                // Query for the old total revenue balance
                pool.query(
                  "SELECT revenue_wallet_total_balance FROM top_up ORDER BY top_up_id DESC LIMIT 1",
                  (err, totalRevenueResults) => {
                    if (err) {
                      return reject(err);
                    }
                    console.log("vcccc", totalRevenueResults);
                    // Store the old total revenue balance
                    OldRevenueTotalBalance = totalRevenueResults[0] ?totalRevenueResults[0].revenue_wallet_total_balance : null;
 
                    // Calculate the new main wallet balance and total balance
                    let newMainWalletBalance = OldMainWalletBalance - withdrawalAmount;
                    let newMainWalletTotalBalance =
                    OldMainWalletTotalBalance - withdrawalAmount;

                    // Calculate the new revenue wallet balance and total
                    let newRevenueBalance =
                      OldRevenueBalance - withdrawalAmount;
                    let newRevenueTotalBalance =
                      OldRevenueTotalBalance - withdrawalAmount;

                    //create date time
                    function formatCurrentDateTime() {
                      const now = new Date();
                      const year = now.getFullYear();
                      const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                      const day = String(now.getDate()).padStart(2, '0');
                      const hours = String(now.getHours()).padStart(2, '0');
                      const minutes = String(now.getMinutes()).padStart(2, '0');
                      const seconds = String(now.getSeconds()).padStart(2, '0');
                  
                      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                  }
                  
               
const dateTime =formatCurrentDateTime();

                    mainWalletId,
                      newMainWalletBalance, // New main wallet balance
                      newMainWalletTotalBalance,
                      (currency = Currency),
                      (exchange_rate = exchangeRate),
                      (date = dateTime),
                      (description = "Withdrawal from Revenue Wallet ID: "+ RevenueWalletId +" of Main Wallet ID :"+mainWalletId),
                      (client_profile_id = ""),
                      (vendor_id = ""),
                      (payment_gateway_id = ""),
                      (main_wallet_id = mainWalletId),
                      (revenue_wallet_id = RevenueWalletId),
                      (amount = withdrawalAmount),
                      (trip_id = ""),
                      (trxn_code = "WTD"),
                      (user_wallet_debit = ""),
                      (user_wallet_credit = ""),
                      (user_wallet_balance = ""),
                      (user_wallet_total_balance = ""),
                      (main_wallet_debit = ""),
                      (main_wallet_credit = withdrawalAmount),
                      (main_wallet_balance = newMainWalletBalance),
                      (main_wallet_total_balance = newMainWalletTotalBalance),
                      (payment_gateway_charges_debit = ""),
                      (payment_gateway_charges_credit = ""),
                      (payment_gateway_charges_balance = ""),
                      (payment_gateway_charges_total_balance = ""),
                      (revenue_wallet_debit = ""),
                      (revenue_wallet_credit = ""),
                      (revenue_wallet_balance = OldRevenueBalance),
                      (revenue_wallet_total_balance = OldRevenueTotalBalance),
                      (vendor_wallet_debit = ""),
                      (vendor_wallet_credit = ""),
                      (vendor_wallet_balance = ""),
                      (vendor_wallet_total_balance = ""),
                      (escrow_debit = ""),
                      (escrow_credit = ""),
                      (escrow_balance = ""),
                      (escrow_total_balance = ""),
                      (folio = "MW");

                    // Insert new main wallet balance and updated total balance
                    pool.query(
                      "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio)" +
                        " VALUES (?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?)",
                      [
                        currency,
                        exchange_rate,
                        date,
                        description,
                        client_profile_id,
                        vendor_id,
                        payment_gateway_id,
                        main_wallet_id,
                        revenue_wallet_id,
                        amount,
                        trip_id,
                        trxn_code,
                        user_wallet_debit,
                        user_wallet_credit,
                        user_wallet_balance,
                        user_wallet_total_balance,
                        main_wallet_debit,
                        main_wallet_credit,
                        main_wallet_balance,
                        main_wallet_total_balance,
                        payment_gateway_charges_debit,
                        payment_gateway_charges_credit,
                        payment_gateway_charges_balance,
                        payment_gateway_charges_total_balance,
                        revenue_wallet_debit,
                        revenue_wallet_credit,
                        revenue_wallet_balance,
                        revenue_wallet_total_balance,
                        vendor_wallet_debit,
                        vendor_wallet_credit,
                        vendor_wallet_balance,
                        vendor_wallet_total_balance,
                        escrow_debit,
                        escrow_credit,
                        escrow_balance,
                        escrow_total_balance,
                        folio,
                      ],
                      (err, insertResults) => {
                        if (err) {
                          return reject(err);
                        }

                        (currency = Currency),
                        (exchange_rate = exchangeRate),
                        (date = dateTime),
                        (description = "Withdrawal from Revenue Wallet ID: "+ RevenueWalletId +" of Main Wallet ID :"+mainWalletId),
                        (client_profile_id = ""),
                        (vendor_id = ""),
                        (payment_gateway_id = ""),
                        (main_wallet_id = mainWalletId),
                        (revenue_wallet_id = RevenueWalletId),
                        (amount = withdrawalAmount),
                        (trip_id = ""),
                        (trxn_code = "WTD"),
                        (user_wallet_debit = ""),
                        (user_wallet_credit = ""),
                        (user_wallet_balance = ""),
                        (user_wallet_total_balance = ""),
                        (main_wallet_debit = ""),
                        (main_wallet_credit = withdrawalAmount),
                        (main_wallet_balance = newMainWalletBalance),
                        (main_wallet_total_balance = newMainWalletTotalBalance),
                        (payment_gateway_charges_debit = ""),
                        (payment_gateway_charges_credit = ""),
                        (payment_gateway_charges_balance = ""),
                        (payment_gateway_charges_total_balance = ""),
                        (revenue_wallet_debit = ""),
                        (revenue_wallet_credit = withdrawalAmount),
                        (revenue_wallet_balance = newRevenueBalance),
                        (revenue_wallet_total_balance = newRevenueTotalBalance),
                        (vendor_wallet_debit = ""),
                        (vendor_wallet_credit = ""),
                        (vendor_wallet_balance = ""),
                        (vendor_wallet_total_balance = ""),
                        (escrow_debit = ""),
                        (escrow_credit = ""),
                        (escrow_balance = ""),
                        (escrow_total_balance = ""),
                        (folio = "RW");
  

                        //Insert 
                        pool.query(
                          "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio)" +
                            " VALUES (?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?)",
                          [
                            currency,
                            exchange_rate,
                            date,
                            description,
                            client_profile_id,
                            vendor_id,
                            payment_gateway_id,
                            main_wallet_id,
                            revenue_wallet_id,
                            amount,
                            trip_id,
                            trxn_code,
                            user_wallet_debit,
                            user_wallet_credit,
                            user_wallet_balance,
                            user_wallet_total_balance,
                            main_wallet_debit,
                            main_wallet_credit,
                            main_wallet_balance,
                            main_wallet_total_balance,
                            payment_gateway_charges_debit,
                            payment_gateway_charges_credit,
                            payment_gateway_charges_balance,
                            payment_gateway_charges_total_balance,
                            revenue_wallet_debit,
                            revenue_wallet_credit,
                            revenue_wallet_balance,
                            revenue_wallet_total_balance,
                            vendor_wallet_debit,
                            vendor_wallet_credit,
                            vendor_wallet_balance,
                            vendor_wallet_total_balance,
                            escrow_debit,
                            escrow_credit,
                            escrow_balance,
                            escrow_total_balance,
                            folio,
                          ],
                          (err, revenueInsertResults) => {
                            if (err) {
                              return reject(err);
                            }

                            // Resolve with all results
                            return resolve({
                              results,
                              insertResults,
                              revenueInsertResults,
                            });
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

// ########################################################################################################################

crudsObj.getWalletWithdrawByUser = (
  withdrawalAmount,
  mainWalletId,
  UserWalletId

) => {
  return new Promise((resolve, reject) => {
    let currency = "";
    let exchange_rate = "";
    let date = "";
    let description = "";
    let client_profile_id = "";
    let vendor_id = "";
    let payment_gateway_id = "";
    let main_wallet_id = "";
    let revenue_wallet_id = "";
    let amount = "";
    let trip_id = "";
    let trxn_code = "";
    let user_wallet_debit = "";
    let user_wallet_credit = "";
    let user_wallet_balance = "";
    let user_wallet_total_balance = "";
    let main_wallet_debit = "";
    let main_wallet_credit = "";
    let main_wallet_balance = "";
    let main_wallet_total_balance = "";
    let payment_gateway_charges_debit = "";
    let payment_gateway_charges_credit = "";
    let payment_gateway_charges_balance = "";
    let payment_gateway_charges_total_balance = "";
    let revenue_wallet_debit = "";
    let revenue_wallet_credit = "";
    let revenue_wallet_balance = "";
    let revenue_wallet_total_balance = "";
    let vendor_wallet_debit = "";
    let vendor_wallet_credit = "";
    let vendor_wallet_balance = "";
    let vendor_wallet_total_balance = "";
    let escrow_debit = "";
    let escrow_credit = "";
    let escrow_balance = "";
    let escrow_total_balance = "";
    let folio = "";
    let mFolio = "MW";
    let uFolio = "UW";

    // Create an object to hold the results
    const results = {};
    let OldBalance, OldTotalBalance, OldUserBalance, OldUserTotalBalance;

    // Query for the old main wallet balance
    pool.query(
      "SELECT main_wallet_balance FROM top_up WHERE main_wallet_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
      [mainWalletId,mFolio],
      (err, mainWalletResults) => {
        if (err) {
          return reject(err);
        }

        // Store the old main wallet balance
        OldBalance = mainWalletResults[0]
          ? mainWalletResults[0].main_wallet_balance
          : null;

        // Query for the old total main wallet balance
        pool.query(
          "SELECT main_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
          [mFolio],
          (err, totalMainWalletResults) => {
            if (err) {
              return reject(err);
            }

            // Store the old total main wallet balance
            OldTotalBalance = totalMainWalletResults[0]
              ? totalMainWalletResults[0].main_wallet_total_balance
              : null;

            // Query for the old revenue balance
            pool.query(
              "SELECT user_wallet_balance FROM top_up WHERE client_profile_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
              [UserWalletId,uFolio],
              (err, UserWalletResults) => {
                if (err) {
                  return reject(err);
                }

                // Store the old revenue balance
                OldUserBalance = UserWalletResults[0]
                  ? UserWalletResults[0].user_wallet_balance
                  : null;

                // Query for the old total revenue balance
                pool.query(
                  "SELECT user_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
                  [uFolio],
                  (err, totalUserResults) => {
                    if (err) {
                      return reject(err);
                    }

                    // Store the old total revenue balance
                    OldUserTotalBalance = totalUserResults[0]
                      ? totalUserResults[0].user_wallet_total_balance
                      : null;

                    // Calculate the new main wallet balance and total balance
                    let newMainWalletBalance = OldBalance - withdrawalAmount;
                    let newMainWalletTotalBalance =
                      OldTotalBalance - withdrawalAmount;

                    // Calculate the new revenue wallet balance and total
                    let newUserBalance = OldUserBalance - withdrawalAmount;
                    let newUserTotalBalance =
                      OldUserTotalBalance - withdrawalAmount;

                      mainWalletId,
                      newMainWalletBalance, // New main wallet balance
                      newMainWalletTotalBalance,
                      (currency = ""),
                      (exchange_rate = ""),
                      (date = ""),
                      (description = ""),
                      (client_profile_id = UserWalletId),
                      (vendor_id = ""),
                      (payment_gateway_id = ""),
                      (main_wallet_id = mainWalletId),
                      (revenue_wallet_id = ""),
                      (escrow_id = 1),
                      (amount = ""),
                      (trip_id = ""),
                      (trxn_code = ""),
                      (user_wallet_debit = ""),
                      (user_wallet_credit = ""),
                      (user_wallet_balance = ""),
                      (user_wallet_total_balance = ""),
                      (main_wallet_debit = ""),
                      (main_wallet_credit = withdrawalAmount),
                      (main_wallet_balance = newMainWalletBalance),
                      (main_wallet_total_balance = newMainWalletTotalBalance),
                      (payment_gateway_charges_debit = ""),
                      (payment_gateway_charges_credit = ""),
                      (payment_gateway_charges_balance = ""),
                      (payment_gateway_charges_total_balance = ""),
                      (revenue_wallet_debit = ""),
                      (revenue_wallet_credit = ""),
                      (revenue_wallet_balance = ""),
                      (revenue_wallet_total_balance = ""),
                      (vendor_wallet_debit = ""),
                      (vendor_wallet_credit = ""),
                      (vendor_wallet_balance = ""),
                      (vendor_wallet_total_balance = ""),
                      (escrow_debit = ""),
                      (escrow_credit = ""),
                      (escrow_balance = ""),
                      (escrow_total_balance = ""),
                      (folio = "MW");

                      pool.query(
                        "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, escrow_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio)" +
                        " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                          currency || '',
                          exchange_rate || '',
                          date || '',
                          description || '',
                          client_profile_id || '',
                          vendor_id || '',
                          payment_gateway_id || '',
                          main_wallet_id || '',
                          revenue_wallet_id || '',
                          escrow_id || 1, // Ensure this has a valid value
                          amount || '',
                          trip_id || '',
                          trxn_code || '',
                          user_wallet_debit || '',
                          user_wallet_credit || '',
                          user_wallet_balance || '',
                          user_wallet_total_balance || '',
                          main_wallet_debit || '',
                          main_wallet_credit || withdrawalAmount || '',
                          main_wallet_balance || newMainWalletBalance || '',
                          main_wallet_total_balance || newMainWalletTotalBalance || '',
                          payment_gateway_charges_debit || '',
                          payment_gateway_charges_credit || '',
                          payment_gateway_charges_balance || '',
                          payment_gateway_charges_total_balance || '',
                          revenue_wallet_debit || '',
                          revenue_wallet_credit || '',
                          revenue_wallet_balance || '',
                          revenue_wallet_total_balance || '',
                          vendor_wallet_debit || '',
                          vendor_wallet_credit || '',
                          vendor_wallet_balance || '',
                          vendor_wallet_total_balance || '',
                          escrow_debit || '',
                          escrow_credit || '',
                          escrow_balance || '',
                          escrow_total_balance || '',
                          folio || 'MW'
                        ],
                        (err, insertResults) => {
                          if (err) {
                            return reject(err);
                          }
                      
                          console.log("all done");
                      
                     
                    
                  
                      mainWalletId,
                      newMainWalletBalance, // New main wallet balance
                      newMainWalletTotalBalance,
                      (currency = ""),
                      (exchange_rate = ""),
                      (date = ""),
                      (description = ""),
                      (client_profile_id = UserWalletId),
                      (vendor_id = ""),
                      (payment_gateway_id = ""),
                      (main_wallet_id = mainWalletId),
                      (revenue_wallet_id = ""),
                      (escrow_id = ""),
                      (amount = ""),
                      (trip_id = ""),
                      (trxn_code = ""),
                      (user_wallet_debit = ""),
                      (user_wallet_credit = withdrawalAmount),
                      (user_wallet_balance = newUserBalance),
                      (user_wallet_total_balance = newUserTotalBalance),
                      (main_wallet_debit = ""),
                      (main_wallet_credit = ""),
                      (main_wallet_balance = ""),
                      (main_wallet_total_balance = ""),
                      (payment_gateway_charges_debit = ""),
                      (payment_gateway_charges_credit = ""),
                      (payment_gateway_charges_balance = ""),
                      (payment_gateway_charges_total_balance = ""),
                      (revenue_wallet_debit = ""),
                      (revenue_wallet_credit = ""),
                      (revenue_wallet_balance = ""),
                      (revenue_wallet_total_balance = ""),
                      (vendor_wallet_debit = ""),
                      (vendor_wallet_credit = ""),
                      (vendor_wallet_balance = ""),
                      (vendor_wallet_total_balance = ""),
                      (escrow_debit = ""),
                      (escrow_credit = ""),
                      (escrow_balance = ""),
                      (escrow_total_balance = ""),
                      (folio = "UW");


                      pool.query(
                        "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                          currency || '',
                          exchange_rate || '',
                          date || '',
                          description || '',
                          client_profile_id || '',
                          vendor_id || '',
                          payment_gateway_id || '',
                          main_wallet_id || '',
                          revenue_wallet_id || '',
                          amount || '',
                          trip_id || '',
                          trxn_code || '',
                          user_wallet_debit || '',
                          user_wallet_credit || withdrawalAmount || '',
                          user_wallet_balance || newUserBalance || '',
                          user_wallet_total_balance || newUserTotalBalance || '',
                          main_wallet_debit || '',
                          main_wallet_credit || '',
                          main_wallet_balance || '',
                          main_wallet_total_balance || '',
                          payment_gateway_charges_debit || '',
                          payment_gateway_charges_credit || '',
                          payment_gateway_charges_balance || '',
                          payment_gateway_charges_total_balance || '',
                          revenue_wallet_debit || '',
                          revenue_wallet_credit || '',
                          revenue_wallet_balance || '',
                          revenue_wallet_total_balance || '',
                          vendor_wallet_debit || '',
                          vendor_wallet_credit || '',
                          vendor_wallet_balance || '',
                          vendor_wallet_total_balance || '',
                          escrow_debit || '',
                          escrow_credit || '',
                          escrow_balance || '',
                          escrow_total_balance || '',
                          folio || 'UW'
                        ],
                        (err, revenueInsertResults) => {
                          if (err) {
                            return reject(err);
                          }
                          console.log("Insert successful:", revenueInsertResults);
                      

                            // Resolve with all results
                            return resolve({
                              results,
                              insertResults,
                              revenueInsertResults,
                            });
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
// ##########################################################################################

crudsObj.getWalletWithdrawByVendor = (
  withdrawalAmount,
  mainWalletId,
  VendorId
  //####################################
) => {
  return new Promise((resolve, reject) => {
    let currency = "";
    let exchange_rate = "";
    let date = "";
    let description = "";
    let client_profile_id = "";
    let vendor_id = "";
    let payment_gateway_id = "";
    let main_wallet_id = "";
    let revenue_wallet_id = "";
    let amount = "";
    let trip_id = "";
    let trxn_code = "";
    let user_wallet_debit = "";
    let user_wallet_credit = "";
    let user_wallet_balance = "";
    let user_wallet_total_balance = "";
    let main_wallet_debit = "";
    let main_wallet_credit = "";
    let main_wallet_balance = "";
    let main_wallet_total_balance = "";
    let payment_gateway_charges_debit = "";
    let payment_gateway_charges_credit = "";
    let payment_gateway_charges_balance = "";
    let payment_gateway_charges_total_balance = "";
    let revenue_wallet_debit = "";
    let revenue_wallet_credit = "";
    let revenue_wallet_balance = "";
    let revenue_wallet_total_balance = "";
    let vendor_wallet_debit = "";
    let vendor_wallet_credit = "";
    let vendor_wallet_balance = "";
    let vendor_wallet_total_balance = "";
    let escrow_debit = "";
    let escrow_credit = "";
    let escrow_balance = "";
    let escrow_total_balance = "";
    let folio = "";
    let mFolio = "MW";
    let vFolio = "VW";


    // Create an object to hold the results
    const results = {};
    let OldBalance, OldTotalBalance, OldVendorBalance, OldVendorTotalBalance;

    // Query for the old main wallet balance
    pool.query(
      "SELECT main_wallet_balance FROM top_up WHERE main_wallet_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
      [mainWalletId,mFolio],
      (err, mainWalletResults) => {
        if (err) {
          return reject(err);
        }

        // Store the old main wallet balance
        OldBalance = mainWalletResults[0]
          ? mainWalletResults[0].main_wallet_balance
          : null;

        // Query for the old total main wallet balance
        pool.query(
          "SELECT main_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
          [mFolio],
          (err, totalMainWalletResults) => {
            if (err) {
              return reject(err);
            }

            // Store the old total main wallet balance
            OldTotalBalance = totalMainWalletResults[0]
              ? totalMainWalletResults[0].main_wallet_total_balance
              : null;

            // Query for the old revenue balance
            pool.query(
              "SELECT vendor_wallet_balance FROM top_up WHERE vendor_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
              [VendorId,vFolio],
              (err, VendorWalletResults) => {
                if (err) {
                  return reject(err);
                }

                // Store the old revenue balance
                OldVendorBalance = VendorWalletResults[0]
                  ? VendorWalletResults[0].vendor_wallet_balance
                  : null;

                // Query for the old total revenue balance
                pool.query(
                  "SELECT vendor_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
                  [vFolio],
                  (err, totalVendorResults) => {
                    if (err) {
                      return reject(err);
                    }

                    // Store the old total revenue balance
                    OldVendorTotalBalance = totalVendorResults[0]
                      ? totalVendorResults[0].vendor_wallet_total_balance
                      : null;

                    // Calculate the new main wallet balance and total balance
                    let newMainWalletBalance = OldBalance - withdrawalAmount;
                    let newMainWalletTotalBalance =
                      OldTotalBalance - withdrawalAmount;

                    // Calculate the new revenue wallet balance and total
                    let newVendorBalance = OldVendorBalance - withdrawalAmount;
                    let newVendorTotalBalance =
                      OldVendorTotalBalance - withdrawalAmount;

                      mainWalletId,
                      newMainWalletBalance, // New main wallet balance
                      newMainWalletTotalBalance,
                      (currency = ""),
                      (exchange_rate = ""),
                      (date = ""),
                      (description = ""),
                      (client_profile_id = ""),
                      (vendor_id = VendorId),
                      (payment_gateway_id = ""),
                      (main_wallet_id = mainWalletId),
                      (revenue_wallet_id = ""),
                      (escrow_id = 1),
                      (amount = ""),
                      (trip_id = ""),
                      (trxn_code = ""),
                      (user_wallet_debit = ""),
                      (user_wallet_credit = ""),
                      (user_wallet_balance = ""),
                      (user_wallet_total_balance = ""),
                      (main_wallet_debit = ""),
                      (main_wallet_credit = withdrawalAmount),
                      (main_wallet_balance = newMainWalletBalance),
                      (main_wallet_total_balance = newMainWalletTotalBalance),
                      (payment_gateway_charges_debit = ""),
                      (payment_gateway_charges_credit = ""),
                      (payment_gateway_charges_balance = ""),
                      (payment_gateway_charges_total_balance = ""),
                      (revenue_wallet_debit = ""),
                      (revenue_wallet_credit = ""),
                      (revenue_wallet_balance = ""),
                      (revenue_wallet_total_balance = ""),
                      (vendor_wallet_debit = ""),
                      (vendor_wallet_credit = ""),
                      (vendor_wallet_balance = ""),
                      (vendor_wallet_total_balance = ""),
                      (escrow_debit = ""),
                      (escrow_credit = ""),
                      (escrow_balance = ""),
                      (escrow_total_balance = ""),
                      (folio = "MW");

                      pool.query(
                        "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, escrow_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio)" +
                        " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                          currency || '',
                          exchange_rate || '',
                          date || '',
                          description || '',
                          client_profile_id || '',
                          vendor_id || '',
                          payment_gateway_id || '',
                          main_wallet_id || '',
                          revenue_wallet_id || '',
                          escrow_id || 1, // Ensure this has a valid value
                          amount || '',
                          trip_id || '',
                          trxn_code || '',
                          user_wallet_debit || '',
                          user_wallet_credit || '',
                          user_wallet_balance || '',
                          user_wallet_total_balance || '',
                          main_wallet_debit || '',
                          main_wallet_credit || withdrawalAmount || '',
                          main_wallet_balance || newMainWalletBalance || '',
                          main_wallet_total_balance || newMainWalletTotalBalance || '',
                          payment_gateway_charges_debit || '',
                          payment_gateway_charges_credit || '',
                          payment_gateway_charges_balance || '',
                          payment_gateway_charges_total_balance || '',
                          revenue_wallet_debit || '',
                          revenue_wallet_credit || '',
                          revenue_wallet_balance || '',
                          revenue_wallet_total_balance || '',
                          vendor_wallet_debit || '',
                          vendor_wallet_credit || '',
                          vendor_wallet_balance || '',
                          vendor_wallet_total_balance || '',
                          escrow_debit || '',
                          escrow_credit || '',
                          escrow_balance || '',
                          escrow_total_balance || '',
                          folio || 'MW'
                        ],
                        (err, insertResults) => {
                          if (err) {
                            return reject(err);
                          }
                      
                          console.log("all done");
                      
                     
                    
                  
                      mainWalletId,
                      newMainWalletBalance, // New main wallet balance
                      newMainWalletTotalBalance,
                      (currency = ""),
                      (exchange_rate = ""),
                      (date = ""),
                      (description = ""),
                      (client_profile_id = ""),
                      (vendor_id = VendorId),
                      (payment_gateway_id = ""),
                      (main_wallet_id = mainWalletId),
                      (revenue_wallet_id = ""),
                      (escrow_id = ""),
                      (amount = ""),
                      (trip_id = ""),
                      (trxn_code = ""),
                      (user_wallet_debit = ""),
                      (user_wallet_credit = ""),
                      (user_wallet_balance = ""),
                      (user_wallet_total_balance = ""),
                      (main_wallet_debit = ""),
                      (main_wallet_credit = ""),
                      (main_wallet_balance = ""),
                      (main_wallet_total_balance = ""),
                      (payment_gateway_charges_debit = ""),
                      (payment_gateway_charges_credit = ""),
                      (payment_gateway_charges_balance = ""),
                      (payment_gateway_charges_total_balance = ""),
                      (revenue_wallet_debit = ""),
                      (revenue_wallet_credit = ""),
                      (revenue_wallet_balance = ""),
                      (revenue_wallet_total_balance = ""),
                      (vendor_wallet_debit = ""),
                      (vendor_wallet_credit = withdrawalAmount),
                      (vendor_wallet_balance = newVendorBalance),
                      (vendor_wallet_total_balance = newVendorTotalBalance),
                      (escrow_debit = ""),
                      (escrow_credit = ""),
                      (escrow_balance = ""),
                      (escrow_total_balance = ""),
                      (folio = "VW");


                      pool.query(
                        "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                          currency || '',
                          exchange_rate || '',
                          date || '',
                          description || '',
                          client_profile_id || '',
                          vendor_id || '',
                          payment_gateway_id || '',
                          main_wallet_id || '',
                          revenue_wallet_id || '',
                          amount || '',
                          trip_id || '',
                          trxn_code || '',
                          user_wallet_debit || '',
                          user_wallet_credit || '',
                          user_wallet_balance || '',
                          user_wallet_total_balance || '',
                          main_wallet_debit || '',
                          main_wallet_credit || '',
                          main_wallet_balance || '',
                          main_wallet_total_balance || '',
                          payment_gateway_charges_debit || '',
                          payment_gateway_charges_credit || '',
                          payment_gateway_charges_balance || '',
                          payment_gateway_charges_total_balance || '',
                          revenue_wallet_debit || '',
                          revenue_wallet_credit || '',
                          revenue_wallet_balance || '',
                          revenue_wallet_total_balance || '',
                          vendor_wallet_debit || '',
                          vendor_wallet_credit || '',
                          vendor_wallet_balance || '',
                          vendor_wallet_total_balance || '',
                          escrow_debit || '',
                          escrow_credit || '',
                          escrow_balance || '',
                          escrow_total_balance || '',
                          folio || 'VW'
                        ],
                        (err, revenueInsertResults) => {
                          if (err) {
                            return reject(err);
                          }
                          console.log("Insert successful:", revenueInsertResults);
                      

                            // Resolve with all results
                            return resolve({
                              results,
                              insertResults,
                              revenueInsertResults,
                            });
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


// ###############################################################################################

// crudsObj.getPayTripFromWallet = (withdrawalAmount, depositAmount, UserId) => {
//   return new Promise((resolve, reject) => {
//     let results = {};
//     let OldUserBalance, OldUserTotalBalance;

//     // Query for the old user wallet balance
//     pool.query(
//       "SELECT user_wallet_balance, user_wallet_total_balance FROM top_up WHERE client_profile_id = ? ORDER BY top_up_id DESC LIMIT 1",
//       [UserId],
//       (err, UserWalletResults) => {
//         if (err) {
//           return reject(err);
//         }

//         OldUserBalance = UserWalletResults[0] ? UserWalletResults[0].user_wallet_balance : null;
//         OldUserTotalBalance = UserWalletResults[0] ? UserWalletResults[0].user_wallet_total_balance : null;

//         // Calculate the new balances
//         let newUserBalance = OldUserBalance - withdrawalAmount;
//         let newUserTotalBalance = OldUserTotalBalance - withdrawalAmount;

//         // Prepare data for insertion
//         const insertData = {
//           currency: "",
//           exchange_rate: "",
//           date: "",
//           description: "",
//           client_profile_id: UserId,
//           vendor_id: " ",
//           payment_gateway_id: "",
//           main_wallet_id: "",
//           revenue_wallet_id: "",
//           amount: "",
//           trip_id: "",
//           trxn_code: "",
//           user_wallet_debit: depositAmount,
//           user_wallet_credit: withdrawalAmount,
//           user_wallet_balance: newUserBalance,
//           user_wallet_total_balance: newUserTotalBalance,
//           main_wallet_debit: "",
//           main_wallet_credit: "",
//           main_wallet_balance: "",
//           main_wallet_total_balance: " ",
//           payment_gateway_charges_debit: "",
//           payment_gateway_charges_credit: "",
//           payment_gateway_charges_balance: "",
//           payment_gateway_charges_total_balance: "",
//           revenue_wallet_debit: "",
//           revenue_wallet_credit: "",
//           revenue_wallet_balance: "",
//           revenue_wallet_total_balance: "",
//           vendor_wallet_debit: "",
//           vendor_wallet_credit: " ",
//           vendor_wallet_balance: " ",
//           vendor_wallet_total_balance: " ",
//           escrow_debit: "",
//           escrow_credit: "",
//           escrow_balance: "",
//           escrow_total_balance: "",
//           folio: ""
//         };

//         // Insert new wallet balance and updated total balance
//         pool.query(
//           "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//           Object.values(insertData),
//           (err, insertResults) => {
//             if (err) {
//               return reject(err);
//             }

//             // Resolve with results
//             resolve({ results, insertResults });
//           }
//         );
//       }
//     );
//   });
// };

//to be seen

// #############################################################################################

// get crud by trip commission settlement

crudsObj.getTripCommissionSettlement = (
  commission,
  RevenueWalletId,
  UserWalletId,
  description,
  tripId
  //####################################
) => {
  return new Promise((resolve, reject) => {





    
    let currency = "";
    let exchange_rate = "";
    // let date = new Date().toISOString().replace('T', ' ').substring(0, 19).replace(/-/g, '/');

     // Get the current date and time in YYYY/MM/DD HH:mm:ss format
     let now = new Date();
     let year = now.getFullYear();
     let month = String(now.getMonth() + 2).padStart(2, '0'); // Months are zero-based
     let day = String(now.getDate()).padStart(2, '0');
     let hours = String(now.getHours()).padStart(2, '0');
     let minutes = String(now.getMinutes()).padStart(2, '0');
     let seconds = String(now.getSeconds()).padStart(2, '0');
 
    let date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    let client_profile_id = "";
    let vendor_id = "";
    let payment_gateway_id = "";
    let main_wallet_id = "";
    let revenue_wallet_id = "";
    let amount = "";
    let trip_id = "";
    let trxn_code = "";
    let user_wallet_debit = "";
    let user_wallet_credit = "";
    let user_wallet_balance = "";
    let user_wallet_total_balance = "";
    let main_wallet_debit = "";
    let main_wallet_credit = "";
    let main_wallet_balance = "";
    let main_wallet_total_balance = "";
    let payment_gateway_charges_debit = "";
    let payment_gateway_charges_credit = "";
    let payment_gateway_charges_balance = "";
    let payment_gateway_charges_total_balance = "";
    let revenue_wallet_debit = "";
    let revenue_wallet_credit = "";
    let revenue_wallet_balance = "";
    let revenue_wallet_total_balance = "";
    let vendor_wallet_debit = "";
    let vendor_wallet_credit = "";
    let vendor_wallet_balance = "";
    let vendor_wallet_total_balance = "";
    let escrow_debit = "";
    let escrow_credit = "";
    let escrow_balance = "";
    let escrow_total_balance = "";
    let folio = "";
    let rFolio = "RW";
    let uFolio = "UW";

    // Create an object to hold the results
    const results = {};
    let OldBalance, OldTotalBalance, OldUserBalance, OldUserTotalBalance;

    // Query for the old main wallet balance
    pool.query(
      "SELECT revenue_wallet_balance FROM top_up WHERE revenue_wallet_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
      [RevenueWalletId,rFolio],
      (err, revenueWalletResults) => {
        if (err) {
          return reject(err);
        }

        // Store the old main wallet balance
        OldBalance = revenueWalletResults[0]
          ? revenueWalletResults[0].revenue_wallet_balance
          : null;

        // Query for the old total main wallet balance
        pool.query(
          "SELECT revenue_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
          [rFolio],
          (err, totalRevenueWalletResults) => {
            if (err) {
              return reject(err);
            }

            // Store the old total main wallet balance
            OldTotalBalance = totalRevenueWalletResults[0]
              ? totalRevenueWalletResults[0].revenue_wallet_total_balance
              : null;

            // Query for the old revenue balance
            pool.query(
              "SELECT user_wallet_balance FROM top_up WHERE client_profile_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
              [UserWalletId,uFolio],
              (err, userWalletResults) => {
                if (err) {
                  return reject(err);
                }

                // Store the old revenue balance
                OldUserBalance = userWalletResults[0]
                  ? userWalletResults[0].user_wallet_balance
                  : null;

                // Query for the old total revenue balance
                pool.query(
                  "SELECT user_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
                  [uFolio],
                  (err, totalUserResults) => {
                    if (err) {
                      return reject(err);
                    }

                    // Store the old total revenue balance
                    OldUserTotalBalance = totalUserResults[0]
                      ? totalUserResults[0].user_wallet_total_balance
                      : null;

                    // Calculate the new revenue wallet balance and total balance
                    let newRevenueWalletBalance = OldBalance + commission;
                    let newRevenueWalletTotalBalance =
                      OldTotalBalance + commission;

                    // Calculate the new user wallet balance and total
                    let newUserBalance = OldUserBalance - commission;
                    let newUserTotalBalance = OldUserTotalBalance - commission;

                    RevenueWalletId,
                      newRevenueWalletBalance, // New main wallet balance
                      newRevenueWalletTotalBalance,
                      (currency = "USD"),
                      (exchange_rate = 1),
                      (date = date),
                      (description = description),
                      (client_profile_id = UserWalletId),
                      (vendor_id = " "),
                      (payment_gateway_id = ""),
                      (main_wallet_id = " "),
                      (revenue_wallet_id = RevenueWalletId),
                      (amount = ""),
                      (trip_id = tripId),
                      (trxn_code = "CM"),
                      (user_wallet_debit = " "),
                      (user_wallet_credit = commission),
                      (user_wallet_balance = newUserBalance),
                      (user_wallet_total_balance = newUserTotalBalance),
                      (main_wallet_debit = ""),
                      (main_wallet_credit = " "),
                      (main_wallet_balance = " "),
                      (main_wallet_total_balance = " "),
                      (payment_gateway_charges_debit = ""),
                      (payment_gateway_charges_credit = ""),
                      (payment_gateway_charges_balance = ""),
                      (payment_gateway_charges_total_balance = ""),
                      (revenue_wallet_debit = ""),
                      (revenue_wallet_credit = ""),
                      (revenue_wallet_balance = ""),
                      (revenue_wallet_total_balance =""),
                      (vendor_wallet_debit = ""),
                      (vendor_wallet_credit = " "),
                      (vendor_wallet_balance = " "),
                      (vendor_wallet_total_balance = " "),
                      (escrow_debit = ""),
                      (escrow_credit = ""),
                      (escrow_balance = ""),
                      (escrow_total_balance = ""),
                      (folio = "UW");

                    // Insert new main wallet balance and updated total balance
                    pool.query(
                    "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) " +
  "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                      [
                        currency,
                        exchange_rate,
                        date,
                        description,
                        client_profile_id,
                        vendor_id,
                        payment_gateway_id,
                        main_wallet_id,
                        revenue_wallet_id,
                        amount,
                        trip_id,
                        trxn_code,
                        user_wallet_debit,
                        user_wallet_credit,
                        user_wallet_balance,
                        user_wallet_total_balance,
                        main_wallet_debit,
                        main_wallet_credit,
                        main_wallet_balance,
                        main_wallet_total_balance,
                        payment_gateway_charges_debit,
                        payment_gateway_charges_credit,
                        payment_gateway_charges_balance,
                        payment_gateway_charges_total_balance,
                        revenue_wallet_debit,
                        revenue_wallet_credit,
                        revenue_wallet_balance,
                        revenue_wallet_total_balance,
                        vendor_wallet_debit,
                        vendor_wallet_credit,
                        vendor_wallet_balance,
                        vendor_wallet_total_balance,
                        escrow_debit,
                        escrow_credit,
                        escrow_balance,
                        escrow_total_balance,
                        folio,
                      ],
                      (err, insertResults) => {
                        if (err) {
                          return reject(err);
                        }


                        
                    RevenueWalletId,
                    newRevenueWalletBalance, // New main wallet balance
                    newRevenueWalletTotalBalance,
                    (currency = "USD"),
                    (exchange_rate = 1),
                    (date = date),
                    (description = description),
                    (client_profile_id = UserWalletId),
                    (vendor_id = " "),
                    (payment_gateway_id = ""),
                    (main_wallet_id = " "),
                    (revenue_wallet_id = RevenueWalletId),
                    (amount = ""),
                    (trip_id = tripId),
                    (trxn_code = "CM"),
                    (user_wallet_debit = " "),
                    (user_wallet_credit = ""),
                    (user_wallet_balance = ""),
                    (user_wallet_total_balance = ""),
                    (main_wallet_debit = ""),
                    (main_wallet_credit = " "),
                    (main_wallet_balance = " "),
                    (main_wallet_total_balance = " "),
                    (payment_gateway_charges_debit = ""),
                    (payment_gateway_charges_credit = ""),
                    (payment_gateway_charges_balance = ""),
                    (payment_gateway_charges_total_balance = ""),
                    (revenue_wallet_debit = commission),
                    (revenue_wallet_credit = ""),
                    (revenue_wallet_balance = newRevenueWalletBalance),
                    (revenue_wallet_total_balance = newRevenueWalletTotalBalance),
                    (vendor_wallet_debit = ""),
                    (vendor_wallet_credit = " "),
                    (vendor_wallet_balance = " "),
                    (vendor_wallet_total_balance = " "),
                    (escrow_debit = ""),
                    (escrow_credit = ""),
                    (escrow_balance = ""),
                    (escrow_total_balance = ""),
                    (folio = "RW");

                        // Insert new revenue balance and updated total balance
                        pool.query(
                       "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) " +
  "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                          [
                            currency,
                            exchange_rate,
                            date,
                            description,
                            client_profile_id,
                            vendor_id,
                            payment_gateway_id,
                            main_wallet_id,
                            revenue_wallet_id,
                            amount,
                            trip_id,
                            trxn_code,
                            user_wallet_debit,
                            user_wallet_credit,
                            user_wallet_balance,
                            user_wallet_total_balance,
                            main_wallet_debit,
                            main_wallet_credit,
                            main_wallet_balance,
                            main_wallet_total_balance,
                            payment_gateway_charges_debit,
                            payment_gateway_charges_credit,
                            payment_gateway_charges_balance,
                            payment_gateway_charges_total_balance,
                            revenue_wallet_debit,
                            revenue_wallet_credit,
                            revenue_wallet_balance,
                            revenue_wallet_total_balance,
                            vendor_wallet_debit,
                            vendor_wallet_credit,
                            vendor_wallet_balance,
                            vendor_wallet_total_balance,
                            escrow_debit,
                            escrow_credit,
                            escrow_balance,
                            escrow_total_balance,
                            folio,
                          ],
                          (err, revenueInsertResults) => {
                            if (err) {
                              return reject(err);
                            }

                            // Resolve with all results
                            return resolve({
                              results,
                              insertResults,
                              revenueInsertResults,
                            });
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


crudsObj.getVendorCommissionSettlement = (
  commission,
  RevenueWalletId,
  VendorWalletId,
  description
  //####################################
) => {
  return new Promise((resolve, reject) => {





    
    let currency = "";
    let exchange_rate = "";
    // let date = new Date().toISOString().replace('T', ' ').substring(0, 19).replace(/-/g, '/');

     // Get the current date and time in YYYY/MM/DD HH:mm:ss format
     let now = new Date();
     let year = now.getFullYear();
     let month = String(now.getMonth() + 2).padStart(2, '0'); // Months are zero-based
     let day = String(now.getDate()).padStart(2, '0');
     let hours = String(now.getHours()).padStart(2, '0');
     let minutes = String(now.getMinutes()).padStart(2, '0');
     let seconds = String(now.getSeconds()).padStart(2, '0');
 
     let date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    let client_profile_id = "";
    let vendor_id = "";
    let payment_gateway_id = "";
    let main_wallet_id = "";
    let revenue_wallet_id = "";
    let amount = "";
    let trip_id = "";
    let trxn_code = "";
    let user_wallet_debit = "";
    let user_wallet_credit = "";
    let user_wallet_balance = "";
    let user_wallet_total_balance = "";
    let main_wallet_debit = "";
    let main_wallet_credit = "";
    let main_wallet_balance = "";
    let main_wallet_total_balance = "";
    let payment_gateway_charges_debit = "";
    let payment_gateway_charges_credit = "";
    let payment_gateway_charges_balance = "";
    let payment_gateway_charges_total_balance = "";
    let revenue_wallet_debit = "";
    let revenue_wallet_credit = "";
    let revenue_wallet_balance = "";
    let revenue_wallet_total_balance = "";
    let vendor_wallet_debit = "";
    let vendor_wallet_credit = "";
    let vendor_wallet_balance = "";
    let vendor_wallet_total_balance = "";
    let escrow_debit = "";
    let escrow_credit = "";
    let escrow_balance = "";
    let escrow_total_balance = "";
    let folio = "";
    let rFolio = "RW";
    let vFolio = "VW";

    // Create an object to hold the results
    const results = {};
    let OldBalance, OldTotalBalance, OldUserBalance, OldUserTotalBalance;

    // Query for the old main wallet balance
    pool.query(
      "SELECT revenue_wallet_balance FROM top_up WHERE revenue_wallet_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
      [RevenueWalletId,rFolio],
      (err, revenueWalletResults) => {
        if (err) {
          return reject(err);
        }

        // Store the old main wallet balance
        OldBalance = revenueWalletResults[0]
          ? revenueWalletResults[0].revenue_wallet_balance
          : null;

        // Query for the old total main wallet balance
        pool.query(
          "SELECT revenue_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
          [vFolio],
          (err, totalRevenueWalletResults) => {
            if (err) {
              return reject(err);
            }

            // Store the old total main wallet balance
            OldTotalBalance = totalRevenueWalletResults[0]
              ? totalRevenueWalletResults[0].revenue_wallet_total_balance
              : null;

            // Query for the old revenue balance
            pool.query(
              "SELECT vendor_wallet_balance FROM top_up WHERE vendor_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
              [VendorWalletId,vFolio],
              (err, vendorWalletResults) => {
                if (err) {
                  return reject(err);
                }

                // Store the old revenue balance
                OldVendorBalance = vendorWalletResults[0]
                  ? vendorWalletResults[0].vendor_wallet_balance
                  : null;

                // Query for the old total revenue balance
                pool.query(
                  "SELECT vendor_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
                  [vFolio],
                  (err, totalVendorResults) => {
                    if (err) {
                      return reject(err);
                    }

                    // Store the old total revenue balance
                    OldVendorTotalBalance = totalVendorResults[0]
                      ? totalVendorResults[0].vendor_wallet_total_balance
                      : null;

                    // Calculate the new revenue wallet balance and total balance
                    let newRevenueWalletBalance = OldBalance + commission;
                    let newRevenueWalletTotalBalance =
                      OldTotalBalance + commission;

                    // Calculate the new user wallet balance and total
                    let newVendorBalance = OldVendorBalance - commission;
                    let newVendorTotalBalance = OldVendorTotalBalance - commission;

                    RevenueWalletId,
                      newRevenueWalletBalance, // New main wallet balance
                      newRevenueWalletTotalBalance,
                      (currency = "USD"),
                      (exchange_rate = ""),
                      (date = date),
                      (description = description),
                      (client_profile_id = ""),
                      (vendor_id = VendorWalletId),
                      (payment_gateway_id = ""),
                      (main_wallet_id = " "),
                      (revenue_wallet_id = RevenueWalletId),
                      (amount = ""),
                      (trip_id = ""),
                      (trxn_code = "CM"),
                      (user_wallet_debit = " "),
                      (user_wallet_credit = ""),
                      (user_wallet_balance = ""),
                      (user_wallet_total_balance = ""),
                      (main_wallet_debit = ""),
                      (main_wallet_credit = " "),
                      (main_wallet_balance = " "),
                      (main_wallet_total_balance = " "),
                      (payment_gateway_charges_debit = ""),
                      (payment_gateway_charges_credit = ""),
                      (payment_gateway_charges_balance = ""),
                      (payment_gateway_charges_total_balance = ""),
                      (revenue_wallet_debit = ""),
                      (revenue_wallet_credit = ""),
                      (revenue_wallet_balance = ""),
                      (revenue_wallet_total_balance =""),
                      (vendor_wallet_debit = ""),
                      (vendor_wallet_credit = commission),
                      (vendor_wallet_balance = newVendorBalance),
                      (vendor_wallet_total_balance = newVendorTotalBalance),
                      (escrow_debit = ""),
                      (escrow_credit = ""),
                      (escrow_balance = ""),
                      (escrow_total_balance = ""),
                      (folio = "VW");

                    // Insert new main wallet balance and updated total balance
                    pool.query(
                    "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) " +
  "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                      [
                        currency,
                        exchange_rate,
                        date,
                        description,
                        client_profile_id,
                        vendor_id,
                        payment_gateway_id,
                        main_wallet_id,
                        revenue_wallet_id,
                        amount,
                        trip_id,
                        trxn_code,
                        user_wallet_debit,
                        user_wallet_credit,
                        user_wallet_balance,
                        user_wallet_total_balance,
                        main_wallet_debit,
                        main_wallet_credit,
                        main_wallet_balance,
                        main_wallet_total_balance,
                        payment_gateway_charges_debit,
                        payment_gateway_charges_credit,
                        payment_gateway_charges_balance,
                        payment_gateway_charges_total_balance,
                        revenue_wallet_debit,
                        revenue_wallet_credit,
                        revenue_wallet_balance,
                        revenue_wallet_total_balance,
                        vendor_wallet_debit,
                        vendor_wallet_credit,
                        vendor_wallet_balance,
                        vendor_wallet_total_balance,
                        escrow_debit,
                        escrow_credit,
                        escrow_balance,
                        escrow_total_balance,
                        folio,
                      ],
                      (err, insertResults) => {
                        if (err) {
                          return reject(err);
                        }


                        
                    RevenueWalletId,
                    newRevenueWalletBalance, // New main wallet balance
                    newRevenueWalletTotalBalance,
                    (currency = "USD"),
                    (exchange_rate = ""),
                    (date = date),
                    (description = description),
                    (client_profile_id = ""),
                    (vendor_id = VendorWalletId),
                    (payment_gateway_id = ""),
                    (main_wallet_id = " "),
                    (revenue_wallet_id = RevenueWalletId),
                    (amount = ""),
                    (trip_id = ""),
                    (trxn_code = "CM"),
                    (user_wallet_debit = " "),
                    (user_wallet_credit = ""),
                    (user_wallet_balance = ""),
                    (user_wallet_total_balance = ""),
                    (main_wallet_debit = ""),
                    (main_wallet_credit = " "),
                    (main_wallet_balance = " "),
                    (main_wallet_total_balance = " "),
                    (payment_gateway_charges_debit = ""),
                    (payment_gateway_charges_credit = ""),
                    (payment_gateway_charges_balance = ""),
                    (payment_gateway_charges_total_balance = ""),
                    (revenue_wallet_debit = commission),
                    (revenue_wallet_credit = ""),
                    (revenue_wallet_balance = newRevenueWalletBalance),
                    (revenue_wallet_total_balance =
                      newRevenueWalletTotalBalance),
                    (vendor_wallet_debit = ""),
                    (vendor_wallet_credit = " "),
                    (vendor_wallet_balance = " "),
                    (vendor_wallet_total_balance = " "),
                    (escrow_debit = ""),
                    (escrow_credit = ""),
                    (escrow_balance = ""),
                    (escrow_total_balance = ""),
                    (folio = "RW");

                        // Insert new revenue balance and updated total balance
                        pool.query(
                       "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) " +
  "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                          [
                            currency,
                            exchange_rate,
                            date,
                            description,
                            client_profile_id,
                            vendor_id,
                            payment_gateway_id,
                            main_wallet_id,
                            revenue_wallet_id,
                            amount,
                            trip_id,
                            trxn_code,
                            user_wallet_debit,
                            user_wallet_credit,
                            user_wallet_balance,
                            user_wallet_total_balance,
                            main_wallet_debit,
                            main_wallet_credit,
                            main_wallet_balance,
                            main_wallet_total_balance,
                            payment_gateway_charges_debit,
                            payment_gateway_charges_credit,
                            payment_gateway_charges_balance,
                            payment_gateway_charges_total_balance,
                            revenue_wallet_debit,
                            revenue_wallet_credit,
                            revenue_wallet_balance,
                            revenue_wallet_total_balance,
                            vendor_wallet_debit,
                            vendor_wallet_credit,
                            vendor_wallet_balance,
                            vendor_wallet_total_balance,
                            escrow_debit,
                            escrow_credit,
                            escrow_balance,
                            escrow_total_balance,
                            folio,
                          ],
                          (err, revenueInsertResults) => {
                            if (err) {
                              return reject(err);
                            }

                            // Resolve with all results
                            return resolve({
                              results,
                              insertResults,
                              revenueInsertResults,
                            });
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

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// get top up user wallet

crudsObj.getTopUpUserWallet = (
  depositedAmount,
  UserWalletId,
  mainWalletId,
  RevenueWalletId

  //####################################
) => {
  return new Promise((resolve, reject) => {
    let currency = "";
    let exchange_rate = "";
    let date = "";
    let description = "";
    let client_profile_id = "";
    let vendor_id = "";
    let payment_gateway_id = "";
    let main_wallet_id = "";
    let revenue_wallet_id = "";
    let amount = "";
    let trip_id = "";
    let trxn_code = "";
    let user_wallet_debit = "";
    let user_wallet_credit = "";
    let user_wallet_balance = "";
    let user_wallet_total_balance = "";
    let main_wallet_debit = "";
    let main_wallet_credit = "";
    let main_wallet_balance = "";
    let main_wallet_total_balance = "";
    let payment_gateway_charges_debit = "";
    let payment_gateway_charges_credit = "";
    let payment_gateway_charges_balance = "";
    let payment_gateway_charges_total_balance = "";
    let revenue_wallet_debit = "";
    let revenue_wallet_credit = "";
    let revenue_wallet_balance = "";
    let revenue_wallet_total_balance = "";
    let vendor_wallet_debit = "";
    let vendor_wallet_credit = "";
    let vendor_wallet_balance = "";
    let vendor_wallet_total_balance = "";
    let escrow_debit = "";
    let escrow_credit = "";
    let escrow_balance = "";
    let escrow_total_balance = "";
    let folio = "";
    let uFolio = "UW";
    let mFolio = "MW";
    let rFolio = "RW";

    // Create an object to hold the results
    const results = {};
    let OldUserBalance, OldUserTotalBalance, OldMainBalance, OldMainTotalBalance, OldRevenueBalance, OldRevenueTotalBalance;
    

    pool.query(
      "SELECT revenue_wallet_balance FROM top_up WHERE revenue_wallet_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
      [RevenueWalletId,rFolio],
      (err, revenueWalletResults) => {
        if (err) {
          return reject(err);
        }

        // Store the old main wallet balance
        OldRevenueBalance = revenueWalletResults[0]
          ? revenueWalletResults[0].revenue_wallet_balance
          : null;

        // Query for the old total main wallet balance
        pool.query(
          "SELECT revenue_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
          [rFolio],
          (err, totalRevenueWalletResults) => {
            if (err) {
              return reject(err);
            }

            // Store the old total main wallet balance
            OldRevenueTotalBalance = totalRevenueWalletResults[0]
              ? totalRevenueWalletResults[0].revenue_wallet_total_balance
              : null;

            // Query for the old revenue balance
            pool.query(
              "SELECT user_wallet_balance FROM top_up WHERE client_profile_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
              [UserWalletId,uFolio],
              (err, userWalletResults) => {
                if (err) {
                  return reject(err);
                }

                // Store the old revenue balance
                OldUserBalance = userWalletResults[0]
                  ? userWalletResults[0].user_wallet_balance
                  : null;

                // Query for the old total revenue balance
                pool.query(
                  "SELECT user_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
                  [uFolio],
                  (err, totalUserResults) => {
                    if (err) {
                      return reject(err);
                    }

                    // Store the old total revenue balance
                    OldUserTotalBalance = totalUserResults[0]
                      ? totalUserResults[0].user_wallet_total_balance
                      : null;


            // Query for the old revenue balance
            pool.query(
              "SELECT main_wallet_balance FROM top_up WHERE main_wallet_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
              [mainWalletId,mFolio],
              (err, mainWalletResults) => {
                if (err) {
                  return reject(err);
                }

                // Store the old revenue balance
                OldMainBalance = mainWalletResults[0]
                  ? mainWalletResults[0].main_wallet_balance
                  : null;

                // Query for the old total revenue balance
                pool.query(
                  "SELECT main_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
                  [mFolio],
                  (err, totalMainResults) => {
                    if (err) {
                      return reject(err);
                    }

                    // Store the old total revenue balance
                    OldMainTotalBalance = totalMainResults[0]
                      ? totalMainResults[0].main_wallet_total_balance
                      : null;

                    // Calculate the new revenue wallet balance and total balance
                    let newUserBalance = OldUserBalance + depositedAmount;
                    let newUserWalletTotalBalance =
                      OldUserTotalBalance + depositedAmount;

                    // Calculate the new user wallet balance and total
                    let newMainBalance = OldMainBalance + depositedAmount;
                    let newMainTotalBalance =
                      OldMainTotalBalance + depositedAmount;

                    // Calculate the new revenue wallet balance and total
                    let newRevenueBalance = OldRevenueBalance + depositedAmount;
                    let newRevenueTotalBalance = 
                      OldRevenueTotalBalance + depositedAmount;
                      

                      UserWalletId,
                      newUserBalance, // New main wallet balance
                      newUserWalletTotalBalance,
                      (currency = ""),
                      (exchange_rate = ""),
                      (date = ""),
                      (description = ""),
                      (client_profile_id = UserWalletId),
                      (vendor_id = " "),
                      (payment_gateway_id = ""),
                      (main_wallet_id = mainWalletId),
                      (revenue_wallet_id = RevenueWalletId),
                      (amount = ""),
                      (trip_id = ""),
                      (trxn_code = ""),
                      (user_wallet_debit = depositedAmount),
                      (user_wallet_credit = ""),
                      (user_wallet_balance = newUserBalance),
                      (user_wallet_total_balance = newUserWalletTotalBalance),
                      (main_wallet_debit = ""),
                      (main_wallet_credit = ""),
                      (main_wallet_balance = ""),
                      (main_wallet_total_balance = ""),
                      (payment_gateway_charges_debit = ""),
                      (payment_gateway_charges_credit = ""),
                      (payment_gateway_charges_balance = ""),
                      (payment_gateway_charges_total_balance = ""),
                      (revenue_wallet_debit = depositedAmount),
                      (revenue_wallet_credit = ""),
                      (revenue_wallet_balance = " "),
                      (revenue_wallet_total_balance = " "),
                      (vendor_wallet_debit = ""),
                      (vendor_wallet_credit = " "),
                      (vendor_wallet_balance = " "),
                      (vendor_wallet_total_balance = " "),
                      (escrow_debit = ""),
                      (escrow_credit = ""),
                      (escrow_balance = ""),
                      (escrow_total_balance = ""),
                      (folio = "UW");

                    // Insert new main wallet balance and updated total balance
                    pool.query(
"INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) " +
" VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                      [
                        currency,
                        exchange_rate,
                        date,
                        description,
                        client_profile_id,
                        vendor_id,
                        payment_gateway_id,
                        main_wallet_id,
                        revenue_wallet_id,
                        amount,
                        trip_id,
                        trxn_code,
                        user_wallet_debit,
                        user_wallet_credit,
                        user_wallet_balance,
                        user_wallet_total_balance,
                        main_wallet_debit,
                        main_wallet_credit,
                        main_wallet_balance,
                        main_wallet_total_balance,
                        payment_gateway_charges_debit,
                        payment_gateway_charges_credit,
                        payment_gateway_charges_balance,
                        payment_gateway_charges_total_balance,
                        revenue_wallet_debit,
                        revenue_wallet_credit,
                        revenue_wallet_balance,
                        revenue_wallet_total_balance,
                        vendor_wallet_debit,
                        vendor_wallet_credit,
                        vendor_wallet_balance,
                        vendor_wallet_total_balance,
                        escrow_debit,
                        escrow_credit,
                        escrow_balance,
                        escrow_total_balance,
                        folio,
                      ],
                      (err, insertResults) => {
                        if (err) {
                          return reject(err);
                        }



                      (currency = ""),
                      (exchange_rate = ""),
                      (date = ""),
                      (description = ""),
                      (client_profile_id = UserWalletId),
                      (vendor_id = " "),
                      (payment_gateway_id = ""),
                      (main_wallet_id = mainWalletId),
                      (revenue_wallet_id = RevenueWalletId),
                      (amount = ""),
                      (trip_id = ""),
                      (trxn_code = ""),
                      (user_wallet_debit = ""),
                      (user_wallet_credit = ""),
                      (user_wallet_balance = ""),
                      (user_wallet_total_balance = ""),
                      (main_wallet_debit = depositedAmount),
                      (main_wallet_credit = " "),
                      (main_wallet_balance = newMainBalance),
                      (main_wallet_total_balance = newMainTotalBalance),
                      (payment_gateway_charges_debit = ""),
                      (payment_gateway_charges_credit = ""),
                      (payment_gateway_charges_balance = ""),
                      (payment_gateway_charges_total_balance = ""),
                      (revenue_wallet_debit = depositedAmount),
                      (revenue_wallet_credit = ""),
                      (revenue_wallet_balance = " "),
                      (revenue_wallet_total_balance = " "),
                      (vendor_wallet_debit = ""),
                      (vendor_wallet_credit = " "),
                      (vendor_wallet_balance = " "),
                      (vendor_wallet_total_balance = " "),
                      (escrow_debit = ""),
                      (escrow_credit = ""),
                      (escrow_balance = ""),
                      (escrow_total_balance = ""),
                      (folio = "MW");

                        // Insert new revenue balance and updated total balance
                        pool.query(
                        "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) " +
" VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                          [
                            currency,
                            exchange_rate,
                            date,
                            description,
                            client_profile_id,
                            vendor_id,
                            payment_gateway_id,
                            main_wallet_id,
                            revenue_wallet_id,
                            amount,
                            trip_id,
                            trxn_code,
                            user_wallet_debit,
                            user_wallet_credit,
                            user_wallet_balance,
                            user_wallet_total_balance,
                            main_wallet_debit,
                            main_wallet_credit,
                            main_wallet_balance,
                            main_wallet_total_balance,
                            payment_gateway_charges_debit,
                            payment_gateway_charges_credit,
                            payment_gateway_charges_balance,
                            payment_gateway_charges_total_balance,
                            revenue_wallet_debit,
                            revenue_wallet_credit,
                            revenue_wallet_balance,
                            revenue_wallet_total_balance,
                            vendor_wallet_debit,
                            vendor_wallet_credit,
                            vendor_wallet_balance,
                            vendor_wallet_total_balance,
                            escrow_debit,
                            escrow_credit,
                            escrow_balance,
                            escrow_total_balance,
                            folio,
                          ],
                          (err, revenueInsertResults) => {
                            if (err) {
                              return reject(err);
                            }

                            (currency = ""),
                            (exchange_rate = ""),
                            (date = ""),
                            (description = ""),
                            (client_profile_id = UserWalletId),
                            (vendor_id = ""),
                            (payment_gateway_id = ""),
                            (main_wallet_id = mainWalletId),
                            (revenue_wallet_id = RevenueWalletId),
                            (amount = ""),
                            (trip_id = ""),
                            (trxn_code = ""),
                            (user_wallet_debit = ""),
                            (user_wallet_credit = ""),
                            (user_wallet_balance = ""),
                            (user_wallet_total_balance = ""),
                            (main_wallet_debit = ""),
                            (main_wallet_credit = ""),
                            (main_wallet_balance = ""),
                            (main_wallet_total_balance = ""),
                            (payment_gateway_charges_debit = ""),
                            (payment_gateway_charges_credit = ""),
                            (payment_gateway_charges_balance = ""),
                            (payment_gateway_charges_total_balance = ""),
                            (revenue_wallet_debit = depositedAmount),
                            (revenue_wallet_credit = ""),
                            (revenue_wallet_balance = newRevenueBalance),
                            (revenue_wallet_total_balance = newRevenueTotalBalance),
                            (vendor_wallet_debit = ""),
                            (vendor_wallet_credit = ""),
                            (vendor_wallet_balance = ""),
                            (vendor_wallet_total_balance = ""),
                            (escrow_debit = ""),
                            (escrow_credit = ""),
                            (escrow_balance = ""),
                            (escrow_total_balance = ""),
                            (folio = "RW");
      
    
                            //Insert 
                            pool.query(
                              "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio)" +
                                " VALUES (?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?)",
                              [
                                currency,
                                exchange_rate,
                                date,
                                description,
                                client_profile_id,
                                vendor_id,
                                payment_gateway_id,
                                main_wallet_id,
                                revenue_wallet_id,
                                amount,
                                trip_id,
                                trxn_code,
                                user_wallet_debit,
                                user_wallet_credit,
                                user_wallet_balance,
                                user_wallet_total_balance,
                                main_wallet_debit,
                                main_wallet_credit,
                                main_wallet_balance,
                                main_wallet_total_balance,
                                payment_gateway_charges_debit,
                                payment_gateway_charges_credit,
                                payment_gateway_charges_balance,
                                payment_gateway_charges_total_balance,
                                revenue_wallet_debit,
                                revenue_wallet_credit,
                                revenue_wallet_balance,
                                revenue_wallet_total_balance,
                                vendor_wallet_debit,
                                vendor_wallet_credit,
                                vendor_wallet_balance,
                                vendor_wallet_total_balance,
                                escrow_debit,
                                escrow_credit,
                                escrow_balance,
                                escrow_total_balance,
                                folio,
                              ],
                              (err, revenueInsertResults) => {
                                if (err) {
                                  return reject(err);
                                }
    
                                // Resolve with all results
                                return resolve({
                                  results,
                                  insertResults,
                                  revenueInsertResults,
                                });
                              
                            // Resolve with all results
                            return resolve({
                              results,
                              insertResults,
                              revenueInsertResults,
                            });
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
      });
  });
});
}
// /////////////////////////////////////////////////////////////////////////////////////////////////////////

// get by escrow security intransit
crudsObj.getEscrowSecurityIntransit = (
  withdrawalAmount,
  userWalletId,
  EscrowId
  //####################################
) => {
  return new Promise((resolve, reject) => {
    let currency = "";
    let exchange_rate = "";
    let date = "";
    let description = "";
    let client_profile_id = "";
    let vendor_id = "";
    let payment_gateway_id = "";
    let main_wallet_id = "";
    let revenue_wallet_id = "";
    let amount = "";
    let trip_id = "";
    let trxn_code = "";
    let user_wallet_debit = "";
    let user_wallet_credit = "";
    let user_wallet_balance = "";
    let user_wallet_total_balance = "";
    let main_wallet_debit = "";
    let main_wallet_credit = "";
    let main_wallet_balance = "";
    let main_wallet_total_balance = "";
    let payment_gateway_charges_debit = "";
    let payment_gateway_charges_credit = "";
    let payment_gateway_charges_balance = "";
    let payment_gateway_charges_total_balance = "";
    let revenue_wallet_debit = "";
    let revenue_wallet_credit = "";
    let revenue_wallet_balance = "";
    let revenue_wallet_total_balance = "";
    let vendor_wallet_debit = "";
    let vendor_wallet_credit = "";
    let vendor_wallet_balance = "";
    let vendor_wallet_total_balance = "";
    let escrow_debit = "";
    let escrow_credit = "";
    let escrow_balance = "";
    let escrow_total_balance = "";
    let folio = "";
    let uFolio = "UW";
    let eFolio = "EW";

    // Create an object to hold the results
    const results = {};
    let OldBalance, OldTotalBalance, OldEscrowBalance, OldEscrowTotalBalance;

    // Query for the old main wallet balance
    pool.query(
      "SELECT user_wallet_balance FROM top_up WHERE client_profile_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
      [userWalletId,uFolio],
      (err, userWalletResults) => {
        if (err) {
          return reject(err);
        }

        // Store the old main wallet balance
        OldBalance = userWalletResults[0]
          ? userWalletResults[0].user_wallet_balance
          : null;

        // Query for the old total main wallet balance
        pool.query(
          "SELECT user_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
          [uFolio],
          (err, totalUserWalletResults) => {
            if (err) {
              return reject(err);
            }

            // Store the old total main wallet balance
            OldTotalBalance = totalUserWalletResults[0]
              ? totalUserWalletResults[0].user_wallet_total_balance
              : null;

            // Query for the old revenue balance
            pool.query(
              "SELECT escrow_balance FROM top_up WHERE escrow_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
              [EscrowId,eFolio],
              (err, EscrowWalletResults) => {
                if (err) {
                  return reject(err);
                }

                // Store the old revenue balance
                OldEscrowBalance = EscrowWalletResults[0]
                  ? EscrowWalletResults[0].escrow_balance
                  : null;

                // Query for the old total revenue balance
                pool.query(
                  "SELECT escrow_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
                  [eFolio],
                  (err, totalEscrowResults) => {
                    if (err) {
                      return reject(err);
                    }

                    // Store the old total revenue balance
                    OldEscrowTotalBalance = totalEscrowResults[0]
                      ? totalEscrowResults[0].escrow_total_balance
                      : null;

                    // Calculate the new main wallet balance and total balance
                    let newUserWalletBalance = OldBalance - withdrawalAmount;
                    let newUserWalletTotalBalance =
                      OldTotalBalance - withdrawalAmount;

                    // Calculate the new revenue wallet balance and total
                    let newEscrowBalance = OldEscrowBalance + withdrawalAmount;
                    let newEsacrowTotalBalance =
                      OldEscrowTotalBalance + withdrawalAmount;

                      userWalletId,
                      newUserWalletBalance, // New main wallet balance
                      newUserWalletTotalBalance,
                      (currency = ""),
                      (exchange_rate = ""),
                      (date = ""),
                      (description = ""),
                      (client_profile_id = userWalletId),
                      (vendor_id = " "),
                      (payment_gateway_id = ""),
                      (main_wallet_id = " "),
                      (revenue_wallet_id = ""),
                      (amount = ""),
                      (trip_id = ""),
                      (trxn_code = ""),
                      (user_wallet_debit = ""),
                      (user_wallet_credit = withdrawalAmount),
                      (user_wallet_balance = newUserWalletBalance),
                      (user_wallet_total_balance = newUserWalletTotalBalance),
                      (main_wallet_debit = ""),
                      (main_wallet_credit = " "),
                      (main_wallet_balance = ""),
                      (main_wallet_total_balance = ""),
                      (payment_gateway_charges_debit = ""),
                      (payment_gateway_charges_credit = ""),
                      (payment_gateway_charges_balance = ""),
                      (payment_gateway_charges_total_balance = ""),
                      (revenue_wallet_debit = ""),
                      (revenue_wallet_credit = ""),
                      (revenue_wallet_balance = ""),
                      (revenue_wallet_total_balance = ""),
                      (vendor_wallet_debit = ""),
                      (vendor_wallet_credit = ""),
                      (vendor_wallet_balance = ""),
                      (vendor_wallet_total_balance = ""),
                      (escrow_debit = ""),
                      (escrow_credit = ""),
                      (escrow_balance = ""),
                      (escrow_total_balance = ""),
                      (folio = "UW");

                    // Insert new main wallet balance and updated total balance
                    pool.query(
"INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) " +
" VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                      [
                        currency,
                        exchange_rate,
                        date,
                        description,
                        client_profile_id,
                        vendor_id,
                        payment_gateway_id,
                        main_wallet_id,
                        revenue_wallet_id,
                        amount,
                        trip_id,
                        trxn_code,
                        user_wallet_debit,
                        user_wallet_credit,
                        user_wallet_balance,
                        user_wallet_total_balance,
                        main_wallet_debit,
                        main_wallet_credit,
                        main_wallet_balance,
                        main_wallet_total_balance,
                        payment_gateway_charges_debit,
                        payment_gateway_charges_credit,
                        payment_gateway_charges_balance,
                        payment_gateway_charges_total_balance,
                        revenue_wallet_debit,
                        revenue_wallet_credit,
                        revenue_wallet_balance,
                        revenue_wallet_total_balance,
                        vendor_wallet_debit,
                        vendor_wallet_credit,
                        vendor_wallet_balance,
                        vendor_wallet_total_balance,
                        escrow_debit,
                        escrow_credit,
                        escrow_balance,
                        escrow_total_balance,
                        folio,
                      ],
                      (err, insertResults) => {
                        if (err) {
                          return reject(err);
                        }



                        userWalletId,
                        newUserWalletBalance, // New main wallet balance
                        newUserWalletTotalBalance,
                        (currency = ""),
                        (exchange_rate = ""),
                        (date = ""),
                        (description = ""),
                        (client_profile_id = userWalletId),
                        (vendor_id = " "),
                        (payment_gateway_id = ""),
                        (main_wallet_id = " "),
                        (revenue_wallet_id = ""),
                        (amount = ""),
                        (trip_id = ""),
                        (trxn_code = ""),
                        (user_wallet_debit = ""),
                        (user_wallet_credit = ""),
                        (user_wallet_balance = ""),
                        (user_wallet_total_balance = ""),
                        (main_wallet_debit = ""),
                        (main_wallet_credit = " "),
                        (main_wallet_balance = ""),
                        (main_wallet_total_balance = ""),
                        (payment_gateway_charges_debit = ""),
                        (payment_gateway_charges_credit = ""),
                        (payment_gateway_charges_balance = ""),
                        (payment_gateway_charges_total_balance = ""),
                        (revenue_wallet_debit = ""),
                        (revenue_wallet_credit = ""),
                        (revenue_wallet_balance = ""),
                        (revenue_wallet_total_balance = ""),
                        (vendor_wallet_debit = ""),
                        (vendor_wallet_credit = ""),
                        (vendor_wallet_balance = ""),
                        (vendor_wallet_total_balance = ""),
                        (escrow_debit = withdrawalAmount),
                        (escrow_credit = ""),
                        (escrow_balance = newEscrowBalance),
                        (escrow_total_balance = newEsacrowTotalBalance),
                        (folio = "EW");
  



                        // Insert new revenue balance and updated total balance
                        pool.query(
                          "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) " +
" VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                          [
                            currency,
                            exchange_rate,
                            date,
                            description,
                            client_profile_id,
                            vendor_id,
                            payment_gateway_id,
                            main_wallet_id,
                            revenue_wallet_id,
                            amount,
                            trip_id,
                            trxn_code,
                            user_wallet_debit,
                            user_wallet_credit,
                            user_wallet_balance,
                            user_wallet_total_balance,
                            main_wallet_debit,
                            main_wallet_credit,
                            main_wallet_balance,
                            main_wallet_total_balance,
                            payment_gateway_charges_debit,
                            payment_gateway_charges_credit,
                            payment_gateway_charges_balance,
                            payment_gateway_charges_total_balance,
                            revenue_wallet_debit,
                            revenue_wallet_credit,
                            revenue_wallet_balance,
                            revenue_wallet_total_balance,
                            vendor_wallet_debit,
                            vendor_wallet_credit,
                            vendor_wallet_balance,
                            vendor_wallet_total_balance,
                            escrow_debit,
                            escrow_credit,
                            escrow_balance,
                            escrow_total_balance,
                            folio,
                          ],
                          (err, revenueInsertResults) => {
                            if (err) {
                              return reject(err);
                            }

                            // Resolve with all results
                            return resolve({
                              results,
                              insertResults,
                              revenueInsertResults,
                            });
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

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////

// get by escrow security end with success
crudsObj.getEscrowSecurityEndWithSuccess = (
  withdrawalAmount,
  userWalletId,
  EscrowId
  //####################################
) => {
  return new Promise((resolve, reject) => {
    let currency = "";
    let exchange_rate = "";
    let date = "";
    let description = "";
    let client_profile_id = "";
    let vendor_id = "";
    let payment_gateway_id = "";
    let main_wallet_id = "";
    let revenue_wallet_id = "";
    let amount = "";
    let trip_id = "";
    let trxn_code = "";
    let user_wallet_debit = "";
    let user_wallet_credit = "";
    let user_wallet_balance = "";
    let user_wallet_total_balance = "";
    let main_wallet_debit = "";
    let main_wallet_credit = "";
    let main_wallet_balance = "";
    let main_wallet_total_balance = "";
    let payment_gateway_charges_debit = "";
    let payment_gateway_charges_credit = "";
    let payment_gateway_charges_balance = "";
    let payment_gateway_charges_total_balance = "";
    let revenue_wallet_debit = "";
    let revenue_wallet_credit = "";
    let revenue_wallet_balance = "";
    let revenue_wallet_total_balance = "";
    let vendor_wallet_debit = "";
    let vendor_wallet_credit = "";
    let vendor_wallet_balance = "";
    let vendor_wallet_total_balance = "";
    let escrow_debit = "";
    let escrow_credit = "";
    let escrow_balance = "";
    let escrow_total_balance = "";
    let folio = "";
    let uFolio = "UW";
    let eFolio = "EW";

    // Create an object to hold the results
    const results = {};
    let OldBalance, OldTotalBalance, OldEscrowBalance, OldEscrowTotalBalance;

    // Query for the old main wallet balance
    pool.query(
      "SELECT user_wallet_balance FROM top_up WHERE client_profile_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
      [userWalletId,uFolio],
      (err, userWalletResults) => {
        if (err) {
          return reject(err);
        }

        // Store the old main wallet balance
        OldBalance = userWalletResults[0]
          ? userWalletResults[0].user_wallet_balance
          : null;

        // Query for the old total main wallet balance
        pool.query(
          "SELECT user_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
          [uFolio],
          (err, totalUserWalletResults) => {
            if (err) {
              return reject(err);
            }

            // Store the old total main wallet balance
            OldTotalBalance = totalUserWalletResults[0]
              ? totalUserWalletResults[0].user_wallet_total_balance
              : null;

            // Query for the old revenue balance
            pool.query(
              "SELECT escrow_balance FROM top_up WHERE escrow_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
              [EscrowId,eFolio],
              (err, EscrowWalletResults) => {
                if (err) {
                  return reject(err);
                }

                // Store the old revenue balance
                OldEscrowBalance = EscrowWalletResults[0]
                  ? EscrowWalletResults[0].escrow_balance
                  : null;

                // Query for the old total revenue balance
                pool.query(
                  "SELECT escrow_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
                  [eFolio],
                  (err, totalEscrowResults) => {
                    if (err) {
                      return reject(err);
                    }

                    // Store the old total revenue balance
                    OldEscrowTotalBalance = totalEscrowResults[0]
                      ? totalEscrowResults[0].escrow_total_balance
                      : null;

                    // Calculate the new main wallet balance and total balance
                    let newUserWalletBalance = OldBalance + withdrawalAmount;
                    let newUserWalletTotalBalance =
                      OldTotalBalance + withdrawalAmount;

                    // Calculate the new revenue wallet balance and total
                    let newEscrowBalance = OldEscrowBalance - withdrawalAmount;
                    let newEsacrowTotalBalance =
                      OldEscrowTotalBalance - withdrawalAmount;

                      userWalletId,
                      newUserWalletBalance, // New main wallet balance
                      newUserWalletTotalBalance,
                      (currency = ""),
                      (exchange_rate = ""),
                      (date = ""),
                      (description = ""),
                      (client_profile_id = userWalletId),
                      (vendor_id = " "),
                      (payment_gateway_id = ""),
                      (main_wallet_id = " "),
                      (revenue_wallet_id = ""),
                      (amount = ""),
                      (trip_id = ""),
                      (trxn_code = ""),
                      (user_wallet_debit = withdrawalAmount),
                      (user_wallet_credit = ""),
                      (user_wallet_balance = newUserWalletBalance),
                      (user_wallet_total_balance = newUserWalletTotalBalance),
                      (main_wallet_debit = ""),
                      (main_wallet_credit = " "),
                      (main_wallet_balance = ""),
                      (main_wallet_total_balance = ""),
                      (payment_gateway_charges_debit = ""),
                      (payment_gateway_charges_credit = ""),
                      (payment_gateway_charges_balance = ""),
                      (payment_gateway_charges_total_balance = ""),
                      (revenue_wallet_debit = ""),
                      (revenue_wallet_credit = ""),
                      (revenue_wallet_balance = ""),
                      (revenue_wallet_total_balance = ""),
                      (vendor_wallet_debit = ""),
                      (vendor_wallet_credit = ""),
                      (vendor_wallet_balance = ""),
                      (vendor_wallet_total_balance = ""),
                      (escrow_debit = ""),
                      (escrow_credit = ""),
                      (escrow_balance = ""),
                      (escrow_total_balance = ""),
                      (folio = "UW");

                    // Insert new main wallet balance and updated total balance
                    pool.query(
"INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) " +
" VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                      [
                        currency,
                        exchange_rate,
                        date,
                        description,
                        client_profile_id,
                        vendor_id,
                        payment_gateway_id,
                        main_wallet_id,
                        revenue_wallet_id,
                        amount,
                        trip_id,
                        trxn_code,
                        user_wallet_debit,
                        user_wallet_credit,
                        user_wallet_balance,
                        user_wallet_total_balance,
                        main_wallet_debit,
                        main_wallet_credit,
                        main_wallet_balance,
                        main_wallet_total_balance,
                        payment_gateway_charges_debit,
                        payment_gateway_charges_credit,
                        payment_gateway_charges_balance,
                        payment_gateway_charges_total_balance,
                        revenue_wallet_debit,
                        revenue_wallet_credit,
                        revenue_wallet_balance,
                        revenue_wallet_total_balance,
                        vendor_wallet_debit,
                        vendor_wallet_credit,
                        vendor_wallet_balance,
                        vendor_wallet_total_balance,
                        escrow_debit,
                        escrow_credit,
                        escrow_balance,
                        escrow_total_balance,
                        folio,
                      ],
                      (err, insertResults) => {
                        if (err) {
                          return reject(err);
                        }



                        userWalletId,
                        newUserWalletBalance, // New main wallet balance
                        newUserWalletTotalBalance,
                        (currency = ""),
                        (exchange_rate = ""),
                        (date = ""),
                        (description = ""),
                        (client_profile_id = userWalletId),
                        (vendor_id = " "),
                        (payment_gateway_id = ""),
                        (main_wallet_id = " "),
                        (revenue_wallet_id = ""),
                        (amount = ""),
                        (trip_id = ""),
                        (trxn_code = ""),
                        (user_wallet_debit = ""),
                        (user_wallet_credit = ""),
                        (user_wallet_balance = ""),
                        (user_wallet_total_balance = ""),
                        (main_wallet_debit = ""),
                        (main_wallet_credit = " "),
                        (main_wallet_balance = ""),
                        (main_wallet_total_balance = ""),
                        (payment_gateway_charges_debit = ""),
                        (payment_gateway_charges_credit = ""),
                        (payment_gateway_charges_balance = ""),
                        (payment_gateway_charges_total_balance = ""),
                        (revenue_wallet_debit = ""),
                        (revenue_wallet_credit = ""),
                        (revenue_wallet_balance = ""),
                        (revenue_wallet_total_balance = ""),
                        (vendor_wallet_debit = ""),
                        (vendor_wallet_credit = ""),
                        (vendor_wallet_balance = ""),
                        (vendor_wallet_total_balance = ""),
                        (escrow_debit = ""),
                        (escrow_credit = withdrawalAmount),
                        (escrow_balance = newEscrowBalance),
                        (escrow_total_balance = newEsacrowTotalBalance),
                        (folio = "EW");
  



                        // Insert new revenue balance and updated total balance
                        pool.query(
                          "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) " +
" VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                          [
                            currency,
                            exchange_rate,
                            date,
                            description,
                            client_profile_id,
                            vendor_id,
                            payment_gateway_id,
                            main_wallet_id,
                            revenue_wallet_id,
                            amount,
                            trip_id,
                            trxn_code,
                            user_wallet_debit,
                            user_wallet_credit,
                            user_wallet_balance,
                            user_wallet_total_balance,
                            main_wallet_debit,
                            main_wallet_credit,
                            main_wallet_balance,
                            main_wallet_total_balance,
                            payment_gateway_charges_debit,
                            payment_gateway_charges_credit,
                            payment_gateway_charges_balance,
                            payment_gateway_charges_total_balance,
                            revenue_wallet_debit,
                            revenue_wallet_credit,
                            revenue_wallet_balance,
                            revenue_wallet_total_balance,
                            vendor_wallet_debit,
                            vendor_wallet_credit,
                            vendor_wallet_balance,
                            vendor_wallet_total_balance,
                            escrow_debit,
                            escrow_credit,
                            escrow_balance,
                            escrow_total_balance,
                            folio,
                          ],
                          (err, revenueInsertResults) => {
                            if (err) {
                              return reject(err);
                            }

                            // Resolve with all results
                            return resolve({
                              results,
                              insertResults,
                              revenueInsertResults,
                            });
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// get pay delivery from wallet
crudsObj.getPayDeliveryWallet = (
  withdrawalAmount,
  userWalletId,
  RevenueId,
  VendorId
) => {
  return new Promise((resolve, reject) => {
    let currency = "";
    let exchange_rate = "";
    let date = "";
    let description = "";
    let client_profile_id = "";
    let vendor_id = "";
    let payment_gateway_id = "";
    let main_wallet_id = "";
    let revenue_wallet_id = "";
    let amount = "";
    let trip_id = "";
    let trxn_code = "";
    let user_wallet_debit = "";
    let user_wallet_credit = "";
    let user_wallet_balance = "";
    let user_wallet_total_balance = "";
    let main_wallet_debit = "";
    let main_wallet_credit = "";
    let main_wallet_balance = "";
    let main_wallet_total_balance = "";
    let payment_gateway_charges_debit = "";
    let payment_gateway_charges_credit = "";
    let payment_gateway_charges_balance = "";
    let payment_gateway_charges_total_balance = "";
    let revenue_wallet_debit = "";
    let revenue_wallet_credit = "";
    let revenue_wallet_balance = "";
    let revenue_wallet_total_balance = "";
    let vendor_wallet_debit = "";
    let vendor_wallet_credit = "";
    let vendor_wallet_balance = "";
    let vendor_wallet_total_balance = "";
    let escrow_debit = "";
    let escrow_credit = "";
    let escrow_balance = "";
    let escrow_total_balance = "";
    let folio = "";

    // Create an object to hold the results
    const results = {};
    let OldBalance,
      OldTotalBalance,
      OldRevenueBalance,
      OldRevenueTotalBalance,
      OldVendorBalance,
      OldVendorTotalBalance;

    // Query for the old main wallet balance
    pool.query(
      "SELECT user_wallet_balance FROM top_up WHERE client_profile_id = ? ORDER BY top_up_id DESC LIMIT 1",
      [userWalletId],
      (err, userWalletResults) => {
        if (err) {
          return reject(err);
        }

        // Store the old main wallet balance
        OldBalance = userWalletResults[0]
          ? userWalletResults[0].user_wallet_balance
          : null;

        // Query for the old total main wallet balance
        pool.query(
          "SELECT user_wallet_total_balance FROM top_up ORDER BY top_up_id DESC LIMIT 1",
          (err, totalUserWalletResults) => {
            if (err) {
              return reject(err);
            }

            // Store the old total main wallet balance
            OldTotalBalance = totalUserWalletResults[0]
              ? totalUserWalletResults[0].user_wallet_total_balance
              : null;

            // Query for the old vendor balance
            pool.query(
              "SELECT vendor_wallet_balance FROM top_up WHERE vendor_id = ? ORDER BY top_up_id DESC LIMIT 1",
              [VendorId],
              (err, VendorWalletResults) => {
                if (err) {
                  return reject(err);
                }

                // Store the old vendor balance
                OldVendorBalance = VendorWalletResults[0]
                  ? VendorWalletResults[0].vendor_wallet_balance
                  : null;

                // Query for the old total vendor balance
                pool.query(
                  "SELECT vendor_total_balance FROM top_up ORDER BY top_up_id DESC LIMIT 1",
                  (err, totalVendorResults) => {
                    if (err) {
                      return reject(err);
                    }

                    // Store the old total vendor balance
                    OldVendorTotalBalance = totalVendorResults[0]
                      ? totalVendorResults[0].vendor_total_balance
                      : null;

                    // Query for the old revenue balance
                    pool.query(
                      "SELECT revenue_wallet_balance FROM top_up WHERE revenue_wallet_id = ? ORDER BY top_up_id DESC LIMIT 1",
                      [RevenueId],
                      (err, RevenueWalletResults) => {
                        if (err) {
                          return reject(err);
                        }

                        // Store the old revenue balance
                        OldRevenueBalance = RevenueWalletResults[0]
                          ? RevenueWalletResults[0].revenue_wallet_balance
                          : null;

                        // Query for the old total revenue balance
                        pool.query(
                          "SELECT revenue_total_balance FROM top_up ORDER BY top_up_id DESC LIMIT 1",
                          (err, totalRevenueResults) => {
                            if (err) {
                              return reject(err);
                            }

                            // Store the old total revenue balance
                            OldRevenueTotalBalance = totalRevenueResults[0]
                              ? totalRevenueResults[0].revenue_total_balance
                              : null;

                            // Calculate the new user wallet balance and total balance
                            let newUserWalletBalance =
                              OldBalance - withdrawalAmount;
                            let newUserWalletTotalBalance =
                              OldTotalBalance - withdrawalAmount;

                            // Calculate the new vendor wallet balance and total
                            let newVendorBalance =
                              OldVendorBalance + withdrawalAmount;
                            let newVendorTotalBalance =
                              OldVendorTotalBalance + withdrawalAmount;

                            // Calculate the new revenue wallet balance and total
                            let newRevenueBalance =
                              OldRevenueBalance + withdrawalAmount;
                            let newRevenueTotalBalance =
                              OldRevenueTotalBalance + withdrawalAmount;

                            // Prepare values for insertion
                            currency = "";
                            exchange_rate = "";
                            date = "";
                            description = "";
                            client_profile_id = userWalletId;
                            vendor_id = VendorId;
                            payment_gateway_id = "";
                            main_wallet_id = " ";
                            revenue_wallet_id = RevenueId;
                            amount = "";
                            trip_id = "";
                            trxn_code = "";
                            user_wallet_debit = "";
                            user_wallet_credit = withdrawalAmount;
                            user_wallet_balance = newUserWalletBalance;
                            user_wallet_total_balance =
                              newUserWalletTotalBalance;
                            main_wallet_debit = "";
                            main_wallet_credit = " ";
                            main_wallet_balance = "";
                            main_wallet_total_balance = "";
                            payment_gateway_charges_debit = "";
                            payment_gateway_charges_credit = "";
                            payment_gateway_charges_balance = "";
                            payment_gateway_charges_total_balance = "";
                            revenue_wallet_debit = withdrawalAmount;
                            revenue_wallet_credit = "";
                            revenue_wallet_balance = newRevenueBalance;
                            revenue_wallet_total_balance =
                              newRevenueTotalBalance;
                            vendor_wallet_debit = withdrawalAmount;
                            vendor_wallet_credit = "";
                            vendor_wallet_balance = newRevenueBalance;
                            vendor_wallet_total_balance = newVendorTotalBalance;
                            escrow_debit = "";
                            escrow_credit = "";
                            escrow_balance = " ";
                            escrow_total_balance = " ";
                            folio = "";

                            // Insert new user wallet balance and updated total balance
                            pool.query(
                              "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                              [
                                currency,
                                exchange_rate,
                                date,
                                description,
                                client_profile_id,
                                vendor_id,
                                payment_gateway_id,
                                main_wallet_id,
                                revenue_wallet_id,
                                amount,
                                trip_id,
                                trxn_code,
                                user_wallet_debit,
                                user_wallet_credit,
                                user_wallet_balance,
                                user_wallet_total_balance,
                                main_wallet_debit,
                                main_wallet_credit,
                                main_wallet_balance,
                                main_wallet_total_balance,
                                payment_gateway_charges_debit,
                                payment_gateway_charges_credit,
                                payment_gateway_charges_balance,
                                payment_gateway_charges_total_balance,
                                revenue_wallet_debit,
                                revenue_wallet_credit,
                                revenue_wallet_balance,
                                revenue_wallet_total_balance,
                                vendor_wallet_debit,
                                vendor_wallet_credit,
                                vendor_wallet_balance,
                                vendor_wallet_total_balance,
                                escrow_debit,
                                escrow_credit,
                                escrow_balance,
                                escrow_total_balance,
                                folio,
                              ],
                              (err, insertResults) => {
                                if (err) {
                                  return reject(err);
                                }

                                // Insert new revenue balance and updated total balance
                                pool.query(
                                  "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                  [
                                    currency,
                                    exchange_rate,
                                    date,
                                    description,
                                    client_profile_id,
                                    vendor_id,
                                    payment_gateway_id,
                                    main_wallet_id,
                                    revenue_wallet_id,
                                    amount,
                                    trip_id,
                                    trxn_code,
                                    user_wallet_debit,
                                    user_wallet_credit,
                                    user_wallet_balance,
                                    user_wallet_total_balance,
                                    main_wallet_debit,
                                    main_wallet_credit,
                                    main_wallet_balance,
                                    main_wallet_total_balance,
                                    payment_gateway_charges_debit,
                                    payment_gateway_charges_credit,
                                    payment_gateway_charges_balance,
                                    payment_gateway_charges_total_balance,
                                    revenue_wallet_debit,
                                    revenue_wallet_credit,
                                    revenue_wallet_balance,
                                    revenue_wallet_total_balance,
                                    vendor_wallet_debit,
                                    vendor_wallet_credit,
                                    vendor_wallet_balance,
                                    vendor_wallet_total_balance,
                                    escrow_debit,
                                    escrow_credit,
                                    escrow_balance,
                                    escrow_total_balance,
                                    folio,
                                  ],
                                  (err, revenueInsertResults) => {
                                    if (err) {
                                      return reject(err);
                                    }

                                    // Insert new vendor balance and updated total balance
                                    pool.query(
                                      "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                      [
                                        currency,
                                        exchange_rate,
                                        date,
                                        description,
                                        client_profile_id,
                                        vendor_id,
                                        payment_gateway_id,
                                        main_wallet_id,
                                        revenue_wallet_id,
                                        amount,
                                        trip_id,
                                        trxn_code,
                                        user_wallet_debit,
                                        user_wallet_credit,
                                        user_wallet_balance,
                                        user_wallet_total_balance,
                                        main_wallet_debit,
                                        main_wallet_credit,
                                        main_wallet_balance,
                                        main_wallet_total_balance,
                                        payment_gateway_charges_debit,
                                        payment_gateway_charges_credit,
                                        payment_gateway_charges_balance,
                                        payment_gateway_charges_total_balance,
                                        revenue_wallet_debit,
                                        revenue_wallet_credit,
                                        revenue_wallet_balance,
                                        revenue_wallet_total_balance,
                                        vendor_wallet_debit,
                                        vendor_wallet_credit,
                                        vendor_wallet_balance,
                                        vendor_wallet_total_balance,
                                        escrow_debit,
                                        escrow_credit,
                                        escrow_balance,
                                        escrow_total_balance,
                                        folio,
                                      ],
                                      (err, vendorInsertResults) => {
                                        if (err) {
                                          return reject(err);
                                        }

                                        // Resolve with all results
                                        return resolve({
                                          results,
                                          insertResults,
                                          revenueInsertResults,
                                          vendorInsertResults,
                                        });
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

// ///////////////////////////////////////////////////////////////////////////////////////

// get by escrow security end with penalty

// crudsObj.getEscrowSecurityEndWithPenalty = (
//   withdrawalAmount,
//   userWalletId,
//   RevenueId,
//   VendorId,
// ) => {
//   return new Promise((resolve, reject) => {
//     // Initialize variables
//     const results = {};
//     let balances = {
//       OldBalance: null,
//       OldTotalBalance: null,
//       OldRevenueBalance: null,
//       OldRevenueTotalBalance: null,
//       OldVendorBalance: null,
//       OldVendorTotalBalance: null
//     };

//     // Helper function to fetch balances
//     const fetchBalance = (query, params) => {
//       return new Promise((resolve, reject) => {
//         pool.query(query, params, (err, result) => {
//           if (err) return reject(err);
//           resolve(result[0] ? result[0] : {});
//         });
//       });
//     };

//     // Fetch balances in sequence
//     const fetchBalances = async () => {
//       try {
//         balances.OldBalance = (await fetchBalance("SELECT user_wallet_balance FROM top_up WHERE client_profile_id = ? ORDER BY top_up_id DESC LIMIT 1", [userWalletId])).user_wallet_balance;
//         balances.OldTotalBalance = (await fetchBalance("SELECT user_wallet_total_balance FROM top_up ORDER BY top_up_id DESC LIMIT 1")).user_wallet_total_balance;
//         balances.OldVendorBalance = (await fetchBalance("SELECT vendor_wallet_balance FROM top_up WHERE vendor_id = ? ORDER BY top_up_id DESC LIMIT 1", [VendorId])).vendor_wallet_balance;
//         balances.OldVendorTotalBalance = (await fetchBalance("SELECT vendor_total_balance FROM top_up ORDER BY top_up_id DESC LIMIT 1")).vendor_total_balance;
//         balances.OldRevenueBalance = (await fetchBalance("SELECT revenue_wallet_balance FROM top_up WHERE revenue_wallet_id = ? ORDER BY top_up_id DESC LIMIT 1", [RevenueId])).revenue_wallet_balance;
//         balances.OldRevenueTotalBalance = (await fetchBalance("SELECT revenue_total_balance FROM top_up ORDER BY top_up_id DESC LIMIT 1")).revenue_total_balance;

//         // Calculate new balances
//         const newUserWalletBalance = balances.OldBalance - withdrawalAmount;
//         const newUserWalletTotalBalance = balances.OldTotalBalance - withdrawalAmount;
//         const newVendorBalance = balances.OldVendorBalance + withdrawalAmount;
//         const newVendorTotalBalance = balances.OldVendorTotalBalance + withdrawalAmount;
//         const newRevenueBalance = balances.OldRevenueBalance + withdrawalAmount;
//         const newRevenueTotalBalance = balances.OldRevenueTotalBalance + withdrawalAmount;

//         // Prepare insert query
//         const insertQuery = "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

//         // Insert balances
//         await pool.query(insertQuery, [
//           "", "", "", "", userWalletId, "", "", "", "", "", "", "", "", "", withdrawalAmount, "", newUserWalletBalance, newUserWalletTotalBalance, "", "", "", "", "", "", "", "", withdrawalAmount, "", newRevenueBalance, newRevenueTotalBalance, "", "", "", newVendorBalance, newVendorTotalBalance, "", "", "", "", ""
//         ]);

//         // Resolve with results
//         resolve({
//           results,
//           newVendorBalance,
//           newRevenueBalance,
//         });

//       } catch (err) {
//         reject(err);
//       }
//     };

//     fetchBalances();
//   });
// };




///??????????????????????????????????????????????????????
crudsObj.getEscrowSecurityEndWithPenalty = (
  withdrawalAmount,
  customer_Id,
  driver_Id,
  RevenueId,
  VendorId,
  trip_id

) => {
  return new Promise((resolve, reject) => {
    // Initialize variables
    const results = {};
    
    let  OldCustomerBalance = null;
    let  OldCustomerTotalBalance = null;
    let  OldDriverBalance = null;
    let  OldDriverTotalBalance = null;
    let  OldRevenueBalance = null;
    let  OldRevenueTotalBalance = null;
    let  OldVendorBalance = null;
    let  OldVendorTotalBalance = null;
    let  OldEscrowBalance = null;
    let  OldEscrowTotalBalance = null;
    
    let uFolio = "UW";
    let vFolio = "VW";
    let rFolio = "RW";
    let eFolio = "EW";

    // Helper function to fetch balances
    const fetchBalance = (query, params) => {
      return new Promise((resolve, reject) => {
        console.log("Executing query:", query, "with params:", params); // Log the query and params
        pool.query(query, params, (err, result) => {
          if (err) return reject(err);
          resolve(result[0] ? result[0] : {});
        });
      });
    };

    // Fetch balances in sequence
    const fetchBalances = async () => {
      try {
        // Customer get balance
        OldCustomerBalance = (
          await fetchBalance(
            "SELECT user_wallet_balance FROM top_up WHERE client_profile_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
            [customer_Id, uFolio]
          )
        ).user_wallet_balance || 0; // Default to 0 if undefined
    
        OldCustomerTotalBalance = (
          await fetchBalance(
            "SELECT user_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
            [uFolio]
          )
        ).user_wallet_total_balance || 0; // Default to 0 if undefined
    
        // Driver get balance
        OldDriverBalance = (
          await fetchBalance(
            "SELECT user_wallet_balance FROM top_up WHERE client_profile_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
            [driver_Id, uFolio]
          )
        ).user_wallet_balance || 0; // Default to 0 if undefined
    
        OldDriverTotalBalance = (
          await fetchBalance(
            "SELECT user_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
            [uFolio]
          )
        ).user_wallet_total_balance || 0; // Default to 0 if undefined
    
        // Vendor get balance
        OldVendorBalance = (
          await fetchBalance(
            "SELECT vendor_wallet_balance FROM top_up WHERE vendor_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
            [VendorId, vFolio]
          )
        ).vendor_wallet_balance || 0; // Default to 0 if undefined
    
        OldVendorTotalBalance = (
          await fetchBalance(
            "SELECT vendor_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
            [vFolio]
          )
        ).vendor_total_balance || 0; // Default to 0 if undefined
    
        // Get revenue balance
        OldRevenueBalance = (
          await fetchBalance(
            "SELECT revenue_wallet_balance FROM top_up WHERE revenue_wallet_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
            [RevenueId, rFolio]
          )
        ).revenue_wallet_balance || 0; // Default to 0 if undefined
    
        OldRevenueTotalBalance = (
          await fetchBalance(
            "SELECT revenue_wallet_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
            [rFolio]
          )
        ).revenue_total_balance || 0; // Default to 0 if undefined
    
        // Get escrow balance
        OldEscrowBalance = (
          await fetchBalance(
            "SELECT escrow_balance FROM top_up WHERE client_profile_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
            [RevenueId, eFolio]
          )
        ).escrow_balance || 0; // Default to 0 if undefined
    
        OldEscrowTotalBalance = (
          await fetchBalance(
            "SELECT escrow_total_balance FROM top_up WHERE folio = ? ORDER BY top_up_id DESC LIMIT 1",
            [eFolio]
          )
        ).escrow_total_balance || 0; // Default to 0 if undefined
    
        // Log the fetched balances for debugging
        console.log("Fetched Balances:", {
          OldCustomerBalance,
          OldCustomerTotalBalance,
          OldDriverBalance,
          OldDriverTotalBalance,
          OldVendorBalance,
          OldVendorTotalBalance,
          OldRevenueBalance,
          OldRevenueTotalBalance,
          OldEscrowBalance,
          OldEscrowTotalBalance,
        });
    
        // Calculate new balances
        const newCustomerWalletBalance = OldCustomerBalance + withdrawalAmount;
        const newCustomerTotalBalance = OldCustomerTotalBalance + withdrawalAmount;
    
        const newDriverWalletBalance = OldDriverBalance + withdrawalAmount;
        const newDriverTotalBalance = OldDriverTotalBalance + withdrawalAmount;
    
        const newVendorBalance = OldVendorBalance + withdrawalAmount;
        const newVendorTotalBalance = OldVendorTotalBalance + withdrawalAmount;
    
        const newRevenueBalance = OldRevenueBalance + withdrawalAmount;
        const newRevenueTotalBalance = OldRevenueTotalBalance + withdrawalAmount;
    
        const newEscrowBalance = OldEscrowBalance - withdrawalAmount;
        const newEscrowTotalBalance = OldEscrowTotalBalance - withdrawalAmount;
    
 // Log new balances before insertion
 console.log("New Balances:", {
  newCustomerWalletBalance,
  newCustomerTotalBalance,
  newDriverWalletBalance,
  newDriverTotalBalance,
  newVendorBalance,
  newVendorTotalBalance,
  newRevenueBalance,
  newRevenueTotalBalance,
  newEscrowBalance,
  newEscrowTotalBalance,
});

// Validate balances
if (newDriverWalletBalance < 0 || newDriverTotalBalance < 0) {
  throw new Error("New balances cannot be negative.");
}

// Prepare insert query
const insertDriverQuery =
  "INSERT INTO top_up (currency, exchange_rate, date, description, client_profile_id, vendor_id, payment_gateway_id, main_wallet_id, revenue_wallet_id, escrow_id, amount, trip_id, trxn_code, user_wallet_debit, user_wallet_credit, user_wallet_balance, user_wallet_total_balance, main_wallet_debit, main_wallet_credit, main_wallet_balance, main_wallet_total_balance, payment_gateway_charges_debit, payment_gateway_charges_credit, payment_gateway_charges_balance, payment_gateway_charges_total_balance, revenue_wallet_debit, revenue_wallet_credit, revenue_wallet_balance, revenue_wallet_total_balance, vendor_wallet_debit, vendor_wallet_credit, vendor_wallet_balance, vendor_wallet_total_balance, escrow_debit, escrow_credit, escrow_balance, escrow_total_balance, folio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

// Prepare values for insertion
const values = [
  "", // currency
  "", // exchange_rate
  "", // date
  "", // description
  driver_Id, // client_profile_id
  "", // vendor_id
  "", // payment_gateway_id
  "", // main_wallet_id
  "", // revenue_wallet_id
  "", // escrow_id
  withdrawalAmount, // amount
  trip_id, // trip_id
  11, // trxn_code
  withdrawalAmount, // user_wallet_debit
  "", // user_wallet_credit
  newDriverWalletBalance, // user_wallet_balance
  newDriverTotalBalance, // user_wallet_total_balance
  "", // main_wallet_debit
  "", // main_wallet_credit
  "", // main_wallet_balance
  "", // main_wallet_total_balance
  "", // payment_gateway_charges_debit
  "", // payment_gateway_charges_credit
  "", // payment_gateway_charges_balance
  "", // payment_gateway_charges_total_balance
  "", // revenue_wallet_debit
  "", // revenue_wallet_credit
  "", // revenue_wallet_balance
  "", // revenue_wallet_total_balance
  "", // vendor_wallet_debit
  "", // vendor_wallet_credit
  "", // vendor_wallet_balance
  "", // vendor_wallet_total_balance
  "", // escrow_debit
  "", // escrow_credit
  "", // escrow_balance
  "", // escrow_total_balance
  ""  // folio
];

// Log SQL execution
console.log("Executing SQL:", insertDriverQuery);
console.log("With values:", values);

// Insert driver balances
const result = await pool.query(insertDriverQuery, values);
console.log("Insert result:", result);

// Check how many rows were affected
if (result.affectedRows && result.affectedRows > 0) {
  resolve({
    success: true,
    message: "Insertion successful",
    data: { insertId: result.insertId }
  });
} else {
  throw new Error("No rows were affected, insertion failed.");
}

} catch (err) {
console.error("Error fetching balances or inserting to the database:", err);
reject({
  success: false,
  message: "Insertion failed",
  error: err.message
});
}
};

    fetchBalances();
  });
};


//???????????????????????????????????????????????????????



//crud get top up by id
crudsObj.getTopUpById = (top_up_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM top_up WHERE top_up_id = ?",
      [top_up_id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

//crud get top up by client_id
crudsObj.getTopUpByClientId = (client_profile_id) => {
  let folio = "UW"
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM top_up WHERE client_profile_id = ? AND folio = ? ORDER BY top_up_id DESC;",
      [client_profile_id,folio],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

//get Vendor topUp
crudsObj.getTopUpByVendorId = (vendor_id) => {
  let folio = "VW"
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM top_up WHERE vendor_id = ? AND folio = ? ORDER BY top_up_id DESC;",
      [vendor_id,folio],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

// get last topUp by client profile id
crudsObj.getLastTopUpById = (client_profile_id) => {
  let folio = "UW"
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT user_wallet_balance FROM top_up WHERE client_profile_id = ? AND folio = ? ORDER BY top_up_id DESC LIMIT 1",
      [client_profile_id,folio],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve({ results });
      }
    );
  });
};

//crud post TopUp
crudsObj.postTopUp = (

  currency,
  exchange_rate,
  date, // Ensure this is formatted correctly
  description,
  client_profile_id,
  vendor_id,
  payment_gateway_id,
  main_wallet_id,
  revenue_wallet_id,
  amount,
  trip_id,
  trxn_code,
  user_wallet_debit,
  user_wallet_credit,
  user_wallet_balance,
  user_wallet_total_balance,
  main_wallet_debit,
  main_wallet_credit,
  main_wallet_balance,
  main_wallet_total_balance,
  payment_gateway_charges_debit,
  payment_gateway_charges_credit,
  payment_gateway_charges_balance,
  payment_gateway_charges_total_balance,
  revenue_wallet_debit,
  revenue_wallet_credit,
  revenue_wallet_balance,
  revenue_wallet_total_balance,
  vendor_wallet_debit,
  vendor_wallet_credit,
  vendor_wallet_balance,
  vendor_wallet_total_balance,
  escrow_debit,
  escrow_credit,
  escrow_balance,
  escrow_total_balance,
  folio
) => {
  return new Promise((resolve, reject) => {
    console.log("Folio from Crud", folio);
    // Get Total Balance
    pool.query(
      "SELECT user_wallet_total_balance, amount FROM top_up WHERE folio = ?  ORDER BY top_up_id DESC LIMIT 1",
      [folio],
      (err, results) => {
        if (err) {
          return reject(err);
        }

        // Check if results is not empty
        const getTotalBal = results.length > 0 ? results[0].user_wallet_total_balance : 0; // Default to 0 if no results
       
        // Calculate total balance
        const user_wallet_total_balance =
          parseFloat(getTotalBal) + parseFloat(user_wallet_debit); // Ensure user_wallet_debit is defined

          pool.query(
            "INSERT INTO top_up ( \
              currency, \
              exchange_rate, \
              date, \
              description, \
              client_profile_id, \
              vendor_id, \
              payment_gateway_id, \
              main_wallet_id, \
              revenue_wallet_id, \
              amount, \
              trip_id, \
              trxn_code, \
              user_wallet_debit, \
              user_wallet_credit, \
              user_wallet_balance, \
              user_wallet_total_balance, \
              main_wallet_debit, \
              main_wallet_credit, \
              main_wallet_balance, \
              main_wallet_total_balance, \
              payment_gateway_charges_debit, \
              payment_gateway_charges_credit, \
              payment_gateway_charges_balance, \
              payment_gateway_charges_total_balance, \
              revenue_wallet_debit, \
              revenue_wallet_credit, \
              revenue_wallet_balance, \
              revenue_wallet_total_balance, \
              vendor_wallet_debit, \
              vendor_wallet_credit, \
              vendor_wallet_balance, \
              vendor_wallet_total_balance, \
              escrow_debit, \
              escrow_credit, \
              escrow_balance, \
              escrow_total_balance, \
              folio \
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              currency,
              exchange_rate,
              date, // Ensure this is formatted correctly
              description,
              client_profile_id,
              vendor_id,
              payment_gateway_id,
              main_wallet_id,
              revenue_wallet_id,
              amount,
              trip_id,
              trxn_code,
              user_wallet_debit,
              user_wallet_credit,
              user_wallet_balance,
              user_wallet_total_balance,
              main_wallet_debit,
              main_wallet_credit,
              main_wallet_balance,
              main_wallet_total_balance,
              payment_gateway_charges_debit,
              payment_gateway_charges_credit,
              payment_gateway_charges_balance,
              payment_gateway_charges_total_balance,
              revenue_wallet_debit,
              revenue_wallet_credit,
              revenue_wallet_balance,
              revenue_wallet_total_balance,
              vendor_wallet_debit,
              vendor_wallet_credit,
              vendor_wallet_balance,
              vendor_wallet_total_balance,
              escrow_debit,
              escrow_credit,
              escrow_balance,
              escrow_total_balance,
              folio,
            ],
            (err, results) => {
              if (err) {
                console.error("Error inserting data:", err); // Log error
                return reject(err);
              }
              console.log("Data inserted successfully:", results); // Log success
              return resolve([{ status: "200", message: "Saving successful" }]);
            }
          );
      }
    );
  });
};


//vendor
crudsObj.postVTopUp = (

  currency,
  exchange_rate,
  date, // Ensure this is formatted correctly
  description,
  client_profile_id,
  vendor_id,
  payment_gateway_id,
  main_wallet_id,
  revenue_wallet_id,
  amount,
  trip_id,
  trxn_code,
  user_wallet_debit,
  user_wallet_credit,
  user_wallet_balance,
  user_wallet_total_balance,
  main_wallet_debit,
  main_wallet_credit,
  main_wallet_balance,
  main_wallet_total_balance,
  payment_gateway_charges_debit,
  payment_gateway_charges_credit,
  payment_gateway_charges_balance,
  payment_gateway_charges_total_balance,
  revenue_wallet_debit,
  revenue_wallet_credit,
  revenue_wallet_balance,
  revenue_wallet_total_balance,
  vendor_wallet_debit,
  vendor_wallet_credit,
  vendor_wallet_balance,
  vendor_wallet_total_balance,
  escrow_debit,
  escrow_credit,
  escrow_balance,
  escrow_total_balance,
  folio
) => {
  return new Promise((resolve, reject) => {
    console.log("Folio from Crud", folio);
    // Get Total Balance
    pool.query(
      "SELECT vendor_wallet_total_balance, amount FROM top_up WHERE folio = ?  ORDER BY top_up_id DESC LIMIT 1",
      [folio],
      (err, results) => {
        if (err) {
          return reject(err);
        }

        // Check if results is not empty
        const getTotalBal = results.length > 0 ? results[0].vendor_wallet_total_balance : 0; // Default to 0 if no results
       
        // Calculate total balance
        const vendor_wallet_total_balance =
          parseFloat(getTotalBal) + parseFloat(vendor_wallet_debit); // Ensure user_wallet_debit is defined

          pool.query(
            "INSERT INTO top_up ( \
              currency, \
              exchange_rate, \
              date, \
              description, \
              client_profile_id, \
              vendor_id, \
              payment_gateway_id, \
              main_wallet_id, \
              revenue_wallet_id, \
              amount, \
              trip_id, \
              trxn_code, \
              user_wallet_debit, \
              user_wallet_credit, \
              user_wallet_balance, \
              user_wallet_total_balance, \
              main_wallet_debit, \
              main_wallet_credit, \
              main_wallet_balance, \
              main_wallet_total_balance, \
              payment_gateway_charges_debit, \
              payment_gateway_charges_credit, \
              payment_gateway_charges_balance, \
              payment_gateway_charges_total_balance, \
              revenue_wallet_debit, \
              revenue_wallet_credit, \
              revenue_wallet_balance, \
              revenue_wallet_total_balance, \
              vendor_wallet_debit, \
              vendor_wallet_credit, \
              vendor_wallet_balance, \
              vendor_wallet_total_balance, \
              escrow_debit, \
              escrow_credit, \
              escrow_balance, \
              escrow_total_balance, \
              folio \
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              currency,
              exchange_rate,
              date, // Ensure this is formatted correctly
              description,
              client_profile_id,
              vendor_id,
              payment_gateway_id,
              main_wallet_id,
              revenue_wallet_id,
              amount,
              trip_id,
              trxn_code,
              user_wallet_debit,
              user_wallet_credit,
              user_wallet_balance,
              user_wallet_total_balance,
              main_wallet_debit,
              main_wallet_credit,
              main_wallet_balance,
              main_wallet_total_balance,
              payment_gateway_charges_debit,
              payment_gateway_charges_credit,
              payment_gateway_charges_balance,
              payment_gateway_charges_total_balance,
              revenue_wallet_debit,
              revenue_wallet_credit,
              revenue_wallet_balance,
              revenue_wallet_total_balance,
              vendor_wallet_debit,
              vendor_wallet_credit,
              vendor_wallet_balance,
              vendor_wallet_total_balance,
              escrow_debit,
              escrow_credit,
              escrow_balance,
              escrow_total_balance,
              folio,
            ],
            (err, results) => {
              if (err) {
                console.error("Error inserting data:", err); // Log error
                return reject(err);
              }
              console.log("Data inserted successfully:", results); // Log success
              return resolve([{ status: "200", message: "Saving successful" }]);
            }
          );
      }
    );
  });
};

//crud put TopUp
crudsObj.putTopUp = (
  top_up_id,
  currency,
  exchange_rate,
  date,
  description,
  client_profile_id,
  vendor_id,
  payment_gateway_id,
  main_wallet_id,
  amount,
  trip_id,
  trxn_code,
  user_wallet_debit,
  user_wallet_credit,
  user_wallet_balance,
  user_wallet_total_balance,
  main_wallet_debit,
  main_wallet_credit,
  main_wallet_balance,
  main_wallet_total_balance,
  payment_gateway_charges_debit,
  payment_gateway_charges_credit,
  payment_gateway_charges_balance,
  payment_gateway_charges_total_balance,
  revenue_wallet_debit,
  revenue_wallet_credit,
  revenue_wallet_balance,
  revenue_wallet_total_balance,
  vendor_wallet_debit,
  vendor_wallet_credit,
  vendor_wallet_balance,
  vendor_wallet_total_balance,
  escrow_debit,
  escrow_credit,
  escrow_balance,
  escrow_total_balance,
  folio
) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE top_up SET \
        currency = ?, \
        exchange_rate = ?, \
        date = ?, \
        description = ?, \
        client_profile_id = ?, \
        vendor_id = ?, \
        payment_gateway_id = ?, \
        main_wallet_id = ?, \
        amount = ?, \
        trip_id = ?, \
        trxn_code = ?, \
        user_wallet_debit = ?, \
        user_wallet_credit = ?, \
        user_wallet_balance = ?, \
        user_wallet_total_balance = ?, \
        main_wallet_debit = ?, \
        main_wallet_credit = ?, \
        main_wallet_balance = ?, \
        main_wallet_total_balance = ?, \
        payment_gateway_charges_debit = ?, \
        payment_gateway_charges_credit = ?, \
        payment_gateway_charges_balance = ?, \
        payment_gateway_charges_total_balance = ?, \
        revenue_wallet_debit = ?, \
        revenue_wallet_credit = ?, \
        revenue_wallet_balance = ?, \
        revenue_wallet_total_balance = ?, \
        vendor_wallet_debit = ?, \
        vendor_wallet_credit = ?, \
        vendor_wallet_balance = ?, \
        vendor_wallet_total_balance = ?, \
        escrow_debit = ?, \
        escrow_credit = ?, \
        escrow_balance = ?, \
        escrow_total_balance = ?, \
        folio = ? \
      WHERE top_up_id = ?",
      [
        currency,
        exchange_rate,
        date,
        description,
        client_profile_id,
        vendor_id,
        payment_gateway_id,
        main_wallet_id,
        amount,
        trip_id,
        trxn_code,
        user_wallet_debit,
        user_wallet_credit,
        user_wallet_balance,
        user_wallet_total_balance,
        main_wallet_debit,
        main_wallet_credit,
        main_wallet_balance,
        main_wallet_total_balance,
        payment_gateway_charges_debit,
        payment_gateway_charges_credit,
        payment_gateway_charges_balance,
        payment_gateway_charges_total_balance,
        revenue_wallet_debit,
        revenue_wallet_credit,
        revenue_wallet_balance,
        revenue_wallet_total_balance,
        vendor_wallet_debit,
        vendor_wallet_credit,
        vendor_wallet_balance,
        vendor_wallet_total_balance,
        escrow_debit,
        escrow_credit,
        escrow_balance,
        escrow_total_balance,
        folio,
        top_up_id, // Ensure this is the last parameter for the WHERE clause
      ],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: "200", message: "saving successful" });
      }
    );
  });
};

//crud delete TopUps by id
crudsObj.deleteTopUpById = (top_up_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM top_up WHERE top_up_id =?",
      [top_up_id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve({ results });
      }
    );
  });
};



// crudsObj.postCrTopUp = (cr, trip_id, client_profile_id, desc, trxn_code) => {
//   return new Promise((resolve, reject) => {
//     // First query to get the latest total balance, total usage, and escroll
//     pool.query(
//       "SELECT total_balance, amount, escroll FROM top_up ORDER BY top_up_id DESC LIMIT 1",
//       (err, balanceUsageResults) => {
//         if (err) {
//           return reject(err);
//         }

//         // Check if any transactions exist for total balance and usage
//         if (balanceUsageResults.length === 0) {
//           return resolve([{ status: "404", message: "No available balance." }]);
//         }

//         const {
//           total_balance: oldTotalBalance,
//           amount: oldTotalUsage,
//           escroll: oldEscroll,
//         } = balanceUsageResults[0];

//         // Second query to fetch the latest transaction details for the client
//         pool.query(
//           "SELECT * FROM top_up WHERE client_profile_id = ? ORDER BY top_up_id DESC LIMIT 1",
//           [client_profile_id],
//           (err, clientResults) => {
//             if (err) {
//               return reject(err);
//             }

//             // Check if any transactions exist for the client
//             if (clientResults.length === 0) {
//               return resolve([
//                 { status: "404", message: "No balance found for this client." },
//               ]);
//             }

//             // Retrieve client-specific details
//             const clientTransaction = clientResults[0];
//             const clientBalance = parseFloat(clientTransaction.balance);

//             // Calculate new balances
//             const newClientBalance = clientBalance - cr; // Client's new balance
//             const newTotalBalance = oldTotalBalance - cr; // Updated total balance
//             const newEscroll = parseFloat(oldEscroll) + cr; // Updated escroll
//             const currentDate = new Date()
//               .toISOString()
//               .slice(0, 19)
//               .replace("T", " "); // Format date

//             // Check if the new client balance is non-negative
//             if (newClientBalance < 0) {
//               return resolve([
//                 {
//                   status: "400",
//                   message: "Insufficient balance after withdrawal.",
//                 },
//               ]);
//             }

//             // Insert new transaction
//             pool.query(
//               "INSERT INTO top_up (currency, exchange_rate, date, credit, debit, balance, description, client_profile_id, total_balance, amount, escroll, trip_id, trxn_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)",
//               [
//                 "USD",
//                 1.0,
//                 currentDate,
//                 cr,
//                 0,
//                 newClientBalance,
//                 desc,
//                 client_profile_id,
//                 newTotalBalance,
//                 oldTotalUsage, // Keep oldTotalUsage as it is
//                 newEscroll,
//                 trip_id, // Updated total usage
//                 trxn_code, //
//               ],
//               (err, insertResults) => {
//                 if (err) {
//                   return reject(err);
//                 }
//                 return resolve([
//                   { status: "200", message: "Saving successful." },
//                 ]);
//               }
//             );
//           }
//         );
//       }
//     );
//   });
// };



 crudsObj.postDrTopUp = (dr, trip_id, client_profile_id, desc, trxn_code) => {
//   return new Promise((resolve, reject) => {
//     // First query to get the latest total balance, total usage, and escroll
//     pool.query(
//       "SELECT total_balance, amount, escroll FROM top_up ORDER BY top_up_id DESC LIMIT 1",
//       (err, balanceUsageResults) => {
//         if (err) {
//           return reject(err);
//         }

//         // Check if any transactions exist for total balance and usage
//         if (balanceUsageResults.length === 0) {
//           return resolve([{ status: "404", message: "No available balance." }]);
//         }

//         const {
//           total_balance: oldTotalBalance,
//           amount: oldTotalUsage,
//           escroll: oldEscroll,
//         } = balanceUsageResults[0];

//         // Second query to fetch the latest transaction details for the client
//         pool.query(
//           "SELECT * FROM top_up WHERE client_profile_id = ? ORDER BY top_up_id DESC LIMIT 1",
//           [client_profile_id],
//           (err, clientResults) => {
//             if (err) {
//               return reject(err);
//             }

//             let clientBalance = 0; // Default to 0 if no previous records
//             let initialClientRecord = false; // Flag to check if we are creating an initial record

//             // Check if any transactions exist for the client
//             if (clientResults.length > 0) {
//               // Retrieve client-specific details
//               const clientTransaction = clientResults[0];
//               clientBalance = parseFloat(clientTransaction.balance);
//             } else {
//               // No previous transactions for the client, we will create an initial record
//               initialClientRecord = true;
//             }

//             // Calculate new balances
//             const usageIncrease = dr * 0.1;
//             const dr_f = dr - usageIncrease;
//             const newClientBalance = clientBalance + dr; // Update client balance
//             const newTotalBalance = oldTotalBalance + dr; // Update total balance
//             const newTotalUsage = oldTotalUsage; // Update total usage
//             const newEscroll = parseFloat(oldEscroll) - dr; // Updated escroll decreases by dr
//             const currentDate = new Date()
//               .toISOString()
//               .slice(0, 19)
//               .replace("T", " "); // Format date

//             // Check if the new escroll goes negative
//             if (newEscroll < 0) {
//               return resolve([
//                 {
//                   status: "400",
//                   message: "Insufficient escroll after withdrawal.",
//                 },
//               ]);
//             }

//             // Prepare the insert query
//             const insertQuery = `
//                 INSERT INTO top_up (currency, exchange_rate, date, credit, debit, balance, description, client_profile_id, total_balance, amount, escroll, trip_id, trxn_code)
//                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
//               `;

//             let insertValues;

//             // Determine the values to insert based on whether it's an initial record
//             if (initialClientRecord) {
//               insertValues = [
//                 "USD",
//                 1.0,
//                 currentDate,
//                 0, // No credit in debit transaction
//                 dr,
//                 dr, // Initial balance is just the top-up amount
//                 desc,
//                 client_profile_id,
//                 newTotalBalance, // Updated total balance
//                 newTotalUsage, // Updated total usage
//                 newEscroll,
//                 trip_id, // Updated total usage
//                 trxn_code, //
//               ];
//             } else {
//               insertValues = [
//                 "USD",
//                 1.0,
//                 currentDate,
//                 0, // No credit in debit transaction
//                 dr,
//                 newClientBalance, // Client's new balance
//                 desc,
//                 client_profile_id,
//                 newTotalBalance, // Updated total balance
//                 newTotalUsage, // Updated total usage
//                 newEscroll, // Updated escroll
//                 trip_id, // Updated total usage
//                 trxn_code, //
//               ];
//             }

//             // Execute the insert query
//             pool.query(insertQuery, insertValues, (err, insertResults) => {
//               if (err) {
//                 return reject(err);
//               }
//               return resolve([
//                 { status: "200", message: "Saving successful." },
//               ]);
//             });

//             pool.query(
//               "INSERT INTO top_up (currency, exchange_rate, date, credit, debit, balance, description, client_profile_id, total_balance, amount, escroll, trip_id, trxn_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)",
//               [
//                 "USD",
//                 1.0,
//                 currentDate,
//                 usageIncrease,
//                 0,
//                 newClientBalance - usageIncrease,
//                 "Service Commission",
//                 client_profile_id,
//                 newTotalBalance - usageIncrease,
//                 oldTotalUsage + usageIncrease, // Keep oldTotalUsage as it is
//                 newEscroll,
//                 trip_id, // Updated total usage
//                 "comm", //
//               ],
//               (err, insertResults) => {
//                 if (err) {
//                   return reject(err);
//                 }
//                 return resolve([
//                   { status: "200", message: "Saving successful." },
//                 ]);
//               }
//             );
//           }
//         );
//       }
//     );
//   });
};


module.exports = crudsObj;
