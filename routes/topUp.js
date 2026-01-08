const express = require("express");
const topUpRouter = express.Router();
const topUpsDbOperations = require("../cruds/topUp");

// Get topUps all
topUpRouter.get("/", async (req, res, next) => {
  try {
    let results = await topUpsDbOperations.getTopUp();
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// get all entity total balances
topUpRouter.get("/get_all_entity_total_balances", async (req, res, next) => {
  try {
    // Fetching all entity total balances
    const results = await topUpsDbOperations.getAllEntityTotalBalances();

    // Responding with a structured JSON response
    res.status(200).json({
      success: true,
      data: results,
      message: "Fetched all entity total balances successfully",
    });
  } catch (error) {
    // Logging the error for debugging
    console.error("Error fetching entity total balances:", error);

    // Sending a structured error response
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

    // Optionally pass the error to error-handling middleware
    next(error);
  }
});

// Get userbalance by client profile id and folio
///done
topUpRouter.get("/userBalance/:clientProfileId", async (req, res, next) => {
  const clientProfileId = req.params.clientProfileId;
  // console.log(clientProfileId);

  try {
    // Fetching the user balance using the clientProfileId
    const results = await topUpsDbOperations.getUserWalletBalance(
      clientProfileId
    );

    // Responding with a structured JSON response
    res.status(200).json({
      success: true,
      data: results,
      message: "Fetched user balance successfully",
    });
  } catch (error) {
    // Logging the error for debugging
    console.error("Error fetching user balance:", error);

    // Sending a structured error response
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

    // Optionally pass the error to error-handling middleware
    next(error);
  }
});

topUpRouter.get("/vendorBalance/:vendorId", async (req, res, next) => {
  const vendorId = req.params.vendorId;
  console.log(vendorId);

  try {
    // Fetching the user balance using the clientProfileId
    const results = await topUpsDbOperations.getVendorWalletBalance(vendorId);

    // Responding with a structured JSON response
    res.status(200).json({
      success: true,
      data: results,
      message: "Fetched vendor balance successfully",
    });
  } catch (error) {
    // Logging the error for debugging
    console.error("Error fetching vendor balance:", error);

    // Sending a structured error response
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

    // Optionally pass the error to error-handling middleware
    next(error);
  }
});

topUpRouter.get("/escrow_security_end_with_penalty", async (req, res, next) => {
  const clientProfileId = req.params.clientProfileId;

  const RevenueId = 1;
  const VendorId = 1;
  const receivedValues = req.body;
  const withdrawalAmount = receivedValues.withdrawalAmount;
  const customer_Id = receivedValues.customer_Id;
  const driver_Id = receivedValues.driver_Id;
  const trip_id = receivedValues.trip_id;

  try {
    const results = await topUpsDbOperations.getEscrowSecurityEndWithPenalty(
      RevenueId,
      VendorId,
      withdrawalAmount,
      customer_Id,
      driver_Id,
      trip_id
    );

    // Responding with a structured JSON response
    res.status(200).json({
      success: true,
      data: results,
      message: "Done",
    });
  } catch (error) {
    // Logging the error for debugging
    console.error("Error fetching user balance:", error);

    // Sending a structured error response
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

    // Optionally pass the error to error-handling middleware
    next(error);
  }
});

// get wallet by folio, datefor , dateto
topUpRouter.get("/userReportBalance", async (req, res, next) => {
  const { dateFor, dateTo, folio } = req.body; // Extracting variables from the request body

  try {
    // Fetching the user wallet balance based on the provided date range and folio
    const results = await topUpsDbOperations.getReport(dateFor, dateTo, folio);

    // Responding with a structured JSON response
    res.status(200).json({
      success: true,
      data: results,
      message: "Fetched user wallet balance successfully",
    });
  } catch (error) {
    // Logging the error for debugging
    console.error("Error fetching user wallet balance:", error);

    // Sending a structured error response
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

    // Optionally pass the error to error-handling middleware
    next(error);
  }
});

// get wallet by folio, datefor , dateto, client_profile_id
topUpRouter.get("/wallet_by_client_id", async (req, res, next) => {
  const { dateFor, dateTo, folio, client_profile_id } = req.body; // Extracting variables from the request body

  try {
    // Fetching the user wallet balance based on the provided date range and folio
    const results = await topUpsDbOperations.getReportByClientId(
      dateFor,
      dateTo,
      folio,
      client_profile_id
    );

    // Responding with a structured JSON response
    res.status(200).json({
      success: true,
      data: results,
      message: "Fetched user wallet balance successfully",
    });
  } catch (error) {
    // Logging the error for debugging
    console.error("Error fetching user wallet balance:", error);

    // Sending a structured error response
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

    // Optionally pass the error to error-handling middleware
    next(error);
  }
});

// withdrawal from revenue
topUpRouter.get(
  "/wallet_withdrawal_from_revenue/:mainWalletId/:RevenueWalletId",

  async (req, res, next) => {
    const postedAmount = req.body;
    let withdrawalAmount = postedAmount.withdrawalAmount;
    let mainWalletId = req.params.mainWalletId;
    let RevenueWalletId = req.params.RevenueWalletId;
    try {
      let results = await topUpsDbOperations.getWalletWithdrawFromRevenue(
        withdrawalAmount,
        mainWalletId,
        RevenueWalletId
      );
      res.json(results);
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
);

//withdrawal by vendor
topUpRouter.get(
  "/wallet_withdrawal_by_vendor/:mainWalletId/:VendorId",

  async (req, res, next) => {
    const postedAmount = req.body;
    let withdrawalAmount = postedAmount.withdrawalAmount;
    let mainWalletId = req.params.mainWalletId;
    let VendorId = req.params.UserWalletId;
    try {
      let results = await topUpsDbOperations.getWalletWithdrawByVendor(
        withdrawalAmount,
        mainWalletId,
        VendorId
      );
      res.json(results);
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
);

//withdrawal by user
topUpRouter.get(
  "/wallet_withdrawal_by_user/:mainWalletId/:UserWalletId",

  async (req, res, next) => {
    const postedAmount = req.body;
    let withdrawalAmount = postedAmount.withdrawalAmount;
    let mainWalletId = req.params.mainWalletId;
    let UserWalletId = req.params.UserWalletId;
    try {
      let results = await topUpsDbOperations.getWalletWithdrawByUser(
        withdrawalAmount,
        mainWalletId,
        UserWalletId
      );
      res.json(results);
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
);

//vendor
topUpRouter.post(
  "/vendor_commission_settlement/:RevenueWalletId/:VendorWalletId",

  async (req, res, next) => {
    const postedAmount = req.body;
    let commission = postedAmount.commission;
    let description = postedAmount.description;
    let RevenueWalletId = req.params.RevenueWalletId;
    let VendorWalletId = req.params.VendorWalletId;
    try {
      let results = await topUpsDbOperations.getVendorCommissionSettlement(
        commission,
        RevenueWalletId,
        VendorWalletId,
        description
      );
      res.json(results);
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
);

//trip settlement
topUpRouter.post(
  "/trip_commission_settlement/:RevenueWalletId/:UserWalletId",

  async (req, res, next) => {
    const postedAmount = req.body;
    let commission = postedAmount.commission;
    let description = postedAmount.description;
    let RevenueWalletId = req.params.RevenueWalletId;
    let UserWalletId = req.params.UserWalletId;
    let tripId = req.params.tripId;
    try {
      let results = await topUpsDbOperations.getTripCommissionSettlement(
        commission,
        RevenueWalletId,
        UserWalletId,
        description,
        tripId
      );
      res.json(results);
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
);

//top Up
topUpRouter.get(
  "/topUp_User_Wallet/:RevenueWalletId/:UserWalletId/:MainWalletId",

  async (req, res, next) => {
    const postedAmount = req.body;
    let depositedAmount = postedAmount.depositedAmount;
    let RevenueWalletId = req.params.RevenueWalletId;
    let UserWalletId = req.params.UserWalletId;
    let mainWalletId = req.params.MainWalletId;
    try {
      let results = await topUpsDbOperations.getTopUpUserWallet(
        depositedAmount,
        UserWalletId,
        mainWalletId,
        RevenueWalletId
      );
      res.json(results);
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
);

//escrow_security_intransit
topUpRouter.get(
  "/escrow_security_intransit/:UserWalletId/:EscrowId",

  async (req, res, next) => {
    const postedAmount = req.body;
    let withdrawalAmount = postedAmount.withdrawalAmount;
    let UserWalletId = req.params.UserWalletId;
    let EscrowId = req.params.EscrowId;
    try {
      let results = await topUpsDbOperations.getEscrowSecurityIntransit(
        withdrawalAmount,
        UserWalletId,
        EscrowId
      );
      res.json(results);
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
);

//escrow_security_end_with_success
topUpRouter.get(
  "/escrow_security_end_with_success/:UserWalletId/:EscrowId",

  async (req, res, next) => {
    const postedAmount = req.body;
    let withdrawalAmount = postedAmount.withdrawalAmount;
    let UserWalletId = req.params.UserWalletId;
    let EscrowId = req.params.EscrowId;
    try {
      let results = await topUpsDbOperations.getEscrowSecurityEndWithSuccess(
        withdrawalAmount,
        UserWalletId,
        EscrowId
      );
      res.json(results);
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
);

// Get topUps by id
topUpRouter.get("/:top_up_id", async (req, res, next) => {
  try {
    let top_up_id = req.params.top_up_id;
    let results = await topUpsDbOperations.getTopUpById(top_up_id);
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// Get topUps by client_profile_id
topUpRouter.get(
  "/topup/:client_profile_id",

  async (req, res, next) => {
    try {
      let client_profile_id = req.params.client_profile_id;
      let results = await topUpsDbOperations.getTopUpByClientId(
        client_profile_id
      );
      res.json(results);
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
);

//getVendor topups
topUpRouter.get(
  "/vendorTopup/:vendor_id",

  async (req, res, next) => {
    try {
      let vendor_id = req.params.vendor_id;
      let results = await topUpsDbOperations.getTopUpByVendorId(vendor_id);
      res.json(results);
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
);

// Get last topup by client_profile_id
topUpRouter.get("/lasttopup/:client_profile_id", async (req, res, next) => {
  try {
    let client_profile_id = req.params.client_profile_id;
    let results = await topUpsDbOperations.getLastTopUpById(client_profile_id);
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// Post topUp
topUpRouter.post("/", async (req, res, next) => {
  try {
    let postedValues = req.body;
    // Log the entire request body
    console.log("Request Body:", req.body);
    let {
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
    } = postedValues;

    // Log the posted values and folio
    console.log("Posted Values Before Destructuring:", postedValues);
    console.log("Folio Value After Destructuring:", folio);

    let results = await topUpsDbOperations.postTopUp(
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
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

//vendor
topUpRouter.post("/vendor", async (req, res, next) => {
  try {
    let postedValues = req.body;
    // Log the entire request body
    // console.log("Request Body:", req.body);
    let {
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
    } = postedValues;

    // Log the posted values and folio
    console.log("Posted Values Before Destructuring:", postedValues);
    console.log("Folio Value After Destructuring:", folio);

    let results = await topUpsDbOperations.postVTopUp(
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
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// Update topUp by id
topUpRouter.put("/:id", async (req, res, next) => {
  try {
    let top_up_id = req.params.id;
    let postedValues = req.body;
    let {
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
    } = postedValues;

    let results = await topUpsDbOperations.putTopUp(
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
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// Delete topUp by id
topUpRouter.delete("/:top_up_id", async (req, res, next) => {
  try {
    let top_up_id = req.params.top_up_id;
    let results = await topUpsDbOperations.deleteTopUpById(top_up_id);
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});
topUpRouter.post("/topupcr", async (req, res, next) => {
  try {
    // Extract data from the request body
    const { cr, trip_id, client_profile_id, desc, trxn_code } = req.body;

    // Validate request data

    // Call the postCrTopUp function with the extracted data
    let results = await topUpsDbOperations.postCrTopUp(
      cr,
      trip_id,
      client_profile_id,
      desc,
      trxn_code
    );

    // Send back the resultss
    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

topUpRouter.post("/topupdr", async (req, res, next) => {
  const { dr, trip_id, client_profile_id, desc, trxn_code } = req.body;

  if (!dr || !trip_id || !client_profile_id || !desc || !trxn_code) {
    return res
      .status(400)
      .json({ status: "400", message: "Missing required fields." });
  }

  try {
    const result = await topUpsDbOperations.postDrTopUp(
      dr,
      trip_id,
      client_profile_id,
      desc,
      trxn_code
    );
    res.status(result[0].status).json(result[0]);
  } catch (error) {
    console.error("Error in top-up:", error);
    res.status(500).json({ status: "500", message: "Internal server error." });
  }
});
module.exports = topUpRouter;
