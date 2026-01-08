const express = require("express");
const CustomerAdminChatRouter = express.Router();
const CustomerAdminChatsDbOperations = require("../cruds/customer_admin_chats");

CustomerAdminChatRouter.post("/", async (req, res, next) => {
  try {
    let postedValues = req.body;
    let {
      customer_driver_chat_id,
      date_chat,
      time_chat,
      trip_id,
      admin_id,
      driver_id,
      message,
      conversation_id,
      origin,
      message_type, // New field
      media_url, // New field
    } = postedValues;

    let results = await CustomerAdminChatsDbOperations.postCustomerAdminChat(
      customer_driver_chat_id,
      date_chat,
      time_chat,
      trip_id,
      admin_id,
      driver_id,
      conversation_id,
      message,
      origin,
      message_type, // Pass the new field
      media_url // Pass the new field
    );
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});
CustomerAdminChatRouter.get("/", async (req, res, next) => {
  try {
    let results = await CustomerAdminChatsDbOperations.getCustomerAdminChats();
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});
CustomerAdminChatRouter.get("/admin-charts", async (req, res, next) => {
  try {
    let results = await CustomerAdminChatsDbOperations.getAdminChartsAndUser();
    if (!results || results.length === 0) {
      console.log("No data found");
      return res.status(404).json({ message: "No data found" });
    }
    res.json(results); // Send the results directly
  } catch (e) {
    console.log("Error:", e);
    res.sendStatus(500);
  }
});
CustomerAdminChatRouter.get(
  "/customer_admin_chats/:trip_id",
  async (req, res) => {
    const trip_id = req.params.trip_id;

    try {
      const results =
        await CustomerAdminChatsDbOperations.getCustomerAdminChatsByTripId(
          trip_id
        );
      return res.status(200).json({
        status: "200",
        message: "Retrieved customer driver chats successfully",
        data: results,
      });
    } catch (error) {
      console.error("Error retrieving customer driver chats:", error);
      return res.status(500).json({
        status: "500",
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
);

CustomerAdminChatRouter.get("/:id", async (req, res, next) => {
  try {
    let driver_id = req.params.id;
    let result =
      await CustomerAdminChatsDbOperations.getCustomerAdminChatByDriverId(
        driver_id
      );
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

CustomerAdminChatRouter.put("/:customer_admin_chat_id", async (req, res) => {
  const customer_admin_chat_id = req.params.customer_admin_chat_id; // Ensure this matches the route
  const updatedValues = req.body;

  try {
    const result = await CustomerAdminChatsDbOperations.updateCustomerAdminChat(
      customer_admin_chat_id,
      updatedValues
    );
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error updating customer admin chat:", error);
    return res.status(500).json({
      status: "500",
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

CustomerAdminChatRouter.delete("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    let result = await CustomerAdminChatsDbOperations.deleteCustomerAdminChat(
      id
    );
    res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = CustomerAdminChatRouter;