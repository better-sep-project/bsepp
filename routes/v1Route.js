const express = require("express");
const router = express.Router();

const authRoute = require("./v1/authRoute");
const testRoute = require("./v1/testRoute");

router.use("/v1/auth", authRoute);
router.use("/v1/test", testRoute);

module.exports = router;
