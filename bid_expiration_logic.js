// Add to rideshare.js cruds
crudsObj.markBidAsViewed = (request_id, driver_id) =>
  new Promise((resolve, reject) => {
    // Mark negotiation as viewed with timestamp
    pool.query(
      `UPDATE rideshare_negotiation_history 
       SET viewed_at = CURRENT_TIMESTAMP, status = 'Viewed'
       WHERE request_id = ? AND driver_id = ? AND status IN ('Pending', 'Active')`,
      [request_id, driver_id],
      (err) => {
        if (err) return reject(err);
        resolve({ status: 200, message: "Bid marked as viewed" });
      }
    );
  });

crudsObj.checkBidExpiration = (request_id) =>
  new Promise((resolve, reject) => {
    // Check if any viewed bids have expired (2 minutes)
    pool.query(
      `UPDATE rideshare_negotiation_history 
       SET status = 'Expired'
       WHERE request_id = ? 
       AND status = 'Viewed' 
       AND viewed_at < DATE_SUB(NOW(), INTERVAL 2 MINUTE)`,
      [request_id],
      (err) => {
        if (err) return reject(err);
        resolve({ status: 200, message: "Expired bids updated" });
      }
    );
  });

crudsObj.checkRequestExpiration = () =>
  new Promise((resolve, reject) => {
    // Auto-expire requests older than 15 minutes with no accepted bids
    pool.query(
      `UPDATE rideshare_requests r
       SET r.status = 'Expired'
       WHERE r.status IN ('Negotiating', 'Join Shared Ride Request')
       AND r.created_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE)
       AND NOT EXISTS (
         SELECT 1 FROM rideshare_requests r2 
         WHERE r2.rideshare_id = r.rideshare_id 
         AND r2.status = 'Accepted'
       )`,
      (err) => {
        if (err) return reject(err);
        resolve({ status: 200, message: "Old requests expired" });
      }
    );
  });
