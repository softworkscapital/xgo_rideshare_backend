const mysql = require('mysql2/promise');
const pool = require('./poolfile');

async function checkTables() {
  try {
    const results = await pool.query('SHOW TABLES');
    console.log('All Tables:');
    results.forEach(table => {
      console.log(`Table: ${table.table_name}`);
    });
    
    const rideshareTables = results.filter(table => 
      table.table_name.toLowerCase().includes('rideshare')
    );
    
    if (rideshareTables.length > 0) {
      console.log('\nRideshare Tables Found:');
      rideshareTables.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
      
      // Get structure of first rideshare table
      const firstRideshareTable = rideshareTables[0].table_name;
      const structure = await pool.query(`DESCRIBE ${firstRideshareTable}`);
      console.log(`\nStructure of ${firstRideshareTable}:`);
      structure.forEach(column => {
        console.log(`- ${column.Field} (${column.Type}) ${column.Null ? 'NULL' : column.Key})`);
      });
    } else {
      console.log('No rideshare tables found in database');
    }
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

checkTables();
