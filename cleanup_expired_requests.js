// Cleanup script for expired rideshare requests
// This script should be run periodically (e.g., every 5 minutes)

const pool = require('./cruds/poolfile');

const cleanupExpiredRequests = async () => {
  try {
    console.log('🧹 Starting cleanup of expired rideshare requests...');
    
    // Expire requests older than 30 minutes
    const expireQuery = `
      UPDATE rideshare_requests 
      SET status = 'Expired', updated_at = NOW()
      WHERE status IN ('Join Shared Ride Request', 'Negotiating') 
      AND created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE)
    `;
    
    pool.query(expireQuery, (err, result) => {
      if (err) {
        console.error('❌ Error cleaning up expired requests:', err);
        return;
      }
      
      if (result.affectedRows > 0) {
        console.log(`✅ Cleaned up ${result.affectedRows} expired rideshare requests`);
      } else {
        console.log('✅ No expired requests to clean up');
      }
    });
    
    // Also clean up very old completed/cancelled requests (older than 7 days)
    const cleanupOldQuery = `
      DELETE FROM rideshare_requests 
      WHERE status IN ('Completed', 'Cancelled', 'Expired') 
      AND updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
    `;
    
    pool.query(cleanupOldQuery, (err, result) => {
      if (err) {
        console.error('❌ Error cleaning up old requests:', err);
        return;
      }
      
      if (result.affectedRows > 0) {
        console.log(`🗑️  Deleted ${result.affectedRows} old completed/cancelled requests`);
      }
    });
    
  } catch (error) {
    console.error('❌ Cleanup script error:', error);
  }
};

// Run cleanup immediately
cleanupExpiredRequests();

// Set up interval to run every 5 minutes
setInterval(cleanupExpiredRequests, 5 * 60 * 1000); // 5 minutes

console.log('🔄 Request cleanup service started (runs every 5 minutes)');
