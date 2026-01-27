// SMS Notification Service for Batch Notifications
const smsTemplates = require('./smsTemplates');

class SMSNotificationService {
  constructor() {
    this.apiEndpoint = 'https://srv547457.hstgr.cloud:3003/smsendpoint';
    this.clientId = '1001';
    this.clientKey = 'hdojFa502Uy6nG2';
    this.senderId = 'REMS';
  }

  // Send SMS notification to single recipient
  async sendSMS(phoneNumber, message) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientid: this.clientId,
          clientkey: this.clientKey,
          message,
          recipients: [phoneNumber],
          senderid: this.senderId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SMS sending error:', response.status, errorText);
        throw new Error(`SMS failed: ${response.status}`);
      }

      console.log(`✅ SMS sent to ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('❌ SMS service error:', error);
      return false;
    }
  }

  // Send batch SMS to multiple recipients
  async sendBatchSMS(phoneNumbers, message) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientid: this.clientId,
          clientkey: this.clientKey,
          message,
          recipients: phoneNumbers,
          senderid: this.senderId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Batch SMS sending error:', response.status, errorText);
        throw new Error(`Batch SMS failed: ${response.status}`);
      }

      console.log(`✅ Batch SMS sent to ${phoneNumbers.length} recipients`);
      return true;
    } catch (error) {
      console.error('❌ Batch SMS service error:', error);
      return false;
    }
  }

  // Format rideshare batch notification message
  formatBatchNotificationMessage(batchData) {
    const {
      totalRequests,
      areaName,
      destinations = [],
      driverName = 'Driver'
    } = batchData;

    const destinationsList = destinations.slice(0, 3).join(', ');
    const destinationsText = destinationsList || 'Multiple locations';

    return `🚀 XGO High Demand Alert!\n\nHi ${driverName},\n${totalRequests} rideshare requests in ${areaName}. Top destinations: ${destinationsText}\n\nOpen app for high earning opportunities!\n\n- XGO Team`;
  }

  // Send batch rideshare notification via SMS
  async sendBatchRideshareSMS(drivers, batchData) {
    // Choose appropriate template based on request volume
    const templateKey = batchData.totalRequests >= 10 
      ? 'rideshare_batch_high_demand' 
      : 'rideshare_batch_medium';

    // Check if notification should be sent
    if (!smsTemplates.shouldSend(templateKey, batchData)) {
      console.log(`⚠️ SMS conditions not met for template: ${templateKey}`);
      return false;
    }

    const message = smsTemplates.formatMessage(templateKey, {
      driverName: '{driverName}', // Will be replaced per driver
      totalRequests: batchData.totalRequests,
      areaName: batchData.areaName,
      destinations: batchData.destinations?.slice(0, 3).join(', ') || 'Multiple locations'
    });

    const phoneNumbers = drivers.map(driver => driver.phone_number).filter(Boolean);

    if (phoneNumbers.length === 0) {
      console.log('⚠️ No phone numbers found for SMS notification');
      return false;
    }

    console.log(`📱 Sending batch SMS (${templateKey}) to ${phoneNumbers.length} drivers`);
    
    return await this.sendBatchSMS(phoneNumbers, message);
  }

  // Send individual driver notification
  async sendDriverNotification(driver, notificationData) {
    const message = this.formatDriverMessage(driver, notificationData);
    
    if (!driver.phone_number) {
      console.log('⚠️ No phone number for driver:', driver.driver_id);
      return false;
    }

    return await this.sendSMS(driver.phone_number, message);
  }

  // Format individual driver message
  formatDriverMessage(driver, notificationData) {
    const { type, totalRequests, areaName, destinations } = notificationData;
    
    switch (type) {
      case 'rideshare_batch':
        return this.formatBatchNotificationMessage({
          totalRequests,
          areaName,
          destinations,
          driverName: driver.name || 'Driver'
        });
      
      case 'high_demand':
        return `🔥 XGO High Demand Alert!\n\nHi ${driver.name || 'Driver'},\nHigh demand in your area! Open app for premium rides.\n\n- XGO Team`;
      
      case 'price_suggestion':
        return `💡 XGO Price Tip!\n\nHi ${driver.name || 'Driver'},\nConsider increasing prices by 20% for better matches.\n\n- XGO Team`;
      
      default:
        return `📱 XGO Notification\n\nHi ${driver.name || 'Driver'},\nNew ride opportunities available. Open app to view.\n\n- XGO Team`;
    }
  }

  // Send SMS to passengers about ride status
  async sendPassengerRideSMS(passenger, rideData) {
    const { status, driverName, eta, fare } = rideData;
    
    let message = `🚗 XGO Ride Update\n\nHi ${passenger.name || 'Passenger'},\n`;
    
    switch (status) {
      case 'driver_assigned':
        message += `Driver ${driverName} has been assigned to your ride.`;
        break;
      case 'driver_on_way':
        message += `Driver ${driverName} is on the way! ETA: ${eta || '5-10 minutes'}.`;
        break;
      case 'ride_completed':
        message += `Your ride has been completed. Fare: $${fare}. Thank you for using XGO!`;
        break;
      default:
        message += `Your ride status has been updated.`;
    }
    
    message += `\n\n- XGO Team`;
    
    if (!passenger.phone_number) {
      console.log('⚠️ No phone number for passenger:', passenger.customer_id);
      return false;
    }

    return await this.sendSMS(passenger.phone_number, message);
  }

  // Send promotional SMS
  async sendPromotionalSMS(phoneNumbers, promotionData) {
    const { title, description, promoCode, expiry } = promotionData;
    
    const message = `🎁 XGO Special Offer!\n\n${title}\n${description}\n\nPromo code: ${promoCode}\nExpires: ${expiry}\n\n- XGO Team`;
    
    return await this.sendBatchSMS(phoneNumbers, message);
  }

  // Validate phone number format
  validatePhoneNumber(phoneNumber) {
    // Basic validation for international format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  // Clean and format phone number
  cleanPhoneNumber(phoneNumber) {
    // Remove spaces, dashes, parentheses
    let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }
}

module.exports = new SMSNotificationService();
