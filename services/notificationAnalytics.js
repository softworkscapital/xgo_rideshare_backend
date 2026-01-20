const pool = require('../cruds/poolfile');
const NotificationsCRUD = require('../cruds/notifications');

class NotificationAnalytics {
  constructor() {
    this.metricsCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  // Get comprehensive notification analytics
  async getNotificationAnalytics(startDate, endDate, filters = {}) {
    try {
      const cacheKey = `analytics_${startDate}_${endDate}_${JSON.stringify(filters)}`;
      
      // Check cache first
      if (this.metricsCache.has(cacheKey)) {
        const cached = this.metricsCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const analytics = {
        overview: await this.getOverviewAnalytics(startDate, endDate),
        matchRates: await this.getMatchRateAnalytics(startDate, endDate),
        userEngagement: await this.getUserEngagementAnalytics(startDate, endDate),
        performance: await this.getPerformanceAnalytics(startDate, endDate),
        trends: await this.getTrendsAnalytics(startDate, endDate),
        recommendations: await this.generateRecommendations()
      };

      // Cache the results
      this.metricsCache.set(cacheKey, {
        data: analytics,
        timestamp: Date.now()
      });

      return analytics;
    } catch (error) {
      console.error('❌ Error getting notification analytics:', error);
      throw error;
    }
  }

  // Overview analytics
  async getOverviewAnalytics(startDate, endDate) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_notifications,
          COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END) as delivered_notifications,
          COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened_notifications,
          AVG(TIMESTAMPDIFF(SECOND, sent_at, delivered_at)) as avg_delivery_time_seconds,
          AVG(TIMESTAMPDIFF(SECOND, delivered_at, opened_at)) as avg_open_time_seconds
        FROM notifications 
        WHERE sent_at BETWEEN ? AND ?
      `;

      const results = await this.queryDatabase(query, [startDate, endDate]);
      const row = results[0] || {};

      return {
        totalNotifications: row.total_notifications || 0,
        deliveredNotifications: row.delivered_notifications || 0,
        openedNotifications: row.opened_notifications || 0,
        deliveryRate: row.total_notifications > 0 ? ((row.delivered_notifications / row.total_notifications) * 100).toFixed(2) : 0,
        openRate: row.delivered_notifications > 0 ? ((row.opened_notifications / row.delivered_notifications) * 100).toFixed(2) : 0,
        avgDeliveryTime: Math.round(row.avg_delivery_time_seconds || 0),
        avgOpenTime: Math.round(row.avg_open_time_seconds || 0)
      };
    } catch (error) {
      console.error('❌ Error getting overview analytics:', error);
      return {};
    }
  }

  // Match rate analytics
  async getMatchRateAnalytics(startDate, endDate) {
    try {
      console.log('🔍 Getting match rate analytics for:', startDate, endDate);
      
      // Private ride match rates
      const privateQuery = `
        SELECT 
          COUNT(DISTINCT customer_id) as total_private_requests,
          COUNT(DISTINCT CASE WHEN driver_id IS NOT NULL THEN customer_id END) as matched_private_requests
        FROM trips 
        WHERE request_start_datetime BETWEEN ? AND ?
          AND trip_type = 'private'
      `;

      // Rideshare match rates
      const rideshareQuery = `
        SELECT 
          COUNT(DISTINCT customer_id) as total_rideshare_requests,
          COUNT(DISTINCT CASE WHEN driver_id IS NOT NULL THEN customer_id END) as matched_rideshare_requests
        FROM rideshare_requests 
        WHERE created_at BETWEEN ? AND ?
      `;

      console.log('📊 Executing queries...');
      const [privateResults, rideshareResults] = await Promise.all([
        this.queryDatabase(privateQuery, [startDate, endDate]),
        this.queryDatabase(rideshareQuery, [startDate, endDate])
      ]);

      console.log('📈 Query results:', { 
        privateResults: privateResults?.length || 0, 
        rideshareResults: rideshareResults?.length || 0 
      });

      const privateRow = privateResults[0] || {};
      const rideshareRow = rideshareResults[0] || {};

      const result = {
        privateRides: {
          totalRequests: privateRow.total_private_requests || 0,
          matchedRequests: privateRow.matched_private_requests || 0,
          matchRate: privateRow.total_private_requests > 0 ? ((privateRow.matched_private_requests / privateRow.total_private_requests) * 100).toFixed(2) : 0
        },
        rideshare: {
          totalRequests: rideshareRow.total_rideshare_requests || 0,
          matchedRequests: rideshareRow.matched_rideshare_requests || 0,
          matchRate: rideshareRow.total_rideshare_requests > 0 ? ((rideshareRow.matched_rideshare_requests / rideshareRow.total_rideshare_requests) * 100).toFixed(2) : 0
        },
        overall: {
          totalRequests: (privateRow.total_private_requests || 0) + (rideshareRow.total_rideshare_requests || 0),
          matchedRequests: (privateRow.matched_private_requests || 0) + (rideshareRow.matched_rideshare_requests || 0),
          matchRate: ((privateRow.total_private_requests || 0) + (rideshareRow.total_rideshare_requests || 0)) > 0 ? 
            ((((privateRow.matched_private_requests || 0) + (rideshareRow.matched_rideshare_requests || 0)) / 
             ((privateRow.total_private_requests || 0) + (rideshareRow.total_rideshare_requests || 0))) * 100).toFixed(2) : 0
        }
      };

      console.log('✅ Match rate analytics result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error getting match rate analytics:', error);
      return {
        privateRides: { totalRequests: 0, matchedRequests: 0, matchRate: 0 },
        rideshare: { totalRequests: 0, matchedRequests: 0, matchRate: 0 },
        overall: { totalRequests: 0, matchedRequests: 0, matchRate: 0 }
      };
    }
  }

  // User engagement analytics
  async getUserEngagementAnalytics(startDate, endDate) {
    try {
      const query = `
        SELECT 
          u.user_id,
          u.user_type,
          COUNT(n.id) as notifications_received,
          COUNT(CASE WHEN n.delivered_at IS NOT NULL THEN 1 END) as notifications_delivered,
          COUNT(CASE WHEN n.opened_at IS NOT NULL THEN 1 END) as notifications_opened,
          AVG(CASE WHEN n.opened_at IS NOT NULL THEN TIMESTAMPDIFF(SECOND, n.sent_at, n.opened_at) END) as avg_response_time_seconds
        FROM users u
        LEFT JOIN notifications n ON u.user_id = n.user_id AND n.sent_at BETWEEN ? AND ?
        WHERE u.user_type IN ('customer', 'driver')
        GROUP BY u.user_id, u.user_type
        ORDER BY notifications_received DESC
        LIMIT 100
      `;

      const results = await this.queryDatabase(query, [startDate, endDate]);

      return results.map(row => ({
        userId: row.user_id,
        userType: row.user_type,
        notificationsReceived: row.notifications_received || 0,
        notificationsDelivered: row.notifications_delivered || 0,
        notificationsOpened: row.notifications_opened || 0,
        deliveryRate: row.notifications_received > 0 ? ((row.notifications_delivered / row.notifications_received) * 100).toFixed(2) : 0,
        openRate: row.notifications_delivered > 0 ? ((row.notifications_opened / row.notifications_delivered) * 100).toFixed(2) : 0,
        avgResponseTime: Math.round(row.avg_response_time_seconds || 0)
      }));
    } catch (error) {
      console.error('❌ Error getting user engagement analytics:', error);
      return [];
    }
  }

  // Performance analytics
  async getPerformanceAnalytics(startDate, endDate) {
    try {
      const query = `
        SELECT 
          notification_type,
          COUNT(*) as total_sent,
          COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END) as total_delivered,
          COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as total_opened,
          AVG(TIMESTAMPDIFF(SECOND, sent_at, delivered_at)) as avg_delivery_time,
          AVG(TIMESTAMPDIFF(SECOND, delivered_at, opened_at)) as avg_open_time
        FROM notifications 
        WHERE sent_at BETWEEN ? AND ?
        GROUP BY notification_type
        ORDER BY total_sent DESC
      `;

      const results = await this.queryDatabase(query, [startDate, endDate]);

      return results.map(row => ({
        notificationType: row.notification_type,
        totalSent: row.total_sent || 0,
        totalDelivered: row.total_delivered || 0,
        totalOpened: row.total_opened || 0,
        deliveryRate: row.total_sent > 0 ? ((row.total_delivered / row.total_sent) * 100).toFixed(2) : 0,
        openRate: row.total_delivered > 0 ? ((row.total_opened / row.total_delivered) * 100).toFixed(2) : 0,
        avgDeliveryTime: Math.round(row.avg_delivery_time || 0),
        avgOpenTime: Math.round(row.avg_open_time || 0)
      }));
    } catch (error) {
      console.error('❌ Error getting performance analytics:', error);
      return [];
    }
  }

  // Trends analytics
  async getTrendsAnalytics(startDate, endDate) {
    try {
      const query = `
        SELECT 
          DATE(sent_at) as date,
          COUNT(*) as notifications_sent,
          COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END) as notifications_delivered,
          COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as notifications_opened
        FROM notifications 
        WHERE sent_at BETWEEN ? AND ?
        GROUP BY DATE(sent_at)
        ORDER BY date ASC
      `;

      const results = await this.queryDatabase(query, [startDate, endDate]);

      return results.map(row => ({
        date: row.date,
        notificationsSent: row.notifications_sent || 0,
        notificationsDelivered: row.notifications_delivered || 0,
        notificationsOpened: row.notifications_opened || 0,
        deliveryRate: row.notifications_sent > 0 ? ((row.notifications_delivered / row.notifications_sent) * 100).toFixed(2) : 0,
        openRate: row.notifications_delivered > 0 ? ((row.notifications_opened / row.notifications_delivered) * 100).toFixed(2) : 0
      }));
    } catch (error) {
      console.error('❌ Error getting trends analytics:', error);
      return [];
    }
  }

  // Generate recommendations based on analytics
  async generateRecommendations() {
    try {
      const recommendations = [];

      // Get recent performance data
      const performanceQuery = `
        SELECT 
          notification_type,
          AVG(TIMESTAMPDIFF(SECOND, sent_at, delivered_at)) as avg_delivery_time,
          AVG(TIMESTAMPDIFF(SECOND, delivered_at, opened_at)) as avg_open_time,
          COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END) / COUNT(*) as delivery_rate,
          COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) / COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END) as open_rate
        FROM notifications 
        WHERE sent_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY notification_type
        HAVING COUNT(*) >= 10
      `;

      const performanceResults = await this.queryDatabase(performanceQuery);

      performanceResults.forEach(row => {
        if (row.delivery_rate < 80) {
          recommendations.push({
            type: 'delivery_rate',
            priority: 'high',
            notificationType: row.notification_type,
            message: `Low delivery rate (${row.delivery_rate.toFixed(1)}%) for ${row.notification_type}. Consider adjusting message content or timing.`,
            suggestion: 'Optimize message content and timing'
          });
        }

        if (row.open_rate < 50) {
          recommendations.push({
            type: 'open_rate',
            priority: 'high',
            notificationType: row.notification_type,
            message: `Low open rate (${row.open_rate.toFixed(1)}%) for ${row.notification_type}. Consider improving message relevance.`,
            suggestion: 'Personalize message content'
          });
        }

        if (row.avg_delivery_time > 10) {
          recommendations.push({
            type: 'delivery_time',
            priority: 'medium',
            notificationType: row.notification_type,
            message: `Slow delivery time (${row.avg_delivery_time}s) for ${row.notification_type}. Check Firebase configuration.`,
            suggestion: 'Optimize Firebase settings'
          });
        }
      });

      return recommendations;
    } catch (error) {
      console.error('❌ Error generating recommendations:', error);
      return [];
    }
  }

  // Real-time metrics
  async getRealTimeMetrics() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const query = `
        SELECT 
          COUNT(*) as notifications_last_hour,
          COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END) as delivered_last_hour,
          COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened_last_hour
        FROM notifications 
        WHERE sent_at >= ?
      `;

      const results = await this.queryDatabase(query, [oneHourAgo]);
      const row = results[0] || {};

      return {
        notificationsLastHour: row.notifications_last_hour || 0,
        deliveredLastHour: row.delivered_last_hour || 0,
        openedLastHour: row.opened_last_hour || 0,
        deliveryRateLastHour: row.notifications_last_hour > 0 ? ((row.delivered_last_hour / row.notifications_last_hour) * 100).toFixed(2) : 0,
        openRateLastHour: row.delivered_last_hour > 0 ? ((row.opened_last_hour / row.delivered_last_hour) * 100).toFixed(2) : 0,
        timestamp: now.toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting real-time metrics:', error);
      return {};
    }
  }

  // Match rate by time of day
  async getMatchRateByTimeOfDay(startDate, endDate) {
    try {
      const query = `
        SELECT 
          HOUR(request_start_datetime) as hour_of_day,
          COUNT(*) as total_requests,
          COUNT(CASE WHEN driver_id IS NOT NULL THEN 1 END) as matched_requests
        FROM trips 
        WHERE request_start_datetime BETWEEN ? AND ?
        GROUP BY HOUR(request_start_datetime)
        ORDER BY hour_of_day
      `;

      const results = await this.queryDatabase(query, [startDate, endDate]);

      return results.map(row => ({
        hourOfDay: row.hour_of_day,
        totalRequests: row.total_requests || 0,
        matchedRequests: row.matched_requests || 0,
        matchRate: row.total_requests > 0 ? ((row.matched_requests / row.total_requests) * 100).toFixed(2) : 0
      }));
    } catch (error) {
      console.error('❌ Error getting match rate by time of day:', error);
      return [];
    }
  }

  // Helper method to query database
  async queryDatabase(query, params = []) {
    return new Promise((resolve, reject) => {
      pool.query(query, params, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Clear cache
  clearCache() {
    this.metricsCache.clear();
  }
}

module.exports = new NotificationAnalytics();
