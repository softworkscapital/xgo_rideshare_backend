const express = require("express");
const DriverRouter = express.Router();
const DriverDbOperations = require("../cruds/driver_details");

// Route to create a new driver
DriverRouter.post("/", async (req, res, next) => {
  try {
    let postedValues = req.body;
    // console.log("from front", postedValues)
    let {
      driver_id,
      ecnumber,
      account_type,
      signed_on,
      username,
      name,
      surname,
      idnumber,
      sex,
      dob,
      address,
      house_number_and_street_name,
      surbub,
      city,
      country,
      lat_cordinates,
      long_cordinates,
      phone,
      plate,
      email,
      password,
      employer,
      workindustry,
      workaddress,
      workphone,
      workphone2,
      nok1name,
      nok1surname,
      nok1relationship,
      nok1phone,
      nok2name,
      nok2surname,
      nok2relationship,
      nok2phone,
      rating,
      credit_bar_rule_exception,
      membershipstatus,
      make,
      model,
      colour,
      vehicle_category,
      vehicle_year,
      type,
      defaultsubs,
      sendmail,
      sendsms,
      product_code,
      cost_price,
      selling_price,
      payment_style,
      profilePic,
      id_image,
      number_plate_image,
      vehicle_license_image,
      driver_license_image,
      vehicle_img1,
      vehicle_img2,
      vehicle_img3,
      number_of_passangers,
      delivery_volume,
      delivery_weight,
      driver_license_date,
    } = postedValues;

    let results = await DriverDbOperations.postDriver(
      driver_id,
      ecnumber,
      account_type,
      signed_on,
      username,
      name,
      surname,
      idnumber,
      sex,
      dob,
      address,
      house_number_and_street_name,
      surbub,
      city,
      country,
      lat_cordinates,
      long_cordinates,
      phone,
      plate,
      email,
      password,
      employer,
      workindustry,
      workaddress,
      workphone,
      workphone2,
      nok1name,
      nok1surname,
      nok1relationship,
      nok1phone,
      nok2name,
      nok2surname,
      nok2relationship,
      nok2phone,
      rating,
      credit_bar_rule_exception,
      membershipstatus,
      make,
      model,
      colour,
      vehicle_category,
      vehicle_year,
      type,
      defaultsubs,
      sendmail,
      sendsms,
      product_code,
      cost_price,
      selling_price,
      payment_style,
      profilePic,
      id_image,
      number_plate_image,
      vehicle_license_image,
      driver_license_image,
      vehicle_img1,
      vehicle_img2,
      vehicle_img3,
      number_of_passangers,
      delivery_volume,
      delivery_weight,
      driver_license_date,
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// Route to get all drivers
DriverRouter.get("/", async (req, res, next) => {
  try {
    let results = await DriverDbOperations.getDrivers();
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// Route to get a driver by ID
DriverRouter.get("/:driver_id", async (req, res, next) => {
  try {
    let driver_id = req.params.driver_id;
    let result = await DriverDbOperations.getDriverById(driver_id);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// Add this to your DriverRouter
DriverRouter.patch("/updatedrivervehiclecategory/:driver_id", async (req, res, next) => {
  try {
    let driver_id = req.params.driver_id;
    let { vehicle_category } = req.body; // Get the new vehicle category from the request body

    if (!vehicle_category) {
      return res.status(400).json({ message: "Vehicle category is required." });
    }

    const result = await DriverDbOperations.updateVehicleCategory(driver_id, vehicle_category);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Driver not found." });
    }

    res.status(200).json({ message: "Vehicle category updated successfully." });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// Route to get a driver by email for login
DriverRouter.get("/login/:driver_email", async (req, res, next) => {
  try {
    let driver_email = req.params.driver_email;
    let result = await DriverDbOperations.getDriverByEmail(driver_email);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// Route to update a driver's details
DriverRouter.put("/:id", async (req, res, next) => {
  try {
    let driver_id = req.params.id;
    let updatedValues = req.body;

    let results = await DriverDbOperations.updateDriver(
      driver_id,
      updatedValues
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

DriverRouter.put("/driving_status/:id", async (req, res, next) => {
  try {
    let driver_id = req.params.id;
    let updatedValues = req.body;

    let results = await DriverDbOperations.updateDriverStatus(
      driver_id,
      updatedValues
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// New route to update driver's coordinates
DriverRouter.put("/:id/coordinates", async (req, res, next) => {
  try {
    let driver_id = req.params.id;
    const { lat_cordinates, long_cordinates } = req.body;

    console.log("lats", {lat_cordinates, long_cordinates});
    let results = await DriverDbOperations.updateDriverCoordinates(
      driver_id,
      lat_cordinates,
      long_cordinates
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// Route to delete a driver
DriverRouter.delete("/:id", async (req, res, next) => {
  try {
    let driver_id = req.params.id;
    let result = await DriverDbOperations.deleteDriver(driver_id);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});


//driver route
DriverRouter.get("/driver_status/:status", async (req, res, next) => {
  try {
    let status = req.params.status;
    let result = await DriverDbOperations.getDriverByStatus(status);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

DriverRouter.get("/driver_trips_completed_update/:id", async (req, res, next) => {
  try {
    let driverId = req.params.id;
    let result = await DriverDbOperations.updateDriverTripCount(driverId);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

DriverRouter.get("/driver_trips_completed/:id", async (req, res, next) => {
  try {
    let driverId = req.params.id;
    let result = await DriverDbOperations.getDriverTripCount(driverId);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});


/////Verification
DriverRouter.get("/driver_verify/:email/:phone/:idnumber", async (req, res, next) => {
  try {
    let email = req.params.email;
    let phone = req.params.phone;
    let idnumber = req.params.idnumber;
    let result = await DriverDbOperations.getVerifyDriver(email,phone,idnumber);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});



///////

DriverRouter.put("/update_status/:id", async (req, res, next) => {
  try {
    let driver_id = req.params.id;
    let updatedValues = req.body;

    let results = await DriverDbOperations.updateDriverStatus(
      driver_id,
      updatedValues
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});


DriverRouter.put("/update_account_category/:id", async (req, res, next) => {
  try {
    let driver_id = req.params.id;
    let updatedValues = req.body;

    let results = await DriverDbOperations.updateDriverAccountType(
      driver_id,
      updatedValues
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});


// ===========================================
// DRIVER RATING SYSTEM ENDPOINTS
// ===========================================

// Update driver rating given to customer (driver's perspective of customer performance)
DriverRouter.put("/:id/rating_given", async (req, res, next) => {
  try {
    let driver_id = req.params.id;
    const { rating, tripType } = req.body;

    let results = await DriverDbOperations.updateDriverRatingGiven(driver_id, rating, tripType);
    res.json(results);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Failed to update driver rating given to customer", message: e.message });
  }
});

// Update driver rating received from customer (customer's perspective of driver performance)
DriverRouter.put("/:id/rating_received", async (req, res, next) => {
  try {
    let driver_id = req.params.id;
    const { rating, tripType } = req.body;

    let results = await DriverDbOperations.updateDriverRatingReceived(driver_id, rating, tripType);
    res.json(results);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Failed to update driver rating received from customer", message: e.message });
  }
});

// Get comprehensive driver rating statistics
DriverRouter.get("/:id/rating_statistics", async (req, res, next) => {
  try {
    let driver_id = req.params.id;

    let results = await DriverDbOperations.getDriverRatingStatistics(driver_id);
    res.json(results);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Failed to get driver rating statistics", message: e.message });
  }
});


// ===========================================
// COMPREHENSIVE DRIVER ANALYTICS API ENDPOINTS
// ===========================================

// Update driver private trip status
DriverRouter.put("/:id/private_trip_status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, earnings = 0, distance = 0, duration = 0 } = req.body;

    if (!status) {
      return res.status(400).json({ 
        status: 400, 
        message: "Status is required" 
      });
    }

    const result = await DriverDbOperations.updateDriverPrivateTripStatus(id, status, earnings, distance, duration);
    res.json(result);
  } catch (error) {
    console.error('Error updating driver private trip status:', error);
    
    // Handle structured errors from CRUD operations
    if (error.status && error.message) {
      return res.status(error.status).json({
        status: error.status,
        message: error.message
      });
    }
    
    res.status(500).json({ 
      status: 500, 
      message: "Internal server error",
      error: error.message 
    });
  }
});

// Update driver rideshare trip status
DriverRouter.put("/:id/rideshare_trip_status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, earnings = 0, distance = 0, duration = 0 } = req.body;

    if (!status) {
      return res.status(400).json({ 
        status: 400, 
        message: "Status is required" 
      });
    }

    const result = await DriverDbOperations.updateDriverRideshareTripStatus(id, status, earnings, distance, duration);
    res.json(result);
  } catch (error) {
    console.error('Error updating driver rideshare trip status:', error);
    
    // Handle structured errors from CRUD operations
    if (error.status && error.message) {
      return res.status(error.status).json({
        status: error.status,
        message: error.message
      });
    }
    
    res.status(500).json({ 
      status: 500, 
      message: "Internal server error",
      error: error.message 
    });
  }
});

// Update driver earnings
DriverRouter.put("/:id/earnings", async (req, res) => {
  try {
    const { id } = req.params;
    const { earnings, tripType } = req.body;

    if (!earnings || earnings <= 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "Valid earnings amount is required" 
      });
    }

    if (!tripType || !['private', 'rideshare'].includes(tripType)) {
      return res.status(400).json({ 
        status: 400, 
        message: "Valid trip type (private or rideshare) is required" 
      });
    }

    const result = await DriverDbOperations.updateDriverEarnings(id, earnings, tripType);
    res.json(result);
  } catch (error) {
    console.error('Error updating driver earnings:', error);
    
    // Handle structured errors from CRUD operations
    if (error.status && error.message) {
      return res.status(error.status).json({
        status: error.status,
        message: error.message
      });
    }
    
    res.status(500).json({ 
      status: 500, 
      message: "Internal server error",
      error: error.message 
    });
  }
});

// Update driver performance metrics
DriverRouter.put("/:id/performance_metrics", async (req, res) => {
  try {
    const { id } = req.params;
    const metrics = req.body;

    if (!metrics || Object.keys(metrics).length === 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "Performance metrics are required" 
      });
    }

    const result = await DriverDbOperations.updateDriverPerformanceMetrics(id, metrics);
    res.json(result);
  } catch (error) {
    console.error('Error updating driver performance metrics:', error);
    res.status(500).json({ 
      status: 500, 
      message: "Internal server error",
      error: error.message 
    });
  }
});

// Update driver activity metrics
DriverRouter.put("/:id/activity_metrics", async (req, res) => {
  try {
    const { id } = req.params;
    const metrics = req.body;

    if (!metrics || Object.keys(metrics).length === 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "Activity metrics are required" 
      });
    }

    const result = await DriverDbOperations.updateDriverActivityMetrics(id, metrics);
    res.json(result);
  } catch (error) {
    console.error('Error updating driver activity metrics:', error);
    res.status(500).json({ 
      status: 500, 
      message: "Internal server error",
      error: error.message 
    });
  }
});

// Get comprehensive driver statistics
DriverRouter.get("/:id/comprehensive_stats", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await DriverDbOperations.getComprehensiveDriverStatistics(id);
    res.json(result);
  } catch (error) {
    console.error('Error getting comprehensive driver statistics:', error);
    res.status(500).json({ 
      status: 500, 
      message: "Internal server error",
      error: error.message 
    });
  }
});

// Get driver earnings summary
DriverRouter.get("/:id/earnings_summary", async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;

    // Get comprehensive stats and extract earnings
    const stats = await DriverDbOperations.getComprehensiveDriverStatistics(id);
    
    const earningsSummary = {
      status: "200",
      message: "Driver earnings summary retrieved successfully",
      driver_id: id,
      period: `${days} days`,
      earnings: stats.earnings,
      total_earnings: stats.earnings.combined.total_earnings,
      average_per_trip: stats.earnings.combined.average_per_trip,
      last_earning_date: stats.earnings.combined.last_earning_date,
      breakdown: {
        private: {
          total: stats.earnings.private.total_earnings,
          percentage: stats.earnings.combined.total_earnings > 0 
            ? (stats.earnings.private.total_earnings / stats.earnings.combined.total_earnings * 100).toFixed(2)
            : 0
        },
        rideshare: {
          total: stats.earnings.rideshare.total_earnings,
          percentage: stats.earnings.combined.total_earnings > 0 
            ? (stats.earnings.rideshare.total_earnings / stats.earnings.combined.total_earnings * 100).toFixed(2)
            : 0
        }
      }
    };

    res.json(earningsSummary);
  } catch (error) {
    console.error('Error getting driver earnings summary:', error);
    res.status(500).json({ 
      status: 500, 
      message: "Internal server error",
      error: error.message 
    });
  }
});

// Get driver performance summary
DriverRouter.get("/:id/performance_summary", async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await DriverDbOperations.getComprehensiveDriverStatistics(id);
    
    const performanceSummary = {
      status: "200",
      message: "Driver performance summary retrieved successfully",
      driver_id: id,
      performance: stats.performance,
      trip_completion: {
        total_trips: stats.trip_statistics.combined.total_trips,
        completed_trips: stats.trip_statistics.private.completed + stats.trip_statistics.rideshare.completed,
        cancelled_trips: stats.trip_statistics.private.cancelled + stats.trip_statistics.rideshare.cancelled,
        completion_rate: stats.performance.completion_rate || 0
      },
      efficiency: {
        average_trip_duration: stats.performance.average_trip_duration_minutes,
        average_distance_per_trip: stats.performance.average_distance_per_trip,
        total_distance: stats.performance.total_distance_km
      }
    };

    res.json(performanceSummary);
  } catch (error) {
    console.error('Error getting driver performance summary:', error);
    res.status(500).json({ 
      status: 500, 
      message: "Internal server error",
      error: error.message 
    });
  }
});

// Get driver activity summary
DriverRouter.get("/:id/activity_summary", async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await DriverDbOperations.getComprehensiveDriverStatistics(id);
    
    const activitySummary = {
      status: "200",
      message: "Driver activity summary retrieved successfully",
      driver_id: id,
      activity: stats.activity,
      engagement: {
        days_active: stats.activity.days_active,
        average_trips_per_day: stats.activity.average_trips_per_day,
        current_streak: stats.activity.current_streak_days,
        longest_streak: stats.activity.longest_streak_days,
        last_active: stats.activity.last_active_date
      }
    };

    res.json(activitySummary);
  } catch (error) {
    console.error('Error getting driver activity summary:', error);
    res.status(500).json({ 
      status: 500, 
      message: "Internal server error",
      error: error.message 
    });
  }
});

module.exports = DriverRouter;
