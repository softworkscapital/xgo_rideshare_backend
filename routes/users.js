const express = require("express");
const userRouter = express.Router();
const usersDbOperations = require("../cruds/users");

// Create a new user
userRouter.post("/", async (req, res, next) => {
  try {
    const postedValues = req.body;

    console.log("Posted Values:", postedValues);

    const {
      userId,
      username,
      password,
      role,
      email,
      notify,
      activesession,
      addproperty,
      editproperty,
      approverequests,
      delivery,
      status,
      employee_id,
      company_id,
      branch_id,
      sync_status,
      last_logged_account,
      driver_id,
      customerid,
      otp,
      signed_up_on,
      last_logged_in,
      last_activity_date_time,
      last_fin_activity_date_time,
      referral_code,
      reference_payment_status,
      referred_by,
      referred_by_me_count,
      customer_adoption_type,
      my_current_wait_branch,
      my_job_title_id,
      reporting_to_job_title_id,
      reporting_to_user_id,
    } = postedValues;

    if (!userId) {
      return res.status(400).json({ error: "userid is required." });
    }

    const userToInsert = {
      userId,
      username,
      password,
      role,
      email,
      notify,
      activesession,
      addproperty,
      editproperty,
      approverequests,
      delivery,
      status,
      employee_id,
      company_id,
      branch_id,
      sync_status,
      last_logged_account,
      driver_id,
      customerid,
      otp,
      signed_up_on,
      last_logged_in,
      last_activity_date_time,
      last_fin_activity_date_time,
      referral_code,
      reference_payment_status,
      referred_by,
      referred_by_me_count,
      customer_adoption_type,
      my_current_wait_branch,
      my_job_title_id,
      reporting_to_job_title_id,
      reporting_to_user_id,
    };

    console.log("User to Insert:", userToInsert);

    const results = await usersDbOperations.postUser(userToInsert);

    // Respond with the created user ID
    res
      .status(201)
      .json({ userid: results.userid, message: "User created successfully." });
  } catch (error) {
    console.error("Error during user creation:", error);
    res.sendStatus(500);
  }
});

// Get All Users
userRouter.get("/last_user_id", async (req, res, next) => {
  try {
    const users = await usersDbOperations.getLastUser(); // Fetch all users
    res.json(users); // Respond with users
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Send a 500 status code in case of an error
  }
});

// Get All Users
userRouter.get("/", async (req, res, next) => {
  try {
    const users = await usersDbOperations.getUsers(); // Fetch all users
    res.json(users); // Respond with users
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Send a 500 status code in case of an error
  }
});

// Get User by ID
userRouter.get("/:id", async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await usersDbOperations.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Route to get full user details with job title
userRouter.get(
  "/getFullUserDetailsWithJobTitle/:id",
  async (req, res, next) => {
    try {
      const userId = req.params.id;
      const user = await usersDbOperations.getFullUserDetailsWithJobTitle(
        userId
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  }
);

// New route for getting user details with reporting job title
userRouter.get(
  "/getFullUserDetailsWithSupervisorTitle/:id",
  async (req, res, next) => {
    try {
      const userId = req.params.id;
      const user =
        await usersDbOperations.getFullUserDetailsWithSupervisorTitle(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  }
);

// Route to get driver details based on driver_id
userRouter.get("/getdriverfulldetails/:driver_id", async (req, res) => {
  const { driver_id } = req.params; // Get driver_id from URL parameters

  if (!driver_id) {
    return res.status(400).json({ message: "driver_id is required." });
  }

  try {
    const userDetails = await usersDbOperations.getDriverInfo(driver_id); // Pass driver_id to getUsers
    res.json(userDetails);
  } catch (error) {
    console.error("Error fetching driver details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Route to update driver information
userRouter.put("/getdriverfulldetails/:driver_id", async (req, res) => {
  const { driver_id } = req.params; // Get driver_id from URL parameters
  const data = req.body; // Get updated data from request body

  if (!driver_id) {
    return res.status(400).json({ message: "driver_id is required." });
  }

  try {
    await usersDbOperations.updateDriverInfo(driver_id, data); // Pass data to update function
    res.json({ message: "Driver information updated successfully." });
  } catch (error) {
    console.error("Error updating driver details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Route to get user by reference code
userRouter.get("/GetUserByReferenceCode/:referenceCode", async (req, res) => {
  const referenceCode = req.params.referenceCode;

  try {
    const user = await usersDbOperations.getUserByReferenceCode(referenceCode);
    if (user.length > 0) {
      res.status(200).json(user[0]); // Assuming you're returning a single user
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user by reference code:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get User By Credentials
userRouter.get("/login/:email/:password", async (req, res, next) => {
  try {
    const email = req.params.email;
    const password = req.params.password;
    const result = await usersDbOperations.getUserByCred(email, password);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Update User by ID
userRouter.put("/:id", async (req, res, next) => {
  try {
    const userId = req.params.id; // Extract user ID from parameters
    const updatedValues = req.body; // Get updated values from the request body

    const results = await usersDbOperations.updateUser(userId, updatedValues); // Update user in DB
    res.json(results); // Respond with the updated user
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Send a 500 status code in case of an error
  }
});

//update user Status
userRouter.put("/update_status/:id", async (req, res, next) => {
  try {
    let userid = req.params.id;
    let updatedValues = req.body;

    let results = await usersDbOperations.updateUserStatus(
      userid,
      updatedValues
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

userRouter.put("/update_last_logged_in/:id", async (req, res, next) => {
  try {
    let userid = req.params.id;

    let results = await usersDbOperations.updateLastLoggedIn(userid);
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});



userRouter.put(
  "/update_last_activity_date_time/:id",
  async (req, res, next) => {
    try {
      let userid = req.params.id;

      let results = await usersDbOperations.updateLastActivityDateTime(userid);
      res.json(results);
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
);

// Update OTP route
userRouter.put("/update_otp/:id", async (req, res) => {
  const userId = req.params.id; // Get userId from request parameters
  const { otp } = req.body; // Destructure otp from request body

  // Check if OTP is provided
  if (!otp) {
    return res.status(400).json({ message: "New OTP is required" });
  }

  try {
    // Call the updateOTP function with userId and otp
    const result = await usersDbOperations.updateOTP(userId, otp);
    res.status(200).json(result); // Respond with success message
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred", error: err.message }); // Handle errors
  }
});

// Delete User by ID
userRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.params.id; // Extract user ID from parameters
    await usersDbOperations.deleteUser(userId); // Delete user from DB
    res.sendStatus(204); // Respond with no content status
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Send a 500 status code in case of an error
  }
});

// Route to get job titles with user counts
userRouter.get("/job_titles/user_counts", async (req, res) => {
  try {
    const results = await usersDbOperations.getJobTitlesWithUserCounts();
    res.json(results); // Respond with job titles and user counts
  } catch (error) {
    console.error("Error fetching job titles with user counts:", error);
    res.sendStatus(500);
  }
});
//-----------------------newrotees-------------------//
// Get Users by Job Title ID
userRouter.get("/job_title/:id", async (req, res) => {
  try {
    const jobTitleId = req.params.id;
    const users = await usersDbOperations.getUsersByJobTitleId(jobTitleId);

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found for this job title." });
    }

    res.json(users);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Terminate Employee
userRouter.put("/terminate/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await usersDbOperations.terminateEmployee(userId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Get Employees by Roles
userRouter.get("/employees/roles", async (req, res) => {
  try {
    const results = await usersDbOperations.getEmployeesByRoles();
    res.json(results);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Get Job Titles with User Counts
userRouter.get("/job_titles/user_counts", async (req, res) => {
  try {
    const results = await usersDbOperations.getJobTitlesWithUserCounts();
    res.json(results);
  } catch (error) {
    console.error("Error fetching job titles with user counts:", error);
    res.sendStatus(500);
  }
});

// Billing Preference Routes
userRouter.get("/billing-preference/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const result = await usersDbOperations.getBillingPreference(userId);
    
    if (result === null) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ billing_preference: result });
  } catch (error) {
    console.error("Error fetching billing preference:", error);
    res.sendStatus(500);
  }
});

userRouter.put("/billing-preference/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const { billing_preference } = req.body;
    
    if (!billing_preference) {
      return res.status(400).json({ error: "billing_preference is required" });
    }
    
    const result = await usersDbOperations.updateBillingPreference(userId, billing_preference);
    res.json(result);
  } catch (error) {
    console.error("Error updating billing preference:", error);
    if (error.message.includes('Invalid billing preference')) {
      return res.status(400).json({ error: error.message });
    }
    res.sendStatus(500);
  }
});

userRouter.get("/billing-statistics", async (req, res, next) => {
  try {
    const result = await usersDbOperations.getBillingStatistics();
    res.json(result);
  } catch (error) {
    console.error("Error fetching billing statistics:", error);
    res.sendStatus(500);
  }
});

module.exports = userRouter; // Export the userRouter
