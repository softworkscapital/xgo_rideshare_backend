const express = require('express');
const TarrifDetailsRouter = express.Router();
const TarrifDetailsDbOperations = require('../cruds/tarrif_details');

TarrifDetailsRouter.post('/', async (req, res) => {
  try {
    const { tarrif_name, tarrif_description, created_by } = req.body;
    const results = await TarrifDetailsDbOperations.postTarrifDetail(tarrif_name, tarrif_description, created_by);
    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

TarrifDetailsRouter.get('/', async (req, res) => {
  try {
    const results = await TarrifDetailsDbOperations.getTarrifDetails();
    res.json(results);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

TarrifDetailsRouter.get('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await TarrifDetailsDbOperations.getTarrifDetailById(id);
    if (!result) {
      return res.status(404).json({ message: 'Tarrif detail not found.' });
    }
    res.json(result);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

TarrifDetailsRouter.put('/:tarrif_details_id', async (req, res) => {
  const tarrif_details_id = req.params.tarrif_details_id;
  const updatedValues = req.body;

  try {
    const result = await TarrifDetailsDbOperations.updateTarrifDetail(tarrif_details_id, updatedValues);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error updating tarrif detail:", error);
    return res.status(500).json({
      status: "500",
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

TarrifDetailsRouter.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await TarrifDetailsDbOperations.deleteTarrifDetail(id);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

module.exports = TarrifDetailsRouter;