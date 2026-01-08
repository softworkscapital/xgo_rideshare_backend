require("dotenv").config();
const pool = require("./poolfile");

let crudsObj = {};

crudsObj.postVehicle = (
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
) => {
return new Promise((resolve, reject) => {
  pool.query(
    `INSERT INTO vehicles(
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
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
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
    ],
    (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({ status: "200", message: "Your vehicle has been added successfully." });
    }
  );
});
};

crudsObj.getVehicles = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM vehicles", (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

crudsObj.getVehicleById = (vehicles_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM vehicles WHERE vehicles_id = ?", 
      [vehicles_id], 
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};


crudsObj.getVehicleByDriverId = (driver_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM vehicles WHERE driver_id = ?",
      [driver_id], 
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};


crudsObj.updateVehicle = (number_plate, updatedValues) => {
  const {
    vehicles_id,  
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
  } = updatedValues;

  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE vehicles SET 
        vehicles_id = ?,        
        driver_id = ?,
        vehicle_make = ?,
        vehicle_model = ?,
        colour = ?,
        vehicle_license_image = ?,
        vehicle_image1 = ?,
        vehicle_image2 = ?,
        vehicle_image3 = ?,
        vehicle_category = ?,
        vehicle_year = ?,
        vehicle_count = ?,
        vehicle_type = ? 
      WHERE number_plate = ?`,
      [
        vehicles_id,  
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
        vehicle_type,
        number_plate
      ],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: "200", message: "Update successful" });
      }
    );
  });
};

crudsObj.deleteVehicle = (vehicles_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM vehicles WHERE vehicles_id = ?",  
      [vehicles_id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};


module.exports = crudsObj;
