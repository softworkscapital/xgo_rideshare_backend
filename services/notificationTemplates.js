const notificationTemplates = {
  // Private Ride Notifications
  private_ride_nearby: {
    title: "🚗 Private Ride Request Nearby",
    body: "{count} passengers requesting private rides within 2km",
    priority: "high",
    data: {
      type: "ride_request",
      action: "view_private_requests"
    }
  },

  // Rideshare Notifications
  rideshare_nearby: {
    title: "🚙 Rideshare Request Nearby",
    body: "{count} passengers requesting rideshare within 2km",
    priority: "high",
    data: {
      type: "rideshare_request",
      action: "view_rideshare_requests"
    }
  },

  rideshare_nearby_with_destination: {
    title: "🎯 Popular Route Available",
    body: "{count} rideshare requests to {destination} within 2km",
    priority: "high",
    data: {
      type: "rideshare_request",
      action: "view_rideshare_requests",
      destination: "{destination}"
    }
  },

  // Batch notifications for multiple requests
  rideshare_batch_nearby: {
    title: "🚀 High Demand Area Alert!",
    body: "{totalRequests} rideshare requests in {areaName}. Top destinations: {destinations}",
    priority: "high",
    data: {
      type: "rideshare_batch_request",
      action: "view_rideshare_requests",
      totalRequests: "{totalRequests}",
      areaName: "{areaName}",
      destinations: "{destinations}"
    }
  },

  // Counter Offer Notifications
  counter_offer_received: {
    title: "💰 Counter Offer Received",
    body: "{senderName} sent counter offer: ${amount}",
    priority: "high",
    data: {
      type: "counter_offer",
      action: "view_offer",
      senderId: "{senderId}",
      amount: "{amount}"
    }
  },

  // Offer Status Notifications
  offer_declined: {
    title: "❌ Offer Declined",
    body: "Driver declined your offer. Searching for new driver...",
    priority: "medium",
    data: {
      type: "offer_declined",
      action: "continue_searching"
    }
  },

  // Ride Acceptance Notifications
  ride_accepted: {
    title: "🎉 Your Ride Has Been Accepted!",
    body: "Driver {driverName} accepted your offer",
    priority: "high",
    data: {
      type: "ride_accepted",
      action: "view_trip_details",
      driverId: "{driverId}"
    }
  },

  rideshare_accepted: {
    title: "🚙 Rideshare Matched!",
    body: "Driver {driverName} accepted your rideshare request",
    priority: "high",
    data: {
      type: "rideshare_accepted",
      action: "view_trip_details",
      driverId: "{driverId}"
    }
  },

  rideshare_matched: {
    title: "🚙 Rideshare Matched!",
    body: "Driver {driverName} found! {totalPassengers} passengers total",
    priority: "high",
    data: {
      type: "rideshare_matched",
      action: "view_trip_details",
      driverId: "{driverId}",
      otherPassengers: "{otherPassengers}"
    }
  },

  // Driver Status Updates
  driver_on_way: {
    title: "🚗 Your Driver is On the Way",
    body: "Driver {driverName} is heading to your location (ETA: {eta} min)",
    priority: "high",
    data: {
      type: "driver_on_way",
      action: "track_driver",
      driverId: "{driverId}"
    }
  },

  driver_arrived: {
    title: "📍 Your Driver Has Arrived!",
    body: "Driver {driverName} is waiting at pickup location",
    priority: "high",
    data: {
      type: "driver_arrived",
      action: "contact_driver",
      driverId: "{driverId}"
    }
  },

  // Trip Completion
  trip_completed: {
    title: "✅ Trip Completed!",
    body: "Thank you for riding with XGO! Rate your experience",
    priority: "medium",
    data: {
      type: "trip_completed",
      action: "rate_trip",
      tripId: "{tripId}"
    }
  },

  // Payment Notifications
  payment_received: {
    title: "💳 Payment Received",
    body: "You received ${amount} for trip {tripId}",
    priority: "medium",
    data: {
      type: "payment_received",
      action: "view_earnings",
      tripId: "{tripId}"
    }
  },

  // Message Notifications
  new_message: {
    title: "💬 New Message",
    body: "{senderName}: {message}",
    priority: "medium",
    data: {
      type: "new_message",
      action: "view_chat",
      senderId: "{senderId}"
    }
  },

  // Match Rate Improvement Notifications
  no_match_suggestion: {
    title: "🔍 Still Searching...",
    body: "Increase offer by {increasePercent}% for faster matching",
    priority: "high",
    data: {
      type: "price_suggestion",
      action: "update_offer",
      currentOffer: "{currentOffer}",
      suggestedOffer: "{suggestedOffer}"
    }
  },

  high_demand_alert: {
    title: "🔥 High Demand in Your Area!",
    body: "Drivers are busy. Consider increasing prices by {suggestedIncrease}%",
    priority: "high",
    data: {
      type: "high_demand",
      action: "view_demand_map",
      location: "{location}",
      demandMultiplier: "{demandMultiplier}"
    }
  },

  quick_match_available: {
    title: "⚡ Driver Available Now!",
    body: "Accept for immediate pickup ({distance}km away, ${estimatedEarnings})",
    priority: "high",
    data: {
      type: "quick_match",
      action: "accept_ride",
      passengerId: "{passengerId}",
      distance: "{distance}",
      estimatedEarnings: "{estimatedEarnings}"
    }
  },

  popular_route_alert: {
    title: "🎯 Popular Route Alert",
    body: "{requestCount} requests from {origin} → {destination} (${potentialEarnings})",
    priority: "medium",
    data: {
      type: "popular_route",
      action: "view_route_opportunities",
      origin: "{origin}",
      destination: "{destination}",
      potentialEarnings: "{potentialEarnings}"
    }
  },

  // User Experience Improvements
  pre_trip_reminder: {
    title: "📍 Be Ready!",
    body: "Driver {driverName} arriving in {minutesUntil} minutes",
    priority: "high",
    data: {
      type: "pre_trip_reminder",
      action: "track_driver",
      driverName: "{driverName}"
    }
  },

  driver_delay: {
    title: "⏰ Driver Running Late",
    body: "Driver {driverName} running {delayMinutes} minutes late (New ETA: {newEta})",
    priority: "high",
    data: {
      type: "driver_delay",
      action: "view_updated_eta",
      driverName: "{driverName}",
      delayMinutes: "{delayMinutes}"
    }
  },

  // Engagement Notifications
  price_suggestion: {
    title: "💡 Suggested Price",
    body: "${amount} for 90% match rate in your area",
    priority: "medium",
    data: {
      type: "price_suggestion",
      action: "use_suggested_price",
      suggestedPrice: "{amount}"
    }
  },

  // Driver Engagement
  driver_utilization_low: {
    title: "📊 Increase Your Earnings",
    body: "You're online but not getting requests. Try moving to a busy area",
    priority: "low",
    data: {
      type: "utilization_tip",
      action: "view_heat_map"
    }
  },

  // Passenger Engagement
  ride_request_timeout: {
    title: "⏰ Request Timeout",
    body: "No drivers available. Try again or increase your offer",
    priority: "medium",
    data: {
      type: "request_timeout",
      action: "retry_request"
    }
  },

  // System Notifications
  system_maintenance: {
    title: "🔧 Scheduled Maintenance",
    body: "App will be unavailable for 30 minutes starting at {time}",
    priority: "low",
    data: {
      type: "system_maintenance",
      action: "view_details"
    }
  },

  // Promotional Notifications
  promo_code_available: {
    title: "🎁 Special Offer!",
    body: "Use code {code} for {discount}% off your next ride",
    priority: "low",
    data: {
      type: "promo",
      action: "apply_promo",
      code: "{code}",
      discount: "{discount}"
    }
  },

  // Safety Notifications
  safety_reminder: {
    title: "🛡️ Safety Reminder",
    body: "Always verify your driver and vehicle details before starting your trip",
    priority: "low",
    data: {
      type: "safety_tip",
      action: "view_safety_guide"
    }
  },

  // Rating Reminders
  rating_reminder: {
    title: "⭐ Rate Your Trip",
    body: "How was your experience with {driverName}?",
    priority: "medium",
    data: {
      type: "rating_reminder",
      action: "rate_driver",
      driverName: "{driverName}"
    }
  }
};

// Template substitution helper
function substituteTemplate(template, data) {
  let result = template;
  
  // Replace placeholders with actual data
  Object.keys(data).forEach(key => {
    const placeholder = `{${key}}`;
    const value = data[key];
    
    if (typeof value === 'object') {
      result = result.replace(new RegExp(placeholder, 'g'), JSON.stringify(value));
    } else {
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
  });
  
  return result;
}

// Get notification template by type
function getNotificationTemplate(type, data = {}) {
  const template = notificationTemplates[type];
  
  if (!template) {
    console.error(`❌ Notification template not found: ${type}`);
    return {
      title: "XGO Notification",
      body: "You have a new notification",
      priority: "medium",
      data: { type: "generic" }
    };
  }
  
  // Create a copy of the template
  const result = JSON.parse(JSON.stringify(template));
  
  // Substitute placeholders in title and body
  result.title = substituteTemplate(result.title, data);
  result.body = substituteTemplate(result.body, data);
  
  // Process data object
  if (result.data) {
    Object.keys(result.data).forEach(key => {
      if (typeof result.data[key] === 'string' && result.data[key].includes('{')) {
        result.data[key] = substituteTemplate(result.data[key], data);
      }
    });
  }
  
  return result;
}

module.exports = {
  notificationTemplates,
  getNotificationTemplate,
  substituteTemplate
};
