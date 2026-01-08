const express = require("express");
const tripRouter = express.Router();
const tripDbOperations = require("../cruds/trip");
const NewOrderObj = require("../cruds/NewOrderHandler");

tripRouter.post("/", async (req, res, next) => {
  try {
    let postedValues = req.body;
    console.log("from frontend:", postedValues);
    
    let driver_id = postedValues.driver_id;
    let cust_id = postedValues.cust_id;
    let request_start_datetime = postedValues.request_start_datetime;
    let order_start_datetime = postedValues.order_start_datetime;
    let order_end_datetime = postedValues.order_end_datetime;
    let estimate_order_end_datetime = postedValues.estimate_order_end_datetime;
    let status = postedValues.status;
    let deliveray_details = postedValues.deliveray_details;
    let delivery_notes = postedValues.delivery_notes;
    let weight = postedValues.weight;
    let delivery_contact_details = postedValues.delivery_contact_details;
    let dest_location = postedValues.dest_location;
    let origin_location = postedValues.origin_location;
    let origin_location_lat = postedValues.origin_location_lat;
    let origin_location_long = postedValues.origin_location_long;
    let destination_lat = postedValues.destination_lat;
    let destination_long = postedValues.destination_long;
    let distance = postedValues.distance;
    let delivery_cost_proposed = postedValues.delivery_cost_proposed;
    let accepted_cost = postedValues.accepted_cost;
    let paying_when = postedValues.paying_when;
    let payment_type = postedValues.payment_type;
    let preferred_gender = postedValues.preferred_gender;     
    let preferred_car_type = postedValues.preferred_car_type;  
    let preferred_age = postedValues.preferred_age_range;        
    let number_of_passengers = postedValues.number_of_passengers; 
    let driver_license_date = postedValues.driver_license_date; 
    let currency_id = postedValues.currency_id;
    let currency_code = postedValues.currency_code;
    let usd_rate = postedValues.usd_rate;
    let customer_comment = postedValues.customer_comment;
    let driver_comment = postedValues.driver_comment;
    let driver_stars = postedValues.driver_stars;
    let customer_stars = postedValues.customer_stars;
    let customer_status = postedValues.customer_status;
    let pascel_pic1 = postedValues.pascel_pic1;
    let pascel_pic2 = postedValues.pascel_pic2;
    let pascel_pic3 = postedValues.pascel_pic3;
    let trip_priority_type = postedValues.trip_priority_type;
    let delivery_received_confirmation_code = postedValues.delivery_received_confirmation_code;
    let commercial_value_delivery_category = postedValues.commercial_value_delivery_category;

    let results = await tripDbOperations.postTrip(
      driver_id,
      cust_id,
      request_start_datetime,
      order_start_datetime,
      order_end_datetime,
      estimate_order_end_datetime,
      status,
      deliveray_details,
      delivery_notes,
      weight,
      delivery_contact_details,
      dest_location,
      origin_location,
      origin_location_lat,
      origin_location_long,
      destination_lat,
      destination_long,
      distance,
      delivery_cost_proposed,
      accepted_cost,
      paying_when,
      payment_type,
      preferred_gender,      
      preferred_car_type,    
      preferred_age,       
      number_of_passengers,   
      driver_license_date,   
      currency_id,
      currency_code,
      usd_rate,
      customer_comment,
      driver_comment,
      driver_stars,
      customer_stars,
      customer_status,
      pascel_pic1,
      pascel_pic2,
      pascel_pic3,
      trip_priority_type,
      delivery_received_confirmation_code,
      commercial_value_delivery_category
    );

    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});





tripRouter.get("/", async (req, res, next) => {
  try {
    let results = await tripDbOperations.getTrips();
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});




// Route to get delayed trips where current time is greater than estimate_order_end_datetime
tripRouter.get("/delayedtrips", async (req, res, next) => {
  try {
    let results = await tripDbOperations.getDelayedTrips();
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});





tripRouter.get("/drivers/:driverId", async (req, res) => {
  try {
    const driverId = req.params.driverId;
    let results = await NewOrderObj.getEligibleTrips(driverId);
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});
tripRouter.get("/driver_id/status", async (req, res, next) => {
  const { driver_id, status } = req.query;

  if (!driver_id || !status) {
    return res
      .status(400)
      .json({ error: "Driver ID and status are required." });
  }

  try {
    let results = await tripDbOperations.getNumberofTrips(driver_id, status);
    res.json({ tripCount: results });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

tripRouter.get("/getting_joined_tables_using_trip_id/:trip_id", async (req, res, next) => {
  const tripId = req.params.trip_id;

  try {
    let results = await tripDbOperations.getTripDetailsOfTablesById(tripId);
    if (results.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});


tripRouter.put("/updateStatusAndDriver/:id", async (req, res, next) => {
  try {
    const trip_id = req.params.id;
    const { driver_id, status } = req.body;

    if (!driver_id || !status) {
      return res.status(400).json({ error: "Driver ID and status are required." });
    }

    const result = await tripDbOperations.updateStatusAndDriver(trip_id, driver_id, status);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

tripRouter.get("/tripsbystatus/:status", async (req, res, next) => {
  try {
    let status = req.params.status;
    let results = await tripDbOperations.getTripToDash(status);
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

tripRouter.get("/byStatus/driver_id/status", async (req, res, next) => {
  const { driver_id, status } = req.query;
  if (!driver_id || !status) {
    return res
      .status(400)
      .json({ error: "Driver ID and status are required." });
  }
  try {
    let results = await tripDbOperations.getTripByDriverAndStatus(driver_id, status);
    if (results.length === 0) {
      return res.status(404).json({ message: "No trips found." });
    }
    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

tripRouter.get("/byStatus/customer/:cust_id/:status", async (req, res, next) => {
  const { cust_id, status } = req.params;
  if (!cust_id || !status) {
    return res
      .status(400)
      .json({ error: "Driver ID and status are required." });
  }
  try {
    let results = await tripDbOperations.getTripByCustomerIdAndStatus(cust_id, status);
    if (results.length === 0) {
      return res.status(404).json({ message: "No trips found." });
    }
    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

tripRouter.get("/driver/notify/", async (req, res, next) => {
  try {
    let results = await tripDbOperations.getTripByStatusToDriver();
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

tripRouter.get("/driver/notify/:id", async (req, res, next) => {
  try {
    let driver_id = req.params.id;
    let results = await tripDbOperations.getTripByStatusToDriverEnd(driver_id);
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

tripRouter.get("/customer/notify/:id", async (req, res, next) => {
  try {
    let cust_id = req.params.id;
    let results = await tripDbOperations.getTripByStatusToCustomer(cust_id);
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});




tripRouter.get("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    let result = await tripDbOperations.getTripById(id);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

tripRouter.put("/:id", async (req, res, next) => {
  try {
    let trip_id = req.params.id;
    let updatedValues = req.body;

    let result = await tripDbOperations.updateTrip(trip_id, updatedValues);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});


//#########################
tripRouter.get('/mylastTwentyTripsById/:customer_id/:driver_id', async (req, res, next) => {
    try {
        let customer_id = req.params.customer_id;
        let driver_id = req.params.driver_id;
        let result = await tripDbOperations.getMylastTwentyTripsById(customer_id, driver_id);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

tripRouter.put("/customerComment/:id", async (req, res, next) => {
  try {
    const trip_id = req.params.id;
    const updatedValues = req.body;

    console.log("from frontend:", updatedValues);
    const result = await tripDbOperations.updateCustomerComment(
      trip_id,
      updatedValues
    );

    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

tripRouter.put("/driverComment/:id", async (req, res, next) => {
  try {
    const trip_id = req.params.id;
    const updatedValues = req.body;
    console.log("From front", updatedValues);

    const result = await tripDbOperations.updateDriverComment(
      trip_id,
      updatedValues
    );

    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

tripRouter.delete("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    let result = await tripDbOperations.deleteTrip(id);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});
tripRouter.post('/end-trip/customer/:trip_id', (req, res) => {
  const trip_id = req.params.trip_id;
  tripDbOperations.endTripByCustomer(trip_id)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Route to end trip by driver
tripRouter.post('/end-trip/driver/:trip_id', (req, res) => {
  console.log("vauya")
  const trip_id = req.params.trip_id;
  tripDbOperations.endTripByDriver(trip_id)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({ error: err.message }));
});


module.exports = tripRouter;