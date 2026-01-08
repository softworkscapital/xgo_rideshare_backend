const express = require("express");
const TicketProgressRouter = express.Router();
const TicketProgressDbOperations = require("../cruds/ticket_progress");
const ticketCrudsObj = require("../cruds/TicketHandler");
// POST a new ticket progress
TicketProgressRouter.post("/", async (req, res) => {
  try {
    const {
      ticket_id,
      assigned_user_id,
      action_notes,
      received_at_date_time,
      left_at_date_time,
      status,
      pinned_images_url,
    } = req.body;

    // Validate input
    if (!ticket_id || typeof ticket_id !== "number") {
      return res
        .status(400)
        .json({ error: "ticket_id is required and must be a number." });
    }

    // if (!assigned_user_id || typeof assigned_user_id !== 'number') {
    //   return res.status(400).json({ error: "assigned_user_id is required and must be a number." });
    // }

    if (typeof action_notes !== "string") {
      return res.status(400).json({ error: "action_notes must be a string." });
    }

    if (
      !received_at_date_time ||
      isNaN(new Date(received_at_date_time).getTime())
    ) {
      return res
        .status(400)
        .json({
          error: "received_at_date_time is required and must be a valid date.",
        });
    }

    if (!left_at_date_time || isNaN(new Date(left_at_date_time).getTime())) {
      return res
        .status(400)
        .json({
          error: "left_at_date_time is required and must be a valid date.",
        });
    }

    if (!status || typeof status !== "string") {
      return res
        .status(400)
        .json({ error: "status is required and must be a string." });
    }

    if (typeof pinned_images_url !== "string") {
      return res
        .status(400)
        .json({ error: "pinned_images_url must be a string." });
    }

    // Proceed to create the ticket progress
    const results = await TicketProgressDbOperations.postTicketProgress(
      ticket_id,
      assigned_user_id,
      action_notes,
      received_at_date_time,
      left_at_date_time,
      status,
      pinned_images_url
    );
    res.status(201).json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// GET all ticket progress entries
TicketProgressRouter.get("/", async (req, res) => {
  try {
    const results = await TicketProgressDbOperations.getTicketProgress();
    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// GET a ticket progress entry by ID
TicketProgressRouter.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await TicketProgressDbOperations.getTicketProgressById(id);
    if (!result) {
      return res.status(404).json({ message: "Ticket progress not found." });
    }
    res.json(result);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// PUT update a ticket progress
TicketProgressRouter.put("/:ticket_progress_id", async (req, res) => {
  const ticket_progress_id = req.params.ticket_progress_id;
  const updatedValues = req.body;

  try {
    const result = await TicketProgressDbOperations.updateTicketProgress(
      ticket_progress_id,
      updatedValues
    );
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error updating ticket progress:", error);
    return res.status(500).json({
      status: "500",
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// DELETE a ticket progress entry
TicketProgressRouter.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await TicketProgressDbOperations.deleteTicketProgress(id);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});
TicketProgressRouter.post(
  "/escalet_ticket/:userId/:ticketId",
  async (req, res) => {
    const userId = req.params.userId;
    const ticketId = req.params.ticketId;

    try {
      const result = await ticketCrudsObj.assignTicketToSupervisor(
        ticketId,
        userId
      );
      res.status(200).json(result); // Respond with the result of the ticket assignment
    } catch (error) {
      console.error("Error assigning ticket:", error);
      res.status(500).json({ message: error.message });
    }
  }
);
// GET all ticket progress entries by ticket ID
TicketProgressRouter.get("/ticket/:ticket_id", async (req, res) => {
  const ticket_id = req.params.ticket_id;

  try {
    const results =
      await TicketProgressDbOperations.getTicketProgressByTicketId(ticket_id);
    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

module.exports = TicketProgressRouter;
