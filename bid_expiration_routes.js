// Add to rideshare.js routes

// Mark bid as viewed (starts 2-minute timer)
RideShareRouter.post("/negotiations/:request_id/view", async (req, res) => {
  try {
    const { request_id } = req.params;
    const { driver_id } = req.body;
    
    const result = await RideShareDb.markBidAsViewed(request_id, driver_id);
    res.json(result);
  } catch (error) {
    logRouteError("POST /negotiations/:request_id/view", req, error);
    sendError(res, req, {
      status: 500,
      message: "Failed to mark bid as viewed",
      route: "POST /negotiations/:request_id/view"
    }, error);
  }
});

// Check and update expired bids
RideShareRouter.post("/negotiations/:request_id/check-expiration", async (req, res) => {
  try {
    const { request_id } = req.params;
    
    const result = await RideShareDb.checkBidExpiration(request_id);
    res.json(result);
  } catch (error) {
    logRouteError("POST /negotiations/:request_id/check-expiration", req, error);
    sendError(res, req, {
      status: 500,
      message: "Failed to check bid expiration",
      route: "POST /negotiations/:request_id/check-expiration"
    }, error);
  }
});

// Auto-expire old requests (run every 5 minutes)
RideShareRouter.post("/requests/auto-expire", async (req, res) => {
  try {
    const result = await RideShareDb.checkRequestExpiration();
    res.json(result);
  } catch (error) {
    logRouteError("POST /requests/auto-expire", req, error);
    sendError(res, req, {
      status: 500,
      message: "Failed to auto-expire requests",
      route: "POST /requests/auto-expire"
    }, error);
  }
});
