const express = require("express");
const router = express.Router();
const testController = require("../../controllers/testController");
const { requireAuth } = require("../../middlewares/authMiddleware");

router.get("/", testController.ping);
router.get("/isAuth", requireAuth, testController.isAuth);

module.exports = router;
