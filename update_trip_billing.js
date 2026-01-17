// Script to update existing trip billing calculation logic
// This script demonstrates how to integrate the new commission system

const commissionSettingsDb = require('./cruds/commissionSettings');

// Example of how to update rideshare trip billing
const updateRideshareBilling = async (rideshareId, acceptedFare, userId, userPreference = null) => {
  try {
    // Calculate commission using new system
    const commissionData = await commissionSettingsDb.calculateCommission(
      userId, 
      acceptedFare, 
      userPreference
    );
    
    // Update rideshare_trips table with new commission data
    const pool = require('./cruds/poolfile');
    
    const updateQuery = `
      UPDATE rideshare_trips 
      SET 
        billing_amount = ?,
        billing_type = ?,
        commission_amount = ?,
        driver_earnings = ?,
        commission_type_used = ?,
        commission_rate_applied = ?,
        commission_calculation_method = ?,
        commission_settings_id = ?,
        promotion_active_at_time = ?
      WHERE rideshare_id = ?
    `;
    
    const values = [
      acceptedFare,
      commissionData.billing_preference,
      commissionData.commission_amount,
      commissionData.driver_earnings,
      commissionData.commission_type,
      commissionData.commission_rate_applied,
      commissionData.commission_calculation_method,
      commissionData.commission_settings_id,
      commissionData.promotion_active_at_time,
      rideshareId
    ];
    
    return new Promise((resolve, reject) => {
      pool.query(updateQuery, values, (err, result) => {
        if (err) {
          return reject(err);
        }
        if (result.affectedRows === 0) {
          return reject(new Error('Rideshare trip not found'));
        }
        
        resolve({
          status: 200,
          message: 'Rideshare billing updated successfully',
          commission_data: commissionData
        });
      });
    });
    
  } catch (error) {
    throw error;
  }
};

// Example of how to update private trip billing
const updateTripBilling = async (tripId, acceptedFare, userId, userPreference = null) => {
  try {
    // Calculate commission using new system
    const commissionData = await commissionSettingsDb.calculateCommission(
      userId, 
      acceptedFare, 
      userPreference
    );
    
    // Update trip table with new commission data
    const pool = require('./cruds/poolfile');
    
    const updateQuery = `
      UPDATE trip 
      SET 
        billing_amount = ?,
        billing_type = ?,
        commission_calculated = ?,
        driver_earnings = ?,
        commission_type_used = ?,
        commission_rate_applied = ?,
        commission_calculation_method = ?,
        commission_settings_id = ?,
        promotion_active_at_time = ?
      WHERE trip_id = ?
    `;
    
    const values = [
      acceptedFare,
      commissionData.billing_preference,
      commissionData.commission_amount,
      commissionData.driver_earnings,
      commissionData.commission_type,
      commissionData.commission_rate_applied,
      commissionData.commission_calculation_method,
      commissionData.commission_settings_id,
      commissionData.promotion_active_at_time,
      tripId
    ];
    
    return new Promise((resolve, reject) => {
      pool.query(updateQuery, values, (err, result) => {
        if (err) {
          return reject(err);
        }
        if (result.affectedRows === 0) {
          return reject(new Error('Trip not found'));
        }
        
        resolve({
          status: 200,
          message: 'Trip billing updated successfully',
          commission_data: commissionData
        });
      });
    });
    
  } catch (error) {
    throw error;
  }
};

// Test function to demonstrate usage
const testCommissionSystem = async () => {
  try {
    console.log('Testing commission system...');
    
    // Test commission calculation
    const commissionData = await commissionSettingsDb.calculateCommission(
      123, // userId
      100, // acceptedFare
      'percentage' // userPreference
    );
    
    console.log('Commission calculation result:', commissionData);
    
    // Test earnings summary
    const earnings = await commissionSettingsDb.getDriverEarningsSummary(123, 7);
    console.log('Driver earnings summary:', earnings);
    
    console.log('Commission system test completed successfully!');
    
  } catch (error) {
    console.error('Commission system test failed:', error);
  }
};

// Export functions for use in other files
module.exports = {
  updateRideshareBilling,
  updateTripBilling,
  testCommissionSystem
};

// Run test if this file is executed directly
if (require.main === module) {
  testCommissionSystem();
}
