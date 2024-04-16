const express = require("express");
const router = express.Router();

const { getEntries } = require("../../controllers/entryController");

router.get("/", getEntries);

module.exports = router;
