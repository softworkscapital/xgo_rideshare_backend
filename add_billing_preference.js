const mysql = require('mysql');
const pool = require('./cruds/poolfile');

async function addBillingPreferenceField() {
  return new Promise((resolve, reject) => {
    console.log('Adding billing_preference field to users table...');
    
    // Check if field already exists
    pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'billing_preference'
      AND TABLE_SCHEMA = DATABASE()
    `, (err, results) => {
      if (err) {
        console.error('❌ Error checking field:', err);
        reject(err);
        return;
      }
      
      if (results.length === 0) {
        // Add the field
        pool.query(`
          ALTER TABLE users 
          ADD COLUMN billing_preference ENUM('percentage', 'daily') DEFAULT 'percentage'
        `, (err, result) => {
          if (err) {
            console.error('❌ Error adding field:', err);
            reject(err);
            return;
          }
          console.log('✅ billing_preference field added successfully');
          verifyField();
        });
      } else {
        console.log('✅ billing_preference field already exists');
        verifyField();
      }
    });
    
    function verifyField() {
      // Verify the field was added
      pool.query('DESCRIBE users', (err, results) => {
        if (err) {
          console.error('❌ Error verifying field:', err);
          reject(err);
          return;
        }
        
        const billingField = results.find(field => field.Field === 'billing_preference');
        
        if (billingField) {
          console.log('✅ Field verification successful:', billingField);
          resolve(billingField);
        } else {
          console.log('❌ Field verification failed');
          reject(new Error('Field not found'));
        }
        
        pool.end();
      });
    }
  });
}

addBillingPreferenceField().catch(console.error);
