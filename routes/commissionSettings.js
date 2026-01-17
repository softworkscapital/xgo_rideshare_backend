const express = require("express");
const router = express.Router();
const commissionSettingsDb = require("../cruds/commissionSettings");

// Get commission settings
router.get("/settings", async (req, res) => {
  try {
    const settings = await commissionSettingsDb.getCommissionSettings();
    const promotionActive = await commissionSettingsDb.isPromotionActive();
    
    res.json({
      status: 200,
      settings: {
        ...settings,
        promotion_active: promotionActive
      }
    });
  } catch (error) {
    console.error("Error getting commission settings:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to get commission settings"
    });
  }
});

// Update commission settings (Admin only)
router.put("/settings", async (req, res) => {
  try {
    const {
      percentage_commission_rate,
      daily_flat_figure_commission,
      daily_promotion_active,
      promotion_start_date,
      promotion_end_date,
      lock_to_percentage,
      auto_switch_percentage
    } = req.body;

    // Validate required fields
    if (!percentage_commission_rate || !daily_flat_figure_commission) {
      return res.status(400).json({
        status: 400,
        error: "percentage_commission_rate and daily_flat_figure_commission are required"
      });
    }

    // Validate promotion dates
    if (daily_promotion_active && (!promotion_start_date || !promotion_end_date)) {
      return res.status(400).json({
        status: 400,
        error: "promotion_start_date and promotion_end_date are required when promotion is active"
      });
    }

    const result = await commissionSettingsDb.updateCommissionSettings({
      percentage_commission_rate,
      daily_flat_figure_commission,
      daily_promotion_active,
      promotion_start_date,
      promotion_end_date,
      lock_to_percentage,
      auto_switch_percentage
    });

    res.json(result);
  } catch (error) {
    console.error("Error updating commission settings:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to update commission settings"
    });
  }
});

// Calculate commission for a trip
router.post("/calculate", async (req, res) => {
  try {
    const { userId, acceptedFare, userPreference } = req.body;

    if (!userId || !acceptedFare) {
      return res.status(400).json({
        status: 400,
        error: "userId and acceptedFare are required"
      });
    }

    const commissionData = await commissionSettingsDb.calculateCommission(
      userId, 
      parseFloat(acceptedFare), 
      userPreference
    );

    res.json({
      status: 200,
      commission: commissionData
    });
  } catch (error) {
    console.error("Error calculating commission:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to calculate commission"
    });
  }
});

// Check if daily commission is already paid
router.get("/daily-commission-check/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        status: 400,
        error: "userId is required"
      });
    }

    const isPaid = await commissionSettingsDb.checkDailyCommissionPaid(userId);
    
    res.json({
      status: 200,
      daily_commission_paid: isPaid
    });
  } catch (error) {
    console.error("Error checking daily commission:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to check daily commission status"
    });
  }
});

// Get driver earnings summary
router.get("/earnings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        status: 400,
        error: "userId is required"
      });
    }

    const earnings = await commissionSettingsDb.getDriverEarningsSummary(
      userId, 
      parseInt(days)
    );
    
    res.json({
      status: 200,
      earnings: earnings
    });
  } catch (error) {
    console.error("Error getting driver earnings:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to get driver earnings"
    });
  }
});

// Create commission notification
router.post("/notifications", async (req, res) => {
  try {
    const { userId, notificationType, message } = req.body;

    if (!userId || !notificationType || !message) {
      return res.status(400).json({
        status: 400,
        error: "userId, notificationType, and message are required"
      });
    }

    const result = await commissionSettingsDb.createCommissionNotification(
      userId, 
      notificationType, 
      message
    );

    res.json(result);
  } catch (error) {
    console.error("Error creating commission notification:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to create commission notification"
    });
  }
});

// Get user commission notifications
router.get("/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { unreadOnly = false } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        status: 400,
        error: "userId is required"
      });
    }

    const notifications = await commissionSettingsDb.getUserCommissionNotifications(
      userId, 
      unreadOnly === 'true'
    );
    
    res.json({
      status: 200,
      notifications: notifications
    });
  } catch (error) {
    console.error("Error getting commission notifications:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to get commission notifications"
    });
  }
});

// Mark notification as read
router.put("/notifications/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;
    
    if (!notificationId || !userId) {
      return res.status(400).json({
        status: 400,
        error: "notificationId and userId are required"
      });
    }

    const result = await commissionSettingsDb.markNotificationAsRead(
      notificationId, 
      userId
    );

    res.json(result);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to mark notification as read"
    });
  }
});

// Get commission analytics (Admin)
router.get("/analytics", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // This would require additional analytics queries
    // For now, return basic commission settings info
    const settings = await commissionSettingsDb.getCommissionSettings();
    const promotionActive = await commissionSettingsDb.isPromotionActive();
    
    res.json({
      status: 200,
      analytics: {
        current_settings: settings,
        promotion_active: promotionActive,
        // Add more analytics here as needed
      }
    });
  } catch (error) {
    console.error("Error getting commission analytics:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to get commission analytics"
    });
  }
});

// Get all drivers earnings summary (Admin)
router.get("/analytics/drivers-summary", async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const result = await commissionSettingsDb.getAllDriversEarningsSummary(parseInt(days));
    
    res.json(result);
  } catch (error) {
    console.error("Error getting drivers earnings summary:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to get drivers earnings summary"
    });
  }
});

// Get driver performance analytics (Admin)
router.get("/analytics/performance", async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const result = await commissionSettingsDb.getDriverPerformanceAnalytics(parseInt(days));
    
    res.json(result);
  } catch (error) {
    console.error("Error getting driver performance analytics:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to get driver performance analytics"
    });
  }
});

// Get commission type distribution (Admin)
router.get("/analytics/distribution", async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const result = await commissionSettingsDb.getCommissionTypeDistribution(parseInt(days));
    
    res.json(result);
  } catch (error) {
    console.error("Error getting commission type distribution:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to get commission type distribution"
    });
  }
});

module.exports = router;
