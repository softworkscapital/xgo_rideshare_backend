const axios = require('axios');

class SMSService {
  constructor() {
    // SMS API configuration
    this.apiKey = process.env.SMS_API_KEY;
    this.apiSecret = process.env.SMS_API_SECRET;
    this.senderId = process.env.SMS_SENDER_ID || 'XGOLife';
    this.apiUrl = process.env.SMS_API_URL || 'https://api.smsprovider.com/v1/send';
    
    // Emergency contacts
    this.emergencyContacts = {
      police: process.env.EMERGENCY_POLICE_NUMBER,
      ambulance: process.env.EMERGENCY_AMBULANCE_NUMBER,
      roadside: process.env.EMERGENCY_ROADSIDE_NUMBER,
      support: process.env.EMERGENCY_SUPPORT_NUMBER
    };
  }

  // Send emergency SMS alert
  async sendEmergencyAlert(emergencyType, userInfo, location, additionalInfo = {}) {
    try {
      console.log(`🚨 Sending emergency SMS alert: ${emergencyType}`);
      
      // Validate required fields
      if (!userInfo.phone || !location) {
        throw new Error('Missing required fields: phone number and location');
      }

      // Get emergency contact based on type
      const emergencyNumber = this.getEmergencyNumber(emergencyType);
      
      // Format emergency message
      const message = this.formatEmergencyMessage(emergencyType, userInfo, location, additionalInfo);
      
      // Send to emergency services
      const emergencyResult = await this.sendSMS(emergencyNumber, message, 'emergency');
      
      // Send confirmation to user
      const confirmationMessage = this.formatConfirmationMessage(emergencyType, emergencyNumber);
      const userResult = await this.sendSMS(userInfo.phone, confirmationMessage, 'confirmation');
      
      // Send to driver if applicable
      let driverResult = null;
      if (additionalInfo.driverPhone) {
        const driverMessage = this.formatDriverMessage(emergencyType, userInfo, location);
        driverResult = await this.sendSMS(additionalInfo.driverPhone, driverMessage, 'driver_alert');
      }

      // Log emergency alert
      await this.logEmergencyAlert({
        type: emergencyType,
        userInfo,
        location,
        emergencyNumber,
        message,
        timestamp: new Date(),
        results: {
          emergency: emergencyResult,
          user: userResult,
          driver: driverResult
        }
      });

      console.log(`✅ Emergency alert sent successfully to ${emergencyNumber}`);
      
      return {
        success: true,
        emergencyNumber,
        messageId: emergencyResult.messageId,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Failed to send emergency SMS:', error);
      
      // Try backup emergency number
      try {
        const backupResult = await this.sendBackupEmergencyAlert(emergencyType, userInfo, location);
        return backupResult;
      } catch (backupError) {
        console.error('❌ Backup emergency alert also failed:', backupError);
        throw new Error(`Emergency alert failed: ${error.message}`);
      }
    }
  }

  // Get appropriate emergency number
  getEmergencyNumber(emergencyType) {
    const numbers = {
      'accident': this.emergencyContacts.ambulance,
      'breakdown': this.emergencyContacts.roadside,
      'theft': this.emergencyContacts.police,
      'medical': this.emergencyContacts.ambulance,
      'harassment': this.emergencyContacts.police,
      'lost': this.emergencyContacts.support,
      'danger': this.emergencyContacts.police,
      'other': this.emergencyContacts.support
    };

    return numbers[emergencyType] || numbers.other;
  }

  // Format emergency message
  formatEmergencyMessage(emergencyType, userInfo, location, additionalInfo) {
    const emergencyLabels = {
      'accident': 'TRAFFIC ACCIDENT',
      'breakdown': 'VEHICLE BREAKDOWN',
      'theft': 'THEFT/ROBBERY',
      'medical': 'MEDICAL EMERGENCY',
      'harassment': 'HARASSMENT/ASSAULT',
      'lost': 'LOST PASSENGER',
      'danger': 'DANGEROUS SITUATION',
      'other': 'GENERAL EMERGENCY'
    };

    const label = emergencyLabels[emergencyType] || 'GENERAL EMERGENCY';
    
    let message = `🚨 ${label} - XGO Rideshare Emergency\n\n`;
    message += `Name: ${userInfo.name}\n`;
    message += `Phone: ${userInfo.phone}\n`;
    message += `Location: ${location.address || `${location.lat}, ${location.lng}`}\n`;
    
    if (additionalInfo.driverName) {
      message += `Driver: ${additionalInfo.driverName} (${additionalInfo.driverPhone})\n`;
    }
    
    if (additionalInfo.vehicleInfo) {
      message += `Vehicle: ${additionalInfo.vehicleInfo}\n`;
    }
    
    if (additionalInfo.tripDetails) {
      message += `Trip: ${additionalInfo.tripDetails}\n`;
    }
    
    if (additionalInfo.description) {
      message += `Details: ${additionalInfo.description}\n`;
    }
    
    message += `\nTime: ${new Date().toLocaleString()}\n`;
    message += `Priority: HIGH - Immediate response required`;
    
    return message;
  }

  // Format confirmation message to user
  formatConfirmationMessage(emergencyType, emergencyNumber) {
    const messages = {
      'accident': '🚨 EMERGENCY ALERT SENT: Ambulance dispatched to your location. Stay calm and safe.',
      'breakdown': '🔧 EMERGENCY ALERT SENT: Roadside assistance notified. Help is on the way.',
      'theft': '👮 EMERGENCY ALERT SENT: Police notified of your situation. Move to safe location if possible.',
      'medical': '🚑 EMERGENCY ALERT SENT: Medical services dispatched to your location.',
      'harassment': '🚨 EMERGENCY ALERT SENT: Police notified. Stay on the line if safe.',
      'lost': '📍 EMERGENCY ALERT SENT: Support team notified. We\'ll help locate you.',
      'danger': '⚠️ EMERGENCY ALERT SENT: Police notified. Prioritize your safety.',
      'other': '🆘 EMERGENCY ALERT SENT: Support team notified. Help is on the way.'
    };

    return messages[emergencyType] || messages.other;
  }

  // Format driver alert message
  formatDriverMessage(emergencyType, userInfo, location) {
    const messages = {
      'accident': '🚨 ACCIDENT ALERT: Passenger has reported an accident. Check on their safety immediately.',
      'breakdown': '🔧 BREAKDOWN ALERT: Passenger reports vehicle breakdown. Assist if safe to do so.',
      'theft': '👮 THEFT ALERT: Passenger reports theft situation. Do not intervene - call police if needed.',
      'medical': '🚑 MEDICAL ALERT: Passenger needs medical assistance. Help if trained to do so.',
      'harassment': '🚨 SAFETY ALERT: Passenger reports harassment. Ensure their safety.',
      'lost': '📍 LOST ALERT: Passenger is lost. Help them locate their destination.',
      'danger': '⚠️ DANGER ALERT: Passenger in dangerous situation. Prioritize their safety.',
      'other': '🆘 EMERGENCY ALERT: Passenger needs assistance. Contact them immediately.'
    };

    return messages[emergencyType] || messages.other;
  }

  // Send SMS via API
  async sendSMS(phoneNumber, message, type = 'normal') {
    try {
      const payload = {
        api_key: this.apiKey,
        api_secret: this.apiSecret,
        sender_id: this.senderId,
        phone: phoneNumber,
        message: message,
        priority: type === 'emergency' ? 'high' : 'normal',
        type: type
      };

      console.log(`📱 Sending SMS to ${phoneNumber}:`, message.substring(0, 50) + '...');

      const response = await axios.post(this.apiUrl, payload, {
        timeout: 10000, // 10 second timeout for emergency messages
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        console.log(`✅ SMS sent successfully to ${phoneNumber}`);
        return {
          success: true,
          messageId: response.data.message_id,
          status: response.data.status
        };
      } else {
        throw new Error(`SMS API returned error: ${response.data.message}`);
      }

    } catch (error) {
      console.error(`❌ Failed to send SMS to ${phoneNumber}:`, error.message);
      throw error;
    }
  }

  // Backup emergency alert (fallback method)
  async sendBackupEmergencyAlert(emergencyType, userInfo, location) {
    try {
      console.log('🔄 Attempting backup emergency alert...');
      
      // Use backup SMS provider or direct emergency number
      const backupNumber = process.env.BACKUP_EMERGENCY_NUMBER || '911';
      const message = this.formatEmergencyMessage(emergencyType, userInfo, location);
      
      // Simple HTTP call to backup service
      const result = await this.sendSMS(backupNumber, message, 'emergency_backup');
      
      console.log('✅ Backup emergency alert sent successfully');
      return result;
      
    } catch (error) {
      console.error('❌ Backup emergency alert failed:', error);
      throw error;
    }
  }

  // Log emergency alert for analytics and compliance
  async logEmergencyAlert(alertData) {
    try {
      // Store in database for audit trail
      const logData = {
        ...alertData,
        id: `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date(),
        status: 'sent'
      };

      // You would typically save this to your database
      console.log('📝 Emergency alert logged:', logData.id);
      
      // For now, just log to console (in production, save to DB)
      return logData;
      
    } catch (error) {
      console.error('❌ Failed to log emergency alert:', error);
    }
  }

  // Test SMS service
  async testEmergencyAlert() {
    try {
      console.log('🧪 Testing emergency SMS system...');
      
      const testUserInfo = {
        name: 'Test User',
        phone: '+1234567890'
      };
      
      const testLocation = {
        lat: -1.2921,
        lng: 36.8219,
        address: 'Test Location, Nairobi'
      };
      
      const result = await this.sendEmergencyAlert(
        'accident',
        testUserInfo,
        testLocation,
        {
          driverName: 'Test Driver',
          driverPhone: '+0987654321',
          vehicleInfo: 'Toyota Camry - KAB 123X',
          tripDetails: 'Downtown to Airport',
          description: 'Test emergency alert for system validation'
        }
      );
      
      console.log('✅ Emergency SMS test completed successfully');
      return result;
      
    } catch (error) {
      console.error('❌ Emergency SMS test failed:', error);
      throw error;
    }
  }

  // Send location sharing SMS
  async sendLocationShare(userInfo, location, recipientPhone, duration = 30) {
    try {
      const message = `📍 Location Share - XGO Rideshare\n\n`;
      message += `${userInfo.name} is sharing their location with you\n`;
      message += `Current location: ${location.address || `${location.lat}, ${location.lng}`}\n`;
      message += `Live tracking: https://xgo.life/track/${userInfo.id}\n`;
      message += `Valid for: ${duration} minutes\n`;
      message += `Time: ${new Date().toLocaleString()}`;

      const result = await this.sendSMS(recipientPhone, message, 'location_share');
      
      console.log(`📍 Location share sent to ${recipientPhone}`);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to send location share:', error);
      throw error;
    }
  }

  // Send safety check SMS
  async sendSafetyCheck(userInfo, location) {
    try {
      const message = `🛡️ Safety Check - XGO Rideshare\n\n`;
      message += `Hi ${userInfo.name}, this is your safety check\n`;
      message += `Location: ${location.address || `${location.lat}, ${location.lng}`}\n`;
      message += `Time: ${new Date().toLocaleString()}\n\n`;
      message += `Reply SAFE if you're okay or HELP if you need assistance`;
      message += `\nOr call our 24/7 support: ${this.emergencyContacts.support}`;

      const result = await this.sendSMS(userInfo.phone, message, 'safety_check');
      
      console.log(`🛡️ Safety check sent to ${userInfo.phone}`);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to send safety check:', error);
      throw error;
    }
  }
}

module.exports = new SMSService();
