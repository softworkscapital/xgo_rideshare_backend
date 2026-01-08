const express = require("express");
const VehicleRouter = express.Router();
const VehicleDbOperations = require("../cruds/vehicles");

// Route to create a new vehicle
VehicleRouter.post("/", async (req, res, next) => {
  try {
    let postedValues = req.body;
    let {
      vehicles_id, 
      number_plate,
      driver_id,
      vehicle_make,
      vehicle_model,
      colour,
      vehicle_license_image,
      vehicle_image1,
      vehicle_image2,
      vehicle_image3,
      vehicle_category,
      vehicle_year,
      vehicle_count,
      vehicle_type	
    } = postedValues;

    let results = await VehicleDbOperations.postVehicle(
      vehicles_id, 
      number_plate,
      driver_id,
      vehicle_make,
      vehicle_model,
      colour,
      vehicle_license_image,
      vehicle_image1,
      vehicle_image2,
      vehicle_image3,
      vehicle_category,
      vehicle_year,
      vehicle_count,
      vehicle_type
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});       

// Route to get all vehicles
VehicleRouter.get("/", async (req, res, next) => {
  try {
    let results = await VehicleDbOperations.getVehicles();
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// Route to get a vehicle by number plate
VehicleRouter.get("/:vehicles_id", async (req, res, next) => {
  try {
    let vehicles_id = req.params.vehicles_id; 
    let result = await VehicleDbOperations.getVehicleById(vehicles_id); 
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});








VehicleRouter.get("/getvehiclesbydriverid/:driver_id", async (req, res, next) => {
  try {
    let driver_id = req.params.driver_id; 
    let result = await VehicleDbOperations.getVehicleByDriverId(driver_id);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});


VehicleRouter.put("/:vehicles_id", async (req, res, next) => {
  try {
    let vehicles_id = req.params.vehicles_id; 
    let updatedValues = req.body;

    let results = await VehicleDbOperations.updateVehicle(
      vehicles_id,
      updatedValues
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// Route to delete a vehicle
VehicleRouter.delete("/:vehicles_id", async (req, res, next) => {
  try {
    let vehicles_id = req.params.vehicles_id; 
    let result = await VehicleDbOperations.deleteVehicle(vehicles_id);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = VehicleRouter;