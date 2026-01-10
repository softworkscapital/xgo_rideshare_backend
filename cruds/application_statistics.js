require('dotenv').config(); 
const pool = require('./poolfile');

const crudsObj = {}; // <-- This is critical

// ---------------- Helper query function ----------------
const query = (sql, params) =>
  new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

// ---------------- POST / INSERT FULL STATISTICS ----------------
crudsObj.postStatistic = async () => {
  try {
    console.log("Generating full application statistics with per-trip splits...");

    const now = new Date();
    now.setHours(now.getHours() + 2); // timezone adjustment
    const datefor = now.toISOString().slice(0, 19).replace("T", " ");

    // ---------------- CORE TRIP & USER AGGREGATES ----------------
    const [
      totalTripStats,
      privateTripStats,
      rideshareTripStats,
      customerCount,
      newCustomers,
      driverCount,
      newDrivers,
      complaints,
      ratings,
      cancellations
    ] = await Promise.all([
      query("SELECT COUNT(*) trips_count, SUM(distance) kms_billed, SUM(accepted_cost) accepted_cost, AVG(accepted_cost) average_trip_rate_usd FROM trip"),
      query("SELECT COUNT(*) private_trips_count, SUM(distance) private_kms_billed, SUM(accepted_cost) private_accepted_cost, AVG(accepted_cost) private_average_trip_rate_usd FROM trip WHERE trip_type='private'"),
      query("SELECT COUNT(*) rideshare_trips_count, SUM(distance) rideshare_kms_billed, SUM(accepted_cost) rideshare_accepted_cost, AVG(accepted_cost) rideshare_average_trip_rate_usd FROM trip WHERE trip_type='rideshare'"),
      query("SELECT COUNT(customerid) customers_count FROM customer_details"),
      query(`SELECT 
               SUM(CASE WHEN customer_type='private' AND signed_on >= CURDATE() THEN 1 ELSE 0 END) private_new_customers,
               SUM(CASE WHEN customer_type='rideshare' AND signed_on >= CURDATE() THEN 1 ELSE 0 END) rideshare_new_customers
             FROM customer_details`),
      query("SELECT COUNT(driver_id) drivers_count FROM driver_details"),
      query(`SELECT 
               SUM(CASE WHEN driver_type='private' AND signed_on >= CURDATE() THEN 1 ELSE 0 END) private_new_drivers,
               SUM(CASE WHEN driver_type='rideshare' AND signed_on >= CURDATE() THEN 1 ELSE 0 END) rideshare_new_drivers
             FROM driver_details`),
      query(`SELECT 
               COUNT(*) total_complaints,
               SUM(CASE WHEN trip_type='private' THEN 1 ELSE 0 END) private_complaints,
               SUM(CASE WHEN trip_type='rideshare' THEN 1 ELSE 0 END) rideshare_complaints
             FROM tickets`),
      query(`SELECT 
               SUM(customer_stars + driver_stars) total_rating_count,
               AVG(customer_stars + driver_stars) ave_rating_count,
               AVG(CASE WHEN trip_type='private' THEN customer_stars ELSE NULL END) private_average_rating,
               AVG(CASE WHEN trip_type='rideshare' THEN customer_stars ELSE NULL END) rideshare_average_rating
             FROM trip`),
      query(`SELECT 
               SUM(CASE WHEN trip_type='private' AND status ='Cancelled' THEN 1 ELSE 0 END) private_cancellations,
               SUM(CASE WHEN trip_type='rideshare' AND status ='Cancelled' THEN 1 ELSE 0 END) rideshare_cancellations
             FROM trip`)
    ]);

    // ---------------- DESTRUCTURE ----------------
    const t = totalTripStats[0] || {};
    const p = privateTripStats[0] || {};
    const r = rideshareTripStats[0] || {};
    const c = customerCount[0] || {};
    const nc = newCustomers[0] || {};
    const d = driverCount[0] || {};
    const nd = newDrivers[0] || {};
    const comp = complaints[0] || {};
    const rate = ratings[0] || {};
    const canc = cancellations[0] || {};

    const trips_per_customer = c.customers_count > 0 ? t.trips_count / c.customers_count : 0;
    const mode_rate_usd = Math.max(p.private_average_trip_rate_usd || 0, r.rideshare_average_trip_rate_usd || 0);

    // ---------------- USER ACTIVITY ----------------
    const today = new Date().toISOString().slice(0, 10);
    const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);

    const [
      signedUpToday,
      usersToday,
      users1,
      users2,
      users3,
      users7,
      users14,
      users30,
      avgEngagement,
    ] = await Promise.all([
      query("SELECT COUNT(*) c FROM users WHERE signed_up_on = ?", [today]),
      query("SELECT COUNT(*) c FROM users WHERE last_logged_in >= ? AND last_logged_in <= ?", [today, `${today} 23:59:59`]),
      query("SELECT COUNT(*) c FROM users WHERE last_logged_in >= ? AND last_logged_in < ?", [daysAgo(1), today]),
      query("SELECT COUNT(*) c FROM users WHERE last_logged_in >= ? AND last_logged_in < ?", [daysAgo(2), daysAgo(1)]),
      query("SELECT COUNT(*) c FROM users WHERE last_logged_in >= ? AND last_logged_in < ?", [daysAgo(3), daysAgo(2)]),
      query("SELECT COUNT(*) c FROM users WHERE last_logged_in >= ? AND last_logged_in < ?", [daysAgo(7), daysAgo(3)]),
      query("SELECT COUNT(*) c FROM users WHERE last_logged_in >= ? AND last_logged_in < ?", [daysAgo(14), daysAgo(7)]),
      query("SELECT COUNT(*) c FROM users WHERE last_logged_in >= ? AND last_logged_in < ?", [daysAgo(30), daysAgo(14)]),
      query("SELECT AVG(TIMESTAMPDIFF(SECOND, last_logged_in, NOW())) avg FROM users WHERE last_logged_in >= ?", [daysAgo(30)]),
    ]);

    // ---------------- FINANCIAL AGGREGATES ----------------
    const [walletSums] = await Promise.all([query(`
      SELECT 
        SUM(CASE WHEN trxn_code='CM' THEN user_wallet_credit ELSE 0 END) sum_commission_uw,
        SUM(CASE WHEN trxn_code='CM' THEN vendor_wallet_credit ELSE 0 END) sum_commission_vw,
        SUM(CASE WHEN trxn_code='PM' THEN user_wallet_debit ELSE 0 END) sum_promotion_uw,
        SUM(CASE WHEN trxn_code='PM' THEN vendor_wallet_debit ELSE 0 END) sum_promotion_vw,
        SUM(CASE WHEN trxn_code='TU' THEN user_wallet_debit ELSE 0 END) sum_top_up_uw,
        SUM(CASE WHEN trxn_code='TU' THEN vendor_wallet_debit ELSE 0 END) sum_top_up_vw,
        SUM(CASE WHEN trxn_code='WD' THEN user_wallet_credit ELSE 0 END) sum_withdrawal_uw,
        SUM(CASE WHEN trxn_code='WD' THEN vendor_wallet_credit ELSE 0 END) sum_withdrawal_vw,
        SUM(CASE WHEN trxn_code='MP' THEN user_wallet_credit ELSE 0 END) sum_mischief_penalty_uw,
        SUM(CASE WHEN trxn_code='MP' THEN vendor_wallet_credit ELSE 0 END) sum_mischief_penalty_vw,
        SUM(user_wallet_total_balance) user_wallet_total_balance,
        SUM(main_wallet_total_balance) main_wallet_total_balance,
        SUM(main_wallet_balance) main_wallet_balance,
        SUM(revenue_wallet_total_balance) revenue_wallet_total_balance,
        SUM(vendor_wallet_total_balance) vendor_wallet_total_balance,
        SUM(escrow_total_balance) escrow_total_balance
      FROM top_up
      WHERE date = ?
    `, [today]).then(r => r || [{}])]);

    const w = walletSums[0] || {};

    // ---------------- SAFE DEFAULTS ----------------
    const defaults = {
      private_cancellation_rate: 0.0,
      rideshare_cancellation_rate: 0.0,
      average_billed: 0.0,
      private_rating_count: 0,
      rideshare_rating_count: 0,
      private_driver_open_balance: 0.0,
      rideshare_driver_open_balance: 0.0,
      private_driver_close_balance: 0.0,
      rideshare_driver_close_balance: 0.0,
      customer_to_up: 0,
      customer_deduction: 0,
      private_customer_close_balance: 0.0,
      rideshare_customer_close_balance: 0.0,
      private_billed_amount_company_usd: 0.0,
      rideshare_billed_amount_company_usd: 0.0,
    };

    // ---------------- FINANCIAL OBJECTS ----------------
    const dw = {
      driver_open_balance: 0,
      driver_top_up: 0,
      driver_billed_charges: 0,
      driver_withdrawals: 0,
      driver_escrow: 0,
      driver_promo: 0,
      driver_deductions: 0,
      driver_additions: 0,
      driver_close_balance: 0
    };

    const cw = {
      customer_open_balance: 0,
      customer_to_up: 0,
      customer_billed_charges: 0,
      customer_withdrawals: 0,
      customer_escrow: 0,
      customer_promo: 0,
      customer_additions: 0,
      customer_close_balance: 0
    };

    const co = {
      company_open_balance: 0,
      company_income_from_charges: 0,
      company_promotions: 0,
      company_withdraws_out: 0,
      company_close_balance: 0
    };

    // ---------------- INSERT ----------------
const columns = [
  "datefor", "kms_billed", "private_kms_billed", "rideshare_kms_billed",
  "customers_count", "drivers_count",
  "private_cancellations", "private_cancellation_rate",
  "rideshare_cancellations", "rideshare_cancellation_rate",
  "trips_count", "private_trips_count", "rideshare_trips_count", "trips_per_customer",
  "billed_amount_usd", "private_billed_amount_usd", "private_average_trip_rate_usd",
  "rideshare_billed_amount_usd", "rideshare_average_trip_rate_usd",
  "average_trip_rate_usd", "mode_rate_usd", "average_billed",
  "new_customer_count", "private_new_customers", "rideshare_new_customers",
  "new_drivers_count", "private_new_drivers", "rideshare_new_drivers",
  "complaints_count", "private_complaints", "rideshare_complaints",
  "total_rating_count", "ave_rating_count", "private_average_rating", "private_rating_count",
  "rideshare_average_rating", "rideshare_rating_count",
  "driver_open_balance", "private_driver_open_balance", "rideshare_driver_open_balance",
  "driver_top_up", "driver_billed_charges", "driver_withdrawals",
  "driver_escrow", "driver_promo", "driver_deductions", "driver_additions", "driver_close_balance",
  "private_driver_close_balance", "rideshare_driver_close_balance",
  "customer_open_balance", "customer_to_up", "customer_billed_charges", "customer_withdrawals",
  "customer_escrow", "customer_promo", "customer_deduction", "customer_additions", "customer_close_balance",
  "private_customer_close_balance", "rideshare_customer_close_balance",
  "company_open_balance", "company_income_from_charges", "private_billed_amount_company_usd", "rideshare_billed_amount_company_usd",
  "company_promotions", "company_withdraws_out", "company_close_balance",
  "sum_commission_uw", "sum_commission_vw", "sum_promotion_uw", "sum_promotion_vw",
  "sum_top_up_uw", "sum_top_up_vw", "sum_withdrawal_uw", "sum_withdrawal_vw",
  "sum_mischief_penalty_uw", "sum_mischief_penalty_vw",
  "user_wallet_total_balance", "main_wallet_total_balance", "main_wallet_balance",
  "revenue_wallet_total_balance", "vendor_wallet_total_balance", "escrow_total_balance",
  "signed_up_today", "users_logged_in_today", "users_logged_in_one_day_ago",
  "users_logged_in_two_days_ago", "users_logged_in_three_days_ago",
  "users_logged_in_seven_days_ago", "users_logged_in_fourteen_days_ago",
  "users_logged_in_thirty_days_ago", "average_engagement_time"
];

const values = [
  datefor, t.kms_billed||0, p.private_kms_billed||0, r.rideshare_kms_billed||0,
  c.customers_count||0, d.drivers_count||0,
  canc.private_cancellations||0, defaults.private_cancellation_rate,
  canc.rideshare_cancellations||0, defaults.rideshare_cancellation_rate,
  t.trips_count||0, p.private_trips_count||0, r.rideshare_trips_count||0, trips_per_customer,
  t.accepted_cost||0, p.private_accepted_cost||0, p.private_average_trip_rate_usd||0,
  r.rideshare_accepted_cost||0, r.rideshare_average_trip_rate_usd||0,
  t.accepted_cost||0, mode_rate_usd, defaults.average_billed,
  (nc.private_new_customers||0)+(nc.rideshare_new_customers||0), nc.private_new_customers||0, nc.rideshare_new_customers||0,
  (nd.private_new_drivers||0)+(nd.rideshare_new_drivers||0), nd.private_new_drivers||0, nd.rideshare_new_drivers||0,
  comp.total_complaints||0, comp.private_complaints||0, comp.rideshare_complaints||0,
  rate.total_rating_count||0, rate.ave_rating_count||0, rate.private_average_rating||0, defaults.private_rating_count,
  rate.rideshare_average_rating||0, defaults.rideshare_rating_count,
  dw.driver_open_balance||0, defaults.private_driver_open_balance, defaults.rideshare_driver_open_balance,
  dw.driver_top_up||0, dw.driver_billed_charges||0, dw.driver_withdrawals||0,
  dw.driver_escrow||0, dw.driver_promo||0, dw.driver_deductions||0, dw.driver_additions||0, dw.driver_close_balance||0,
  defaults.private_driver_close_balance, defaults.rideshare_driver_close_balance,
  cw.customer_open_balance||0, defaults.customer_to_up, cw.customer_billed_charges||0, cw.customer_withdrawals||0,
  cw.customer_escrow||0, cw.customer_promo||0, defaults.customer_deduction, cw.customer_additions||0, cw.customer_close_balance||0,
  defaults.private_customer_close_balance, defaults.rideshare_customer_close_balance,
  co.company_open_balance||0, co.company_income_from_charges||0, defaults.private_billed_amount_company_usd, defaults.rideshare_billed_amount_company_usd,
  co.company_promotions||0, co.company_withdraws_out||0, co.company_close_balance||0,
  w.sum_commission_uw||0, w.sum_commission_vw||0, w.sum_promotion_uw||0, w.sum_promotion_vw||0,
  w.sum_top_up_uw||0, w.sum_top_up_vw||0, w.sum_withdrawal_uw||0, w.sum_withdrawal_vw||0,
  w.sum_mischief_penalty_uw||0, w.sum_mischief_penalty_vw||0,
  w.user_wallet_total_balance||0, w.main_wallet_total_balance||0, w.main_wallet_balance||0,
  w.revenue_wallet_total_balance||0, w.vendor_wallet_total_balance||0, w.escrow_total_balance||0,
  signedUpToday[0].c||0, usersToday[0].c||0, users1[0].c||0, users2[0].c||0, users3[0].c||0,
  users7[0].c||0, users14[0].c||0, users30[0].c||0, avgEngagement[0].avg||0
];

if (columns.length !== values.length) {
  throw new Error(`Column count (${columns.length}) does not match value count (${values.length})`);
}

// ---------------- INSERT ----------------
const insertResult = await query(
  `INSERT INTO application_statistics (${columns.join(",")}) VALUES (${values.map(_=>"?").join(",")})`,
  values
);


    return { status: 200, message: "Full statistics saved successfully", id: insertResult.insertId };
  } catch (err) {
    console.error("Error generating full statistics:", err);
    throw err;
  }
};



/* ---------------- GET statistics by date range ---------------- */
crudsObj.getStatisticsByDateRange = async (date_from, date_to) => {
  return await query(
    `SELECT * FROM application_statistics WHERE datefor BETWEEN ? AND ? ORDER BY datefor DESC`,
    [date_from, date_to]
  );
};

/* ---------------- GET latest record ---------------- */
crudsObj.getStatistics = async () => {
  return await query(
    `SELECT * FROM application_statistics ORDER BY datefor DESC LIMIT 1`
  );
};

/* ---------------- GET by ID ---------------- */
crudsObj.getStatisticById = async (id) => {
  const results = await query(`SELECT * FROM application_statistics WHERE application_statistic_id=?`, [id]);
  return results[0];
};

/* ---------------- UPDATE ---------------- */
crudsObj.updateStatistic = async (id, values) => {
  const keys = Object.keys(values);
  const params = Object.values(values);
  const setString = keys.map(k => `${k}=?`).join(', ');
  const sql = `UPDATE application_statistics SET ${setString} WHERE application_statistic_id=?`;
  const result = await query(sql, [...params, id]);
  return { status: 200, message: "Statistic updated", affectedRows: result.affectedRows };
};

/* ---------------- DELETE ---------------- */
crudsObj.deleteStatistic = async (id) => {
  const result = await query(`DELETE FROM application_statistics WHERE application_statistic_id=?`, [id]);
  return { status: 200, message: "Statistic deleted", affectedRows: result.affectedRows };
};

/* ---------------- GET last 30 days records ---------------- */
crudsObj.getLast30Days = async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 19).replace("T", " ");
  return await query(
    `SELECT * FROM application_statistics WHERE datefor >= ? ORDER BY datefor DESC`,
    [thirtyDaysAgo]
  );
};

module.exports = crudsObj;
