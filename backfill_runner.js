#!/usr/bin/env node

/**
 * Customer Statistics Backfill Runner
 * Run this script to backfill historical customer trip data
 * 
 * Usage: node backfill_runner.js
 */

const { backfillCustomerStatistics } = require('./backfill_customer_statistics');
const pool = require('./cruds/poolfile');
const fs = require('fs');
const path = require('path');

async function setupDatabaseSchema() {
  console.log("🔧 Setting up database schema...");
  
  return new Promise((resolve, reject) => {
    // Read and execute the SQL schema file
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'add_customer_fields.sql'),
      'utf8'
    );
    
    // Split SQL statements and execute them
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let executedCount = 0;
    
    // Execute statements sequentially
    const executeNext = () => {
      if (executedCount >= statements.length) {
        console.log("✅ Database schema updated successfully!");
        resolve();
        return;
      }
      
      const statement = statements[executedCount];
      if (statement.trim()) {
        pool.query(statement, (error, results) => {
          if (error) {
            console.error(`❌ Error executing statement ${executedCount + 1}:`, error.message);
            // Don't reject - continue with other statements
          } else {
            console.log(`✅ Executed statement ${executedCount + 1}/${statements.length}`);
          }
          executedCount++;
          executeNext();
        });
      } else {
        executedCount++;
        executeNext();
      }
    };
    
    executeNext();
  });
}

async function runBackfill() {
  console.log("🚀 Starting Customer Statistics Backfill Process");
  console.log("================================================");
  
  try {
    // Step 1: Setup database schema
    await setupDatabaseSchema();
    
    // Step 2: Run the backfill
    await backfillCustomerStatistics();
    
    console.log("\n🎉 Customer Statistics Backfill Completed Successfully!");
    console.log("💡 Customer details table has been updated with historical trip data");
    console.log("📊 Both private ride and rideshare statistics are now available");
    
  } catch (error) {
    console.error("\n💥 Customer Statistics Backfill Failed!");
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Run the complete process
runBackfill();
