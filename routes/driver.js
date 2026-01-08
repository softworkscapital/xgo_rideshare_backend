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


module.exports = DriverRouter;
