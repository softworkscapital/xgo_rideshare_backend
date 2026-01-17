const mysql = require('mysql');
const pool = require('./cruds/poolfile');

async function removeIncorrectFeedbackFields() {
  return new Promise((resolve, reject) => {
    console.log('Removing incorrect feedback fields from rideshare_trips table...');
    
    // Define the incorrect fields that need to be removed
    const incorrectFields = [
      'rating_stars',
      'feedback_comment', 
      'feedback_by'
    ];
    
    let completedFields = 0;
    const totalFields = incorrectFields.length;
    
    incorrectFields.forEach((fieldName, index) => {
      // Check if field exists before trying to drop it
      pool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'rideshare_trips' 
        AND COLUMN_NAME = '${fieldName}'
        AND TABLE_SCHEMA = DATABASE()
      `, (err, results) => {
        if (err) {
          console.error(`❌ Error checking field ${fieldName}:`, err);
          if (++completedFields === totalFields) {
            verifyTable();
          }
          return;
        }
        
        if (results.length > 0) {
          // Drop the field
          pool.query(`
            ALTER TABLE rideshare_trips 
            DROP COLUMN IF EXISTS ${fieldName}
          `, (err, result) => {
            if (err) {
              console.error(`❌ Error dropping field ${fieldName}:`, err);
            } else {
              console.log(`✅ ${fieldName} field dropped successfully`);
            }
            
            if (++completedFields === totalFields) {
              verifyTable();
            }
          });
        } else {
          console.log(`✅ ${fieldName} field does not exist (already removed)`);
          if (++completedFields === totalFields) {
            verifyTable();
          }
        }
      });
    });
    
    function verifyTable() {
      // Verify the incorrect fields are gone and correct fields exist
      pool.query('DESCRIBE rideshare_trips', (err, results) => {
        if (err) {
          console.error('❌ Error verifying table:', err);
          reject(err);
          return;
        }
        
        console.log('\n📋 Rideshare_Trips Table Structure (Feedback Fields):');
        
        // Check for incorrect fields (should be gone)
        console.log('\n❌ Incorrect Fields (should be removed):');
        incorrectFields.forEach(fieldName => {
          const field = results.find(f => f.Field === fieldName);
          if (field) {
            console.log(`⚠️  ${fieldName}: Still exists - needs manual removal`);
          } else {
            console.log(`✅ ${fieldName}: Successfully removed`);
          }
        });
        
        // Check for correct fields (should exist)
        const correctFields = ['customer_comment', 'driver_comment', 'driver_stars', 'customer_stars', 'feedback_date'];
        console.log('\n✅ Correct Fields (should exist):');
        correctFields.forEach(fieldName => {
          const field = results.find(f => f.Field === fieldName);
          if (field) {
            console.log(`✅ ${fieldName}: ${field.Type} ${field.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
          } else {
            console.log(`⚠️  ${fieldName}: Not found - needs to be added`);
          }
        });
        
        console.log('\n🎉 Incorrect feedback fields cleanup completed!');
        resolve({ success: true, message: 'Incorrect feedback fields removed successfully' });
        pool.end();
      });
    }
  });
}

removeIncorrectFeedbackFields().catch(console.error);
