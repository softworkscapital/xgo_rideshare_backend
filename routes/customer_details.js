const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const CustomerRouter = express.Router();
const CustomersDbOperations = require("../cruds/customer_details");

// Specify where to store the uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../profiles"); // Specify your upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// Initialize multer
const upload = multer({ storage });

// // Your route
// CustomerRouter.post('/',  async (req, res, next) => {
//     try {
//         // const { body } = req;
//         // const check = req.file; // This should hold the file info
//         // console.log("File uploaded:", check);

//         // const profilePicUrl = check ? `/profiles/${check.filename}` : null;

//         try {
//             let postedValues = req.body;
//             let {
//                 customer_driver_chat_id,
//                 date_chat,
//                 time_chat,
//                 trip_id,
//                 admin_id,
//                 driver_id,
//                 message,
//                 origin
//                 } = postedValues;

//                 let results = await  CustomerAdminChatsDbOperations.postCustomerAdminChat(
//                     customer_driver_chat_id,
//                     date_chat,
//                     time_chat,
//                     trip_id,
//                     admin_id,
//                     driver_id,
//                     message,
//                     origin

//         // Construct the postedValues object with all required fields
//         const postedValues = {
//             customerid: body.customerid,
//             ecnumber: body.ecnumber,
//             account_type: body.account_type,
//             account_category: body.account_category,
//             signed_on: body.signed_on,
//             name: body.name,
//             surname: body.surname,
//             idnumber: body.idnumber,
//             sex: body.sex,
//             dob: body.dob,
//             address: body.address,
//             house_number_and_street_name: body.house_number_and_street_name,
//             surbub: body.surbub, // Corrected spelling from 'surbub'
//             city: body.city,
//             country: body.country,
//             lat_cordinates: body.lat_cordinates, // Corrected spelling
//             long_cordinates: body.long_cordinates, // Corrected spelling
//             phone: body.phone,
//             username: body.username,
//             email: body.email,
//             password: body.password,
//             employer: body.employer,
//             workindustry: body.workindustry,
//             workaddress: body.workaddress,
//             workphone: body.workphone,
//             workphone2: body.workphone2,
//             nok1name: body.nok1name,
//             nok1surname: body.nok1surname,
//             nok1relationship: body.nok1relationship,
//             nok1phone: body.nok1phone,
//             nok2name: body.nok2name,
//             nok2surname: body.nok2surname,
//             nok2relationship: body.nok2relationship,
//             nok2phone: body.nok2phone,
//             creditstanding: body.creditstanding,
//             credit_bar_rule_exception: body.credit_bar_rule_exception,
//             membershipstatus: body.membershipstatus,
//             defaultsubs: body.defaultsubs,
//             sendmail: body.sendmail,
//             sendsms: body.sendsms,
//             product_code: body.product_code,
//             cost_price: body.cost_price,
//             selling_price: body.selling_price,
//             payment_style: body.payment_style,
//             bp_number: body.bp_number,
//             vat_number: body.vat_number
//             // profilePic: profilePicUrl // The URL of the uploaded image
//         };

//         console.log("Request received:", postedValues); // Log the populated object

//         // Ensure that the required fields are present
//         if (!postedValues.customerid || !postedValues.name || !postedValues.surname) {
//             return res.status(400).json({ error: 'Misvvvvvvvvvvsing required fields: customerid, name, or surname.' });
//         }

//         let results = await CustomersDbOperations.postCustomer(postedValues);
//         res.json(results);
//     } catch (e) {
//         console.error(e);
//         res.status(500).json({ error: 'An vvvvvverror occurred while processing your request.' });
//     }
// });

CustomerRouter.post("/", async (req, res, next) => {
  try {
    let postedValues = req.body;
    let {
      customerid,
      ecnumber,
      account_type,
      account_category,
      signed_on,
      name,
      surname,
      idnumber,
      sex,
      dob,
      address,
      house_number_and_street_name,
      surbub, // Corrected spelling from 'surbub'
      city,
      country,
      lat_cordinates, // Corrected spelling from 'lat_cordinates'
      long_cordinates, // Corrected spelling from 'long_cordinates'
      phone,
      username,
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
      creditstanding,
      credit_bar_rule_exception,
      membershipstatus,
      defaultsubs,
      sendmail,
      sendsms,
      product_code,
      cost_price,
      selling_price,
      payment_style,
      bp_number,
      vat_number,
      profilePic,
      id_image,
    } = postedValues;

    // console.log("from front:", postedValues);
    let results = await CustomersDbOperations.postCustomer(
      customerid,
      ecnumber,
      account_type,
      account_category,
      signed_on,
      name,
      surname,
      idnumber,
      sex,
      dob,
      address,
      house_number_and_street_name,
      surbub, // Corrected spelling
      city,
      country,
      lat_cordinates, // Corrected spelling
      long_cordinates, // Corrected spelling
      phone,
      username,
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
      creditstanding,
      credit_bar_rule_exception,
      membershipstatus,
      defaultsubs,
      sendmail,
      sendsms,
      product_code,
      cost_price,
      selling_price,
      payment_style,
      bp_number,
      vat_number,
      profilePic,
      id_image,
    );

    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

CustomerRouter.get("/", async (req, res, next) => {
  try {
    let results = await CustomersDbOperations.getCustomers();
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

//////////////################
CustomerRouter.get("/customer_trips_requested_update/:customerId", async (req, res, next) => {
  try {
    let customerId = req.params.customerId;
    let result = await CustomersDbOperations.updateCustomerTripCount(customerId);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

CustomerRouter.get("/customer_trips_requested/:customerId", async (req, res, next) => {
  try {
    let customerId = req.params.customerId;
    let result = await CustomersDbOperations.getCustomerTripCount(customerId);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});
//////////////////////////////////////

CustomerRouter.get("/:id", async (req, res, next) => {
  try {
    let customer_id = req.params.id;
    let result = await CustomersDbOperations.getCustomerById(customer_id);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

CustomerRouter.get("/login/:email", async (req, res, next) => {
  try {
    let email = req.params.email;
    let result = await CustomersDbOperations.getCustomerByEmail(email);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

CustomerRouter.put("/:id", async (req, res, next) => {
  try {
    let customer_id = req.params.id;
    let updatedValues = req.body;

    let results = await CustomersDbOperations.updateCustomer(
      customer_id,
      updatedValues
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

CustomerRouter.delete("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    let result = await CustomersDbOperations.deleteCustomer(id);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

//customer route
CustomerRouter.get("/customer_status/:status", async (req, res, next) => {
  try {
    let status = req.params.status;
    let result = await CustomersDbOperations.getCustomerByStatus(status);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

/////Verification
CustomerRouter.get(
  "/customer_verify/:email/:phone/:idnumber",
  async (req, res, next) => {
    try {
      let email = req.params.email;
      let phone = req.params.phone;
      let idnumber = req.params.idnumber;
      let result = await CustomersDbOperations.getVerifyCustomer(
        email,
        phone,
        idnumber
      );
      res.json(result);
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
);

CustomerRouter.put("/update_status/:id", async (req, res, next) => {
  try {
    let customerid = req.params.id;
    let updatedValues = req.body;

    let results = await CustomersDbOperations.updateCustomerStatus(
      customerid,
      updatedValues
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

CustomerRouter.put("/update_phone/:id", async (req, res, next) => {
  try {
    let customerid = req.params.id;
    let updatedValues = req.body;

    let results = await CustomersDbOperations.updateCustomerPhone(
      customerid,
      updatedValues
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

CustomerRouter.put("/update_account_type/:id", async (req, res, next) => {
  try {
    let customerid = req.params.id;
    let updatedValues = req.body;

    let results = await CustomersDbOperations.updateCustomerAccountType(
      customerid,
      updatedValues
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

CustomerRouter.put("/:id/coordinates", async (req, res, next) => {
  try {
    let customer_id = req.params.id;
    const { lat_cordinates, long_cordinates } = req.body;

    let results = await CustomersDbOperations.updateCustomerCoordinates(
      customer_id,
      lat_cordinates,
      long_cordinates
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = CustomerRouter;
