const express = require("express");
const StatisticRouter = express.Router();
const StatisticsDbOperations = require("../cruds/application_statistics");

// ---------------- Middleware ----------------
StatisticRouter.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// ---------------- POST ----------------
StatisticRouter.post("/", async (req, res) => {
  try {
    const result = await StatisticsDbOperations.postStatistic();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error generating statistics:", error);
    return res.status(500).json({ status: 500, message: "Failed to generate statistics", error: error.message });
  }
});

// ---------------- GET latest ----------------
StatisticRouter.get("/get_last_statistic", async (req, res) => {
  try {
    const results = await StatisticsDbOperations.getStatistics();
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "No statistics found" });
    }
    const formatted = formatStatistic(results[0]);
    return res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

// ---------------- GET by date range ----------------
StatisticRouter.get("/get_app_stats_by_dates/:date_from/:date_to", async (req, res) => {
  try {
    const { date_from, date_to } = req.params;
    const stats = await StatisticsDbOperations.getStatisticsByDateRange(date_from, date_to);

    if (!stats || stats.length === 0) {
      return res.status(404).json({ message: "No statistics found for this date range" });
    }

    const formattedStats = stats.map(formatStatistic);
    return res.status(200).json({ date_from, date_to, stats: formattedStats });
  } catch (error) {
    console.error("Error fetching statistics by date range:", error);
    return res.status(500).json({ message: "Failed to fetch statistics by date range", error: error.message });
  }
});

// ---------------- GET last 30 days ----------------
StatisticRouter.get("/get_last_30_days", async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    const stats = await StatisticsDbOperations.getStatisticsByDateRange(
      startDate.toISOString().slice(0, 10),
      endDate.toISOString().slice(0, 10)
    );

    if (!stats || stats.length === 0) {
      return res.status(404).json({ message: "No statistics found for the last 30 days" });
    }

    const formattedStats = stats.map(formatStatistic);
    return res.status(200).json({ date_from: startDate.toISOString().slice(0, 10), date_to: endDate.toISOString().slice(0, 10), stats: formattedStats });
  } catch (error) {
    console.error("Error fetching last 30 days statistics:", error);
    return res.status(500).json({ message: "Failed to fetch last 30 days statistics", error: error.message });
  }
});

// ---------------- GET by ID ----------------
StatisticRouter.get("/:id", async (req, res) => {
  try {
    const result = await StatisticsDbOperations.getStatisticById(req.params.id);
    if (!result) return res.status(404).json({ message: "Statistic not found" });
    return res.status(200).json(formatStatistic(result));
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

// ---------------- PUT ----------------
StatisticRouter.put("/:application_statistic_id", async (req, res) => {
  const { application_statistic_id } = req.params;
  const updatedValues = req.body;

  if (!application_statistic_id) {
    return res.status(400).json({ status: 400, message: "application_statistic_id is required" });
  }

  try {
    const result = await StatisticsDbOperations.updateStatistic(application_statistic_id, updatedValues);
    return res.status(result.status || 200).json(result);
  } catch (error) {
    console.error("Error updating statistic:", error);
    return res.status(500).json({ status: 500, message: "Internal Server Error", error: error.message });
  }
});

// ---------------- DELETE ----------------
StatisticRouter.delete("/:id", async (req, res) => {
  try {
    const result = await StatisticsDbOperations.deleteStatistic(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

// ---------------- Helper: format a statistic for dashboard ----------------
function formatStatistic(s) {
  const totalTrips = s.trips_count || 0;
  const totalBilled = s.billed_amount_usd || 0;

  const privateTrips = s.private_trips_count || 0;
  const rideshareTrips = s.rideshare_trips_count || 0;

  const privateBilled = s.private_billed_amount_usd || 0;
  const rideshareBilled = s.rideshare_billed_amount_usd || 0;

  const privateTripPercentage = totalTrips > 0 ? (privateTrips / totalTrips) * 100 : 0;
  const rideshareTripPercentage = totalTrips > 0 ? (rideshareTrips / totalTrips) * 100 : 0;

  const privateBilledPercentage = totalBilled > 0 ? (privateBilled / totalBilled) * 100 : 0;
  const rideshareBilledPercentage = totalBilled > 0 ? (rideshareBilled / totalBilled) * 100 : 0;

  return {
    date: s.datefor,
    total_trips: totalTrips,
    total_billed: totalBilled,
    trips_per_customer: s.trips_per_customer,
    average_trip_rate_usd: s.average_trip_rate_usd,
    trips: {
      private: {
        count: privateTrips,
        billed: privateBilled,
        percentage_of_total: privateTripPercentage.toFixed(2),
        billed_percentage: privateBilledPercentage.toFixed(2),
      },
      rideshare: {
        count: rideshareTrips,
        billed: rideshareBilled,
        percentage_of_total: rideshareTripPercentage.toFixed(2),
        billed_percentage: rideshareBilledPercentage.toFixed(2),
      },
    },
    new_customers: {
      total: s.new_customer_count,
      private: s.private_new_customers,
      rideshare: s.rideshare_new_customers,
    },
    new_drivers: {
      total: s.new_drivers_count,
      private: s.private_new_drivers,
      rideshare: s.rideshare_new_drivers,
    },
    complaints: {
      total: s.complaints_count,
      private: s.private_complaints,
      rideshare: s.rideshare_complaints,
    },
    user_activity: {
      signed_up_today: s.signed_up_today,
      logged_in_today: s.users_logged_in_today,
      logged_in_1_day_ago: s.users_logged_in_one_day_ago,
      logged_in_2_days_ago: s.users_logged_in_two_days_ago,
      logged_in_3_days_ago: s.users_logged_in_three_days_ago,
      logged_in_7_days_ago: s.users_logged_in_seven_days_ago,
      logged_in_14_days_ago: s.users_logged_in_fourteen_days_ago,
      logged_in_30_days_ago: s.users_logged_in_thirty_days_ago,
      average_engagement_days: s.average_engagement_time,
    },
    wallets: {
      driver: {
        open_balance: s.driver_open_balance,
        top_up: s.driver_top_up,
        billed_charges: s.driver_billed_charges,
        withdrawals: s.driver_withdrawals,
        escrow: s.driver_escrow,
        promo: s.driver_promo,
        deductions: s.driver_deductions,
        additions: s.driver_additions,
        close_balance: s.driver_close_balance,
      },
      customer: {
        open_balance: s.customer_open_balance,
        top_up: s.customer_top_up,
        billed_charges: s.customer_billed_charges,
        withdrawals: s.customer_withdrawals,
        escrow: s.customer_escrow,
        promo: s.customer_promo,
        deductions: s.customer_deductions,
        additions: s.customer_additions,
        close_balance: s.customer_close_balance,
      },
      company: {
        open_balance: s.company_open_balance,
        income_from_charges: s.company_income_from_charges,
        promotions: s.company_promotions,
        withdraws_out: s.company_withdraws_out,
        close_balance: s.company_close_balance,
      },
      totals: {
        sum_commission_uw: s.sum_commission_uw,
        sum_commission_vw: s.sum_commission_vw,
        sum_promotion_uw: s.sum_promotion_uw,
        sum_promotion_vw: s.sum_promotion_vw,
        sum_top_up_uw: s.sum_top_up_uw,
        sum_top_up_vw: s.sum_top_up_vw,
        sum_withdrawal_uw: s.sum_withdrawal_uw,
        sum_withdrawal_vw: s.sum_withdrawal_vw,
        sum_mischief_penalty_uw: s.sum_mischief_penalty_uw,
        sum_mischief_penalty_vw: s.sum_mischief_penalty_vw,
        user_wallet_total_balance: s.user_wallet_total_balance,
        main_wallet_total_balance: s.main_wallet_total_balance,
        main_wallet_balance: s.main_wallet_balance,
        revenue_wallet_total_balance: s.revenue_wallet_total_balance,
        vendor_wallet_total_balance: s.vendor_wallet_total_balance,
        escrow_total_balance: s.escrow_total_balance,
      }
    }
  };
}

module.exports = StatisticRouter;
