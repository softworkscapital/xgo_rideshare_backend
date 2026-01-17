const mysql = require('mysql2/promise');
const pool = require('./poolfile');

pool.query('SHOW TABLES', (err, results) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('All Tables:');
  results.forEach(table => {
    console.log(`Table: ${table.table_name}`);
    if (table.table_name.toLowerCase().includes('rideshare')) {
      console.log('  -> Rideshare table found!');
    }
  });
  
  // Check specific rideshare tables
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
    pool.query(`DESCRIBE ${firstRideshareTable}`, (err, results) => {
      if (err) {
        console.error('Error describing table:', err);
        return;
      }
      console.log(`\nStructure of ${firstRideshareTable}:`);
      results.forEach(column => {
        console.log(`- ${column.Field} (${column.Type}) ${column.Null ? 'NULL' : column.Key})`);
      });
      pool.end();
    });
  } else {
    console.log('No rideshare tables found in database');
  }
  
  pool.end();
});
