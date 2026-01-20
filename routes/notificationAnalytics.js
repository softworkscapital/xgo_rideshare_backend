const express = require("express");
const analyticsRouter = express.Router();
const notificationAnalytics = require("../services/notificationAnalytics");

// Get comprehensive notification analytics
analyticsRouter.get("/dashboard", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 7 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const analytics = await notificationAnalytics.getNotificationAnalytics(
      start.toISOString(), 
      end.toISOString()
    );
    
    res.json({
      status: 200,
      data: analytics,
      message: "Analytics retrieved successfully"
    });
  } catch (error) {
    console.error('❌ Error getting dashboard analytics:', error);
    res.status(500).json({
      status: 500,
      error: "Failed to get dashboard analytics",
      message: error.message
    });
  }
});

// Get match rate analytics
analyticsRouter.get("/match-rates", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 7 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const matchRates = await notificationAnalytics.getMatchRateAnalytics(
      start.toISOString(), 
      end.toISOString()
    );
    
    res.json({
      status: 200,
      data: matchRates,
      message: "Match rate analytics retrieved successfully"
    });
  } catch (error) {
    console.error('❌ Error getting match rate analytics:', error);
    res.status(500).json({
      status: 500,
      error: "Failed to get match rate analytics",
      message: error.message
    });
  }
});

// Get user engagement analytics
analyticsRouter.get("/user-engagement", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 7 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const userEngagement = await notificationAnalytics.getUserEngagementAnalytics(
      start.toISOString(), 
      end.toISOString()
    );
    
    res.json({
      status: 200,
      data: userEngagement,
      message: "User engagement analytics retrieved successfully"
    });
  } catch (error) {
    console.error('❌ Error getting user engagement analytics:', error);
    res.status(500).json({
      status: 500,
      error: "Failed to get user engagement analytics",
      message: error.message
    });
  }
});

// Get performance analytics
analyticsRouter.get("/performance", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 7 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const performance = await notificationAnalytics.getPerformanceAnalytics(
      start.toISOString(), 
      end.toISOString()
    );
    
    res.json({
      status: 200,
      data: performance,
      message: "Performance analytics retrieved successfully"
    });
  } catch (error) {
    console.error('❌ Error getting performance analytics:', error);
    res.status(500).json({
      status: 500,
      error: "Failed to get performance analytics",
      message: error.message
    });
  }
});

// Get trends analytics
analyticsRouter.get("/trends", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 7 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const trends = await notificationAnalytics.getTrendsAnalytics(
      start.toISOString(), 
      end.toISOString()
    );
    
    res.json({
      status: 200,
      data: trends,
      message: "Trends analytics retrieved successfully"
    });
  } catch (error) {
    console.error('❌ Error getting trends analytics:', error);
    res.status(500).json({
      status: 500,
      error: "Failed to get trends analytics",
      message: error.message
    });
  }
});

// Get real-time metrics
analyticsRouter.get("/realtime", async (req, res) => {
  try {
    const realTimeMetrics = await notificationAnalytics.getRealTimeMetrics();
    
    res.json({
      status: 200,
      data: realTimeMetrics,
      message: "Real-time metrics retrieved successfully"
    });
  } catch (error) {
    console.error('❌ Error getting real-time metrics:', error);
    res.status(500).json({
      status: 500,
      error: "Failed to get real-time metrics",
      message: error.message
    });
  }
});

// Get match rate by time of day
analyticsRouter.get("/match-rates-by-time", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 7 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const matchRatesByTime = await notificationAnalytics.getMatchRateByTimeOfDay(
      start.toISOString(), 
      end.toISOString()
    );
    
    res.json({
      status: 200,
      data: matchRatesByTime,
      message: "Match rates by time of day retrieved successfully"
    });
  } catch (error) {
    console.error('❌ Error getting match rates by time of day:', error);
    res.status(500).json({
      status: 500,
      error: "Failed to get match rates by time of day",
      message: error.message
    });
  }
});

// Get recommendations
analyticsRouter.get("/recommendations", async (req, res) => {
  try {
    const recommendations = await notificationAnalytics.generateRecommendations();
    
    res.json({
      status: 200,
      data: recommendations,
      message: "Recommendations retrieved successfully"
    });
  } catch (error) {
    console.error('❌ Error getting recommendations:', error);
    res.status(500).json({
      status: 500,
      error: "Failed to get recommendations",
      message: error.message
    });
  }
});

// Clear cache
analyticsRouter.post("/clear-cache", async (req, res) => {
  try {
    notificationAnalytics.clearCache();
    
    res.json({
      status: 200,
      message: "Cache cleared successfully"
    });
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    res.status(500).json({
      status: 500,
      error: "Failed to clear cache",
      message: error.message
    });
  }
});

// KPI Summary endpoint for dashboard
analyticsRouter.get("/kpi-summary", async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range based on period
    const end = new Date();
    const start = new Date();
    
    switch (period) {
      case '1d':
        start.setDate(end.getDate() - 1);
        break;
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      default:
        start.setDate(end.getDate() - 7);
    }
    
    // Get analytics data
    const [overview, matchRates, realTime] = await Promise.all([
      notificationAnalytics.getOverviewAnalytics(start.toISOString(), end.toISOString()),
      notificationAnalytics.getMatchRateAnalytics(start.toISOString(), end.toISOString()),
      notificationAnalytics.getRealTimeMetrics()
    ]);
    
    console.log('📊 Analytics data:', {
      overview: overview ? 'received' : 'missing',
      matchRates: matchRates ? 'received' : 'missing',
      realTime: realTime ? 'received' : 'missing'
    });
    
    if (!matchRates) {
      console.error('❌ matchRates is undefined');
      matchRates = {
        overall: { matchRate: 0 },
        privateRides: { matchRate: 0 },
        rideshare: { matchRate: 0 }
      };
    }
    
    const kpiSummary = {
      period: period,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      notifications: {
        total: overview.totalNotifications || 0,
        delivered: overview.deliveredNotifications || 0,
        opened: overview.openedNotifications || 0,
        deliveryRate: parseFloat(overview.deliveryRate) || 0,
        openRate: parseFloat(overview.openRate) || 0
      },
      matchRates: {
        overall: parseFloat(matchRates?.overall?.matchRate || 0),
        privateRides: parseFloat(matchRates?.privateRides?.matchRate || 0),
        rideshare: parseFloat(matchRates?.rideshare?.matchRate || 0)
      },
      realTime: {
        notificationsLastHour: realTime.notificationsLastHour || 0,
        deliveryRateLastHour: parseFloat(realTime.deliveryRateLastHour) || 0,
        openRateLastHour: parseFloat(realTime.openRateLastHour) || 0
      },
      performance: {
        avgDeliveryTime: overview.avgDeliveryTime || 0,
        avgOpenTime: overview.avgOpenTime || 0
      }
    };
    
    res.json({
      status: 200,
      data: kpiSummary,
      message: "KPI summary retrieved successfully"
    });
  } catch (error) {
    console.error('❌ Error getting KPI summary:', error);
    res.status(500).json({
      status: 500,
      error: "Failed to get KPI summary",
      message: error.message
    });
  }
});

module.exports = analyticsRouter;