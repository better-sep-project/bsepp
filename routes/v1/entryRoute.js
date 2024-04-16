const express = require("express");
const router = express.Router();

const { getEntries } = require("../../controllers/entryController");

router.get("/all", getEntries);

module.exports = router;
