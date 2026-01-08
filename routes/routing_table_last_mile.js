const express = require('express');
const LastMileRoutingRouter = express.Router();
const LastMileRoutingDbOperations = require('../cruds/routing_table_last_mile');

LastMileRoutingRouter.post('/', async (req, res) => {
  try {
    const { group_name, closest_pick_up_branch_id, trip_id } = req.body;
    const results = await LastMileRoutingDbOperations.postRouting(group_name, closest_pick_up_branch_id, trip_id);
    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

LastMileRoutingRouter.get('/', async (req, res) => {
  try {
    const results = await LastMileRoutingDbOperations.getRoutingEntries();
    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

LastMileRoutingRouter.get('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await LastMileRoutingDbOperations.getRoutingById(id);
    if (!result) {
      return res.status(404).json({ message: 'Routing entry not found.' });
    }
    res.json(result);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

LastMileRoutingRouter.put('/:routing_table_last_mile_id', async (req, res) => {
  const routing_table_last_mile_id = req.params.routing_table_last_mile_id;
  const updatedValues = req.body;

  try {
    const result = await LastMileRoutingDbOperations.updateRouting(routing_table_last_mile_id, updatedValues);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error updating routing entry:", error);
    return res.status(500).json({
      status: "500",
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

LastMileRoutingRouter.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await LastMileRoutingDbOperations.deleteRouting(id);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

module.exports = LastMileRoutingRouter;