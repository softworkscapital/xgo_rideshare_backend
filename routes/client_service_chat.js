const express = require("express");
const ClientServiceDbOperations = require("../cruds/client_service_chat");

const ClientServiceChatRouter = express.Router();

// Route to create a new chat record
ClientServiceChatRouter.post("/", async (req, res) => {
  try {
    const { customer_id, date_created, admin_id } = req.body;
    const results = await ClientServiceDbOperations.postChat(customer_id, date_created, admin_id);
    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});
// Route to assign a new admin to a chat record
ClientServiceChatRouter.put("/assign-admin/:id", async (req, res) => {
  try {
    const client_service_chat_id = req.params.id;
    const { admin_id } = req.body;
    const results = await ClientServiceDbOperations.assignAdmin(client_service_chat_id, admin_id);
    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// Route to get all chat records
ClientServiceChatRouter.get("/", async (req, res) => {
  try {
    const results = await ClientServiceDbOperations.getChats();
    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});
ClientServiceChatRouter.get("/newChats", async (req, res) => {
  try {
    const results = await ClientServiceDbOperations.getNewChats();
    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// Route to get a chat record by ID
ClientServiceChatRouter.get("/:id", async (req, res) => {
  try {
    const client_service_chat_id = req.params.id;
    const result = await ClientServiceDbOperations.getChatById(client_service_chat_id);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

ClientServiceChatRouter.get("/customer/:id", async (req, res) => {
  try {
    const client_service_chat_id = req.params.id;
    const result = await ClientServiceDbOperations.getChatsByCustomerId(client_service_chat_id);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

ClientServiceChatRouter.get("/admin/:id", async (req, res) => {
  try {
    const client_service_chat_id = req.params.id;
    const result = await ClientServiceDbOperations.getChatsByAdminId(client_service_chat_id);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});



// Joint
ClientServiceChatRouter.get("/getchatsbychatid/:client_service_chat_id", async (req, res) => {
  try {
    const { client_service_chat_id } = req.params;
    const results = await ClientServiceDbOperations.getAllChatsByChatId(client_service_chat_id);
    res.json(results);
  } catch (e) {
    console.error('Error fetching chats by client service chat ID:', e);
    res.sendStatus(500);
  }
});






// Route to update a chat record
ClientServiceChatRouter.put("/:id", async (req, res) => {
  try {
    const client_service_chat_id = req.params.id;
    const updatedValues = req.body;
    const results = await ClientServiceDbOperations.updateChat(client_service_chat_id, updatedValues);
    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// Route to delete a chat record
ClientServiceChatRouter.delete("/:id", async (req, res) => {
  try {
    const client_service_chat_id = req.params.id;
    const result = await ClientServiceDbOperations.deleteChat(client_service_chat_id);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

module.exports = ClientServiceChatRouter;