// SMS Notification Templates
class SMSTemplates {
  constructor() {
    this.templates = {
      // Batch notifications
      rideshare_batch_high_demand: {
        template: "🚀 XGO High Demand Alert!\n\nHi {driverName},\n{totalRequests} rideshare requests in {areaName}. Top destinations: {destinations}\n\nOpen app for high earning opportunities!\n\n- XGO Team",
        priority: "high",
        conditions: { minRequests: 10 }
      },
      
      rideshare_batch_medium: {
        template: "📱 XGO Rideshare Alert\n\nHi {driverName},\n{totalRequests} rideshare requests in {areaName}. Top destinations: {destinations}\n\nOpen app to view requests.\n\n- XGO Team",
        priority: "medium",
        conditions: { minRequests: 5 }
      },

      // Individual notifications
      driver_assigned: {
        template: "🚗 XGO Driver Assigned\n\nHi {passengerName},\nDriver {driverName} has been assigned to your ride.\n\n- XGO Team",
        priority: "high"
      },

      driver_on_way: {
        template: "🚗 XGO Driver On Way\n\nHi {passengerName},\nDriver {driverName} is on the way! ETA: {eta}.\n\n- XGO Team",
        priority: "high"
      },

      ride_completed: {
        template: "✅ XGO Ride Completed\n\nHi {passengerName},\nYour ride has been completed. Fare: ${fare}. Thank you for using XGO!\n\n- XGO Team",
        priority: "medium"
      },

      // Promotional notifications
      price_suggestion: {
        template: "💡 XGO Price Tip!\n\nHi {driverName},\nConsider increasing prices by 20% for better matches in your area.\n\n- XGO Team",
        priority: "low"
      },

      high_demand_alert: {
        template: "🔥 XGO High Demand Alert!\n\nHi {driverName},\nHigh demand in your area! Open app for premium rides.\n\n- XGO Team",
        priority: "high"
      },

      // Promotional campaigns
      weekend_bonus: {
        template: "🎁 XGO Weekend Bonus!\n\nHi {driverName},\nEarn 2x points on all rides this weekend! Complete 5 rides for $10 bonus.\n\n- XGO Team",
        priority: "medium"
      },

      referral_reward: {
        template: "🎉 XGO Referral Success!\n\nHi {driverName},\nYour friend just joined! You earned 500 points. Keep referring for more rewards.\n\n- XGO Team",
        priority: "medium"
      },

      // System notifications
      payment_processed: {
        template: "💰 XGO Payment Processed\n\nHi {driverName},\nYour payment of ${amount} has been processed and will be in your account soon.\n\n- XGO Team",
        priority: "high"
      },

      document_expiry: {
        template: "📄 XGO Document Reminder\n\nHi {driverName},\nYour {documentType} expires on {expiryDate}. Please update it to continue driving.\n\n- XGO Team",
        priority: "high"
      }
    };
  }

  // Get template by key
  getTemplate(key) {
    return this.templates[key] || this.templates.default_notification;
  }

  // Format message with data
  formatMessage(templateKey, data) {
    const template = this.getTemplate(templateKey);
    if (!template) {
      return this.formatDefaultMessage(data);
    }

    let message = template.template;
    
    // Replace placeholders
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`;
      message = message.replace(new RegExp(placeholder, 'g'), data[key] || '');
    });

    return message;
  }

  // Default message fallback
  formatDefaultMessage(data) {
    const { driverName = 'Driver', passengerName = 'Passenger' } = data;
    return `📱 XGO Notification\n\nHi ${driverName || passengerName},\nYou have a new notification. Open the app to view details.\n\n- XGO Team`;
  }

  // Check if notification should be sent based on conditions
  shouldSend(templateKey, data) {
    const template = this.getTemplate(templateKey);
    if (!template || !template.conditions) {
      return true;
    }

    const { conditions } = template;
    
    // Check minimum requests condition
    if (conditions.minRequests && data.totalRequests) {
      return data.totalRequests >= conditions.minRequests;
    }

    // Check maximum requests condition
    if (conditions.maxRequests && data.totalRequests) {
      return data.totalRequests <= conditions.maxRequests;
    }

    // Check time-based conditions
    if (conditions.timeWindow && data.timestamp) {
      const now = Date.now();
      const timeDiff = now - data.timestamp;
      return timeDiff <= conditions.timeWindow;
    }

    return true;
  }

  // Get all high priority templates
  getHighPriorityTemplates() {
    return Object.entries(this.templates)
      .filter(([key, template]) => template.priority === 'high')
      .map(([key, template]) => ({ key, ...template }));
  }

  // Get promotional templates
  getPromotionalTemplates() {
    return Object.entries(this.templates)
      .filter(([key, template]) => key.includes('bonus') || key.includes('referral') || key.includes('weekend'))
      .map(([key, template]) => ({ key, ...template }));
  }

  // Add custom template
  addTemplate(key, template) {
    this.templates[key] = template;
  }

  // Remove template
  removeTemplate(key) {
    delete this.templates[key];
  }

  // Validate template format
  validateTemplate(template) {
    const requiredFields = ['template', 'priority'];
    return requiredFields.every(field => template.hasOwnProperty(field));
  }

  // Get template statistics
  getTemplateStats() {
    const stats = {
      total: Object.keys(this.templates).length,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0,
      withConditions: 0
    };

    Object.values(this.templates).forEach(template => {
      switch (template.priority) {
        case 'high':
          stats.highPriority++;
          break;
        case 'medium':
          stats.mediumPriority++;
          break;
        case 'low':
          stats.lowPriority++;
          break;
      }
      
      if (template.conditions) {
        stats.withConditions++;
      }
    });

    return stats;
  }
}

module.exports = new SMSTemplates();
