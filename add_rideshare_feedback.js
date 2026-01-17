const mysql = require('mysql');
const pool = require('./cruds/poolfile');

async function addRideshareFeedbackFields() {
  return new Promise((resolve, reject) => {
    console.log('Adding feedback fields to rideshare_trips table...');
    
    // Define feedback fields matching the trip table pattern
    const feedbackFields = [
      {
        name: 'customer_comment',
        type: 'TEXT NULL DEFAULT NULL',
        comment: 'Customer feedback comment for rideshare trip'
      },
      {
        name: 'driver_comment', 
        type: 'TEXT NULL DEFAULT NULL',
        comment: 'Driver feedback comment for rideshare trip'
      },
      {
        name: 'driver_stars',
        type: 'INT NULL DEFAULT NULL',
        comment: 'Customer rating for driver (1-5 stars)'
      },
      {
        name: 'customer_stars',
        type: 'INT NULL DEFAULT NULL', 
        comment: 'Driver rating for customer (1-5 stars)'
      },
      {
        name: 'feedback_date',
        type: 'DATETIME NULL DEFAULT NULL',
        comment: 'Date when feedback was provided'
      }
    ];
    
    let completedFields = 0;
    const totalFields = feedbackFields.length;
    
    feedbackFields.forEach((field, index) => {
      // Check if field already exists
      pool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'rideshare_trips' 
        AND COLUMN_NAME = '${field.name}'
        AND TABLE_SCHEMA = DATABASE()
      `, (err, results) => {
        if (err) {
          console.error(`❌ Error checking field ${field.name}:`, err);
          if (++completedFields === totalFields) {
            verifyTable();
          }
          return;
        }
        
        if (results.length === 0) {
          // Add the field
          pool.query(`
            ALTER TABLE rideshare_trips 
            ADD COLUMN IF NOT EXISTS ${field.name} ${field.type} COMMENT '${field.comment}'
          `, (err, result) => {
            if (err) {
              console.error(`❌ Error adding field ${field.name}:`, err);
            } else {
              console.log(`✅ ${field.name} field added successfully`);
            }
            
            if (++completedFields === totalFields) {
              verifyTable();
            }
          });
        } else {
          console.log(`✅ ${field.name} field already exists`);
          if (++completedFields === totalFields) {
            verifyTable();
          }
        }
      });
    });
    
    function verifyTable() {
      // Verify the fields were added
      pool.query('DESCRIBE rideshare_trips', (err, results) => {
        if (err) {
          console.error('❌ Error verifying table:', err);
          reject(err);
          return;
        }
        
        console.log('\n📋 Rideshare_Trips Table Structure (Feedback Fields):');
        const feedbackFieldNames = feedbackFields.map(f => f.name);
        results.forEach(field => {
          if (feedbackFieldNames.includes(field.Field)) {
            console.log(`✅ ${field.Field}: ${field.Type} ${field.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${field.Key ? `KEY (${field.Key})` : ''} ${field.Default ? `DEFAULT ${field.Default}` : ''} ${field.Comment ? `COMMENT '${field.Comment}'` : ''}`);
          }
        });
        
        console.log('\n🎉 Rideshare feedback fields added successfully!');
        resolve({ success: true, message: 'Rideshare feedback fields added successfully' });
        pool.end();
      });
    }
  });
}

addRideshareFeedbackFields().catch(console.error);
